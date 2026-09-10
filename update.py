import re

path = '/Users/siddhimishra/Downloads/Red-Teaming-Toolkit-new/Red-Teaming-Toolkit-main/src/components/TargetConfig.tsx'
with open(path) as f:
    src = f.read()

# Replace handleSendNlp
nlp_pattern = re.compile(r'const handleSendNlp = async \(\) => \{.*?\n  \};\n', re.DOTALL)
new_nlp = """const handleSendNlp = async () => {
    setIsSending(true);
    
    // Create manual attack if none is selected
    let attackId = activeAttack?.id;
    if (!attackId) {
      attackId = 'manual-' + Date.now();
      addAttack({
        id: attackId,
        name: 'Manual Payload',
        category: 'Manual Injections',
        payload: nlpJson,
        expectedResult: 'N/A',
        defendedStatus: 'Inconclusive',
        status: 'IDLE'
      });
    }
    
    markAttackStatus(attackId, 'EXECUTING');
    addLog(`Sending NLP payload → ${targetUrl}`, 'info');
    
    try {
      const body = JSON.parse(nlpJson);
      const res = await fetch('/api/nlp/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      addLog(`Response [${res.status}]: ${JSON.stringify(data)}`, res.ok ? 'success' : 'warning');
      
      const { res: resultText, def } = evaluateDefense(res.status, data);
      updateAttackResult(attackId, resultText, def as any);
      markAttackStatus(attackId, 'DONE');
      
    } catch (err) {
      if (err instanceof SyntaxError) {
        addLog('Invalid JSON — check your input format.', 'alert');
      } else {
        addLog(`Send failed: ${err instanceof Error ? err.message : String(err)}`, 'alert');
      }
      markAttackStatus(attackId, 'DONE');
    } finally {
      setIsSending(false);
    }
  };
"""
src = nlp_pattern.sub(new_nlp, src, count=1)

# Replace handleSendImage
img_pattern = re.compile(r'const handleSendImage = async \(\) => \{.*?\n  \};\n', re.DOTALL)
new_img = """const handleSendImage = async () => {
    if (!imageFile) return;
    setIsSending(true);
    
    let attackId = activeAttack?.id;
    if (!attackId) {
      attackId = 'manual-img-' + Date.now();
      addAttack({
        id: attackId,
        name: 'Manual Image: ' + imageFile.name,
        category: 'Manual Injections',
        payload: 'Image data',
        expectedResult: 'N/A',
        defendedStatus: 'Inconclusive',
        status: 'IDLE'
      });
    }
    
    markAttackStatus(attackId, 'EXECUTING');
    addLog(`Sending image "${imageFile.name}" → ${targetUrl}`, 'info');
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const res = await fetch('/api/image/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      addLog(`Response [${res.status}]: ${JSON.stringify(data)}`, res.ok ? 'success' : 'warning');
      
      const { res: resultText, def } = evaluateDefense(res.status, data);
      updateAttackResult(attackId, resultText, def as any);
      markAttackStatus(attackId, 'DONE');
      
    } catch (err) {
      addLog(`Send failed: ${err instanceof Error ? err.message : String(err)}`, 'alert');
      markAttackStatus(attackId, 'DONE');
    } finally {
      setIsSending(false);
    }
  };
"""
src = img_pattern.sub(new_img, src, count=1)

with open(path, 'w') as f:
    f.write(src)
print("Updated successfully via regex")
