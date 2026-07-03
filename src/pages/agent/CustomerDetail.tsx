import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, User, Phone, Mail, FileText, ChevronLeft, CreditCard,
  MessageSquare, PlusCircle, CheckCircle, RefreshCw, Upload, Sparkles
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatDate, generateInitials, formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Calendar } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [customer, setCustomer] = useState<any>(null)
  const [loans, setLoans] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Followup form state
  const [showFupModal, setShowFupModal] = useState(false)
  const [fupDate, setFupDate] = useState('')
  const [fupNotes, setFupNotes] = useState('')
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    loadCustomerData()
  }, [id])

  async function loadCustomerData() {
    setIsLoading(true)
    try {
      // 1. Fetch Customer
      const { data: cust, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (custErr) throw custErr
      setCustomer(cust)

      // 2. Fetch Loans, Policies, Investments
      const [loansRes, policiesRes, invsRes, notesRes, followRes] = await Promise.all([
        supabase.from('loans').select('*').eq('customer_id', id).eq('is_deleted', false),
        supabase.from('insurance_policies').select('*').eq('customer_id', id).eq('is_deleted', false),
        supabase.from('investments').select('*').eq('customer_id', id).eq('is_deleted', false),
        supabase.from('notes').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
        supabase.from('follow_ups').select('*').eq('customer_id', id).order('scheduled_at', { ascending: true })
      ])

      setLoans(loansRes.data || [])
      setPolicies(policiesRes.data || [])
      setInvestments(invsRes.data || [])
      setNotes(notesRes.data || [])
      setFollowups(followRes.data || [])

    } catch (err) {
      console.error(err)
      toast.error('Failed to load customer profile details')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddNote() {
    if (!newNote.trim() || !id || !user?.user_id) return
    setSubmittingNote(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          customer_id: id,
          agent_id: user.user_id,
          content: newNote.trim()
        })
        .select()

      if (error) throw error
      toast.success('Note added successfully')
      setNotes(prev => [data[0], ...prev])
      setNewNote('')
    } catch (err) {
      toast.error('Failed to add note')
    } finally {
      setSubmittingNote(false)
    }
  }

  async function handleScheduleFollowup() {
    if (!fupDate || !id || !user?.user_id) return
    setScheduling(true)
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          customer_id: id,
          agent_id: user.user_id,
          scheduled_at: new Date(fupDate).toISOString(),
          notes: fupNotes.trim(),
          is_completed: false
        })
        .select()

      if (error) throw error
      toast.success('Follow-up scheduled successfully')
      setFollowups(prev => [...prev, data[0]])
      setShowFupModal(false)
      setFupDate('')
      setFupNotes('')
    } catch (err) {
      toast.error('Failed to schedule follow-up')
    } finally {
      setScheduling(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell pageTitle="Loading Profile">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell pageTitle={customer?.full_name || 'Customer Detail'}>
      <button onClick={() => navigate('/agent/customers')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to Directory
      </button>

      {/* Customer Header card */}
      <div className="gfs-card p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xl font-bold shrink-0">
            {generateInitials(customer?.full_name)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {customer?.full_name}
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 border border-emerald-200">Verified KYC</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customer?.phone}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {customer?.email || 'No Email'}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setShowFupModal(true)} className="btn-outline-gold flex-1 md:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg border border-gold-500/40 text-gold-400">
            Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Profile Metrics and Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Assess Column */}
        <div className="space-y-6">
          {/* Credit CIBIL Score Card */}
          <div className="gfs-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Underwriting Audit</h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-500 text-xs">Bureau CIBIL Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{customer?.cibil_score || '—'}</span>
                  <span className="text-xs text-emerald-600">Standard Tier</span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Verified Income (Monthly)</p>
                <p className="text-emerald-600 font-bold text-lg mt-0.5">{formatCurrency(customer?.monthly_income || 0)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Aadhaar (KYC masked)</p>
                <p className="text-slate-800 font-mono text-sm mt-0.5">XXXX-XXXX-4930</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">PAN (KYC masked)</p>
                <p className="text-slate-800 font-mono text-sm mt-0.5">XXXXXX492B</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-4">
            {['overview', 'loans', 'insurance', 'investments', 'notes', 'followups'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-3 px-1 text-sm font-semibold capitalize border-b-2 transition-all w-max shrink-0",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {tab === 'followups' ? 'Followups' : tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Active services count */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="gfs-card p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{loans.length}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Loan Schemes</p>
                  </div>
                  <div className="gfs-card p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{policies.length}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Insurance Policies</p>
                  </div>
                  <div className="gfs-card p-4 text-center">
                    <p className="text-2xl font-bold text-slate-800">{investments.length}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Investments Folios</p>
                  </div>
                </div>

                <div className="gfs-card p-5">
                  <h3 className="text-slate-800 font-semibold mb-3">Address & Correspondence</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Pincode</p>
                      <p className="text-slate-800 mt-0.5">{customer?.pincode || '—'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Employer</p>
                      <p className="text-slate-800 mt-0.5">{customer?.employer || '—'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'loans' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {loans.map(loan => (
                  <div key={loan.id} className="gfs-card p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Loan scheme Amount: {formatCurrency(loan.loan_amount)}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Tenure: {loan.tenure_months} Months • Type: {loan.loan_type}</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-primary border border-slate-200">
                      {loan.status}
                    </span>
                  </div>
                ))}
                {loans.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No loans registered.</p>}
              </motion.div>
            )}

            {activeTab === 'insurance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {policies.map(pol => (
                  <div key={pol.id} className="gfs-card p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Sum Assured: {formatCurrency(pol.sum_assured)}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Premium: {formatCurrency(pol.premium_amount)} • Frequency: {pol.payment_frequency}</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-primary border border-slate-200">
                      {pol.status}
                    </span>
                  </div>
                ))}
                {policies.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No policies registered.</p>}
              </motion.div>
            )}

            {activeTab === 'investments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {investments.map(inv => (
                  <div key={inv.id} className="gfs-card p-4 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{inv.fund_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Capital Invested: {formatCurrency(inv.invested_amount)} • Risk: {inv.risk_level}</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-primary border border-slate-200">
                      {inv.investment_type}
                    </span>
                  </div>
                ))}
                {investments.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No active investments found.</p>}
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="space-y-3">
                  <textarea
                    className="gfs-input w-full min-h-[80px] py-2"
                    placeholder="Write a private note on customer interactions..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button
                      disabled={!newNote.trim() || submittingNote}
                      onClick={handleAddNote}
                      className="btn-gold text-xs px-4 py-2 font-bold rounded-lg"
                    >
                      Save Interaction Note
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {notes.map(note => (
                    <div key={note.id} className="gfs-card p-3.5">
                      <p className="text-sm text-slate-800">{note.content}</p>
                      <p className="text-slate-500 text-xs mt-2">{formatDate(note.created_at)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'followups' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {followups.map(fUp => (
                  <div key={fUp.id} className="gfs-card p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{fUp.notes || 'Routine Follow-up'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Scheduled For: {formatDate(fUp.scheduled_at)}</p>
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-bold uppercase",
                      fUp.is_completed ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      {fUp.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Schedule followup modal */}
      {showFupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md mx-4 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-foreground">Schedule Customer Follow-up</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="gfs-label mb-1.5 block">Scheduled Time & Date</label>
                <input
                  className="gfs-input w-full"
                  type="datetime-local"
                  value={fupDate}
                  onChange={e => setFupDate(e.target.value)}
                />
              </div>
              <div>
                <label className="gfs-label mb-1.5 block">Follow-up Notes / Agenda</label>
                <textarea
                  className="gfs-input w-full min-h-[80px] py-2"
                  placeholder="Agenda for discussion e.g. verify KYC documents..."
                  value={fupNotes}
                  onChange={e => setFupNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFupModal(false)} className="btn-outline-gold flex-1 text-sm">Cancel</button>
              <button
                disabled={!fupDate || scheduling}
                onClick={handleScheduleFollowup}
                className="bg-gold-500 text-navy-900 font-bold py-2.5 rounded-xl hover:bg-gold-400 disabled:opacity-50 flex-1 text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
