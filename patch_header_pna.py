import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Make sure to import PAKISTAN_POLITICAL_PARTIES
if "PAKISTAN_POLITICAL_PARTIES" not in content:
    content = content.replace("UN_COUNTRIES", "UN_COUNTRIES, PAKISTAN_POLITICAL_PARTIES")

# Find the label
old_label = """                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Sovereign State / Country
                </label>"""
new_label = """                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {context.committee === 'PNA' || context.committee === 'NA' ? 'Political Party' : 'Sovereign State / Country'}
                </label>"""
content = content.replace(old_label, new_label)

# Find the select
old_select = """                <select
                  id="context-country-select"
                  value={context.country}
                  onChange={(e) => safeUpdate({ country: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                >
                  {UN_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>"""
new_select = """                <select
                  id="context-country-select"
                  value={context.country}
                  onChange={(e) => safeUpdate({ country: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 text-base sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 font-medium text-slate-800 dark:text-slate-100"
                >
                  {(context.committee === 'PNA' || context.committee === 'NA' ? PAKISTAN_POLITICAL_PARTIES : UN_COUNTRIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>"""
content = content.replace(old_select, new_select)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
