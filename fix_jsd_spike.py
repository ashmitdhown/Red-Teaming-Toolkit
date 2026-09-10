import re

path = '/Users/siddhimishra/Downloads/Red-Teaming-Toolkit-new/Red-Teaming-Toolkit-main/src/components/DispatcherControls.tsx'
with open(path) as f:
    src = f.read()

# Replace maxJsd with emaJsd
src = src.replace('let maxJsd = 0;', 'let currentEmaJsd = 0;')
src = src.replace('maxJsd = Math.max(maxJsd, currentJsd);', 'currentEmaJsd = currentEmaJsd === 0 ? currentJsd : (currentEmaJsd * 0.6 + currentJsd * 0.4);')
src = src.replace('jsd: maxJsd.toFixed(3)', 'jsd: currentEmaJsd.toFixed(3)')

with open(path, 'w') as f:
    f.write(src)
print("Replaced maxJsd with EMA JSD")
