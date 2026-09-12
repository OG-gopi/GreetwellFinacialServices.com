import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Phone, ShieldCheck, Settings, Check, X } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { InviteCustomerModal } from '../../components/common/InviteCustomerModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LazyLoadTrigger } from '../../components/common/LazyLoadTrigger';

export const AgentCustomers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Manage Services Modal State for Super Admin
  const [selectedCustForServices, setSelectedCustForServices] = useState<User | null>(null);
  const [modalServices, setModalServices] = useState<string[]>([]);
  const [savingServices, setSavingServices] = useState(false);
  const [serviceModalError, setServiceModalError] = useState('');

  const fetchCustomers = async (pageToFetch = 1, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await api.get(`/users?role=CUSTOMER&page=${pageToFetch}&limit=15`);
      if (res.data.success) {
        const fetchedList = res.data.data || [];
        if (isInitial) {
          setCustomers(fetchedList);
        } else {
          setCustomers((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newUnique = fetchedList.filter((c: User) => !existingIds.has(c.id));
            return [...prev, ...newUnique];
          });
        }
        if (res.data.pagination) {
          setHasMore(pageToFetch < (res.data.pagination.totalPages || 1));
        } else {
          setHasMore(fetchedList.length === 15);
        }
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCustomers(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCustomers(nextPage, false);
    }
  };

  const openManageServices = (cust: User) => {
    setSelectedCustForServices(cust);
    const existing = Array.isArray(cust.serviceTypes)
      ? cust.serviceTypes.map((s) => s.toUpperCase())
      : ['LOANS'];
    setModalServices(existing);
    setServiceModalError('');
  };

  const toggleModalService = (srv: string) => {
    if (modalServices.includes(srv)) {
      if (modalServices.length > 1) {
        setModalServices(modalServices.filter((s) => s !== srv));
      }
    } else {
      setModalServices([...modalServices, srv]);
    }
  };

  const handleSaveServices = async () => {
    if (!selectedCustForServices) return;
    setSavingServices(true);
    setServiceModalError('');
    try {
      const res = await api.put(`/users/${selectedCustForServices.id}/services`, {
        serviceTypes: modalServices,
      });
      if (res.data.success) {
        setSelectedCustForServices(null);
        fetchCustomers();
      }
    } catch (err: any) {
      setServiceModalError(err.response?.data?.message || 'Failed to update customer services.');
    } finally {
      setSavingServices(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentUser?.role === 'SUPER_ADMIN' ? 'All System Customers' : 'Assigned Customers'}
          </h2>
          <p className="text-xs text-slate-500">Customer directory, profiles, and customer invitation engine</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 self-start transition-all"
        >
          <UserPlus className="h-4 w-4" /> Invite Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Service Types</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                {currentUser?.role === 'SUPER_ADMIN' && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={currentUser?.role === 'SUPER_ADMIN' ? 8 : 7} className="py-8 text-center text-slate-500">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={currentUser?.role === 'SUPER_ADMIN' ? 8 : 7} className="py-8 text-center text-slate-500">No customers found. Click "Invite Customer" to onboard your first client.</td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      {cust.customerIdCode ? (
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[11px]">
                          {cust.customerIdCode}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {cust.firstName} {cust.lastName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{cust.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{cust.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {cust.serviceTypes && cust.serviceTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cust.serviceTypes.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cust.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openManageServices(cust)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 inline-flex items-center gap-1 transition-all"
                        >
                          <Settings className="w-3 h-3 text-slate-500" /> Manage Services
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <LazyLoadTrigger
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={loadingMore}
          totalItems={customers.length}
          endMessage="You're all caught up."
        />
      </div>

      <InviteCustomerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => fetchCustomers()}
      />

      {/* Super Admin Service Management Modal */}
      {selectedCustForServices && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Manage Customer Services</h3>
                <p className="text-xs text-slate-500">
                  Customer: <strong>{selectedCustForServices.firstName} {selectedCustForServices.lastName}</strong> ({selectedCustForServices.customerIdCode || selectedCustForServices.email})
                </p>
              </div>
              <button onClick={() => setSelectedCustForServices(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {serviceModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {serviceModalError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Enabled Financial Services:
              </label>

              {[
                { key: 'LOANS', label: 'Loans', desc: 'Personal, Home, Education & Business loans' },
                { key: 'INSURANCE', label: 'Insurance', desc: 'Health, Life, Motor & Property policies' },
                { key: 'INVESTMENT', label: 'Investments & Chit', desc: 'Chit schemes, Mutual funds, FDs & Portfolios' },
              ].map((srv) => {
                const checked = modalServices.includes(srv.key);
                return (
                  <div
                    key={srv.key}
                    onClick={() => toggleModalService(srv.key)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      checked ? 'border-blue-600 bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">{srv.label}</p>
                      <p className="text-[10px] text-slate-500">{srv.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedCustForServices(null)}
                className="px-4 py-2 border border-slate-300 font-bold text-xs rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingServices}
                onClick={handleSaveServices}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                {savingServices ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
