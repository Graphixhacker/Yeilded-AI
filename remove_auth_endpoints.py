import re

with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

# Remove /auth/demo
demo_pattern = r'// Dedicated Instant Demo Delegate Sign-In Endpoint\napiRouter\.post\(\'/auth/demo\'.*?\}\);\n'
content = re.sub(demo_pattern, '', content, flags=re.DOTALL)

# Remove /auth/google
google_pattern = r'apiRouter\.post\(\'/auth/google\', \(req: Request, res: Response\) => \{.*?\n\}\);\n'
content = re.sub(google_pattern, '', content, flags=re.DOTALL)

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)
