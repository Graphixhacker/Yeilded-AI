import re

admin_path = "src/components/AdminDashboard.tsx"
with open(admin_path, "r") as f:
    admin = f.read()

# Add new states
state_insertion = """  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Modal States (to bypass iframe prompt/confirm blocks)
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({ name: '', contact: '', affiliateCode: '', discountRate: '' });
  const [partnerToRemove, setPartnerToRemove] = useState<Partnership | null>(null);"""

admin = admin.replace("  const [partnerships, setPartnerships] = useState<Partnership[]>([]);\n  const [loading, setLoading] = useState(true);", state_insertion)

# Replace Add Partner Button
add_partner_btn = """          <button 
            onClick={() => {
              const name = prompt("Enter Partner Name:");
              if (!name) return;
              const contact = prompt("Enter Contact Info (Email/Phone):");
              const affiliateCode = prompt("Enter Unique Affiliate Code (e.g. PARTNER25):");
              if (!affiliateCode) return;
              const discountRate = prompt("Enter Discount/Commission Rate:");
              
              request('/admin/partnerships', {
                method: 'POST',
                body: JSON.stringify({ name, contact, affiliateCode, discountRate, status: 'active' })
              }).then(p => {
                setPartnerships([...partnerships, p]);
              }).catch(e => { console.error('Add Partner Error:', e); alert('Failed to create partner: ' + (e.message || JSON.stringify(e))); });
            }}
            className="flex items-center gap-2 text-xs bg-[#0B1F3A] hover:bg-[#132c4f] transition-colors text-[#D4AF37] px-3 py-1.5 rounded-lg font-bold"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>"""

new_add_partner_btn = """          <button 
            onClick={() => setShowAddPartner(true)}
            className="flex items-center gap-2 text-xs bg-[#0B1F3A] hover:bg-[#132c4f] transition-colors text-[#D4AF37] px-3 py-1.5 rounded-lg font-bold"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>"""

admin = admin.replace(add_partner_btn, new_add_partner_btn)

# Replace Remove Button
remove_partner_btn = """                      <button 
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to remove partner ${p.name}?`)) return;
                          try {
                            await request(`/admin/partnerships/${p.id}`, { method: 'DELETE' });
                            setPartnerships(partnerships.filter(pt => pt.id !== p.id));
                          } catch (e) {
                            alert('Failed to delete partner');
                          }
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        Remove
                      </button>"""

new_remove_partner_btn = """                      <button 
                        onClick={() => setPartnerToRemove(p)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        Remove
                      </button>"""
admin = admin.replace(remove_partner_btn, new_remove_partner_btn)

# Add modals to end of component
modals = """
      {/* Custom Modals */}
      {showAddPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0c1c33] rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Partner</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Partner Name *</label>
                <input type="text" value={newPartnerForm.name} onChange={e => setNewPartnerForm({...newPartnerForm, name: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliate Code *</label>
                <input type="text" value={newPartnerForm.affiliateCode} onChange={e => setNewPartnerForm({...newPartnerForm, affiliateCode: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Info (Optional)</label>
                <input type="text" value={newPartnerForm.contact} onChange={e => setNewPartnerForm({...newPartnerForm, contact: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Commission Rate (Optional)</label>
                <input type="text" value={newPartnerForm.discountRate} onChange={e => setNewPartnerForm({...newPartnerForm, discountRate: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#071326] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowAddPartner(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={async () => {
                  if (!newPartnerForm.name || !newPartnerForm.affiliateCode) return;
                  try {
                    const p = await request('/admin/partnerships', {
                      method: 'POST',
                      body: JSON.stringify({ ...newPartnerForm, status: 'active' })
                    });
                    setPartnerships([...partnerships, p]);
                    setNewPartnerForm({ name: '', contact: '', affiliateCode: '', discountRate: '' });
                    setShowAddPartner(false);
                  } catch (e: any) {
                    alert('Error: ' + (e.message || JSON.stringify(e)));
                  }
                }}
                disabled={!newPartnerForm.name || !newPartnerForm.affiliateCode}
                className="px-4 py-2 text-sm font-bold bg-[#0B1F3A] text-[#D4AF37] hover:bg-[#132c4f] rounded-lg transition-colors disabled:opacity-50"
              >
                Create Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {partnerToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0c1c33] rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 text-center mb-2">Remove Partner?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Are you sure you want to permanently remove <strong>{partnerToRemove.name}</strong> from the system?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#071326] border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3">
              <button onClick={() => setPartnerToRemove(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button 
                onClick={async () => {
                  try {
                    await request(`/admin/partnerships/${partnerToRemove.id}`, { method: 'DELETE' });
                    setPartnerships(partnerships.filter(pt => pt.id !== partnerToRemove.id));
                    setPartnerToRemove(null);
                  } catch (e) {
                    alert('Failed to delete partner');
                  }
                }}
                className="flex-1 px-4 py-2 text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};"""

admin = admin.replace("    </div>\n  );\n};", modals)

with open(admin_path, "w") as f:
    f.write(admin)

print("Modals injected.")
