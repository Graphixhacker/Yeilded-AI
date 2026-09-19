import re

# 1. Update Header.tsx
header_path = "src/components/Header.tsx"
with open(header_path, "r") as f:
    header = f.read()

country_block_header = """              <div>
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
              </div>"""

new_country_block_header = """              {!isPNA && (
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
              )}"""

header = header.replace(country_block_header, new_country_block_header)
with open(header_path, "w") as f:
    f.write(header)

# 2. Update OnboardingModal.tsx
ob_path = "src/components/OnboardingModal.tsx"
with open(ob_path, "r") as f:
    ob = f.read()

country_block_ob = """            {/* Country Selection */}
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
            </div>"""

new_country_block_ob = """            {/* Country Selection */}
            {!isPNA && (
              <div className="animate-in slide-in-from-top-2 duration-200">
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
            )}"""

ob = ob.replace(country_block_ob, new_country_block_ob)

# Update political party label in OnboardingModal to 2
ob = ob.replace("3. Political Party", "2. Political Party")

with open(ob_path, "w") as f:
    f.write(ob)

# 3. Update PositionPaperTab.tsx
pp_path = "src/components/tabs/PositionPaperTab.tsx"
with open(pp_path, "r") as f:
    pp = f.read()

country_block_pp = """              <div>
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
              </div>"""

new_country_block_pp = """              {!isPNA && (
                <div className="animate-in slide-in-from-top-2 duration-200">
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
              )}"""

pp = pp.replace(country_block_pp, new_country_block_pp)
with open(pp_path, "w") as f:
    f.write(pp)

print("Patch applied.")
