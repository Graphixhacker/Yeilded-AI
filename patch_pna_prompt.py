import re

with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

# Replace system prompt for PNA
old_pna_sys = 'systemPrompt = `You are a Senior Parliamentary Counsel and Policy Advisor to the National Assembly of Pakistan (Majlis-e-Shoora).\nDraft an authentic, formal, and authoritative Parliamentary Policy & Position Brief for the Parliamentary Member / Delegation of ${country} in the Pakistan National Assembly on the agenda item: "${topic}".'
new_pna_sys = 'systemPrompt = `You are a Senior Parliamentary Counsel and Policy Advisor to the National Assembly of Pakistan (Majlis-e-Shoora).\nDraft an authentic, formal, and authoritative Parliamentary Policy & Position Brief for the Political Party / Member of ${country} in the Pakistan National Assembly on the agenda item: "${topic}". Ensure the tone reflects the domestic political stance, ideology, and parliamentary language typical of this specific Pakistani political party, rather than a foreign policy stance.'

content = content.replace(old_pna_sys, new_pna_sys)

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)

