import re

router_path = "server/apiRouter.ts"
with open(router_path, "r") as f:
    router = f.read()

profile_route = """apiRouter.post('/user/profile', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  
  if ((db as any).updateUserProfile) {
    const updatedUser = (db as any).updateUserProfile(user.id, name);
    res.json({ user: updatedUser });
  } else {
    res.status(500).json({ error: 'DB method missing' });
  }
});
"""

router = router.replace("// --- AUTH ENDPOINTS ---", profile_route + "\n// --- AUTH ENDPOINTS ---")

with open(router_path, "w") as f:
    f.write(router)

