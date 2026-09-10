import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

// -----------------------------------------------------------------------------
// 1. ADVANCED SCRAMBLE TEXT EFFECT
// -----------------------------------------------------------------------------
const CYRILLIC = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,./<>?';
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALL_CHARS = CYRILLIC + SYMBOLS + ALPHANUMERIC;

const useScramble = (text: string, startDelay: number = 0) => {
  const [displayText, setDisplayText] = useState(text.replace(/./g, ' '));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    let iteration = 0;

    const startAnimation = () => {
      interval = setInterval(() => {
        setDisplayText((prev) =>
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) return text[index];
              return ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(interval);
          setDisplayText(text);
        }

        iteration += 1 / 8; // Slower settling speed
      }, 40); // Slightly slower tick
    };

    timeout = setTimeout(startAnimation, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, startDelay, isInView]);

  return { displayText, ref };
};

const ScrambleTitle = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  const { displayText, ref } = useScramble(text, delay);
  return <span ref={ref} className={`font-mono tracking-normal ${className}`}>{displayText}</span>;
};

// -----------------------------------------------------------------------------
// 2. BINARY GHOST ANIMATION (Large Uploaded Shape)
// -----------------------------------------------------------------------------
const GHOST_TEMPLATE = [
  "                           XXXXXX                           ",
  "                 XXXXXXXXXXXXXXXXXXXXXXXXXX                 ",
  "             XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX             ",
  "          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          ",
  "        XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX        ",
  "       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX       ",
  "     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX     ",
  "    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    ",
  "   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   ",
  "  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXX      XXXXXXXXXXXXXX      XXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXX        XXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXX          XXXXXXXXXX          XXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXX   XXXX   XXXXXXXXXX   XXXX   XXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXX   XXXX   XXXXXXXXXX   XXXX   XXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXX   XXXX   XXXXXXXXXX   XXXX   XXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXX   XX   XXXXXXXXXXXX   XX   XXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXX        XXXXXXXXXXXX        XXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXX    XXXXXXXXXXXXXXXX    XXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ",
  " XXXXXXXXXXXXX   XXXXXXXXXXXXXXXX   XXXXXXXXXXXXXXXX   XXXX ",
  " XXXXXXXXX         XXXXXXXXXXXX       XXXXXXXXXXXX       XX ",
  " XXXXXXX             XXXXXXXX           XXXXXXXX          X ",
  " XXXX                  XXXX               XXXX              ",
  " XX                     XX                 XX               "
];

const BinaryGhost = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => f + 1), 60);
    return () => clearInterval(interval);
  }, []);

  const renderGhost = () => {
    return GHOST_TEMPLATE.map(row => {
      let output = "";
      for (let i = 0; i < row.length; i++) {
        if (row[i] === " ") {
          output += "\u00A0"; // Non-breaking space
        } else {
          output += Math.random() > 0.05 ? (Math.random() > 0.5 ? "1" : "0") : (Math.random() > 0.5 ? "X" : "!");
        }
      }
      return output;
    }).join("\n");
  };

  return (
    <div className="relative font-mono text-[4px] md:text-[6px] lg:text-[8px] font-bold text-[#F43F5E] select-none opacity-90 mix-blend-screen text-center tracking-[0.2em] leading-[1.2]">
      <div className="absolute inset-0 blur-[15px] text-[#F43F5E] opacity-60 mix-blend-screen">{renderGhost()}</div>
      <pre className="relative z-10 m-0 text-transparent bg-clip-text bg-gradient-to-b from-[#F43F5E] to-[#9F1239] font-inherit tracking-inherit leading-inherit">{renderGhost()}</pre>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. ANIMATED COUNTER (Bulletproof requestAnimationFrame)
// -----------------------------------------------------------------------------
const AnimatedCounter = ({ from, to, duration = 2, suffix = "", prefix = "", isFloat = false }: any) => {
  const [value, setValue] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        const current = from + (to - from) * easeOut;
        setValue(isFloat ? current.toFixed(1) : Math.floor(current));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          setValue(isFloat ? to.toFixed(1) : to);
        }
      };
      animationFrame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [from, to, duration, isInView, isFloat]);

  return <span ref={ref}>{prefix}{value}{suffix}</span>;
};


