import re

file_path = "src/components/OnboardingModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """  const handleCommitteeChange = (commId: string) => {
    setCommittee(commId);
    const comm = UN_COMMITTEES.find(c => c.id === commId);
    if (comm) {
      setTopic(comm.defaultTopic);
    }
  };"""

replacement = """  const handleCommitteeChange = (commId: string) => {
    setCommittee(commId);
  };"""

content = content.replace(target, replacement)

with open(file_path, "w") as f:
    f.write(content)
