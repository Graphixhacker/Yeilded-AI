import re

file_path = "server/aiService.ts"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("'deepseek-v4.1-flash'", "'deepseek-chat'")

with open(file_path, "w") as f:
    f.write(content)

