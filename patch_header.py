import re

header_path = "src/components/Header.tsx"
with open(header_path, "r") as f:
    header = f.read()

# Make Header accept onNavigate
if "onNavigate?: (tab: TabType) => void;" not in header:
    header = header.replace("onToggleDarkMode?: () => void;\n}", "onToggleDarkMode?: () => void;\n  onNavigate?: (tab: string) => void;\n}")
    header = header.replace("isDarkMode = false,\n  onToggleDarkMode\n})", "isDarkMode = false,\n  onToggleDarkMode,\n  onNavigate\n})")

settings_btn = """                <button
                  id="user-menu-settings-btn"
                  onClick={() => { setShowUserMenu(false); if (onNavigate) onNavigate('settings'); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>"""

target = """                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  id="user-menu-logout-btn"
                  onClick={() => { setShowUserMenu(false); onLogout(); }}"""

header = header.replace(target, settings_btn + "\n                <button\n                  id=\"user-menu-logout-btn\"\n                  onClick={() => { setShowUserMenu(false); onLogout(); }}")

# Fix missing Settings icon
header = header.replace("import { Globe, Shield,", "import { Globe, Shield, Settings,")

with open(header_path, "w") as f:
    f.write(header)

