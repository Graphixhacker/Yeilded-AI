import re

file_path = "src/components/Header.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """                  onChange={(e) => {
                    const sel = UN_COMMITTEES.find(c => c.id === e.target.value);
                    safeUpdate({
                      committee: e.target.value,
                      topic: sel ? sel.defaultTopic : context.topic
                    });
                  }}"""

replacement = """                  onChange={(e) => {
                    safeUpdate({
                      committee: e.target.value
                    });
                  }}"""

content = content.replace(target, replacement)

with open(file_path, "w") as f:
    f.write(content)
