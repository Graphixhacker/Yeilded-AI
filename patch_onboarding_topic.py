file_path = "src/components/OnboardingModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """              {selectedCommitteeObj?.topics && selectedCommitteeObj.topics.length > 1 && (
                <select
                  id="onboarding-topic-template-select"
                  onChange={(e) => {
                    if (e.target.value) setTopic(e.target.value);
                  }}
                  className="text-xs text-amber-700 dark:text-amber-400 bg-transparent border-none focus:outline-hidden cursor-pointer hover:underline"
                  defaultValue=""
                >
                  <option value="" disabled>Select agenda template...</option>
                  {selectedCommitteeObj.topics.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              )}"""

content = content.replace(target, "")

with open(file_path, "w") as f:
    f.write(content)
