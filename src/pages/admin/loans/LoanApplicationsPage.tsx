import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Search, Filter, Download, ArrowUpRight, Check, X,
  Eye, HelpCircle, FileSpreadsheet, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import {
  formatCurrency, formatDate, getLoanTypeLabel,
  getLoanStatusColor, generateInitials, cn
} from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import type { Loan, LoanStatus } from '@/types'

// Reusable custom dropdown/select component for filter
function GfsDropdown({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: { value: string, label: string }[], label?: string }) {
  const [open, setOpen] = useState(false)
  const currentLabel = options.find(o => o.value === value)?.label || value

  return (
    <div className="relative">
      {label && <label className="gfs-label mb-1 block">{label}</label>}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-lg px-3 py-2 bg-navy-900 border border-navy-600 text-sm text-gray-100 placeholder:text-gray-500 hover:border-gold-500/50 focus:outline-none focus:border-gold-500 min-w-[140px]"
      >
        <span>{currentLabel}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-1.5 w-full min-w-[160px] rounded-lg border border-navy-700 bg-navy-800 p-1 shadow-xl z-20">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-white transition-colors",
                  option.value === value && "text-gold-400 bg-navy-700/50 font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function LoanApplicationsPage() {
  const { user } = useAuthStore()
  const [loans, setLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  
  // Rejection modal state
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => { loadApplications() }, [])

  async function loadApplications() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*, customer:customers(full_name, phone, email, monthly_income, cibil_score, occupation), agent:profiles!loans_agent_id_fkey(full_name)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLoans((data as unknown as Loan[]) || [])
    } catch (err) {
      console.error('[LoanApplicationsPage]', err)
      toast.error('Failed to load loan applications')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStatusChange(loanId: string, newStatus: LoanStatus, reason?: string) {
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          status: newStatus,
          rejection_reason: reason || null,
          admin_id: user?.user_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId)

      if (error) throw error
      
      toast.success(`Loan status updated to ${newStatus}`)
      setLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: newStatus, rejection_reason: reason || null } : l))
      
      if (selectedLoan && selectedLoan.id === loanId) {
        setSelectedLoan(prev => prev ? { ...prev, status: newStatus, rejection_reason: reason || null } : null)
      }

      // Track Audit Log
      await supabase.from('activity_logs').insert({
        user_id: user?.user_id,
        action: newStatus.toUpperCase(),
        entity_type: 'loan',
        entity_id: loanId,
        ip_address: '127.0.0.1',
        success: true
      })

    } catch (err) {
      console.error(err)
      toast.error('Failed to update application status')
    }
  }

  const filtered = loans.filter(l => {
    const customer = (l as any).customer
    const matchesSearch = !search || 
      customer?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      customer?.phone?.includes(search)
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Export CSV
  function handleExportCSV() {
    if (!filtered.length) return
    const headers = ['Customer', 'Phone', 'Type', 'Amount', 'Tenure (Months)', 'CIBIL', 'Income', 'Status', 'Date']
    const rows = filtered.map(l => {
      const customer = (l as any).customer
      return [
        customer?.full_name || '—',
        customer?.phone || '—',
        getLoanTypeLabel(l.loan_type),
        l.loan_amount,
        l.tenure_months,
        customer?.cibil_score || '—',
        customer?.monthly_income || '—',
        l.status,
        formatDate(l.created_at)
      ]
    })
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `gfs-loans-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AppShell pageTitle="Loan Applications">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Loan Applications</h1>
          <p className="text-navy-400 text-sm mt-0.5">{loans.length} total applications submitted</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-outline flex items-center gap-2 text-xs border border-gold-500/40 text-gold-400 px-4 py-2 rounded-lg hover:bg-gold-500/10 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters bar */}
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
        <GfsDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'lead', label: 'Lead' },
            { value: 'verification', label: 'Verification' },
            { value: 'approved', label: 'Approved' },
            { value: 'disbursed', label: 'Disbursed' },
            { value: 'rejected', label: 'Rejected' }
          ]}
        />
      </div>

      {/* Applications Table */}
      <div className="gfs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gfs-table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>CIBIL</th>
                <th>Income</th>
                <th>Agent</th>
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
              ) : filtered.map((loan, idx) => {
                const customer = (loan as any).customer
                const agent = (loan as any).agent
                const isPending = ['lead', 'verification'].includes(loan.status)
                
                return (
                  <motion.tr
                    key={loan.id}
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
                    <td>
                      <span className="text-navy-200 text-sm font-medium">{getLoanTypeLabel(loan.loan_type)}</span>
                      <p className="text-navy-400 text-xs font-mono">{loan.tenure_months} months tenure</p>
                    </td>
                    <td>
                      <span className="text-gold-400 font-bold text-sm">{formatCurrency(loan.loan_amount)}</span>
                    </td>
                    <td>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded",
                        (customer?.cibil_score || 0) >= 750 ? "text-green-400 bg-green-500/10" :
                        (customer?.cibil_score || 0) >= 650 ? "text-yellow-400 bg-yellow-500/10" :
                        "text-red-400 bg-red-500/10"
                      )}>
                        {customer?.cibil_score || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-navy-300 text-sm">{formatCurrency(customer?.monthly_income || 0)}</span>
                    </td>
                    <td>
                      <span className="text-navy-300 text-sm font-medium">{agent?.full_name || 'Direct'}</span>
                    </td>
                    <td>
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-bold", getLoanStatusColor(loan.status))}>
                        {loan.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="p-1.5 rounded hover:bg-navy-700 text-navy-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleStatusChange(loan.id, 'approved')}
                              className="p-1.5 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                              title="Approve Application"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRejectingLoanId(loan.id)
                                setRejectionReason('')
                              }}
                              className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Reject Application"
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
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No loan applications found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Slide-Over or Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setSelectedLoan(null)} />
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full max-w-xl h-full bg-navy-900 border-l border-slate-200 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Application Detail</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedLoan.id}</p>
                </div>
                <button onClick={() => setSelectedLoan(null)} className="text-slate-500 hover:text-slate-800">✕</button>
              </div>

              {/* Customer Profile */}
              <div className="gfs-card p-4 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Customer Personal Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Full Name</p>
                    <p className="text-slate-800 font-medium mt-0.5">{(selectedLoan as any).customer?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Phone Number</p>
                    <p className="text-slate-800 font-medium mt-0.5">{(selectedLoan as any).customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Email Address</p>
                    <p className="text-slate-800 truncate mt-0.5">{(selectedLoan as any).customer?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Occupation</p>
                    <p className="text-slate-800 mt-0.5">{(selectedLoan as any).customer?.occupation || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="gfs-card p-4 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Credit & Income Assessment</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">CIBIL Bureau Score</p>
                    <p className="text-slate-800 font-bold mt-1 text-base">{(selectedLoan as any).customer?.cibil_score || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Monthly Income</p>
                    <p className="text-emerald-600 font-bold mt-1 text-base">{formatCurrency((selectedLoan as any).customer?.monthly_income || 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Application Status</p>
                    <span className={cn("inline-block text-xs px-2 py-0.5 rounded font-bold mt-1", getLoanStatusColor(selectedLoan.status))}>
                      {selectedLoan.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="gfs-card p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Loan Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Loan Scheme</p>
                    <p className="text-slate-800 mt-0.5">{getLoanTypeLabel(selectedLoan.loan_type)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Requested Amount</p>
                    <p className="text-primary font-bold mt-0.5">{formatCurrency(selectedLoan.loan_amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tenure</p>
                    <p className="text-slate-800 mt-0.5">{selectedLoan.tenure_months} Months</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Purpose</p>
                    <p className="text-slate-800 mt-0.5">{selectedLoan.purpose || '—'}</p>
                  </div>
                </div>
                {selectedLoan.rejection_reason && (
                  <div className="mt-4 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-300">
                    <p className="font-semibold mb-0.5">Rejection Reason:</p>
                    <p>{selectedLoan.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions inside detail card */}
            {['lead', 'verification'].includes(selectedLoan.status) && (
              <div className="flex gap-3 border-t border-slate-200 pt-4 mt-6">
                <button
                  onClick={() => {
                    setRejectingLoanId(selectedLoan.id)
                    setRejectionReason('')
                  }}
                  className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 text-sm font-semibold transition-colors"
                >
                  Decline Application
                </button>
                <button
                  onClick={() => handleStatusChange(selectedLoan.id, 'approved')}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl hover:bg-primary/90 text-sm font-bold transition-all shadow-sm shadow-primary/20"
                >
                  Approve Application
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Decline Dialog with Reason */}
      {rejectingLoanId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md mx-4 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-foreground">Reject Application</h2>
            </div>
            <p className="text-sm text-navy-300 mb-4">Please provide a reason for declining this loan application. This will be visible to the submitting agent.</p>
            <textarea
              className="gfs-input w-full min-h-[100px] py-2"
              placeholder="E.g., CIBIL score below standard criteria, insufficient monthly income..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setRejectingLoanId(null)} className="btn-outline-gold flex-1 text-sm">Cancel</button>
              <button
                disabled={!rejectionReason.trim()}
                onClick={() => {
                  handleStatusChange(rejectingLoanId, 'rejected', rejectionReason)
                  setRejectingLoanId(null)
                }}
                className="bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-400 disabled:opacity-50 flex-1 text-sm transition-colors"
              >
                Decline Application
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
