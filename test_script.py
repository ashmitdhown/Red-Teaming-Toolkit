import re

path = '/Users/siddhimishra/Downloads/Red-Teaming-Toolkit-new/Red-Teaming-Toolkit-main/src/components/TargetConfig.tsx'
with open(path) as f:
    src = f.read()

# Let's add a console.log inside handleSendNlp to see what `activeAttack` is, and if it updates.
src = src.replace('const { res: resultText, def } = evaluateDefense(res.status, data);',
'''const { res: resultText, def } = evaluateDefense(res.status, data);
        console.log("TargetConfig updating attack:", activeAttack.id, resultText, def);''')

with open(path, 'w') as f:
    f.write(src)
print("Updated TargetConfig.tsx with console.log")
