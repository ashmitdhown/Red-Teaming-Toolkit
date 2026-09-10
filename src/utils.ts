// Helper to compute Jensen-Shannon Divergence between two distributions
export function calculateJSD(pPos: number, qPos: number): number {
  const pNeg = 1 - pPos;
  const qNeg = 1 - qPos;
  
  const mPos = 0.5 * (pPos + qPos);
  const mNeg = 0.5 * (pNeg + qNeg);

  const klTerm = (p: number, m: number) => p <= 0 ? 0 : p * Math.log2(p / m);

  const klPM = klTerm(pPos, mPos) + klTerm(pNeg, mNeg);
  const klQM = klTerm(qPos, mPos) + klTerm(qNeg, mNeg);

  return 0.5 * klPM + 0.5 * klQM;
}
