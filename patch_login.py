import re

with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

ban_check = """
  if ((user as any).banned) {
    return res.status(403).json({ error: 'This account has been suspended.' });
  }
"""

if "account has been suspended" not in content:
    content = content.replace("const token = db.createTokenForUser(user.id);", ban_check + "\n  const token = db.createTokenForUser(user.id);")

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)
