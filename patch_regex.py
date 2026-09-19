import re

file_path = "src/components/tabs/PositionPaperTab.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Remove state variables
content = re.sub(r"  const \[customTopic, setCustomTopic\] = useState\(''\);\n", "", content)
content = re.sub(r"  const \[isCustomTopicMode, setIsCustomTopicMode\] = useState\(false\);\n", "", content)

# Remove setIsCustomTopicMode from handleCommitteeChange
content = re.sub(r"      setIsCustomTopicMode\(false\);\n", "", content)

# Remove the two handlers completely
pattern = r"  const handleTopicTemplateChange = .*?};\n\n  const handleCustomTopicChange = .*?};\n"
content = re.sub(pattern, "", content, flags=re.DOTALL)

# Replace the JSX block
jsx_pattern = r"              \{\/\* Agenda Topic Selector with Presets \*\/}.*?\{\/\* Answer \/ Output Language \*\/\}"
new_jsx = """              {/* Agenda Topic Input */}
              <div>
                <label 
                  htmlFor="input-paper-topic"
                  className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                >
                  Agenda Topic
                </label>
                <input
                  id="input-paper-topic"
                  type="text"
                  value={context.topic}
                  onChange={(e) => onUpdateContext && onUpdateContext({ topic: e.target.value })}
                  placeholder="Enter specific crisis agenda or debate item..."
                  className="w-full min-h-[44px] p-3 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                />
              </div>

              {/* Answer / Output Language */}"""
content = re.sub(jsx_pattern, new_jsx, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)

