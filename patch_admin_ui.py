import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

new_ui = """
      {/* Partnerships Section */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">Partnerships & Affiliates</h2>
          <button 
            onClick={() => {
              const name = prompt("Enter Partner Name:");
              if (!name) return;
              const contact = prompt("Enter Contact Info (Email/Phone):");
              const affiliateCode = prompt("Enter Unique Affiliate Code (e.g. PARTNER25):");
              if (!affiliateCode) return;
              const discountRate = prompt("Enter Discount/Commission Rate:");
              
              api.request('/admin/partnerships', {
                method: 'POST',
                body: JSON.stringify({ name, contact, affiliateCode, discountRate, status: 'active' })
              }).then(p => {
                setPartnerships([...partnerships, p]);
              }).catch(e => alert('Failed to create partner'));
            }}
            className="flex items-center gap-2 text-xs bg-[#0B1F3A] hover:bg-[#132c4f] transition-colors text-[#D4AF37] px-3 py-1.5 rounded-lg font-bold"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>
        </div>
        
        {partnerships.length === 0 ? (
          <div className="p-6 text-slate-500 text-sm text-center">
            No partnerships configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Partner Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Rate</th>
                  <th className="px-6 py-4 font-medium text-center">Referred</th>
                  <th className="px-6 py-4 font-medium text-center">Paid Conversions</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {partnerships.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{p.contact}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">{p.affiliateCode}</span></td>
                    <td className="px-6 py-4 text-slate-500">{p.discountRate}</td>
                    <td className="px-6 py-4 text-center font-bold">{p.referredUsers || 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{p.paidConversions || 0}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
"""

content = re.sub(r'\{\/\* Partnerships Section Placeholder for UI completeness \*\/\}.*?</div>\s*</div>\s*\);\s*\}\;', new_ui + '\n    </div>\n  );\n};\n', content, flags=re.DOTALL)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)

