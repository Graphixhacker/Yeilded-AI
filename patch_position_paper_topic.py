import re

file_path = "src/components/tabs/PositionPaperTab.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Remove states
content = content.replace("  const [customTopic, setCustomTopic] = useState('');\n", "")
content = content.replace("  const [isCustomTopicMode, setIsCustomTopicMode] = useState(false);\n", "")

# 2. Remove setIsCustomTopicMode(false) from handleCommitteeChange
content = content.replace("      setIsCustomTopicMode(false);\n", "")

# 3. Remove handleTopicTemplateChange
target_template_handler = """  const handleTopicTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomTopicMode(true);
    } else {
      setIsCustomTopicMode(false);
      if (onUpdateContext) {
        onUpdateContext({ topic: val });
      }
    }
  };"""
content = content.replace(target_template_handler, "")

# 4. Remove handleCustomTopicChange
target_custom_handler = """  const handleCustomTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomTopic(val);
    if (onUpdateContext) {
      onUpdateContext({ topic: val });
    }
  };"""
content = content.replace(target_custom_handler, "")

# 5. Replace JSX
target_jsx = """              {/* Agenda Topic Selector with Presets */}
              <div>
                <label 
                  htmlFor="select-paper-topic-template"
                  className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                >
                  Agenda Topic Template
                </label>
                <div className="relative">
                  <select
                    id="select-paper-topic-template"
                    value={isCustomTopicMode ? '__custom__' : context.topic}
                    onChange={handleTopicTemplateChange}
                    className="w-full min-h-[44px] p-4 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
                  >
                    {currentComm.topics.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="__custom__">✎ Enter custom topic...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Custom Topic Input if selected */}
              {isCustomTopicMode && (
                <div>
                  <label 
                    htmlFor="input-paper-custom-topic"
                    className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                  >
                    Custom Topic Name
                  </label>
                  <input
                    id="input-paper-custom-topic"
                    type="text"
                    value={customTopic || context.topic}
                    onChange={handleCustomTopicChange}
                    placeholder="Enter specific crisis agenda or debate item..."
                    className="w-full min-h-[44px] p-4 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                  />
                </div>
              )}"""

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
                  className="w-full min-h-[44px] p-4 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                />
              </div>"""

content = content.replace(target_jsx, new_jsx)

with open(file_path, "w") as f:
    f.write(content)

