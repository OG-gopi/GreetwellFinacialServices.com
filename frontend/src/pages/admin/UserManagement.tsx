import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Power, RefreshCw, Trash2, Send, MailCheck, ShieldCheck, Users, Mail } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { LazyLoadTrigger } from '../../components/common/LazyLoadTrigger';

interface InvitationItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status: string;
  deliveryStatus: string;
  createdAt: string;
  expiresAt: string;
  invitedByUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export const UserManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [viewTab, setViewTab] = useState<'USERS' | 'INVITATIONS'>('USERS');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [pageUsers, setPageUsers] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  // Invitations state
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Action states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', role: '' });
  const [saving, setSaving] = useState(false);

  const [selectedInvitation, setSelectedInvitation] = useState<InvitationItem | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchUsers = async (pageToFetch = 1, isInitial = false) => {
    if (isInitial) setLoadingUsers(true);
    else setLoadingMoreUsers(true);

    try {
      let url = `/users?search=${encodeURIComponent(search)}&page=${pageToFetch}&limit=15`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        const fetchedList = res.data.data || [];
        if (isInitial) {
          setUsers(fetchedList);
        } else {
          setUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const newUnique = fetchedList.filter((u: User) => !existingIds.has(u.id));
            return [...prev, ...newUnique];
          });
        }

        if (res.data.pagination) {
          setHasMoreUsers(pageToFetch < (res.data.pagination.totalPages || 1));
        } else {
          setHasMoreUsers(fetchedList.length === 15);
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
      setLoadingMoreUsers(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const res = await api.get('/users/invitations');
      if (res.data.success) {
        setInvitations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (viewTab === 'USERS') {
      setPageUsers(1);
      fetchUsers(1, true);
    } else {
      fetchInvitations();
    }
  }, [viewTab, search, roleFilter, statusFilter]);

  const handleLoadMoreUsers = () => {
    if (!loadingUsers && !loadingMoreUsers && hasMoreUsers) {
      const nextPage = pageUsers + 1;
      setPageUsers(nextPage);
      fetchUsers(nextPage, false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/users/${user.id}/status`, { status: newStatus });
      showSuccess(`Account for ${user.email} marked as ${newStatus}.`);
      fetchUsers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${selectedUser.id}`, editForm);
      showSuccess(`Updated user details for ${selectedUser.email}.`);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvitation = async (inv: InvitationItem) => {
    setResendingId(inv.id);
    try {
      const res = await api.post(`/users/invitations/${inv.id}/resend`);
      if (res.data.success) {
        showSuccess(`Invitation email successfully resent to ${inv.email}.`);
        fetchInvitations();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to resend invitation email.');
    } finally {
      setResendingId(null);
    }
  };

  const handleConfirmCancelInvitation = async () => {
    if (!selectedInvitation) return;
    setCanceling(true);
    try {
      const res = await api.delete(`/users/invitations/${selectedInvitation.id}`);
      if (res.data.success) {
        showSuccess(`Invitation for ${selectedInvitation.email} has been canceled.`);
        setIsCancelModalOpen(false);
        fetchInvitations();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to cancel invitation.');
    } finally {
      setCanceling(false);
    }
  };

  // Filtered Invitations
  const filteredInvitations = invitations.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      inv.email.toLowerCase().includes(q) ||
      (inv.firstName && inv.firstName.toLowerCase().includes(q)) ||
      (inv.lastName && inv.lastName.toLowerCase().includes(q));

    const matchRole = !roleFilter || inv.role === roleFilter;
    const matchStatus = !statusFilter || inv.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500">View active users, search roles, monitor invitations, and manage permissions</p>
        </div>

        {/* View Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewTab('USERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'USERS'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Active Users ({users.length})
          </button>
          <button
            onClick={() => setViewTab('INVITATIONS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewTab === 'INVITATIONS'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Pending Invitations ({invitations.length})
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="LOAN_AGENT">Loan Agent</option>
            <option value="INSURANCE_AGENT">Insurance Agent</option>
            <option value="INVESTMENT_AGENT">Investment Agent</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold"
          >
            <option value="">All Statuses</option>
            {viewTab === 'USERS' ? (
              <>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
              </>
            ) : (
              <>
                <option value="INVITATION_SENT">Invitation Sent</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
                <option value="FAILED">Failed Delivery</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      {viewTab === 'USERS' ? (
        /* Users Data Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Loading users list...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No users matching criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {user.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{user.phone || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 text-xs font-semibold"
                          title="Edit User"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'text-rose-600 border border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <LazyLoadTrigger
            onLoadMore={handleLoadMoreUsers}
            hasMore={hasMoreUsers}
            isLoading={loadingMoreUsers}
            totalItems={users.length}
            endMessage="You're all caught up."
          />
        </div>
      ) : (
        /* Pending Invitations Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Invited Person</th>
                  <th className="py-3 px-4">Designated Role</th>
                  <th className="py-3 px-4">Invitation Status</th>
                  <th className="py-3 px-4">Sent Date</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loadingInvitations ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Loading pending invitations...
                    </td>
                  </tr>
                ) : filteredInvitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No pending invitations matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {inv.firstName ? `${inv.firstName} ${inv.lastName || ''}` : 'Invited User'}
                        </p>
                        <p className="text-[11px] text-slate-500">{inv.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          inv.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {inv.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          inv.status === 'INVITATION_SENT' || inv.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : inv.status === 'FAILED'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {inv.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleResendInvitation(inv)}
                          disabled={resendingId === inv.id}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md border border-blue-200 text-xs font-semibold inline-flex items-center gap-1"
                          title="Resend Email Invitation"
                        >
                          <RefreshCw className={`w-3 h-3 ${resendingId === inv.id ? 'animate-spin' : ''}`} />
                          {resendingId === inv.id ? 'Sending...' : 'Resend'}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedInvitation(inv);
                            setIsCancelModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 rounded-md border border-rose-200 text-xs font-semibold inline-flex items-center gap-1"
                          title="Cancel Pending Invitation"
                        >
                          <Trash2 className="w-3 h-3" />
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User Details">
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name (Optional)</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role Assignment</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg font-semibold"
            >
              <option value="SUPER_ADMIN">SUPER ADMIN</option>
              <option value="LOAN_AGENT">LOAN AGENT</option>
              <option value="INSURANCE_AGENT">INSURANCE AGENT</option>
              <option value="INVESTMENT_AGENT">INVESTMENT AGENT</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border text-xs font-semibold rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-500"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Invitation Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Invitation">
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to cancel the pending invitation for{' '}
            <strong className="text-slate-900">{selectedInvitation?.email}</strong> ({selectedInvitation?.role.replace(/_/g, ' ')})?
          </p>
          <p className="text-slate-500 text-[11px]">
            Once canceled, the invitation link sent to this email address will become invalid.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border font-semibold rounded-lg hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmCancelInvitation}
              disabled={canceling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
            >
              {canceling ? 'Canceling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
