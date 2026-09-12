import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, Users, UserCheck, Briefcase } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ReportsSub: React.FC<{ subPage?: string }> = ({ subPage = 'applications' }) => {
  const { user } = useAuth();
  const [appReports, setAppReports] = useState<any>(null);
  const [userReports, setUserReports] = useState<any>(null);
  const [agentReports, setAgentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [appRes, userRes, agentRes] = await Promise.all([
        api.get('/reports/applications'),
        api.get('/reports/users'),
        api.get('/reports/agents'),
      ]);
      setAppReports(appRes.data.data || {});
      setUserReports(userRes.data.data || {});
      setAgentReports(agentRes.data.data || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [subPage]);

  const handleDownloadCSV = (reportType: string) => {
    window.open(`${api.defaults.baseURL}/reports/export?reportType=${reportType}`, '_blank');
  };

  const isLoanRole = user?.role === 'LOAN_AGENT';
  const isInsuranceRole = user?.role === 'INSURANCE_AGENT';
  const isInvestmentRole = user?.role === 'INVESTMENT_AGENT';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Executive Reports & Data Analytics</h2>
          <p className="text-slate-500">Generate CSV exports, monitor application trends, and review processing metrics</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadCSV('applications')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Applications CSV
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDownloadCSV('users')}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Users CSV
            </button>
          )}
        </div>
      </div>

      {subPage === 'users' ? (
        <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-3">User Registrations & Role Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border space-y-2">
              <h4 className="font-bold text-slate-800">Users by Role</h4>
              {userReports?.roleBreakdown?.map((rb: any) => (
                <div key={rb.role} className="flex justify-between font-semibold border-b py-1">
                  <span>{rb.role.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-blue-700">{rb._count._all}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border space-y-2">
              <h4 className="font-bold text-slate-800">Account Statuses</h4>
              {userReports?.statusBreakdown?.map((sb: any) => (
                <div key={sb.status} className="flex justify-between font-semibold border-b py-1">
                  <span>{sb.status}</span>
                  <span className="font-bold text-emerald-700">{sb._count._all}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : subPage === 'agents' ? (
        <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-3">Agent Processing & Performance</h3>
          <div className="divide-y divide-slate-100">
            {agentReports.map((ag) => (
              <div key={ag.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{ag.firstName} {ag.lastName}</p>
                  <p className="text-slate-500">{ag.email} ({ag.role.replace(/_/g, ' ')})</p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold rounded-full border">
                  {ag._count.assignedApplications} Applications Handled
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-6 space-y-4 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-3">Application Volumes & Category Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(isSuperAdmin || isLoanRole) && (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Loan Submissions</p>
                <p className="text-2xl font-black text-purple-900 mt-1">{appReports?.summary?.loanApplications || 0}</p>
              </div>
            )}
            {(isSuperAdmin || isInsuranceRole) && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Insurance Policies</p>
                <p className="text-2xl font-black text-amber-900 mt-1">{appReports?.summary?.insuranceApplications || 0}</p>
              </div>
            )}
            {(isSuperAdmin || isInvestmentRole) && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Investment Funds</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{appReports?.summary?.investmentApplications || 0}</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-slate-500 font-bold uppercase text-[10px]">Total Applications</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{appReports?.summary?.totalApplications || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
