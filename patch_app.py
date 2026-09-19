import re

app_path = "src/App.tsx"
with open(app_path, "r") as f:
    app = f.read()

import_statement = "import { SettingsTab } from './components/tabs/SettingsTab';\nimport { ArchivesTab } from './components/tabs/ArchivesTab';"
app = app.replace("import { ArchivesTab } from './components/tabs/ArchivesTab';", import_statement)

render_statement = """              {activeTab === 'archives' && (
                <ArchivesTab
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onLoadDraftContext={(partial) => {
                    setDelegateContext((prev) => ({ ...prev, ...partial }));
                    setActiveTab('position-paper');
                  }}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsTab
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onOpenPricing={() => setIsPricingOpen(true)}
                  onUpdateUser={(u) => setUser(u)}
                  onNavigate={(tab) => setActiveTab(tab)}
                />
              )}"""

target_render = """              {activeTab === 'archives' && (
                <ArchivesTab
                  user={user}
                  onOpenAuth={handleOpenAuth}
                  onLoadDraftContext={(partial) => {
                    setDelegateContext((prev) => ({ ...prev, ...partial }));
                    setActiveTab('position-paper');
                  }}
                />
              )}"""

app = app.replace(target_render, render_statement)

with open(app_path, "w") as f:
    f.write(app)

