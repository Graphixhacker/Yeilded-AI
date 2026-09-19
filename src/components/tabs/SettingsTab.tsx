import React, { useState } from 'react';
import { User, TabType } from '../../types';
import { api } from '../../services/api';
import { Settings, User as UserIcon, Shield, CreditCard, Mail, ArrowRight, CheckCircle2, Archive } from 'lucide-react';

interface SettingsTabProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onUpdateUser: (u: User) => void;
  onNavigate: (tab: TabType) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  onOpenAuth,
  onOpenPricing,
  onUpdateUser,
  onNavigate
}) => {
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Sign in to Access Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Please log in to manage your profile, view subscription status, and access saved documents.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] px-6 py-2.5 rounded-xl font-bold transition-colors"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await api.updateProfile(name.trim());
      if (res.user) {
        onUpdateUser(res.user);
        setSaveMessage('Profile updated successfully!');
      }
    } catch (err) {
      setSaveMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A] dark:text-slate-100">Settings & Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4 text-[#0B1F3A] dark:text-[#D4AF37] font-bold">
          <UserIcon className="w-5 h-5" />
          <h3>Profile Details</h3>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input 
              type="text" 
              value={user.email} 
              disabled 
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving || !name.trim() || name === user.name}
              className="bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] px-5 py-2 rounded-lg text-base font-bold transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Update Profile'}
            </button>
            {saveMessage && (
              <span className={`text-sm font-bold ${saveMessage.includes('success') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {saveMessage}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-[#0B1F3A] dark:text-[#D4AF37] font-bold">
            <CreditCard className="w-5 h-5" />
            <h3>Subscription Status</h3>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                {user.tier === 'free' ? 'Free Tier' : `${user.tier} Pass`}
              </span>
              {user.tier !== 'free' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
            <p className="text-sm text-slate-500">
              {user.tier === 'free' 
                ? `${Math.max(0, 3 - user.generationsUsed)} of 3 lifetime free AI generations remaining.`
                : user.passExpiresAt 
                  ? `Active until ${new Date(user.passExpiresAt).toLocaleDateString()}`
                  : 'Active subscription.'}
            </p>
          </div>
          <button 
            onClick={onOpenPricing}
            className="text-base font-bold px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
          >
            {user.tier === 'free' ? 'Upgrade Pass' : 'Manage Subscription'}
          </button>
        </div>
      </div>

      {/* Saved Documents Section */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4 text-[#0B1F3A] dark:text-[#D4AF37] font-bold">
          <Archive className="w-5 h-5" />
          <h3>Manage Documents</h3>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400 mb-4">
          View, organize, and export your previously generated position papers, speeches, and resolutions.
        </p>
        <button 
          onClick={() => onNavigate('archives')}
          className="flex items-center gap-2 text-base font-bold text-[#0B1F3A] dark:text-[#D4AF37] hover:underline"
        >
          Open Saved Archive & Drafts <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Support Section */}
      <div className="bg-white dark:bg-[#071326] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-2 text-[#0B1F3A] dark:text-[#D4AF37] font-bold">
          <Mail className="w-5 h-5" />
          <h3>Contact Support</h3>
        </div>
        <p className="text-base text-slate-600 dark:text-slate-400 mb-4">
          Need help with your account or have a feature request? Reach out to our support team.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base font-mono text-slate-800 dark:text-slate-200">
          <Mail className="w-4 h-4 text-slate-400" />
          <a href="mailto:support@yeilded.com" className="hover:text-blue-500 transition-colors">
            support@yeilded.com
          </a>
        </div>
      </div>
      
    </div>
  );
};
