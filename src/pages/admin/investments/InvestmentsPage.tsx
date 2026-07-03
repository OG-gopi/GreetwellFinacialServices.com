import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Search, Download, Check, X, Eye, ShieldAlert,
  Calendar, CreditCard, Users, Landmark, AlertTriangle, TrendingUp, RefreshCw
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import {
  formatCurrency, formatDate, getInvestmentTypeLabel,
  getRiskColor, generateInitials, cn
} from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import type { Investment } from '@/types'

export default function InvestmentsPage() {
  const { user } = useAuthStore()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  
  // Market valuation update state
  const [updatingValuationId, setUpdatingValuationId] = useState<string | null>(null)
  const [newValuation, setNewValuation] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => { loadInvestments() }, [])

  async function loadInvestments() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*, customer:customers(full_name, phone, email, occupation), agent:profiles!investments_agent_id_fkey(full_name)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvestments((data as unknown as Investment[]) || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load mutual funds & investments portfolios')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateValuation() {
    if (!updatingValuationId || !newValuation) return
    setUpdating(true)
    try {
      const val = parseFloat(newValuation)
      if (isNaN(val)) throw new Error('Invalid amount entered')

      const { error } = await supabase
        .from('investments')
        .update({
          current_value: val,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatingValuationId)

      if (error) throw error
      
      toast.success('Market valuation updated successfully')
      setInvestments(prev => prev.map(i => i.id === updatingValuationId ? { ...i, current_value: val } : i))
      
      if (selectedInvestment && selectedInvestment.id === updatingValuationId) {
        setSelectedInvestment(prev => prev ? { ...prev, current_value: val } : null)
      }

      setUpdatingValuationId(null)
      setNewValuation('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to update valuation')
    } finally {
      setUpdating(false)
    }
  }

  const filtered = investments.filter(i => {
    const customer = (i as any).customer
    const matchesSearch = !search || 
      customer?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
      customer?.phone?.includes(search) || 
      i.fund_name?.toLowerCase().includes(search.toLowerCase())
    const matchesRisk = riskFilter === 'all' || i.risk_level === riskFilter
    return matchesSearch && matchesRisk
  })

  // Export CSV
  function handleExportCSV() {
    if (!filtered.length) return
    const headers = ['Customer', 'Type', 'Fund Name', 'Risk Level', 'Invested Capital', 'Current Valuation', 'Returns (%)']
    const rows = filtered.map(i => {
      const customer = (i as any).customer
      const returns = i.current_value && i.invested_amount ? ((i.current_value - i.invested_amount) / i.invested_amount) * 100 : 0
      return [
        customer?.full_name || '—',
        getInvestmentTypeLabel(i.investment_type),
        i.fund_name,
        i.risk_level,
        i.invested_amount,
        i.current_value || i.invested_amount,
        returns.toFixed(2)
      ]
    })
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `gfs-investments-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AppShell pageTitle="Mutual Funds & Investments">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Mutual Funds & Investments</h1>
          <p className="text-navy-400 text-sm mt-0.5">{investments.length} total portfolios registered</p>
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
            placeholder="Search by customer, phone or scheme name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="gfs-input w-auto min-w-[140px]"
        >
          <option value="all">All Risks</option>
          <option value="low">Low Risk</option>
          <option value="medium">Moderate Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      <div className="gfs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gfs-table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Fund / Scheme Name</th>
                <th>Invested Amount</th>
                <th>Current Valuation</th>
                <th>Yield (%)</th>
                <th>Risk Level</th>
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
              ) : filtered.map((inv, idx) => {
                const customer = (inv as any).customer
                const returnsPercent = inv.current_value && inv.invested_amount
                  ? ((inv.current_value - inv.invested_amount) / inv.invested_amount) * 100
                  : 0
                
                return (
                  <motion.tr
                    key={inv.id}
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
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-navy-800 text-gold-400 font-medium">
                        {getInvestmentTypeLabel(inv.investment_type)}
                      </span>
                    </td>
                    <td>
                      <span className="text-white text-sm font-medium">{inv.fund_name}</span>
                      <p className="text-navy-400 text-xs font-mono">{(inv as any).folio_number || '—'}</p>
                    </td>
                    <td>
                      <span className="text-navy-300 font-semibold text-sm">{formatCurrency(inv.invested_amount)}</span>
                    </td>
                    <td>
                      <span className="text-emerald-400 font-bold text-sm">{formatCurrency(inv.current_value || inv.invested_amount)}</span>
                    </td>
                    <td>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-0.5 w-max",
                        returnsPercent >= 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
                      )}>
                        {returnsPercent >= 0 ? '+' : ''}{returnsPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={cn("text-xs font-bold uppercase", getRiskColor(inv.risk_level))}>
                        {inv.risk_level}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvestment(inv)}
                          className="p-1.5 rounded hover:bg-navy-700 text-navy-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setUpdatingValuationId(inv.id)
                            setNewValuation((inv.current_value || inv.invested_amount).toString())
                          }}
                          className="p-1.5 rounded hover:bg-gold-500/20 text-gold-400 transition-colors"
                          title="Update Valuation"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-navy-400 text-sm">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No investments portfolios found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Slide-Over or Modal */}
      {selectedInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setSelectedInvestment(null)} />
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full max-w-xl h-full bg-navy-850 border-l border-navy-700/80 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-navy-700 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Asset Details</h2>
                  <p className="text-xs text-navy-400 font-mono mt-0.5">Folio: {(selectedInvestment as any).folio_number || '—'}</p>
                </div>
                <button onClick={() => setSelectedInvestment(null)} className="text-navy-400 hover:text-white">✕</button>
              </div>

              {/* Customer Personal Info */}
              <div className="gfs-card p-4 border border-navy-700 bg-navy-900/40 mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">Customer Personal Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-navy-400 text-xs">Full Name</p>
                    <p className="text-white font-medium mt-0.5">{(selectedInvestment as any).customer?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Phone Number</p>
                    <p className="text-white font-medium mt-0.5">{(selectedInvestment as any).customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Email Address</p>
                    <p className="text-white truncate mt-0.5">{(selectedInvestment as any).customer?.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Occupation</p>
                    <p className="text-white mt-0.5">{(selectedInvestment as any).customer?.occupation || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Investment details */}
              <div className="gfs-card p-4 border border-navy-700 bg-navy-900/40">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-3">Portfolio Scheme Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-navy-400 text-xs">Investment Category</p>
                    <p className="text-white mt-0.5">{getInvestmentTypeLabel(selectedInvestment.investment_type)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Scheme Name</p>
                    <p className="text-white font-semibold mt-0.5">{selectedInvestment.fund_name}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Invested Capital</p>
                    <p className="text-white font-bold mt-0.5">{formatCurrency(selectedInvestment.invested_amount)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Current Market Valuation</p>
                    <p className="text-emerald-400 font-bold mt-0.5">{formatCurrency(selectedInvestment.current_value || selectedInvestment.invested_amount)}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Risk Profile</p>
                    <span className={cn("inline-block text-xs font-bold mt-1", getRiskColor(selectedInvestment.risk_level))}>
                      {selectedInvestment.risk_level.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-navy-400 text-xs">Date of Deposit</p>
                    <p className="text-white mt-0.5">{formatDate(selectedInvestment.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside detail card */}
            <div className="flex gap-3 border-t border-navy-700 pt-4 mt-6">
              <button
                onClick={() => {
                  setUpdatingValuationId(selectedInvestment.id)
                  setNewValuation((selectedInvestment.current_value || selectedInvestment.invested_amount).toString())
                }}
                className="flex-1 bg-gold-50 text-navy-900 py-2.5 rounded-xl hover:bg-gold-400 text-sm font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Update Valuation
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Valuation update modal */}
      {updatingValuationId && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md mx-4 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-foreground">Update Market Valuation</h2>
            </div>
            <p className="text-sm text-navy-300 mb-4">Provide the latest evaluated NAV/value for this customer's folio. Yield calculations will be refreshed automatically.</p>
            <div>
              <label className="gfs-label mb-1.5 block">Current Valuation (INR)</label>
              <input
                className="gfs-input w-full"
                type="number"
                placeholder="E.g., 500000"
                value={newValuation}
                onChange={e => setNewValuation(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setUpdatingValuationId(null)} className="btn-outline-gold flex-1 text-sm">Cancel</button>
              <button
                disabled={!newValuation.trim() || updating}
                onClick={handleUpdateValuation}
                className="bg-gold-500 text-navy-900 font-bold py-2.5 rounded-xl hover:bg-gold-400 disabled:opacity-50 flex-1 text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {updating && <RefreshCw className="w-4 h-4 animate-spin" />}
                {updating ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
