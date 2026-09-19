import re

ai_path = "server/aiService.ts"
with open(ai_path, "r") as f:
    content = f.read()

# Add dotenv at the top
if "dotenv" not in content:
    content = "import * as dotenv from 'dotenv';\ndotenv.config();\n" + content

with open(ai_path, "w") as f:
    f.write(content)

