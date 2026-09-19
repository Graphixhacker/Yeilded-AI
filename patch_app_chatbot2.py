import re

app_path = "src/App.tsx"
with open(app_path, "r") as f:
    app = f.read()

# Make sure import is there
if "import { DeepSeekChatbot } from './components/DeepSeekChatbot';" not in app:
    app = app.replace("import { SettingsTab } from './components/tabs/SettingsTab';", "import { DeepSeekChatbot } from './components/DeepSeekChatbot';\nimport { SettingsTab } from './components/tabs/SettingsTab';")

target = """    </div>
  );
}"""

replacement = """      {/* DeepSeek Chatbot Floating Widget */}
      <DeepSeekChatbot />
    </div>
  );
}"""

# Check if it was already patched and just missed
if "DeepSeekChatbot Floating Widget" not in app:
    app = app.replace(target, replacement)
    
with open(app_path, "w") as f:
    f.write(app)

print("App patched for chatbot again")
