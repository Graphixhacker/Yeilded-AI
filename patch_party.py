import os
import re

# 1. Update Header.tsx
header_path = "src/components/Header.tsx"
with open(header_path, "r") as f:
    header = f.read()

# Replace Country & Committee sections with Committee first, then Country, then optional Party
new_header_fields = """
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Committee / Assembly
                </label>
                <select
                  id="context-committee-select"
                  value={context.committee}
                  onChange={(e) => {
                    const sel = UN_COMMITTEES.find(c => c.id === e.target.value);
                    safeUpdate({
                      committee: e.target.value,
                      topic: sel ? sel.defaultTopic : context.topic
                    });
                  }}
                  className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                >
                  {UN_COMMITTEES.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Country / Sovereign State
                </label>
                <select
                  id="context-country-select"
                  value={context.country}
                  onChange={(e) => safeUpdate({ country: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                >
                  {UN_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {isPNA && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Political Party
                  </label>
                  <select
                    id="context-party-select"
                    value={context.politicalParty || PAKISTAN_POLITICAL_PARTIES[0]}
                    onChange={(e) => safeUpdate({ politicalParty: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                  >
                    {PAKISTAN_POLITICAL_PARTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
"""

# Find the div containing Country and Committee
country_committee_regex = re.compile(r'<div>\s*<label[^>]*>\s*\{isPNA \? \'Political Party\' : \'Country / Sovereign State\'\}\s*</label>.*?</div>\s*<div>\s*<label[^>]*>\s*Committee / Assembly\s*</label>.*?</div>', re.DOTALL)
header = country_committee_regex.sub(new_header_fields.strip(), header)
with open(header_path, "w") as f:
    f.write(header)


# 2. Update OnboardingModal.tsx
ob_path = "src/components/OnboardingModal.tsx"
with open(ob_path, "r") as f:
    ob = f.read()

ob = ob.replace("const [country, setCountry] = useState(currentContext.country || 'United States of America');", "const [country, setCountry] = useState(currentContext.country || 'United States of America');\n  const [politicalParty, setPoliticalParty] = useState(currentContext.politicalParty || PAKISTAN_POLITICAL_PARTIES[0]);")

ob = ob.replace("country,\n      committee", "country,\n      politicalParty,\n      committee")

new_ob_fields = """
            {/* Committee Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                1. Select Committee
              </label>
              <select
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
              >
                {UN_COMMITTEES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Country Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                2. Select Representation
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
              >
                {UN_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            {isPNA && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  3. Political Party
                </label>
                <select
                  value={politicalParty}
                  onChange={(e) => setPoliticalParty(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
                >
                  {PAKISTAN_POLITICAL_PARTIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            )}
"""

ob_fields_regex = re.compile(r'\{\/\* Country Selection \*\/}.*?\{\/\* Committee Selection \*\/}.*?</div>\s*</div>', re.DOTALL)
ob = ob_fields_regex.sub(new_ob_fields.strip(), ob)

with open(ob_path, "w") as f:
    f.write(ob)

# 3. Update PositionPaperTab.tsx
pp_path = "src/components/tabs/PositionPaperTab.tsx"
with open(pp_path, "r") as f:
    pp = f.read()

pp = pp.replace("import { UN_COMMITTEES } from '../../data/unPresets';", "import { UN_COMMITTEES, PAKISTAN_POLITICAL_PARTIES } from '../../data/unPresets';")

new_pp_fields = """
              <div>
                <label 
                  htmlFor="input-paper-country"
                  className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                >
                  {isINTERPOL ? 'Member Country / National Central Bureau (NCB)' : 'Country / Sovereign State'}
                </label>
                <input
                  id="input-paper-country"
                  type="text"
                  value={context.country}
                  onChange={(e) => onUpdateContext && onUpdateContext({ country: e.target.value })}
                  placeholder={isINTERPOL ? 'e.g. France (NCB Paris)' : 'e.g. Pakistan, United States, Brazil'}
                  className="w-full min-h-[44px] p-2.5 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] transition-colors"
                />
              </div>

              {isPNA && (
                <div>
                  <label 
                    htmlFor="input-paper-party"
                    className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1"
                  >
                    Political Party
                  </label>
                  <select
                    id="input-paper-party"
                    value={context.politicalParty || PAKISTAN_POLITICAL_PARTIES[0]}
                    onChange={(e) => onUpdateContext && onUpdateContext({ politicalParty: e.target.value })}
                    className="w-full min-h-[44px] p-2.5 pr-8 rounded-xl bg-slate-50 dark:bg-[#0b1b33] border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] appearance-none cursor-pointer transition-colors"
                  >
                    {PAKISTAN_POLITICAL_PARTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
"""

pp_fields_regex = re.compile(r'<div>\s*<label[^>]*>\s*\{isPNA \? \'Political Party\' : isINTERPOL \? \'Member Country / National Central Bureau \(NCB\)\' : \'Country / Sovereign State\'\}\s*</label>.*?</div>', re.DOTALL)
pp = pp_fields_regex.sub(new_pp_fields.strip(), pp)

with open(pp_path, "w") as f:
    f.write(pp)

print("Patch applied.")
