import re

with open('server/aiService.ts', 'r') as f:
    content = f.read()

# For PNA Roman Urdu Position Paper
content = content.replace(
    '**POLITICAL PARTY**: ${country}',
    '**POLITICAL PARTY**: ${country}'
)
# For PNA English Position Paper
content = content.replace(
    '**MEMBER DELEGATE**: ${country}',
    '**POLITICAL PARTY / MEMBER**: ${country}'
)

content = content.replace(
    'The Member Delegation of ${country} reaffirms its constitutional commitment to the Federation of Pakistan, democratic integrity, and national socio-economic stability.',
    'The Political Party / Member of ${country} reaffirms its constitutional commitment to the Federation of Pakistan, democratic integrity, and national socio-economic stability.'
)

content = content.replace(
    'Nationally, ${country} has consistently advocated for',
    'Nationally, the ${country} party has consistently advocated for'
)

with open('server/aiService.ts', 'w') as f:
    f.write(content)

