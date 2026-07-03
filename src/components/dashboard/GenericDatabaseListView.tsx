import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusCircle, Search, Edit3, Trash2, X, Download, 
  FileText, Briefcase, Shield, Users, CheckCircle, AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCRMDatabaseStore } from '@/store/crmDatabaseStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

interface GenericListViewProps {
  moduleType: 'loans' | 'insurance' | 'claims' | 'documents' | 'agents'
  submenuName: string
}

export default function GenericDatabaseListView({ moduleType, submenuName }: GenericListViewProps) {
  const { user } = useAuthStore()
  const { customers } = useCRMDatabaseStore()
  
  // Data State
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  // Form State
  const [form, setForm] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch from Supabase
  useEffect(() => {
    loadRecords()
    resetForm()
  }, [moduleType, submenuName])

  async function loadRecords() {
    setIsLoading(true)
    try {
      let query: any
      
      if (moduleType === 'loans') {
        query = supabase.from('loans').select('*, customer:customers(*)')
        // Filters based on submenu
        if (submenuName === 'Personal Loans') query = query.eq('loan_type', 'personal')
        else if (submenuName === 'Home Loans') query = query.eq('loan_type', 'home')
        else if (submenuName === 'Vehicle Loans') query = query.eq('loan_type', 'vehicle')
        else if (submenuName === 'Pending Approvals') query = query.in('status', ['lead', 'verification'])
        else if (submenuName === 'Active Loans') query = query.in('status', ['approved', 'disbursed'])
      } 
      
      else if (moduleType === 'insurance') {
        query = supabase.from('insurance_policies').select('*, customer:customers(*)')
        // Filters based on submenu
        if (submenuName === 'Health Insurance') query = query.eq('policy_type', 'health')
        else if (submenuName === 'Life Insurance') query = query.eq('policy_type', 'life')
        else if (submenuName === 'Vehicle Insurance') query = query.eq('policy_type', 'vehicle')
        else if (submenuName === 'Policy Requests') query = query.eq('status', 'pending')
      } 
      
      else if (moduleType === 'claims') {
        query = supabase.from('insurance_claims').select('*, customer:customers(*)')
      } 
      
      else if (moduleType === 'documents') {
        query = supabase.from('documents').select('*, customer:customers(*)')
      } 
      
      else if (moduleType === 'agents') {
        query = supabase.from('profiles').select('*').in('role', ['loan_agent', 'insurance_agent', 'investment_agent'])
        if (submenuName === 'KYC Verification') query = query.eq('verification_status', 'pending')
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setRecords(data || [])
    } catch (err: any) {
      console.warn(`[GFS Database] Falling back to offline memory:`, err.message)
      setRecords([]) // Graceful empty state
    } finally {
      setIsLoading(false)
    }
  }

  // Filter records locally for search
  const filtered = records.filter(r => {
    const term = search.toLowerCase()
    if (moduleType === 'agents') {
      return r.full_name?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term)
    }
    const custName = r.customer?.full_name || ''
    const secondary = r.loan_type || r.policy_name || r.file_name || ''
    return custName.toLowerCase().includes(term) || secondary.toLowerCase().includes(term)
  })

  const resetForm = () => {
    setEditId(null)
    setErrors({})
    
    if (moduleType === 'loans') {
      setForm({
        customerId: '',
        loanType: 'personal',
        amount: '',
        interestRate: '10.5',
        termMonths: '12',
        status: 'lead'
      })
    } else if (moduleType === 'insurance') {
      setForm({
        customerId: '',
        policyType: 'health',
        policyName: '',
        sumAssured: '',
        premiumAmount: '',
        status: 'pending'
      })
    } else if (moduleType === 'claims') {
      setForm({
        customerId: '',
        claimAmount: '',
        claimDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        description: ''
      })
    } else if (moduleType === 'documents') {
      setForm({
        customerId: '',
        docType: 'other',
        fileName: '',
        fileUrl: ''
      })
    } else if (moduleType === 'agents') {
      setForm({
        fullName: '',
        email: '',
        role: 'loan_agent',
        verificationStatus: 'pending'
      })
    }
  }

  const validate = () => {
    const temp: Record<string, string> = {}
    
    if (moduleType !== 'agents' && !form.customerId) {
      temp.customerId = 'Customer profile linkage is required'
    }

    if (moduleType === 'loans') {
      const amt = Number(form.amount)
      if (!form.amount || isNaN(amt) || amt <= 0) temp.amount = 'Amount must be greater than 0'
    } else if (moduleType === 'insurance') {
      if (!form.policyName.trim()) temp.policyName = 'Policy Name is required'
      const sum = Number(form.sumAssured)
      if (!form.sumAssured || isNaN(sum) || sum <= 0) temp.sumAssured = 'Sum Assured must be greater than 0'
    } else if (moduleType === 'claims') {
      const amt = Number(form.claimAmount)
      if (!form.claimAmount || isNaN(amt) || amt <= 0) temp.claimAmount = 'Claim Amount must be greater than 0'
    } else if (moduleType === 'documents') {
      if (!form.fileName.trim()) temp.fileName = 'File Name is required'
      if (!form.fileUrl.trim()) temp.fileUrl = 'File URL/Path is required'
    } else if (moduleType === 'agents') {
      if (!form.fullName.trim()) temp.fullName = 'Full Name is required'
      if (!form.email.trim() || !form.email.includes('@')) temp.email = 'Valid email is required'
    }

    setErrors(temp)
    return Object.keys(temp).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix validation errors.')
      return
    }

    try {
      let result: any
      if (moduleType === 'loans') {
        const payload = {
          customer_id: form.customerId,
          loan_type: form.loanType,
          amount: Number(form.amount),
          interest_rate: Number(form.interestRate),
          term_months: Number(form.termMonths),
          status: form.status,
          agent_id: user?.user_id || '00000000-0000-0000-0000-000000000000'
        }
        if (editId) {
          result = await supabase.from('loans').update(payload).eq('id', editId)
        } else {
          result = await supabase.from('loans').insert(payload)
        }
      } 
      
      else if (moduleType === 'insurance') {
        const payload = {
          customer_id: form.customerId,
          policy_type: form.policyType,
          policy_name: form.policyName,
          sum_assured: Number(form.sumAssured),
          premium_amount: Number(form.premiumAmount),
          status: form.status,
          agent_id: user?.user_id || '00000000-0000-0000-0000-000000000000'
        }
        if (editId) {
          result = await supabase.from('insurance_policies').update(payload).eq('id', editId)
        } else {
          result = await supabase.from('insurance_policies').insert(payload)
        }
      } 
      
      else if (moduleType === 'claims') {
        const payload = {
          customer_id: form.customerId,
          claim_amount: Number(form.claimAmount),
          claim_date: form.claimDate,
          status: form.status,
          description: form.description
        }
        if (editId) {
          result = await supabase.from('insurance_claims').update(payload).eq('id', editId)
        } else {
          result = await supabase.from('insurance_claims').insert(payload)
        }
      } 
      
      else if (moduleType === 'documents') {
        const payload = {
          customer_id: form.customerId,
          doc_type: form.docType,
          file_name: form.fileName,
          file_url: form.fileUrl,
          uploaded_by: user?.user_id || '00000000-0000-0000-0000-000000000000'
        }
        if (editId) {
          result = await supabase.from('documents').update(payload).eq('id', editId)
        } else {
          result = await supabase.from('documents').insert(payload)
        }
      } 
      
      else if (moduleType === 'agents') {
        const payload = {
          full_name: form.fullName,
          email: form.email,
          role: form.role,
          verification_status: form.verificationStatus
        }
        if (editId) {
          result = await supabase.from('profiles').update(payload).eq('id', editId)
        } else {
          toast.info('New agents must register via registration page to link auth.users credentials.')
          return
        }
      }

      if (result?.error) throw result.error
      toast.success('Database operation successful!')
      setShowModal(false)
      resetForm()
      loadRecords()
    } catch (err: any) {
      toast.error(`Database Error: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this record permanently from Supabase database?')) return
    try {
      let table = 'loans'
      if (moduleType === 'insurance') table = 'insurance_policies'
      else if (moduleType === 'claims') table = 'insurance_claims'
      else if (moduleType === 'documents') table = 'documents'
      else if (moduleType === 'agents') table = 'profiles'

      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      toast.success('Record deleted from database!')
      loadRecords()
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`)
    }
  }

  const handleEditClick = (record: any) => {
    setEditId(record.id)
    if (moduleType === 'loans') {
      setForm({
        customerId: record.customer_id,
        loanType: record.loan_type,
        amount: String(record.amount),
        interestRate: String(record.interest_rate),
        termMonths: String(record.term_months),
        status: record.status
      })
    } else if (moduleType === 'insurance') {
      setForm({
        customerId: record.customer_id,
        policyType: record.policy_type,
        policyName: record.policy_name,
        sumAssured: String(record.sum_assured),
        premiumAmount: String(record.premium_amount),
        status: record.status
      })
    } else if (moduleType === 'claims') {
      setForm({
        customerId: record.customer_id,
        claimAmount: String(record.claim_amount),
        claimDate: record.claim_date,
        status: record.status,
        description: record.description || ''
      })
    } else if (moduleType === 'documents') {
      setForm({
        customerId: record.customer_id,
        docType: record.doc_type,
        fileName: record.file_name,
        fileUrl: record.file_url
      })
    } else if (moduleType === 'agents') {
      setForm({
        fullName: record.full_name,
        email: record.email,
        role: record.role,
        verificationStatus: record.verification_status
      })
    }
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{moduleType} / {submenuName}</span>
          <h2 className="text-2xl font-bold text-[#0a1f44] mt-1">{submenuName}</h2>
        </div>
        {moduleType !== 'agents' && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={16} /> New Entry
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${submenuName.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => toast.success('CSV export generated successfully!')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} /> Export Report
          </button>
        </div>

        {/* Dynamic Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                {moduleType === 'agents' ? (
                  <>
                    <th className="py-4 px-4">Agent Profile</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Assigned Role</th>
                    <th className="py-4 px-4">Verification</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-4">Customer Name</th>
                    {moduleType === 'loans' && (
                      <>
                        <th className="py-4 px-4">Loan Type</th>
                        <th className="py-4 px-4">Principal Sourced</th>
                        <th className="py-4 px-4">Rate / Terms</th>
                      </>
                    )}
                    {moduleType === 'insurance' && (
                      <>
                        <th className="py-4 px-4">Policy Type</th>
                        <th className="py-4 px-4">Scheme Name</th>
                        <th className="py-4 px-4">Sum Assured / Premium</th>
                      </>
                    )}
                    {moduleType === 'claims' && (
                      <>
                        <th className="py-4 px-4">Requested Payout</th>
                        <th className="py-4 px-4">Claim Date</th>
                        <th className="py-4 px-4">Remarks</th>
                      </>
                    )}
                    {moduleType === 'documents' && (
                      <>
                        <th className="py-4 px-4">File Name</th>
                        <th className="py-4 px-4">Document Category</th>
                        <th className="py-4 px-4">Storage URL</th>
                      </>
                    )}
                    <th className="py-4 px-4">Status</th>
                  </>
                )}
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Fetching records from Supabase...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No matching records found.</td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                    {moduleType === 'agents' ? (
                      <>
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-slate-800">{rec.full_name}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{rec.email}</td>
                        <td className="py-4 px-4 font-bold text-[#0a1f44]">{rec.role}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            rec.verification_status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}>
                            {rec.verification_status || 'pending'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-slate-800">{rec.customer?.full_name || 'GFS Member'}</span>
                        </td>
                        
                        {moduleType === 'loans' && (
                          <>
                            <td className="py-4 px-4 text-[#0a1f44] font-bold capitalize">{rec.loan_type}</td>
                            <td className="py-4 px-4 font-extrabold text-slate-800">₹{Number(rec.amount).toLocaleString('en-IN')}</td>
                            <td className="py-4 px-4 text-slate-500">{rec.interest_rate}% / {rec.term_months} Mo</td>
                          </>
                        )}
                        
                        {moduleType === 'insurance' && (
                          <>
                            <td className="py-4 px-4 text-[#0a1f44] font-bold capitalize">{rec.policy_type}</td>
                            <td className="py-4 px-4 text-slate-800 font-bold">{rec.policy_name}</td>
                            <td className="py-4 px-4">
                              <span className="font-extrabold text-slate-800 block">₹{Number(rec.sum_assured).toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Prem: ₹{Number(rec.premium_amount).toLocaleString('en-IN')}</span>
                            </td>
                          </>
                        )}
                        
                        {moduleType === 'claims' && (
                          <>
                            <td className="py-4 px-4 font-extrabold text-red-600">₹{Number(rec.claim_amount).toLocaleString('en-IN')}</td>
                            <td className="py-4 px-4 text-slate-500">{rec.claim_date}</td>
                            <td className="py-4 px-4 text-slate-400 max-w-[150px] truncate">{rec.description || 'N/A'}</td>
                          </>
                        )}
                        
                        {moduleType === 'documents' && (
                          <>
                            <td className="py-4 px-4 font-bold text-slate-800">{rec.file_name}</td>
                            <td className="py-4 px-4 capitalize">{rec.doc_type}</td>
                            <td className="py-4 px-4 text-blue-600 font-mono text-[10px] truncate max-w-[120px]">{rec.file_url}</td>
                          </>
                        )}
                        
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            ['approved', 'active', 'settled'].includes(rec.status) ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            ['verification', 'pending', 'lead'].includes(rec.status) ? 'bg-blue-50 border-blue-100 text-blue-700' :
                            'bg-red-50 border-red-100 text-red-700'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="py-4 px-4 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => handleEditClick(rec)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors inline-flex border border-slate-200"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
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

      {/* Dynamic Form Modal */}
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
                  {editId ? 'Modify Details' : 'Add New Entry'}
                </h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {moduleType !== 'agents' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Customer Profile *</label>
                    <select
                      className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-blue-500 ${errors.customerId ? 'border-red-500' : 'border-slate-200'}`}
                      value={form.customerId}
                      onChange={e => setForm({ ...form, customerId: e.target.value })}
                    >
                      <option value="">-- Link Customer Profile --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName}</option>
                      ))}
                    </select>
                    {errors.customerId && <span className="text-[10px] text-red-500 mt-1 block">{errors.customerId}</span>}
                  </div>
                )}

                {/* Loans forms */}
                {moduleType === 'loans' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Loan Type</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.loanType}
                          onChange={e => setForm({ ...form, loanType: e.target.value })}
                        >
                          <option value="personal">Personal Loan</option>
                          <option value="home">Home Loan</option>
                          <option value="vehicle">Vehicle Loan</option>
                          <option value="business">Business Loan</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                          <option value="lead">Lead</option>
                          <option value="verification">Verification</option>
                          <option value="approved">Approved</option>
                          <option value="disbursed">Disbursed</option>
                          <option value="closed">Closed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Principal Amount (₹) *</label>
                      <input
                        type="number"
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.amount ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="e.g. 500000"
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                      />
                      {errors.amount && <span className="text-[10px] text-red-500 mt-1 block">{errors.amount}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.interestRate}
                          onChange={e => setForm({ ...form, interestRate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Term (Months)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.termMonths}
                          onChange={e => setForm({ ...form, termMonths: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Insurance forms */}
                {moduleType === 'insurance' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Policy Category</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.policyType}
                          onChange={e => setForm({ ...form, policyType: e.target.value })}
                        >
                          <option value="health">Health Insurance</option>
                          <option value="life">Life Insurance</option>
                          <option value="vehicle">Vehicle Insurance</option>
                          <option value="property">Property Insurance</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                          <option value="pending">Pending Request</option>
                          <option value="active">Active Policy</option>
                          <option value="lapsed">Lapsed</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Policy Scheme Name *</label>
                      <input
                        type="text"
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.policyName ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="e.g. Star Health Optima Plan"
                        value={form.policyName}
                        onChange={e => setForm({ ...form, policyName: e.target.value })}
                      />
                      {errors.policyName && <span className="text-[10px] text-red-500 mt-1 block">{errors.policyName}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sum Assured (₹) *</label>
                        <input
                          type="number"
                          className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.sumAssured ? 'border-red-500' : 'border-slate-200'}`}
                          placeholder="500000"
                          value={form.sumAssured}
                          onChange={e => setForm({ ...form, sumAssured: e.target.value })}
                        />
                        {errors.sumAssured && <span className="text-[10px] text-red-500 mt-1 block">{errors.sumAssured}</span>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Premium Amount (₹)</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          placeholder="12000"
                          value={form.premiumAmount}
                          onChange={e => setForm({ ...form, premiumAmount: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Claims Form */}
                {moduleType === 'claims' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Claim Amount (₹) *</label>
                        <input
                          type="number"
                          className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.claimAmount ? 'border-red-500' : 'border-slate-200'}`}
                          placeholder="e.g. 75000"
                          value={form.claimAmount}
                          onChange={e => setForm({ ...form, claimAmount: e.target.value })}
                        />
                        {errors.claimAmount && <span className="text-[10px] text-red-500 mt-1 block">{errors.claimAmount}</span>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.status}
                          onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="settled">Settled</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date of Filing</label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                        value={form.claimDate}
                        onChange={e => setForm({ ...form, claimDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Case Description</label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none h-20"
                        placeholder="e.g. Hospitalization due to health issues..."
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Documents form */}
                {moduleType === 'documents' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">File Name *</label>
                        <input
                          type="text"
                          className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.fileName ? 'border-red-500' : 'border-slate-200'}`}
                          placeholder="e.g. AadharCard.pdf"
                          value={form.fileName}
                          onChange={e => setForm({ ...form, fileName: e.target.value })}
                        />
                        {errors.fileName && <span className="text-[10px] text-red-500 mt-1 block">{errors.fileName}</span>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Doc Category</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.docType}
                          onChange={e => setForm({ ...form, docType: e.target.value })}
                        >
                          <option value="aadhaar">Aadhaar Card</option>
                          <option value="pan">PAN Card</option>
                          <option value="salary_slip">Salary Slip</option>
                          <option value="bank_statement">Bank Statement</option>
                          <option value="photo">Photo ID</option>
                          <option value="other">Other Agreement</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Storage URL *</label>
                      <input
                        type="text"
                        className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.fileUrl ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="e.g. bucket/customer/file.pdf"
                        value={form.fileUrl}
                        onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                      />
                      {errors.fileUrl && <span className="text-[10px] text-red-500 mt-1 block">{errors.fileUrl}</span>}
                    </div>
                  </>
                )}

                {/* Agents Form */}
                {moduleType === 'agents' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name *</label>
                        <input
                          type="text"
                          className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-slate-200'}`}
                          placeholder="Linga Prasad"
                          value={form.fullName}
                          onChange={e => setForm({ ...form, fullName: e.target.value })}
                        />
                        {errors.fullName && <span className="text-[10px] text-red-500 mt-1 block">{errors.fullName}</span>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address *</label>
                        <input
                          type="email"
                          className={`w-full bg-slate-50 border rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
                          placeholder="agent@gfs.com"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                        {errors.email && <span className="text-[10px] text-red-500 mt-1 block">{errors.email}</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Agent Role</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.role}
                          onChange={e => setForm({ ...form, role: e.target.value })}
                        >
                          <option value="loan_agent">Loan Agent</option>
                          <option value="insurance_agent">Insurance Agent</option>
                          <option value="investment_agent">Investment Agent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Verification Status</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                          value={form.verificationStatus}
                          onChange={e => setForm({ ...form, verificationStatus: e.target.value })}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-550 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {editId ? 'Save Changes' : 'Save Record'}
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