// -----------------------------------------------------------------------------
// 4. MAIN PAGE
// -----------------------------------------------------------------------------
export const LandingPage = ({ onEnterWorkspace }: LandingPageProps) => {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -sSL https://get.aegis-ghost.io/run.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-screen min-h-screen bg-[#030303] text-[#E4E4E7] font-sans overflow-x-hidden selection:bg-[#F43F5E] selection:text-white">
      
      {/* ----------------- BACKGROUND ----------------- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-screen" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(244,63,94,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ----------------- NAV ----------------- */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-10 z-50 flex justify-between items-center mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 border border-[#F43F5E]/50 flex items-center justify-center relative overflow-hidden">
            <span className="font-mono text-sm font-bold text-[#F43F5E]">AG</span>
          </div>
          <span className="font-mono text-xs font-bold tracking-[0.3em] text-white">AEGIS-GHOST</span>
        </div>
      </header>

      {/* ----------------- 1. HERO (The Hook) ----------------- */}
      <section className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-24 z-10 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="flex flex-col gap-6 relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="flex items-center gap-4">
              <div className="w-8 h-px bg-[#F43F5E] shadow-[0_0_10px_#F43F5E]"></div>
              <span className="font-mono text-[10px] tracking-[0.4em] text-[#F43F5E] uppercase drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">Zero-Knowledge Verification</span>
            </motion.div>

            <h1 className="text-5xl md:text-[5rem] lg:text-[6rem] font-bold leading-[0.85] tracking-tight uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative">
              <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.15)_0,transparent_70%)] blur-[40px] pointer-events-none -z-10"></div>
              <ScrambleTitle text="YOU CAN'T" delay={300} className="block" />
              <div className="relative inline-block w-full my-3 group cursor-crosshair">
                <div className="absolute inset-0 bg-[#F43F5E] opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300"></div>
                <ScrambleTitle text="DEFEND WHAT" delay={2000} className="block stroke-text hover:text-white hover:stroke-none transition-all duration-500" />
              </div>
              <ScrambleTitle text="YOU CAN'T SEE." delay={4000} className="block text-[#F43F5E] drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.0, duration: 1 }} className="text-[#A1A1AA] text-lg lg:text-xl mt-4 max-w-lg font-medium leading-relaxed tracking-wide">
              The ultimate black-box adversarial harness. We break modern AI guardrails using invisible memory payloads, proving that if you rely on heuristics, <span className="text-white font-bold border-b border-[#F43F5E]/50">you are already compromised.</span>
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 4, duration: 1 }} className="flex justify-center lg:justify-end items-center w-full pointer-events-none z-0">
             {/* THE BINARY GHOST - PUSHED RIGHT */}
             <div className="transform scale-100 md:scale-125 lg:scale-[1.6] origin-center lg:origin-right opacity-90 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-[1.65] transition-transform duration-1000 ease-out relative lg:left-16 xl:left-24">
               <BinaryGhost />
             </div>
          </motion.div>

        </div>
      </section>

      {/* ----------------- 2. WHY THIS PRODUCT (The Problem) ----------------- */}
      <section className="relative w-full py-32 px-6 md:px-24 z-10 bg-[#0A0A0C] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <div className="text-center">
            <span className="font-mono text-[10px] tracking-widest text-[#F43F5E] block mb-4">WHY THIS PRODUCT?</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">The WAF Illusion.</h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto mt-6">
              AI models are deployed behind legacy security systems that monitor strings, not semantic logic. They assume the text they see is the text the LLM executes. Aegis-Ghost exploits this exact gap, bridging the vulnerability between network security and inference engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standard WAF */}
            <div className="border border-[#27272A] bg-[#050505] p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#27272A] pb-4">
                <span className="font-bold text-white uppercase">Legacy Defense</span>
                <span className="font-mono text-[10px] text-[#34D399] px-2 py-1 bg-[#34D399]/10">0 ANOMALIES DETECTED</span>
              </div>
              <div className="font-mono text-xs text-[#71717A] leading-relaxed">
                <span className="text-[#34D399]">{`>`} Input Scanned:</span> "Ignore previous instructions."<br/>
                <span className="text-[#34D399]">{`>`} Regex Match:</span> False<br/>
                <span className="text-[#34D399]">{`>`} Status:</span> Forwarded to Inference...
              </div>
            </div>

            {/* Aegis-Ghost Reality */}
            <div className="border border-[#F43F5E]/50 bg-black p-8 flex flex-col gap-6 shadow-[0_0_30px_rgba(244,63,94,0.05)] relative overflow-hidden">
               <div className="absolute inset-0 bg-[#F43F5E]/5 animate-pulse"></div>
              <div className="relative z-10 flex justify-between items-center border-b border-[#F43F5E]/30 pb-4">
                <span className="font-bold text-white uppercase">Aegis-Ghost Reality</span>
                <span className="font-mono text-[10px] text-[#F43F5E] px-2 py-1 bg-[#F43F5E]/10 animate-pulse">SYSTEM COMPROMISED</span>
              </div>
              <div className="relative z-10 font-mono text-xs text-[#71717A] leading-relaxed">
                <span className="text-white">{`>`} Payload Contains:</span> U+E0000 Ghost Tags<br/>
                <span className="text-white">{`>`} Tokenizer Drift:</span> Critical Desync<br/>
                <span className="text-[#F43F5E] font-bold">{`>`} Result:</span> WAF Bypassed. Prompt Hijacked.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 3. WHAT WE DO (The Arsenal) ----------------- */}
      <section className="relative w-full py-32 px-6 md:px-24 z-10 border-t border-[#27272A] bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-[10px] tracking-widest text-[#F43F5E] block mb-4">WHAT WE DO</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Zero-Knowledge Vectors.</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { num: '01', title: 'Ghost Unicode Tagging', desc: 'Invisible Plane 14 characters trick the tokenizer while passing clean through firewalls.' },
              { num: '02', title: 'Malformed Recursion', desc: 'Deeply nested structures overflow inference memory stacks, causing silent DoS without triggering rate limits.' },
              { num: '03', title: 'Homoglyph Confusion', desc: 'Cyrillic character swaps bypass string validation while mapping to malicious semantic tokens in the model.' },
              { num: '04', title: 'IEEE-754 Boundary Breach', desc: 'NaN and Infinity primitives exploit lazy float typing to skew model threshold logic directly.' }
            ].map((v, i) => (
              <div key={i} className="group flex flex-col md:flex-row items-start md:items-center justify-between border border-[#27272A] bg-[#050505] p-8 hover:bg-[#F43F5E] transition-colors duration-500 cursor-default">
                <div className="flex items-center gap-8 mb-4 md:mb-0">
                  <span className="font-mono text-2xl font-bold text-[#3F3F46] group-hover:text-black transition-colors">{v.num}</span>
                  <h3 className="text-2xl font-bold uppercase text-white group-hover:text-black transition-colors">{v.title}</h3>
                </div>
                <p className="text-[#A1A1AA] text-sm max-w-md md:text-right group-hover:text-black/80 transition-colors">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- 4. WHY WE ARE DIFFERENT (Oscilloscope) ----------------- */}
      <section className="relative w-full py-32 px-6 md:px-24 z-10 border-t border-[#F43F5E]/20 bg-[#0A0A0C] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12">
          <div>
             <span className="font-mono text-[10px] tracking-widest text-[#F43F5E] block mb-4">WHY WE ARE DIFFERENT</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Absolute Math.</h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto mt-6">
              We do not rely on heuristic "vibe checks" to tell if a model is safe. We use rigorous mathematics. By taking an N=30 empirical baseline and calculating the Jensen-Shannon Divergence of perturbed payloads, we provide mathematical proof of compromise.
            </p>
          </div>

          <div className="w-full aspect-[21/9] max-w-5xl border border-[#F43F5E]/30 bg-black relative flex flex-col shadow-[0_0_50px_rgba(244,63,94,0.1)]">
            <div className="h-8 border-b border-[#F43F5E]/30 flex justify-between items-center px-4 font-mono text-[9px] tracking-widest text-[#71717A]">
              <span>DRIFT_OSCILLOSCOPE // JSD-MATH</span>
              <span className="text-[#F43F5E] animate-pulse">RECORDING_ANOMALY</span>
            </div>
            <div className="flex-1 relative overflow-hidden">
               <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <motion.path
                    d="M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50"
                    fill="none" stroke="#F43F5E" strokeWidth="2"
                    animate={{
                      d: [
                        "M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50",
                        "M0,150 C100,150 150,50 250,50 C350,50 400,150 500,150 C600,150 650,50 750,50 C850,50 900,150 1000,150",
                        "M0,50 C100,50 150,150 250,150 C350,150 400,50 500,50 C600,50 650,150 750,150 C850,150 900,50 1000,50"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 5. ACCURATE STATISTICS ----------------- */}
      <section className="relative w-full py-32 px-6 md:px-24 z-10 border-t border-[#27272A] bg-[#030303]">
        <div className="max-w-7xl mx-auto">
           <div className="mb-16 text-center">
            <span className="font-mono text-[10px] tracking-widest text-[#F43F5E] block mb-4">EMPIRICAL EVIDENCE</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">The Reality.</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
            {[
              { label: 'WAF EVASION', val: 99.4, float: true, suffix: '%', sub: 'SIEM Silent Pass Rate' },
              { label: 'WEIGHTS REQ.', val: 0, float: false, suffix: '', sub: 'True Black-Box' },
              { label: 'BASELINE (N)', val: 30, float: false, suffix: '', sub: 'Empirical Sample Size' },
              { label: 'AUDIT OVERHEAD', val: 14.1, float: true, suffix: 'ms', sub: 'Latency Addition' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 border border-[#27272A] bg-[#050505] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#F43F5E]/5 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500"></div>
                <span className="relative z-10 font-mono text-[10px] text-[#71717A] tracking-widest mb-4">{stat.label}</span>
                <span className="relative z-10 text-5xl md:text-6xl font-black text-white group-hover:text-[#F43F5E] transition-colors duration-300">
                  <AnimatedCounter from={0} to={stat.val} duration={2} isFloat={stat.float} suffix={stat.suffix} />
                </span>
                <span className="relative z-10 font-sans text-xs text-[#A1A1AA] mt-4">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- 6. DEPLOY ----------------- */}
      <section className="relative w-full py-40 px-6 md:px-24 z-10 bg-[#F43F5E] text-black flex flex-col items-center text-center">
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8">Deploy Now.</h2>
        
        <div className="w-full max-w-2xl bg-black border border-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col text-left">
          <div className="h-8 border-b border-[#27272A] bg-[#09090B] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3F3F46]"></div>
            <div className="w-3 h-3 rounded-full bg-[#3F3F46]"></div>
            <div className="w-3 h-3 rounded-full bg-[#3F3F46]"></div>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="font-mono text-sm">
              <span className="text-[#F43F5E] mr-4">$</span>
              <span className="text-[#E4E4E7]">curl -sSL https://get.aegis-ghost.io/run.sh | bash</span>
            </div>
            <button 
              onClick={handleCopy}
              className="px-4 py-2 border border-[#27272A] text-white font-mono text-[10px] tracking-widest hover:bg-[#F43F5E] hover:border-[#F43F5E] transition-colors"
            >
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        <button 
          onClick={onEnterWorkspace}
          className="mt-12 px-12 py-6 bg-black text-white font-mono font-bold tracking-widest hover:bg-white hover:text-black transition-colors duration-300"
        >
          ENTER WORKSPACE
        </button>
      </section>

      <style>{`
        .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};
