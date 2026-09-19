import re

file_path = "src/components/tabs/PositionPaperTab.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """  const handleCommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    console.log('[Yeilded] Committee selected:', selectedId);
    const found = UN_COMMITTEES.find((c) => c.id === selectedId);
    if (found) {
      if (onUpdateContext) {
        onUpdateContext({
          committee: found.id,
          topic: found.defaultTopic
        });
      }
    }
  };"""

replacement = """  const handleCommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    console.log('[Yeilded] Committee selected:', selectedId);
    if (onUpdateContext) {
      onUpdateContext({
        committee: selectedId
      });
    }
  };"""

content = content.replace(target, replacement)

with open(file_path, "w") as f:
    f.write(content)
