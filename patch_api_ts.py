import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

content = content.replace("async register(email: string, name: string, pass: string) {", "async register(email: string, name: string, pass: string, affiliateCode?: string) {")
content = content.replace("body: JSON.stringify({ email: cleanEmail, name: name.trim(), password: pass })", "body: JSON.stringify({ email: cleanEmail, name: name.trim(), password: pass, affiliateCode })")

with open('src/services/api.ts', 'w') as f:
    f.write(content)
