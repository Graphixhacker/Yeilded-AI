import React, { useState, useEffect } from 'react';
import { api, request } from '../services/api';
import { User } from '../types';
import { Users, Shield, DollarSign, Activity, AlertCircle, CheckCircle2, UserX, UserCheck, Link as LinkIcon, Plus } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
}

interface Partnership {
  id: string;
  name: string;
  contact: string;
  affiliateCode: string;
  discountRate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  referredUsers: number;
  paidConversions: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Modal States (to bypass iframe prompt/confirm blocks)
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({ name: '', contact: '', affiliateCode: '', discountRate: '' });
  const [partnerToRemove, setPartnerToRemove] = useState<Partnership | null>(null);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await request('/admin/stats');
        setStats(statsRes);
        
        const usersRes = await request('/admin/users');
        setUsers(usersRes.users || []);

        const partnersRes = await request('/admin/partnerships');
        setPartnerships(partnersRes.partnerships || []);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateTier = async (userId: string, tier: string) => {
    try {
      await request(`/admin/users/${userId}/tier`, {
        method: 'POST',
        body: JSON.stringify({ tier })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, tier } : u));
    } catch (err) {
      alert('Failed to update tier');
    }
  };

  const handleToggleBan = async (userId: string, banned: boolean) => {
    try {
      await request(`/admin/users/${userId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ banned })
      });
      setUsers(users.map(u => u.id === userId ? { ...u, banned } : u));
    } catch (err) {
      alert('Failed to update ban status');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-rose-600" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#071326] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-base mb-1">Total Users</div>
          <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
        </div>
        <div className="bg-white dark:bg-[#071326] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-base mb-1">Free Tier Users</div>
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">{stats?.freeUsers || 0}</div>
        </div>
        <div className="bg-white dark:bg-[#071326] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-slate-500 text-base mb-1">Paid/Premium Users</div>
          <div className="text-3xl font-bold text-[#D4AF37]">{stats?.paidUsers || 0}</div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium text-center">Chat Usage</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.tier} 
                      onChange={(e) => handleUpdateTier(u.id, e.target.value)}
                      className="bg-transparent border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="1week">1-Week Pass</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <span className="text-[#D4AF37] font-bold">{u.chatUsage?.count || 0}</span>
                      <span className="text-slate-400 text-xs">today</span>
                      {u.chatUsage?.lifetimeCount !== undefined && (
                        <span className="text-slate-500 text-xs font-normal">({u.chatUsage.lifetimeCount} all-time)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.banned ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleBan(u.id, !u.banned)}
                      className={`text-sm px-3 py-1.5 rounded-lg border ${u.banned ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}
                    >
                      {u.banned ? 'Unban' : 'Ban User'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      
      {/* Partnerships Section */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">Partnerships & Affiliates</h2>
          <button 
            onClick={() => setShowAddPartner(true)}
            className="flex items-center gap-2 text-sm bg-[#0B1F3A] hover:bg-[#132c4f] transition-colors text-[#D4AF37] px-3 py-1.5 rounded-lg font-bold"
          >
            <Plus className="w-4 h-4" /> Add Partner
          </button>
        </div>
        
        {partnerships.length === 0 ? (
          <div className="p-6 text-slate-500 text-base text-center">
            No partnerships configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Partner Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Rate</th>
                  <th className="px-6 py-4 font-medium text-center">Referred</th>
                  <th className="px-6 py-4 font-medium text-center">Paid Conversions</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {partnerships.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{p.contact}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono">{p.affiliateCode}</span></td>
                    <td className="px-6 py-4 text-slate-500">{p.discountRate}</td>
                    <td className="px-6 py-4 text-center font-bold">{p.referredUsers || 0}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{p.paidConversions || 0}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setPartnerToRemove(p)}
                        className="text-sm px-3 py-1.5 rounded-lg border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Custom Modals */}
      {showAddPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0c1c33] rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add New Partner</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Partner Name *</label>
                <input type="text" value={newPartnerForm.name} onChange={e => setNewPartnerForm({...newPartnerForm, name: e.target.value})} className="w-full px-3 py-2 text-base border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Affiliate Code *</label>
                <input type="text" value={newPartnerForm.affiliateCode} onChange={e => setNewPartnerForm({...newPartnerForm, affiliateCode: e.target.value})} className="w-full px-3 py-2 text-base border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Info (Optional)</label>
                <input type="text" value={newPartnerForm.contact} onChange={e => setNewPartnerForm({...newPartnerForm, contact: e.target.value})} className="w-full px-3 py-2 text-base border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Commission Rate (Optional)</label>
                <input type="text" value={newPartnerForm.discountRate} onChange={e => setNewPartnerForm({...newPartnerForm, discountRate: e.target.value})} className="w-full px-3 py-2 text-base border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#071326] border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowAddPartner(false)} className="px-4 py-2 text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
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
                className="px-4 py-2 text-base font-bold bg-[#0B1F3A] text-[#D4AF37] hover:bg-[#132c4f] rounded-lg transition-colors disabled:opacity-50"
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
              <p className="text-base text-slate-600 dark:text-slate-400 text-center">
                Are you sure you want to permanently remove <strong>{partnerToRemove.name}</strong> from the system?
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#071326] border-t border-slate-100 dark:border-slate-800 flex justify-center gap-3">
              <button onClick={() => setPartnerToRemove(null)} className="flex-1 px-4 py-2 text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
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
                className="flex-1 px-4 py-2 text-base font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

