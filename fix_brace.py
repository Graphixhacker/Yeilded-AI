with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

import re
content = re.sub(r'res\.json\(\{ user, token \}\);\s*\}\s*\}\);', 'res.json({ user, token });\n});', content)

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)
