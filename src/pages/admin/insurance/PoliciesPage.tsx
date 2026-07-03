import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Search, Download, Check, X, Eye, ShieldAlert,
  Calendar, CreditCard, Users, Landmark, AlertTriangle
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import {
  formatCurrency, formatDate, getInsuranceTypeLabel,
  getPolicyStatusColor, generateInitials, cn
} from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import type { InsurancePolicy, PolicyStatus } from '@/types'

export default function PoliciesPage() {
  const { user } = useAuthStore()
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null)

  useEffect(() => { loadPolicies() }, [])

  async function loadPolicies() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*, customer:customers(full_name, phone, email, monthly_income, occupation), agent:profiles!insurance_policies_agent_id_fkey(full_name)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolicies((data as unknown as InsurancePolicy[]) || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load insurance policies')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStatusChange(policyId: string, newStatus: PolicyStatus) {
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .update({
          status: newStatus,
          admin_id: user?.user_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId)

      if (error) throw error
      
      toast.success(`Policy status updated to ${newStatus}`)
      setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, status: newStatus } : p))
      
      if (selectedPolicy && selectedPolicy.id === policyId) {
        setSelectedPolicy(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update policy status')
    }
  }

  const filtered = policies.filter(p => {
    const customer = (p as any).customer
    const matchesSearch = !search || 
      customer?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      customer?.phone?.includes(search)
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Export CSV
  function handleExportCSV() {
    if (!filtered.length) return
    const headers = ['Customer', 'Policy Number', 'Type', 'Sum Assured', 'Premium', 'Start Date', 'End Date', 'Status']
    const rows = filtered.map(p => {
      const customer = (p as any).customer
      return [
        customer?.full_name || '—',
        p.policy_number,
        getInsuranceTypeLabel(p.insurance_type),
        p.sum_assured,
        p.premium_amount,
        formatDate(p.start_date),
        formatDate(p.end_date),
        p.status
      ]
    })
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `gfs-policies-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AppShell pageTitle="Insurance Policies">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Insurance Policies</h1>
          <p className="text-navy-400 text-sm mt-0.5">{policies.length} total portfolios registered</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-outline flex items-center gap-2 text-xs border border-gold-500/40 text-gold-400 px-4 py-2 rounded-lg hover:bg-gold-500/10 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            className="gfs-input pl-9 w-full"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="gfs-input w-auto min-w-[140px]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="gfs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gfs-table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Policy #</th>
                <th>Type</th>
                <th>Sum Assured</th>
                <th>Premium</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><div className="shimmer h-4 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((policy, idx) => {
                const customer = (policy as any).customer
                const isPending = policy.status === 'pending'
                
                return (
                  <motion.tr
                    key={policy.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-bold shrink-0">
                          {generateInitials(customer?.full_name || 'UN')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{customer?.full_name || '—'}</p>
                          <p className="text-navy-400 text-xs">{customer?.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-navy-300">{policy.policy_number}</td>
                    <td>
                      <span className="text-navy-200 text-sm font-medium">{getInsuranceTypeLabel(policy.insurance_type)}</span>
                    </td>
                    <td>
                      <span className="text-white font-semibold text-sm">{formatCurrency(policy.sum_assured)}</span>
                    </td>
                    <td>
                      <span className="text-gold-400 font-bold text-sm">{formatCurrency(policy.premium_amount)}</span>
                      <p className="text-navy-400 text-xs">{policy.premium_frequency}</p>
                    </td>
                    <td>
                      <span className="text-navy-400 text-xs">{formatDate(policy.end_date)}</span>
                    </td>
                    <td>
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-bold", getPolicyStatusColor(policy.status))}>
                        {policy.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPolicy(policy)}
                          className="p-1.5 rounded hover:bg-navy-700 text-navy-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleStatusChange(policy.id, 'active')}
                              className="p-1.5 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                              title="Approve & Activate"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(policy.id, 'cancelled')}
                              className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Decline Policy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-navy-400 text-sm">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No insurance policies found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Slide-Over or Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setSelectedPolicy(null)} />
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full max-w-xl h-full bg-navy-850 border-l border-navy-700/80 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-navy-700 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Policy Details</h2>
                  <p className="text-xs text-navy-400 font-mono mt-0.5">Policy #: {selectedPolicy.policy_number}</p>
                </div>
                <button onClick={() => setSelectedPolicy(null)} className="text-navy-400 hover:text-white">✕</button>
              </div>

              {/* Customer Personal Info */}
              <div className="gfs-card p-4 border border-navy-700 bg-navy-900/40 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">Customer Personal Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-navy-400 text-xs">Full Name</p>
                    <p className="text-white font-medium mt-0.5">{(selectedPolicy as any).customer?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Phone Number</p>
                    <p className="text-white font-medium mt-0.5">{(selectedPolicy as any).customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Email Address</p>
                    <p className="text-white truncate mt-0.5">{(selectedPolicy as any).customer?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Occupation</p>
                    <p className="text-white mt-0.5">{(selectedPolicy as any).customer?.occupation || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Policy Scheme Details */}
              <div className="gfs-card p-4 border border-navy-700 bg-navy-900/40">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">Policy Coverage Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-navy-400 text-xs">Coverage Scheme</p>
                    <p className="text-white mt-0.5">{getInsuranceTypeLabel(selectedPolicy.insurance_type)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Sum Assured</p>
                    <p className="text-white font-bold mt-0.5">{formatCurrency(selectedPolicy.sum_assured)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Premium Amount</p>
                    <p className="text-gold-400 font-bold mt-0.5">{formatCurrency(selectedPolicy.premium_amount)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Payment Cycle</p>
                    <p className="text-white mt-0.5">{selectedPolicy.premium_frequency}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Start Date</p>
                    <p className="text-white mt-0.5">{formatDate(selectedPolicy.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">End Date</p>
                    <p className="text-white mt-0.5">{formatDate(selectedPolicy.end_date)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            {selectedPolicy.status === 'pending' && (
              <div className="flex gap-3 border-t border-navy-700 pt-4 mt-6">
                <button
                  onClick={() => handleStatusChange(selectedPolicy.id, 'cancelled')}
                  className="flex-1 border border-red-500/40 text-red-400 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-semibold transition-colors"
                >
                  Reject & Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(selectedPolicy.id, 'active')}
                  className="flex-1 bg-gold-500 text-navy-900 py-2.5 rounded-xl hover:bg-gold-400 text-sm font-bold transition-all"
                >
                  Activate Policy
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
