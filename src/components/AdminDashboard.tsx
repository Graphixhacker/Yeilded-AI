import React, { useState, useEffect } from 'react';
import { api, request } from '../services/api';
import { User } from '../types';
import { Users, Shield, DollarSign, Activity, AlertCircle, CheckCircle2, UserX, UserCheck, Link as LinkIcon, Plus, Database, RefreshCw, Server, HardDrive, Clock } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
}

interface DatabaseHealth {
  status: 'connected' | 'degraded' | 'disconnected';
  databaseConfigured: boolean;
  provider: string;
  latencyMs: number;
  tables: Record<string, number>;
  hostMasked?: string;
  databaseName?: string;
  serverTimestamp?: string;
  pgVersion?: string;
  error?: string;
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
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Custom Modal States (to bypass iframe prompt/confirm blocks)
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({ name: '', contact: '', affiliateCode: '', discountRate: '' });
  const [partnerToRemove, setPartnerToRemove] = useState<Partnership | null>(null);

  const fetchDbHealth = async () => {
    setLoadingDb(true);
    try {
      const res = await request('/admin/db-health');
      setDbHealth(res);
    } catch (err: any) {
      setDbHealth({
        status: 'disconnected',
        databaseConfigured: false,
        provider: 'Disconnected',
        latencyMs: 0,
        tables: {},
        error: err.message || 'Failed to ping database'
      });
    } finally {
      setLoadingDb(false);
    }
  };

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

        await fetchDbHealth();
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

      {/* PostgreSQL Database Health & Connection Status */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${dbHealth?.status === 'connected' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">PostgreSQL Database Status</h2>
                {dbHealth?.status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connected & Healthy
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {dbHealth?.provider || 'Disconnected'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time connection monitoring, query latency, and relational table integrity
              </p>
            </div>
          </div>
          
          <button
            onClick={fetchDbHealth}
            disabled={loadingDb}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-50 min-h-[38px] cursor-pointer"
            title="Ping database and refresh health status"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDb ? 'animate-spin text-[#D4AF37]' : 'text-slate-500'}`} />
            <span>{loadingDb ? 'Testing Connection...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Database Metrics Grid */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" /> Engine & Driver
              </div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 truncate">
                {dbHealth?.provider || 'Unknown'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {dbHealth?.hostMasked ? `Host: ${dbHealth.hostMasked}` : 'DATABASE_URL status'}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Query Latency
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${
                  !dbHealth?.databaseConfigured ? 'text-slate-400' :
                  (dbHealth?.latencyMs || 0) < 150 ? 'text-emerald-600 dark:text-emerald-400' :
                  (dbHealth?.latencyMs || 0) < 400 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {dbHealth?.databaseConfigured ? `${dbHealth?.latencyMs ?? 0} ms` : 'N/A'}
                </span>
                <span className="text-xs text-slate-400">round-trip ping</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {dbHealth?.serverTimestamp ? `Server: ${new Date(dbHealth.serverTimestamp).toLocaleTimeString()}` : 'Verified via SELECT NOW()'}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Relational Schema
              </div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">
                {dbHealth?.status === 'connected' ? '8 Relational Tables' : 'In-Memory Fallback'}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Schema DDL Initialized
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" /> Total Stored Records
              </div>
              <div className="text-2xl font-bold text-[#D4AF37]">
                {dbHealth?.tables
                  ? Object.values(dbHealth.tables).reduce((a: number, b: number) => a + (typeof b === 'number' && b > 0 ? b : 0), 0)
                  : 0}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live row count across tables
              </div>
            </div>
          </div>

          {/* Warning notice if not configured or disconnected */}
          {dbHealth?.error && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Database Note: </span>
                <span>{dbHealth.error}</span>
                {!dbHealth.databaseConfigured && (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    When deploying on Vercel or production, configure the <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">DATABASE_URL</code> environment variable in your project settings.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Table Breakdown Badges */}
          {dbHealth?.tables && (
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                Table Record Distribution (Live Relational Queries)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {Object.entries(dbHealth.tables).map(([table, count]) => (
                  <div key={table} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-center">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate capitalize font-medium" title={table}>
                      {table.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {Number(count) >= 0 ? count : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

