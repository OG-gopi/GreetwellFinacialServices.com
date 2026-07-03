import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Search, Check, Clock, Phone, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatDate, generateInitials, cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function FollowUpsPage() {
  const { user } = useAuthStore()
  const [followups, setFollowups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending')
  const [search, setSearch] = useState('')

  // Create Followup state
  const [showModal, setShowModal] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustId, setSelectedCustId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [fupNotes, setFupNotes] = useState('')
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    loadFollowups()
    loadCustomers()
  }, [])

  async function loadFollowups() {
    setIsLoading(true)
    try {
      if (!user?.user_id) return
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*, customer:customers(full_name, phone)')
        .eq('agent_id', user.user_id)
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      setFollowups(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCustomers() {
    try {
      if (!user?.user_id) return
      const { data } = await supabase
        .from('customers')
        .select('id, full_name')
        .eq('agent_id', user.user_id)
        .eq('is_deleted', false)
      setCustomers(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function toggleComplete(fUpId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .update({ is_completed: !currentStatus })
        .eq('id', fUpId)

      if (error) throw error
      toast.success(!currentStatus ? 'Follow-up completed' : 'Follow-up reopened')
      setFollowups(prev => prev.map(f => f.id === fUpId ? { ...f, is_completed: !currentStatus } : f))
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  async function handleCreateFollowup() {
    if (!selectedCustId || !scheduledAt || !user?.user_id) return
    setScheduling(true)
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .insert({
          customer_id: selectedCustId,
          agent_id: user.user_id,
          scheduled_at: new Date(scheduledAt).toISOString(),
          notes: fupNotes.trim(),
          is_completed: false
        })
        .select('*, customer:customers(full_name, phone)')

      if (error) throw error
      toast.success('Follow-up scheduled successfully')
      setFollowups(prev => [...prev, data[0]])
      setShowModal(false)
      setSelectedCustId('')
      setScheduledAt('')
      setFupNotes('')
    } catch (err) {
      toast.error('Failed to schedule follow-up')
    } finally {
      setScheduling(false)
    }
  }

  const filtered = followups.filter(f => {
    const customer = f.customer
    const matchesSearch = !search || customer?.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && f.is_completed) || 
      (filter === 'pending' && !f.is_completed)
    return matchesSearch && matchesFilter
  })

  return (
    <AppShell pageTitle="Interaction Follow-ups">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Interaction Follow-ups</h1>
          <p className="text-navy-400 text-sm mt-0.5">{followups.filter(f => !f.is_completed).length} open calls scheduled</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-gold flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg"
        >
          <PlusCircle className="w-4 h-4" /> Schedule Call
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            className="gfs-input pl-9 w-full"
            placeholder="Search by customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="gfs-input w-auto min-w-[140px]"
        >
          <option value="pending">Pending Calls</option>
          <option value="completed">Completed Calls</option>
          <option value="all">All Interactions</option>
        </select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-navy-400 py-8 text-center">Loading interactions...</p>
        ) : filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="p-4 rounded-xl border border-navy-700/60 bg-navy-900/30 hover:border-gold-500/20 transition-all flex justify-between items-center flex-wrap gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{item.customer?.full_name}</h4>
                {item.is_completed && <span className="text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Completed</span>}
              </div>
              <p className="text-xs text-navy-400 mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gold-500">{formatDate(item.scheduled_at)}</span>
                <span>•</span>
                <span>{item.notes || 'No call log agenda entered'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a href={`tel:${item.customer?.phone}`} className="p-2 rounded-lg hover:bg-navy-800 text-navy-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => toggleComplete(item.id, item.is_completed)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                  item.is_completed
                    ? "border-navy-600 hover:bg-navy-700 text-navy-300"
                    : "btn-gold border-transparent"
                )}
              >
                {item.is_completed ? 'Reopen' : 'Mark Done'}
              </button>
            </div>
          </motion.div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-navy-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No scheduled follow-up calls found.
          </div>
        )}
      </div>

      {/* Schedule followup call modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md mx-4 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-semibold text-foreground">Schedule Customer Call</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="gfs-label mb-1.5 block">Select Customer Profile</label>
                <select
                  value={selectedCustId}
                  onChange={e => setSelectedCustId(e.target.value)}
                  className="gfs-input w-full"
                >
                  <option value="">-- Choose Profile --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="gfs-label mb-1.5 block">Schedule Time & Date</label>
                <input
                  className="gfs-input w-full"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                />
              </div>
              <div>
                <label className="gfs-label mb-1.5 block">Call Log Agenda Notes</label>
                <textarea
                  className="gfs-input w-full min-h-[80px] py-2"
                  placeholder="Discussion target e.g. details verification, portfolio review..."
                  value={fupNotes}
                  onChange={e => setFupNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-outline-gold flex-1 text-sm">Cancel</button>
              <button
                disabled={!selectedCustId || !scheduledAt || scheduling}
                onClick={handleCreateFollowup}
                className="bg-gold-500 text-navy-900 font-bold py-2.5 rounded-xl hover:bg-gold-400 disabled:opacity-50 flex-1 text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {scheduling ? 'Scheduling...' : 'Schedule Call'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  )
}
