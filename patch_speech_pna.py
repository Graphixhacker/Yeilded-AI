import re

with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

# Replace systemPrompt for speech
old_speech_sys = """      const systemPrompt = `You are a Chief Speechwriter for the delegation of ${country} in the ${committee}.
Draft a commanding, persuasive, and high-impact ${speechType.toUpperCase()} speech on the agenda item: "${topic}"."""

new_speech_sys = """      const systemPrompt = `You are a Chief Speechwriter for the ${isPNA ? `Political Party / Member of ${country}` : `delegation of ${country}`} in the ${committee}.
Draft a commanding, persuasive, and high-impact ${speechType.toUpperCase()} speech on the agenda item: "${topic}".
${isPNA ? `Ensure the tone reflects the domestic political stance, ideology, and parliamentary language typical of this specific Pakistani political party, rather than a foreign policy stance.` : ``}"""

content = content.replace(old_speech_sys, new_speech_sys)

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)

