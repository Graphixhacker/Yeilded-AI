import re

app_path = "src/App.tsx"
with open(app_path, "r") as f:
    app = f.read()

import_statement = "import { DeepSeekChatbot } from './components/DeepSeekChatbot';\nimport { SettingsTab } from './components/tabs/SettingsTab';"
app = app.replace("import { SettingsTab } from './components/tabs/SettingsTab';", import_statement)

# Place the chatbot just before the closing </div> of the main wrapper
target_end = """      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}"""

replacement_end = """      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
      
      {/* DeepSeek Chatbot Floating Widget */}
      <DeepSeekChatbot />
    </div>
  );
}"""

app = app.replace(target_end, replacement_end)

with open(app_path, "w") as f:
    f.write(app)

