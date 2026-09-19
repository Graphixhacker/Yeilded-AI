import re

file_path = "src/components/tabs/PositionPaperTab.tsx"
with open(file_path, "r") as f:
    content = f.read()

pattern = r"  const handleTopicTemplateChange = .*?};\n"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)

