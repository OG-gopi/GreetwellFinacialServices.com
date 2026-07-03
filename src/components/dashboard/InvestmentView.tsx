import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Download, PlusCircle, Search, Edit3, Trash2, 
  Calendar, Briefcase, Coins, CheckCircle, AlertCircle, X 
} from 'lucide-react'
import { useInvestmentStore } from '@/store/investmentStore'
import { useCRMDatabaseStore } from '@/store/crmDatabaseStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface InvestmentViewProps {
  type: 'sip' | 'mutual_fund' | 'fixed_deposit' | 'gold'
  title: string
}

export default function InvestmentView({ type, title }: InvestmentViewProps) {
  const { user } = useAuthStore()
  const { 
    investments, isLoading, fetchInvestments, 
    createInvestment, updateInvestment, setFilters 
  } = useInvestmentStore()
  
  const { customers } = useCRMDatabaseStore()

  // State
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form State
  const [form, setForm] = useState({
    customerId: '',
    fundName: '',
    investedAmount: '',
    currentValue: '',
    startDate: '',
    maturityDate: '',
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
    status: 'active' as 'active' | 'matured' | 'withdrawn' | 'paused',
    sipAmount: '',
    sipFrequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly'
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch data
  useEffect(() => {
    setFilters({ investment_type: type })
    fetchInvestments()
  }, [type])

  // Filter local investments
  const filtered = investments.filter(inv => {
    const custName = (inv as any).customer?.full_name || ''
    const fund = inv.fund_name || ''
    return custName.toLowerCase().includes(search.toLowerCase()) || fund.toLowerCase().includes(search.toLowerCase())
  })

  // Calculations
  const totalInvested = filtered.reduce((sum, item) => sum + Number(item.invested_amount), 0)
  const totalCurrentValue = filtered.reduce((sum, item) => sum + Number(item.current_value || item.invested_amount), 0)
  const netGain = totalCurrentValue - totalInvested

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.customerId) newErrors.customerId = 'Customer is required'
    if (!form.fundName.trim()) newErrors.fundName = 'Fund/Scheme Name is required'
    
    const amt = Number(form.investedAmount)
    if (!form.investedAmount || isNaN(amt) || amt <= 0) {
      newErrors.investedAmount = 'Enter a valid investment amount greater than 0'
    }
    
    if (!form.startDate) newErrors.startDate = 'Start date is required'

    if (type === 'sip') {
      const sipAmt = Number(form.sipAmount)
      if (!form.sipAmount || isNaN(sipAmt) || sipAmt <= 0) {
        newErrors.sipAmount = 'SIP amount must be greater than 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please correct the validation errors in the form.')
      return
    }

    const payload = {
      customer_id: form.customerId,
      investment_type: type,
      fund_name: form.fundName,
      invested_amount: Number(form.investedAmount),
      current_value: Number(form.currentValue || form.investedAmount),
      risk_level: form.riskLevel,
      start_date: form.startDate,
      maturity_date: form.maturityDate || null,
      status: form.status,
      sip_amount: type === 'sip' ? Number(form.sipAmount) : null,
      sip_frequency: type === 'sip' ? form.sipFrequency : null,
      agent_id: user?.user_id || '00000000-0000-0000-0000-000000000000'
    }

    try {
      if (editId) {
        const res = await updateInvestment(editId, payload as any)
        if (res.error) throw new Error(res.error)
        toast.success('Investment updated successfully in database!')
      } else {
        const res = await createInvestment(payload as any)
        if (res.error) throw new Error(res.error)
        toast.success('New investment record stored successfully!')
      }
      setShowModal(false)
      resetForm()
      fetchInvestments()
    } catch (err: any) {
      toast.error(`Database Operation Failed: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this investment record from the database?')) return
    try {
      const { error } = await supabase.from('investments').delete().eq('id', id)
      if (error) throw error
      toast.success('Record successfully removed from database!')
      fetchInvestments()
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`)
    }
  }

  const handleEditClick = (inv: any) => {
    setEditId(inv.id)
    setForm({
      customerId: inv.customer_id,
      fundName: inv.fund_name || '',
      investedAmount: String(inv.invested_amount),
      currentValue: String(inv.current_value || inv.invested_amount),
      startDate: inv.start_date,
      maturityDate: inv.maturity_date || '',
      riskLevel: inv.risk_level,
      status: inv.status,
      sipAmount: String(inv.sip_amount || ''),
      sipFrequency: inv.sip_frequency || 'monthly'
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditId(null)
    setForm({
      customerId: '',
      fundName: '',
      investedAmount: '',
      currentValue: '',
      startDate: '',
      maturityDate: '',
      riskLevel: 'medium',
      status: 'active',
      sipAmount: '',
      sipFrequency: 'monthly'
    })
    setErrors({})
  }

  return (
    <div className="space-y-6">
      
      {/* Header Summary row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Investments / Sourcing Manager</span>
          <h2 className="text-2xl font-bold text-[#0a1f44] mt-1">{title} Desk</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={16} /> New {title}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sourced Principal</span>
          <strong className="block text-2xl font-black text-[#0a1f44] mt-1.5">₹{totalInvested.toLocaleString('en-IN')}</strong>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">{filtered.length} active portfolios</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Current Valuation</span>
          <strong className="block text-2xl font-black text-amber-600 mt-1.5">₹{totalCurrentValue.toLocaleString('en-IN')}</strong>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">Live market calculations</span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Yield / Profit</span>
          <strong className={`block text-2xl font-black mt-1.5 ${netGain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {netGain >= 0 ? '+' : ''}₹{netGain.toLocaleString('en-IN')}
          </strong>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">Sourced returns summary</span>
        </div>
      </div>

      {/* Filters & Grid Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        
        {/* Search bar */}
        <div className="relative mb-6 w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            placeholder="Search by customer name or scheme..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Data list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-4 px-4">Verified Customer</th>
                <th className="py-4 px-4">Scheme / Fund</th>
                <th className="py-4 px-4">Amount Sourced</th>
                {type === 'sip' && <th className="py-4 px-4">SIP Terms</th>}
                <th className="py-4 px-4">Start Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading live records from database...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No active {title} investments logged.</td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-extrabold text-slate-800 block">{(inv as any).customer?.full_name || 'GFS Member'}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{(inv as any).customer?.email || ''}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-bold">{inv.fund_name}</td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-[#0a1f44] block">₹{Number(inv.invested_amount).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Val: ₹{Number(inv.current_value || inv.invested_amount).toLocaleString('en-IN')}</span>
                    </td>
                    {type === 'sip' && (
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-700 block">₹{Number(inv.sip_amount).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-400 uppercase block mt-0.5">{inv.sip_frequency} schedule</span>
                      </td>
                    )}
                    <td className="py-4 px-4 text-slate-500">{inv.start_date}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                        inv.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        inv.status === 'matured' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                        'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => handleEditClick(inv)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors inline-flex border border-slate-200"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors inline-flex border border-red-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CRUD Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-[#070b12]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative text-left"
            >
              
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-[#0a1f44]">
                  {editId ? `Edit ${title} Record` : `Add New ${title}`}
                </h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Customer dropdown */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Link Customer Profile *</label>
                  <select
                    className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500 ${errors.customerId ? 'border-red-500' : 'border-slate-200'}`}
                    value={form.customerId}
                    onChange={e => setForm({ ...form, customerId: e.target.value })}
                  >
                    <option value="">-- Select Sourced Member --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.mobileNumber})</option>
                    ))}
                  </select>
                  {errors.customerId && <span className="text-[10px] text-red-500 mt-1 block">{errors.customerId}</span>}
                </div>

                {/* Scheme / Fund Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fund / Scheme Name *</label>
                  <input
                    type="text"
                    className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500 ${errors.fundName ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="e.g. HDFC Mid-Cap Growth Direct Plan"
                    value={form.fundName}
                    onChange={e => setForm({ ...form, fundName: e.target.value })}
                  />
                  {errors.fundName && <span className="text-[10px] text-red-500 mt-1 block">{errors.fundName}</span>}
                </div>

                {/* Sourced Principal Amount & Current Valuation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Invested Amount (₹) *</label>
                    <input
                      type="number"
                      className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500 ${errors.investedAmount ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="e.g. 150000"
                      value={form.investedAmount}
                      onChange={e => setForm({ ...form, investedAmount: e.target.value })}
                    />
                    {errors.investedAmount && <span className="text-[10px] text-red-500 mt-1 block">{errors.investedAmount}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current Value (₹)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                      placeholder="e.g. 175000"
                      value={form.currentValue}
                      onChange={e => setForm({ ...form, currentValue: e.target.value })}
                    />
                  </div>
                </div>

                {/* SIP Specific details */}
                {type === 'sip' && (
                  <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                    <div>
                      <label className="text-[10px] font-bold text-amber-700 uppercase block mb-1">Monthly SIP (₹) *</label>
                      <input
                        type="number"
                        className={`w-full bg-white border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500 ${errors.sipAmount ? 'border-red-500' : 'border-amber-200'}`}
                        placeholder="e.g. 5000"
                        value={form.sipAmount}
                        onChange={e => setForm({ ...form, sipAmount: e.target.value })}
                      />
                      {errors.sipAmount && <span className="text-[10px] text-red-500 mt-1 block">{errors.sipAmount}</span>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-700 uppercase block mb-1">Frequency</label>
                      <select
                        className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                        value={form.sipFrequency}
                        onChange={e => setForm({ ...form, sipFrequency: e.target.value as any })}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Start Date *</label>
                    <input
                      type="date"
                      className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-amber-500 ${errors.startDate ? 'border-red-500' : 'border-slate-200'}`}
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                    {errors.startDate && <span className="text-[10px] text-red-500 mt-1 block">{errors.startDate}</span>}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Maturity Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                      value={form.maturityDate}
                      onChange={e => setForm({ ...form, maturityDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Risk and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Profile</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                      value={form.riskLevel}
                      onChange={e => setForm({ ...form, riskLevel: e.target.value as any })}
                    >
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as any })}
                    >
                      <option value="active">Active</option>
                      <option value="matured">Matured</option>
                      <option value="withdrawn">Withdrawn</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {editId ? 'Save Updates' : 'Save Record'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
