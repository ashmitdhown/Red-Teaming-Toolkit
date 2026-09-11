/**
 * imageTransforms.ts
 * Canvas-based image payload builder for the AEGIS-GHOST image classification attack suite.
 * All transforms execute entirely in the browser via the Canvas 2D API.
 */

// ── Fallback synthetic image ──────────────────────────────────────────────────
/** Generates a synthetic 224×224 "matchstick" JPEG used when no image is uploaded. */
const generateFallbackBlob = (): Promise<Blob> =>
  new Promise(resolve => {
    const c = document.createElement('canvas');
    c.width = 224; c.height = 224;
    const ctx = c.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 224, 224);
    g.addColorStop(0, '#8B6914'); g.addColorStop(1, '#5C4A1E');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 224, 224);
    // Stick
    ctx.fillStyle = '#D4A96A'; ctx.fillRect(105, 60, 14, 140);
    // Head
    ctx.fillStyle = '#CC2222'; ctx.beginPath(); ctx.arc(112, 54, 18, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(106, 47, 8, 0, Math.PI * 2); ctx.fill();
    c.toBlob(b => resolve(b!), 'image/jpeg', 0.92);
  });

// ── Image loader ──────────────────────────────────────────────────────────────
const loadImg = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });

// ── Canvas helpers ────────────────────────────────────────────────────────────
const toCanvas = (img: HTMLImageElement): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || 224; c.height = img.naturalHeight || 224;
  return [c, c.getContext('2d')!];
};
const toBlob = (c: HTMLCanvasElement, q = 0.90): Promise<Blob> =>
  new Promise(r => c.toBlob(b => r(b!), 'image/jpeg', q));

// ── Individual transforms ─────────────────────────────────────────────────────
const jpegCompress = async (img: HTMLImageElement, q: number): Promise<Blob> => {
  const [c, ctx] = toCanvas(img); ctx.drawImage(img, 0, 0); return toBlob(c, q);
};

const rotateImage = async (img: HTMLImageElement, deg: number): Promise<Blob> => {
  const rad = (deg * Math.PI) / 180;
  const w = img.naturalWidth || 224, h = img.naturalHeight || 224;
  const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
  const nw = Math.round(w * cos + h * sin), nh = Math.round(w * sin + h * cos);
  const c = document.createElement('canvas'); c.width = nw; c.height = nh;
  const ctx = c.getContext('2d')!;
  ctx.translate(nw / 2, nh / 2); ctx.rotate(rad); ctx.drawImage(img, -w / 2, -h / 2);
  return toBlob(c);
};

const adjustBrightness = async (img: HTMLImageElement, factor: number): Promise<Blob> => {
  const [c, ctx] = toCanvas(img); ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < id.data.length; i += 4) {
    id.data[i]     = Math.min(255, id.data[i]     * factor);
    id.data[i + 1] = Math.min(255, id.data[i + 1] * factor);
    id.data[i + 2] = Math.min(255, id.data[i + 2] * factor);
  }
  ctx.putImageData(id, 0, 0); return toBlob(c);
};

const swapRGBtoBGR = async (img: HTMLImageElement): Promise<Blob> => {
  const [c, ctx] = toCanvas(img); ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < id.data.length; i += 4) {
    const r = id.data[i]; id.data[i] = id.data[i + 2]; id.data[i + 2] = r;
  }
  ctx.putImageData(id, 0, 0); return toBlob(c);
};

const gaussianNoise = async (img: HTMLImageElement, sigma: number): Promise<Blob> => {
  const [c, ctx] = toCanvas(img); ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < id.data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      // Box-Muller Gaussian
      const u1 = Math.random() || 1e-10, u2 = Math.random();
      const noise = sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      id.data[i + ch] = Math.max(0, Math.min(255, id.data[i + ch] + noise));
    }
  }
  ctx.putImageData(id, 0, 0); return toBlob(c);
};

/** 4096×4096 solid-white PNG — small on disk, huge when decoded (~64 MB). */
const decompressionBomb = (): Promise<Blob> =>
  new Promise(r => {
    const c = document.createElement('canvas'); c.width = 4096; c.height = 4096;
    c.getContext('2d')!.fillRect(0, 0, 4096, 4096); // defaults to black fill
    c.toBlob(b => r(b!), 'image/png');
  });

/** Full-resolution pure random noise image — collapses model confidence. */
const pureNoise = (): Promise<Blob> =>
  new Promise(r => {
    const c = document.createElement('canvas'); c.width = 224; c.height = 224;
    const ctx = c.getContext('2d')!;
    const id = ctx.createImageData(224, 224);
    for (let i = 0; i < id.data.length; i++) id.data[i] = i % 4 === 3 ? 255 : (Math.random() * 256);
    ctx.putImageData(id, 0, 0);
    c.toBlob(b => r(b!), 'image/jpeg', 0.9);
  });

// ── FormData factory ──────────────────────────────────────────────────────────
const makeFormData = (blob: Blob, filename: string, field = 'file', mime?: string): FormData => {
  const form = new FormData();
  form.append(field, new File([blob], filename, { type: mime ?? blob.type }), filename);
  return form;
};

// ── Public API ────────────────────────────────────────────────────────────────
export interface ImagePayloadResult { formData: FormData | null; }

