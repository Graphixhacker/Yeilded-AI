file_path = "src/components/Header.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """                  {(() => {
                    const currComm = UN_COMMITTEES.find(c => c.id === context.committee);
                    if (!currComm || !currComm.topics || currComm.topics.length <= 1) return null;
                    return (
                      <select
                        id="quick-topic-template-select"
                        onChange={(e) => {
                          if (e.target.value) safeUpdate({ topic: e.target.value });
                        }}
                        className="text-xs text-slate-500 dark:text-slate-400 bg-transparent border-none focus:outline-hidden cursor-pointer hover:text-[#0B1F3A] dark:hover:text-[#D4AF37]"
                        defaultValue=""
                      >
                        <option value="" disabled>Load agenda template...</option>
                        {currComm.topics.map((t, idx) => (
                          <option key={idx} value={t}>{t}</option>
                        ))}
                      </select>
                    );
                  })()}"""

content = content.replace(target, "")

with open(file_path, "w") as f:
    f.write(content)
