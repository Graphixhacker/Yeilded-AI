with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

endpoints = """
apiRouter.get('/admin/partnerships', isAdmin, (req: Request, res: Response) => {
  const partnerships = db.getPartnerships ? db.getPartnerships() : [];
  res.json({ partnerships });
});

apiRouter.post('/admin/partnerships', isAdmin, (req: Request, res: Response) => {
  if (db.addPartnership) {
    const p = db.addPartnership(req.body);
    res.json(p);
  } else {
    res.status(500).json({ error: 'DB method missing' });
  }
});
"""

if "/admin/partnerships" not in content:
    content = content.replace("apiRouter.get('/admin/users'", endpoints + "\napiRouter.get('/admin/users'")

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)
