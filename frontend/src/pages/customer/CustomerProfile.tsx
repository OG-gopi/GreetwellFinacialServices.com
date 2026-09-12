import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const CustomerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/profile', {
        firstName,
        lastName,
        phone,
      });

      if (res.data.success) {
        updateUser(res.data.data);
        setSuccessMsg('Profile details updated successfully.');
      }
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">User Profile Settings</h2>
        <p className="text-xs text-slate-500">Manage account information, contact details, and assigned roles</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {successMsg}
          </div>
        )}

        <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 font-extrabold text-white text-xl">
            {user.firstName[0]}{(user.lastName && user.lastName[0]) || ''}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">{user.firstName} {user.lastName || ''}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              {user.role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2.5 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address (Read Only)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full p-2.5 border rounded-lg bg-slate-100 text-slate-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border rounded-lg"
            />
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
