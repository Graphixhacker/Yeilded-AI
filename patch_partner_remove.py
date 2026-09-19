import re

# 1. Update API router
router_path = "server/apiRouter.ts"
with open(router_path, "r") as f:
    router = f.read()

delete_route = """apiRouter.delete('/admin/partnerships/:id', isAdmin, (req: any, res: any) => {
  const { id } = req.params;
  if ((db as any).deletePartnership) {
    (db as any).deletePartnership(id);
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'DB method missing' });
  }
});

// --- AUTH ENDPOINTS ---"""

router = router.replace("// --- AUTH ENDPOINTS ---", delete_route)

with open(router_path, "w") as f:
    f.write(router)

# 2. Update DB
db_path = "server/db.ts"
with open(db_path, "r") as f:
    db = f.read()

delete_method = """  public deletePartnership(id: string) {
    if (!this.data.partnerships) return;
    this.data.partnerships = this.data.partnerships.filter(p => p.id !== id);
    this.save();
  }
"""

db = db.replace("public getUser(userId: string)", delete_method + "\n  public getUser(userId: string)")

with open(db_path, "w") as f:
    f.write(db)

# 3. Update Frontend Component
admin_path = "src/components/AdminDashboard.tsx"
with open(admin_path, "r") as f:
    admin = f.read()

# Add th for Actions
admin = admin.replace(
    '<th className="px-6 py-4 font-medium">Status</th>',
    '<th className="px-6 py-4 font-medium">Status</th>\n                  <th className="px-6 py-4 font-medium text-right">Actions</th>'
)

# Add td for Delete Action
action_td = """                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to remove partner ${p.name}?`)) return;
                          try {
                            await request(`/admin/partnerships/${p.id}`, { method: 'DELETE' });
                            setPartnerships(partnerships.filter(pt => pt.id !== p.id));
                          } catch (e) {
                            alert('Failed to delete partner');
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        Remove
                      </button>
                    </td>"""

admin = admin.replace(
    '</span>\n                    </td>\n                  </tr>',
    '</span>\n                    </td>\n' + action_td + '\n                  </tr>'
)

with open(admin_path, "w") as f:
    f.write(admin)

print("Patch applied.")
