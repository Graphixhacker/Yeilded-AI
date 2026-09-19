import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_logic = """                {activeTab === 'archives' && (
                  <ArchivesTab
                    user={user}
                    onOpenAuth={handleOpenAuth}
                    onOpenPricing={() => setIsPricingOpen(true)}
                  />
                )}
                {activeTab === 'admin' && user?.email === 'abdulahad2010mine@gmail.com' && (
                  <AdminDashboard />
                )}"""

content = re.sub(
    r'\{\s*activeTab === \'archives\' && \(\s*<ArchivesTab[^>]+>\s*\)\s*\}',
    new_logic,
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

