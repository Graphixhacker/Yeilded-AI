import re

with open('server/apiRouter.ts', 'r') as f:
    content = f.read()

admin_middleware = """
const ADMIN_EMAILS = ['abdulahad2010mine@gmail.com'];

const isAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

apiRouter.get('/admin/stats', isAdmin, (req: any, res: any) => {
  const users = (db as any).getAllUsers ? (db as any).getAllUsers() : [];
  const freeUsers = users.filter((u: any) => u.tier === 'free').length;
  const paidUsers = users.length - freeUsers;
  res.json({ totalUsers: users.length, freeUsers, paidUsers });
});

apiRouter.get('/admin/users', isAdmin, (req: any, res: any) => {
  const users = (db as any).getAllUsers ? (db as any).getAllUsers() : [];
  res.json({ users });
});

apiRouter.post('/admin/users/:id/tier', isAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { tier } = req.body;
  if (!['free', '3day', 'monthly'].includes(tier)) return res.status(400).json({ error: 'Invalid tier' });
  
  if ((db as any).updateUserTier) {
     (db as any).updateUserTier(id, tier);
  }
  res.json({ success: true });
});

apiRouter.post('/admin/users/:id/ban', isAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { banned } = req.body;
  if ((db as any).setUserBanned) {
     (db as any).setUserBanned(id, banned);
  }
  res.json({ success: true });
});

apiRouter.get('/admin/partnerships', isAdmin, (req: any, res: any) => {
  const partnerships = (db as any).getPartnerships ? (db as any).getPartnerships() : [];
  res.json({ partnerships });
});

apiRouter.post('/admin/partnerships', isAdmin, (req: any, res: any) => {
  if ((db as any).addPartnership) {
    const p = (db as any).addPartnership(req.body);
    res.json(p);
  } else {
    res.status(500).json({ error: 'DB method missing' });
  }
});
"""

if "const isAdmin" not in content:
    content = content.replace("export const apiRouter = express.Router();", "export const apiRouter = express.Router();\n" + admin_middleware)

with open('server/apiRouter.ts', 'w') as f:
    f.write(content)
