import re

sidebar_path = "src/components/Sidebar.tsx"
with open(sidebar_path, "r") as f:
    sidebar = f.read()

# Add Settings icon import
sidebar = sidebar.replace("import { \n  FileText, \n  Mic, ", "import { \n  Settings,\n  FileText, \n  Mic, ")
if "Settings," not in sidebar:
    sidebar = sidebar.replace("import {", "import { Settings,", 1)

# Add settings tab
archives_tab = """    {
      id: 'archives' as TabType,
      label: 'Saved Archive & Drafts',
      shortLabel: 'My Archive',
      icon: Archive,
      description: 'Export and organize all conference texts',
      gated: false
    }"""

settings_tab = """    {
      id: 'archives' as TabType,
      label: 'Saved Archive & Drafts',
      shortLabel: 'My Archive',
      icon: Archive,
      description: 'Export and organize all conference texts',
      gated: false
    },
    {
      id: 'settings' as TabType,
      label: 'Settings & Profile',
      shortLabel: 'Settings',
      icon: Settings,
      description: 'Manage account, subscription & preferences',
      gated: false
    }"""

sidebar = sidebar.replace(archives_tab, settings_tab)

with open(sidebar_path, "w") as f:
    f.write(sidebar)

