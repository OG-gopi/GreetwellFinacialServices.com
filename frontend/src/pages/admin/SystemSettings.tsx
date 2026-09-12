import React, { useState, useEffect } from 'react';
import { Settings, Shield, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, pRes, dRes] = await Promise.all([
          api.get('/settings/system-settings'),
          api.get('/settings/permissions'),
          api.get('/settings/doc-types'),
        ]);
        setSettings(sRes.data.data || []);
        setPermissions(pRes.data.data || []);
        setDocTypes(dRes.data.data || []);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">System Settings & Role Permissions</h2>
        <p className="text-xs text-slate-500">Global portal configuration, document categories, and permission definitions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Types */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
            <FileText className="h-4 w-4 text-blue-600" /> Configured Document Requirements
          </h3>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {docTypes.map((dt) => (
              <div key={dt.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{dt.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Code: {dt.code} | Category: {dt.category}</p>
                </div>
                {dt.isRequiredDefault && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">
                    Required Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
            <Settings className="h-4 w-4 text-purple-600" /> Portal System Parameters
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {settings.map((st) => (
              <div key={st.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-mono text-slate-700 font-bold">{st.key}</span>
                <span className="font-semibold text-blue-700 bg-white px-2 py-1 border rounded">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
          <Shield className="h-4 w-4 text-emerald-600" /> Active Role-Based Permission Matrix ({permissions.length} Grants)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {['SUPER_ADMIN', 'LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT', 'CUSTOMER'].map((role) => {
            const rolePerms = permissions.filter((p) => p.role === role);
            return (
              <div key={role} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-extrabold text-blue-900 uppercase text-[11px] border-b pb-1">
                  {role.replace(/_/g, ' ')}
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {rolePerms.map((p) => (
                    <div key={p.id} className="flex items-center text-[10px] text-slate-700">
                      <CheckCircle className="h-3 w-3 text-emerald-500 mr-1 flex-shrink-0" />
                      <span className="font-mono truncate">{p.permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
