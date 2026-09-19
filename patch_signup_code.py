import re

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# Add affiliateCode state
if "const [affiliateCode, setAffiliateCode] = useState('');" not in content:
    content = content.replace("const [password, setPassword] = useState('');", "const [password, setPassword] = useState('');\n  const [affiliateCode, setAffiliateCode] = useState('');")

# Update register call
content = content.replace("await api.register(cleanEmail, delegateName, cleanPassword);", "await api.register(cleanEmail, delegateName, cleanPassword, affiliateCode);")

# Add input in form
input_html = """
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Referral / Affiliate Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value)}
                    placeholder="e.g. MUN2026"
                    className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>
            )}
"""

if "Referral / Affiliate Code (Optional)" not in content:
    content = content.replace('className="space-y-3.5">', 'className="space-y-3.5">' + input_html)

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)
