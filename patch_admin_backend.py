with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

admin_middleware = """
const ADMIN_EMAILS = ['abdulahad2010mine@gmail.com'];

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

apiRouter.get('/admin/stats', isAdmin, (req: Request, res: Response) => {
  const users = db.getAllUsers ? db.getAllUsers() : [];
  const freeUsers = users.filter(u => u.tier === 'free').length;
  const paidUsers = users.length - freeUsers;
  res.json({ totalUsers: users.length, freeUsers, paidUsers });
});

apiRouter.get('/admin/users', isAdmin, (req: Request, res: Response) => {
  const users = db.getAllUsers ? db.getAllUsers() : [];
  res.json({ users });
});

apiRouter.post('/admin/users/:id/tier', isAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { tier } = req.body;
  if (!['free', '3day', 'monthly'].includes(tier)) return res.status(400).json({ error: 'Invalid tier' });
  
  if (db.updateUserTier) {
     db.updateUserTier(id, tier);
  }
  res.json({ success: true });
});

apiRouter.post('/admin/users/:id/ban', isAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { banned } = req.body;
  if (db.setUserBanned) {
     db.setUserBanned(id, banned);
  }
  res.json({ success: true });
});
"""

# inject right after apiRouter = Router()
if "const isAdmin" not in content:
    content = content.replace("const apiRouter = Router();", "const apiRouter = Router();\n" + admin_middleware)

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)
