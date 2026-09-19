import re

ob_path = "src/components/OnboardingModal.tsx"
with open(ob_path, "r") as f:
    ob = f.read()

target = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Country Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {isPNA ? 'Political Party' : 'Represented Nation'}
              </label>
              <select
                id="onboarding-country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
              >
                {(isPNA ? PAKISTAN_POLITICAL_PARTIES : UN_COUNTRIES).map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            {/* Committee Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Committee / Forum
              </label>
              <select
                id="onboarding-committee-select"
                value={committee}
                onChange={(e) => handleCommitteeChange(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
              >
                {UN_COMMITTEES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          </div>"""

replacement = """          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Committee Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                1. Select Committee
              </label>
              <select
                id="onboarding-committee-select"
                value={committee}
                onChange={(e) => handleCommitteeChange(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
              >
                {UN_COMMITTEES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
            {/* Country/Party Selector */}
            {!isPNA ? (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  2. Represented Nation
                </label>
                <select
                  id="onboarding-country-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
                >
                  {UN_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            ) : (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  2. Political Party
                </label>
                <select
                  id="onboarding-party-select"
                  value={politicalParty}
                  onChange={(e) => setPoliticalParty(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-[#071326] text-slate-800 dark:text-slate-200"
                >
                  {PAKISTAN_POLITICAL_PARTIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            )}
          </div>"""

ob = ob.replace(target, replacement)

# ensure politicalParty state exists
ob = ob.replace("const [country, setCountry] = useState(currentContext.country || 'United States of America');", "const [country, setCountry] = useState(currentContext.country || 'United States of America');\n  const [politicalParty, setPoliticalParty] = useState(currentContext.politicalParty || PAKISTAN_POLITICAL_PARTIES[0]);")

# ensure politicalParty is passed to the context update
ob = ob.replace("country,\n      committee", "country,\n      politicalParty,\n      committee")

with open(ob_path, "w") as f:
    f.write(ob)

print("OB Patch Applied")
