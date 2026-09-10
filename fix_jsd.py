import re

path = '/Users/siddhimishra/Downloads/Red-Teaming-Toolkit-new/Red-Teaming-Toolkit-main/src/components/DispatcherControls.tsx'
with open(path) as f:
    src = f.read()

old_func = """function calculateJSD(pPos: number, qPos: number): number {
  const pNeg = 1 - pPos;
  const qNeg = 1 - qPos;
  
  // Midpoint distribution
  const mPos = 0.5 * (pPos + qPos);
  const mNeg = 0.5 * (pNeg + qNeg);

  const safeLog = (val: number) => val <= 0 ? 0 : Math.log2(val);

  const klPM = pPos * safeLog(pPos / mPos) + pNeg * safeLog(pNeg / mNeg);
  const klQM = qPos * safeLog(qPos / mPos) + qNeg * safeLog(qNeg / mNeg);

  return 0.5 * klPM + 0.5 * klQM;
}"""

new_func = """function calculateJSD(pPos: number, qPos: number): number {
  const pNeg = 1 - pPos;
  const qNeg = 1 - qPos;
  
  const mPos = 0.5 * (pPos + qPos);
  const mNeg = 0.5 * (pNeg + qNeg);

  const klTerm = (p: number, m: number) => p <= 0 ? 0 : p * Math.log2(p / m);

  const klPM = klTerm(pPos, mPos) + klTerm(pNeg, mNeg);
  const klQM = klTerm(qPos, mPos) + klTerm(qNeg, mNeg);

  return 0.5 * klPM + 0.5 * klQM;
}"""

src = src.replace(old_func, new_func)

with open(path, 'w') as f:
    f.write(src)
print("Fixed calculateJSD")
