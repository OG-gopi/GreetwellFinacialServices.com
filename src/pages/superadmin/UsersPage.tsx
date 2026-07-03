import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Search, Shield, Users, MoreVertical, Lock, Unlock, RefreshCw, Eye } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { formatDateTime, getRoleLabel, generateInitials } from '@/lib/utils'
import type { Profile, UserRole } from '@/types'
import { toast } from 'sonner'

const ROLES: UserRole[] = [
  'loan_admin', 'insurance_admin', 'investment_admin',
  'loan_agent', 'insurance_agent', 'investment_agent'
]

const ROLE_COLORS: Record<string, string> = {
  superadmin: 'text-gold-400 bg-gold-500/15 border-gold-500/30',
  loan_admin: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
  insurance_admin: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
  investment_admin: 'text-green-400 bg-green-500/15 border-green-500/30',
  loan_agent: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
  insurance_agent: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
  investment_agent: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', full_name: '', phone: '', role: 'loan_agent' as UserRole, password: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      
      if (error) throw error
      
      setUsers(data as Profile[])
    } catch (err) {
      console.error('[UsersPage] Failed to fetch users:', err)
      // Fallback for Offline Demo Mode
      if ((supabase as any).supabaseUrl.includes('placeholder')) {
        setUsers([
          { id: '1', user_id: '1', full_name: 'GFS Chief Executive', email: 'superadmin@gfs.com', role: 'superadmin', module: 'all', is_active: true, is_blocked: false, verification_status: 'approved', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', user_id: '2', full_name: 'Ramesh Kumar (Customer)', email: 'ramesh@gfs.com', role: 'customer', module: 'all', is_active: true, is_blocked: false, verification_status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '3', user_id: '3', full_name: 'GFS Loan Specialist', email: 'loanagent@gfs.com', role: 'loan_agent', module: 'loans', is_active: true, is_blocked: false, verification_status: 'approved', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString() },
          { id: '4', user_id: '4', full_name: 'New Insurance Agent', email: 'pending_agent@gfs.com', role: 'insurance_agent', module: 'insurance', is_active: true, is_blocked: false, verification_status: 'pending', created_at: new Date(Date.now() - 259200000).toISOString(), updated_at: new Date().toISOString() },
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleBlock(user: Profile) {
    const { error } = await supabase.from('profiles').update({ is_blocked: !user.is_blocked }).eq('id', user.id)
    if (error) { toast.error('Failed to update user'); return }
    toast.success(user.is_blocked ? 'User unblocked' : 'User blocked')
    fetchUsers()
  }

  async function toggleUserStatus(id: string, currentStatus: boolean) {
    const { error } = await supabase.from('profiles').update({ is_active: !currentStatus }).eq('id', id)
    if (error) { toast.error('Failed to update status'); return }
    toast.success(!currentStatus ? 'User activated' : 'User deactivated')
    fetchUsers()
  }

  async function createUser() {
    setCreating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          phone: newUser.phone,
          role: newUser.role,
        })
      })

      const data = await response.json()
      
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to create user')
      }

      toast.success('User created successfully')
      setShowCreateModal(false)
      setNewUser({ email: '', full_name: '', phone: '', role: 'loan_agent', password: '' })
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }


  function getModuleFromRole(role: UserRole): string {
    if (role.includes('loan')) return 'loans'
    if (role.includes('insurance')) return 'insurance'
    if (role.includes('investment')) return 'investments'
    return 'all'
  }

  const handleApprove = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, verification_status: 'approved' } : u))
    toast.success('User has been approved and can now log in.')
  }

  const filtered = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(search.toLowerCase()) || user.email?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.verification_status === statusFilter || (!user.verification_status && statusFilter === 'approved')
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <AppShell pageTitle="User Management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-navy-400 text-sm mt-0.5">{users.length} total users across all modules</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-gold flex items-center gap-2 text-sm">
          <UserPlus className="w-4 h-4" /> Create User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            className="gfs-input pl-9"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="gfs-input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {['superadmin', ...ROLES].map(r => (
            <option key={r} value={r}>{getRoleLabel(r as UserRole)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-navy-800 border border-slate-700/50 text-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Table */}
      <div className="gfs-card overflow-hidden">
        <table className="gfs-table">
          <thead>
            <tr>
              <th>User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="shimmer h-4 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.map((user, i) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-bold">
                      {generateInitials(user.full_name)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{user.full_name}</p>
                      <p className="text-navy-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role] || ''}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  {user.verification_status === 'pending' ? <span className="badge-pending">Pending</span> : <span className="badge-approved">Verified</span>}
                </td>
                <td>
                  {user.is_blocked ? (
                    <span className="badge-rejected">Blocked</span>
                  ) : user.is_active ? (
                    <span className="badge-approved">Active</span>
                  ) : (
                    <span className="badge-pending">Inactive</span>
                  )}
                </td>
                <td className="text-navy-400 text-xs">{formatDateTime(user.last_login)}</td>
                <td className="text-navy-400 text-xs">{formatDateTime(user.created_at)}</td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    {user.verification_status === 'pending' && (
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.is_active
                          ? 'text-rose-400 hover:bg-rose-500/10'
                          : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={user.is_active ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      onClick={() => toggleBlock(user)}
                      className="p-1.5 rounded-lg hover:bg-navy-700 text-navy-400 hover:text-foreground transition-colors"
                      title={user.is_blocked ? 'Unblock' : 'Block'}
                    >
                      {user.is_blocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-navy-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-foreground">Create New User</h2>
            </div>
            <div className="space-y-4">
              <div><label className="gfs-label">Full Name</label>
                <input className="gfs-input" placeholder="John Doe" value={newUser.full_name} onChange={e => setNewUser(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div><label className="gfs-label">Email</label>
                <input className="gfs-input" type="email" placeholder="john@gfs.com" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div><label className="gfs-label">Phone</label>
                <input className="gfs-input" placeholder="+91 9999999999" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div><label className="gfs-label">Role</label>
                <select className="gfs-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}>
                  {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                </select>
              </div>
              <div><label className="gfs-label">Temporary Password</label>
                <input className="gfs-input" type="password" placeholder="Min 8 characters" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline-gold flex-1 text-sm">Cancel</button>
              <button onClick={createUser} disabled={creating} className="btn-gold flex-1 text-sm flex items-center justify-center gap-2">
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