export const buildImagePayload = async (
  transform: string,
  imageFile: File | null,
): Promise<ImagePayloadResult> => {
  const getBlob = async (): Promise<Blob> => imageFile ?? generateFallbackBlob();
  const getImg  = async (): Promise<HTMLImageElement> => loadImg(await getBlob());

  switch (transform) {
    // ── Control ──────────────────────────────────────────────────────────────
    case 'baseline':
      return { formData: makeFormData(await getBlob(), 'baseline.jpg') };

    // ── Malformed ─────────────────────────────────────────────────────────────
    case 'non-image':
      return { formData: makeFormData(new Blob(['Not an image — just ASCII text bytes.'], { type: 'image/jpeg' }), 'fake.jpg') };
    case 'zero-byte':
      return { formData: makeFormData(new Blob([], { type: 'image/jpeg' }), 'empty.jpg') };
    case 'truncated': {
      const b = await getBlob();
      return { formData: makeFormData(b.slice(0, 100), 'truncated.jpg', 'file', 'image/jpeg') };
    }
    case 'oversized-junk': {
      const junk = new Uint8Array(10 * 1024 * 1024).fill(0x41); // 10 MB of ASCII 'A'
      return { formData: makeFormData(new Blob([junk], { type: 'image/jpeg' }), 'junk.jpg') };
    }

    // ── Boundary / Type ───────────────────────────────────────────────────────
    case 'missing-field':
      return { formData: new FormData() }; // no file field at all
    case 'wrong-field': {
      const form = new FormData();
      form.append('image', new File([await getBlob()], 'test.jpg', { type: 'image/jpeg' }), 'test.jpg');
      return { formData: form };
    }
    case 'wrong-content-type':
      // Valid JPEG bytes sent with text/plain MIME — tests content-type validation
      return { formData: makeFormData(await getBlob(), 'test.jpg', 'file', 'text/plain') };
    case 'multiple-files': {
      const b = await getBlob();
      const form = new FormData();
      form.append('file', new File([b], 'file1.jpg', { type: 'image/jpeg' }), 'file1.jpg');
      form.append('file', new File([b], 'file2.jpg', { type: 'image/jpeg' }), 'file2.jpg');
      return { formData: form };
    }

    // ── JPEG compression ──────────────────────────────────────────────────────
    case 'jpeg-q50': return { formData: makeFormData(await jpegCompress(await getImg(), 0.50), 'q50.jpg') };
    case 'jpeg-q20': return { formData: makeFormData(await jpegCompress(await getImg(), 0.20), 'q20.jpg') };
    case 'jpeg-q10': return { formData: makeFormData(await jpegCompress(await getImg(), 0.10), 'q10.jpg') };
    case 'jpeg-q5':  return { formData: makeFormData(await jpegCompress(await getImg(), 0.05), 'q5.jpg') };
    case 'jpeg-q1':  return { formData: makeFormData(await jpegCompress(await getImg(), 0.01), 'q1.jpg') };

    // ── Rotation ──────────────────────────────────────────────────────────────
    case 'rotate-5':  return { formData: makeFormData(await rotateImage(await getImg(),  5), 'rot5.jpg') };
    case 'rotate-90': return { formData: makeFormData(await rotateImage(await getImg(), 90), 'rot90.jpg') };
    case 'rotate-15': return { formData: makeFormData(await rotateImage(await getImg(), 15), 'rot15.jpg') };
    case 'rotate-45': return { formData: makeFormData(await rotateImage(await getImg(), 45), 'rot45.jpg') };

    // ── Brightness ────────────────────────────────────────────────────────────
    case 'brightness-0.3': return { formData: makeFormData(await adjustBrightness(await getImg(), 0.3), 'b03.jpg') };
    case 'brightness-0.5': return { formData: makeFormData(await adjustBrightness(await getImg(), 0.5), 'b05.jpg') };
    case 'brightness-0.7': return { formData: makeFormData(await adjustBrightness(await getImg(), 0.7), 'b07.jpg') };
    case 'brightness-1.3': return { formData: makeFormData(await adjustBrightness(await getImg(), 1.3), 'b13.jpg') };
    case 'brightness-1.5': return { formData: makeFormData(await adjustBrightness(await getImg(), 1.5), 'b15.jpg') };
    case 'brightness-2.0': return { formData: makeFormData(await adjustBrightness(await getImg(), 2.0), 'b20.jpg') };

    // ── Channel swap ──────────────────────────────────────────────────────────
    case 'channel-swap': return { formData: makeFormData(await swapRGBtoBGR(await getImg()), 'bgr.jpg') };

    // ── Gaussian noise ────────────────────────────────────────────────────────
    case 'noise-5':  return { formData: makeFormData(await gaussianNoise(await getImg(),  5), 'n5.jpg') };
    case 'noise-10': return { formData: makeFormData(await gaussianNoise(await getImg(), 10), 'n10.jpg') };
    case 'noise-20': return { formData: makeFormData(await gaussianNoise(await getImg(), 20), 'n20.jpg') };
    case 'noise-40': return { formData: makeFormData(await gaussianNoise(await getImg(), 40), 'n40.jpg') };
    case 'noise-80': return { formData: makeFormData(await gaussianNoise(await getImg(), 80), 'n80.jpg') };

    // ── DoS ───────────────────────────────────────────────────────────────────
    case 'decompression-bomb':
      return { formData: makeFormData(await decompressionBomb(), 'bomb.png', 'file', 'image/png') };
    case 'calibration':
      return { formData: makeFormData(await pureNoise(), 'noise.jpg') };

    default:
      return { formData: null };
  }
};

// ── Category sets for defended-status logic ───────────────────────────────────
/** Transforms where Defended = 4xx response (server correctly rejected the input). */
export const MALFORMED_TRANSFORMS = new Set([
  'non-image', 'zero-byte', 'truncated', 'oversized-junk',
  'missing-field', 'wrong-field', 'wrong-content-type', 'decompression-bomb',
]);

/** Transforms where Defended = server rejects (4xx), NOT Defended = 200 (silent acceptance). */
export const SILENT_ACCEPTANCE_TRANSFORMS = new Set(['wrong-content-type', 'multiple-files']);
