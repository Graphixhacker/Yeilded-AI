import re

admin_path = "src/components/AdminDashboard.tsx"
with open(admin_path, "r") as f:
    admin = f.read()

admin = admin.replace(
    "}).catch(e => alert('Failed to create partner'));",
    "}).catch(e => { console.error('Add Partner Error:', e); alert('Failed to create partner: ' + (e.message || JSON.stringify(e))); });"
)

with open(admin_path, "w") as f:
    f.write(admin)
