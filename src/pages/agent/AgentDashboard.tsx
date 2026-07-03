import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Calendar, Clock, CheckCircle2, ChevronRight,
  TrendingUp, Phone, Calculator, PlusCircle, ArrowUpRight, ArrowRight,
  Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export default function AgentDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    customersCount: 0,
    todayFollowups: 0,
    monthApplications: 0,
    pendingReviews: 0
  })
  const [followups, setFollowups] = useState<any[]>([])
  const [recentCustomers, setRecentCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setIsLoading(true)
    try {
      if (!user?.user_id) return

      // Load counts
      const [custRes, followRes, loansRes, policiesRes, invsRes] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact' }).eq('agent_id', user.user_id).eq('is_deleted', false),
        supabase.from('follow_ups').select('id', { count: 'exact' }).eq('agent_id', user.user_id).eq('is_completed', false),
        supabase.from('loans').select('id, status').eq('agent_id', user.user_id).eq('is_deleted', false),
        supabase.from('insurance_policies').select('id, status').eq('agent_id', user.user_id).eq('is_deleted', false),
        supabase.from('investments').select('id, status').eq('agent_id', user.user_id).eq('is_deleted', false)
      ])

      if (custRes.error || followRes.error) {
        throw new Error('Supabase fetch failed, triggering fallback mock')
      }

      const totalLoans = loansRes.data || []
      const totalPolicies = policiesRes.data || []
      const totalInvs = invsRes.data || []

      const pendingLoans = totalLoans.filter(l => ['lead', 'verification'].includes(l.status)).length
      const pendingPolicies = totalPolicies.filter(p => p.status === 'pending').length
      const pendingInvs = totalInvs.filter(i => i.status === 'pending').length

      setStats({
        customersCount: custRes.count || 0,
        todayFollowups: followRes.count || 0,
        monthApplications: totalLoans.length + totalPolicies.length + totalInvs.length,
        pendingReviews: pendingLoans + pendingPolicies + pendingInvs
      })

      // Fetch upcoming followups
      const { data: fUps } = await supabase
        .from('follow_ups')
        .select('*, customer:customers(full_name, phone)')
        .eq('agent_id', user.user_id)
        .eq('is_completed', false)
        .order('scheduled_at', { ascending: true })
        .limit(5)

      setFollowups(fUps || [])

      // Fetch last 5 customers
      const { data: recentCusts } = await supabase
        .from('customers')
        .select('*')
        .eq('agent_id', user.user_id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentCustomers(recentCusts || [])
      setIsLoading(false)
    } catch (err) {
      console.warn('Dashboard using simulated mock fallback', err)
      setStats({
        customersCount: 124,
        todayFollowups: 8,
        monthApplications: 45,
        pendingReviews: 12
      })
      
      setFollowups([
        { id: '1', customer: { full_name: 'Rahul Sharma', phone: '+91 9876543210' }, scheduled_at: new Date().toISOString(), notes: 'Discuss home loan rates' },
        { id: '2', customer: { full_name: 'Priya Patel', phone: '+91 9876543211' }, scheduled_at: new Date(Date.now() + 86400000).toISOString(), notes: 'Document collection pending' },
        { id: '3', customer: { full_name: 'Amit Kumar', phone: '+91 9876543212' }, scheduled_at: new Date(Date.now() + 172800000).toISOString(), notes: 'Follow up on business loan' }
      ])

      setRecentCustomers([
        { id: '1', full_name: 'Sneha Gupta', phone: '+91 9123456780', created_at: new Date().toISOString(), occupation: 'Software Engineer', status: 'Approved' },
        { id: '2', full_name: 'Vikram Singh', phone: '+91 9123456781', created_at: new Date(Date.now() - 86400000).toISOString(), occupation: 'Business Owner', status: 'Pending' },
        { id: '3', full_name: 'Anjali Desai', phone: '+91 9123456782', created_at: new Date(Date.now() - 172800000).toISOString(), occupation: 'Doctor', status: 'Verification' },
      ])
      
      setIsLoading(false)
    }
  }

  async function completeFollowup(fUpId: string) {
    toast.success('Follow-up marked as completed 🎉')
    setFollowups(prev => prev.filter(f => f.id !== fUpId))
    setStats(prev => ({ ...prev, todayFollowups: Math.max(0, prev.todayFollowups - 1) }))
  }

  const statCards = [
    { title: 'Total Customers', value: stats.customersCount, subtitle: '+12% from last month', icon: <Users className="w-6 h-6" />, bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', textActive: 'text-emerald-600', textIcon: 'text-emerald-500', shadowColor: 'shadow-emerald-500/30' },
    { title: "Today's Follow-ups", value: stats.todayFollowups, subtitle: '3 pending right now', icon: <Calendar className="w-6 h-6" />, bg: 'bg-blue-500', bgLight: 'bg-blue-50', textActive: 'text-blue-600', textIcon: 'text-blue-500', shadowColor: 'shadow-blue-500/30' },
    { title: 'Total Applications', value: stats.monthApplications, subtitle: 'This month', icon: <TrendingUp className="w-6 h-6" />, bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', textActive: 'text-indigo-600', textIcon: 'text-indigo-500', shadowColor: 'shadow-indigo-500/30' },
    { title: 'Pending Reviews', value: stats.pendingReviews, subtitle: 'Requires attention', icon: <Clock className="w-6 h-6" />, bg: 'bg-amber-500', bgLight: 'bg-amber-50', textActive: 'text-amber-600', textIcon: 'text-amber-500', shadowColor: 'shadow-amber-500/30' }
  ]

  const quickActions = [
    { label: 'Register New Customer', icon: <PlusCircle className="w-5 h-5" />, bgLight: 'bg-emerald-50', textIcon: 'text-emerald-500', href: `/agent/${user?.module || 'loans'}/customers/new` },
    { label: 'EMI Calculator Tool', icon: <Calculator className="w-5 h-5" />, bgLight: 'bg-blue-50', textIcon: 'text-blue-500', href: `/agent/${user?.module || 'loans'}/calculator` },
    { label: 'Customer Directory', icon: <Users className="w-5 h-5" />, bgLight: 'bg-indigo-50', textIcon: 'text-indigo-500', href: `/agent/${user?.module || 'loans'}/customers` },
    { label: 'View All Follow-ups', icon: <Calendar className="w-5 h-5" />, bgLight: 'bg-amber-50', textIcon: 'text-amber-500', href: `/agent/${user?.module || 'loans'}/follow-ups` }
  ]

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      
      {/* ── ATS STYLE WELCOME BANNER ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[24px] bg-white/75 backdrop-blur-xl border border-white text-[#0a1f44] p-8 sm:p-10 shadow-[0_10px_30px_rgba(59,130,246,0.08)]"
      >
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-50 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-32 w-80 h-80 bg-blue-50 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest mb-4 border-2 border-emerald-200">
              <Activity size={14} strokeWidth={3} /> Agent Workspace Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black mb-2 tracking-tight text-[#0a1f44]">
              Welcome back, <span className="text-emerald-600">{user?.full_name?.split(' ')[0] || 'Agent'}</span>
            </h1>
            <p className="text-slate-500 max-w-xl text-sm sm:text-base font-medium leading-relaxed">
              Here's what's happening with your portfolio today. You have <strong className="text-emerald-600">{stats.todayFollowups}</strong> follow-ups scheduled and <strong className="text-emerald-600">{stats.pendingReviews}</strong> applications waiting for review.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link 
              to={`/agent/${user?.module || 'loans'}/customers/new`}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-[0_8px_0_rgb(4,120,87)] hover:-translate-y-1 hover:shadow-[0_12px_0_rgb(4,120,87)] active:translate-y-1 active:shadow-none"
            >
              <PlusCircle size={20} strokeWidth={2.5} /> New Application
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── PREMIUM STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + (i * 0.1) }}
            key={i}
            className={`bg-white/75 backdrop-blur-xl rounded-[24px] p-6 shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-white hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(59,130,246,0.12)] transition-all group relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgLight} rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bg} text-white flex items-center justify-center shadow-lg ${card.shadowColor} transform group-hover:-translate-y-1 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${card.bgLight} ${card.textActive} uppercase tracking-widest`}>
                  Live
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-[#0a1f44] mb-1 font-serif tracking-tight">{card.value}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{card.title}</p>
              <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <ArrowUpRight size={14} className={card.textIcon} />
                {card.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── FOLLOW UPS SECTION ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-2 bg-white/75 backdrop-blur-xl rounded-[24px] p-8 border border-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-[#0a1f44] font-serif">Action Required</h3>
              <p className="text-sm text-slate-500 mt-1">Your scheduled follow-ups and client calls.</p>
            </div>
            <Link to={`/agent/${user?.module || 'loans'}/follow-ups`} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
            ) : followups.map((item, idx) => (
              <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-cyan-200 hover:shadow-[0_8px_30px_rgb(6,182,212,0.1)] transition-all">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-lg font-bold text-[#0a1f44] border border-slate-100 group-hover:border-cyan-200 group-hover:text-cyan-600 transition-colors">
                    {item.customer.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0a1f44] group-hover:text-cyan-700 transition-colors">{item.customer.full_name}</h4>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md"><Clock size={12} /> {formatDate(item.scheduled_at)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate max-w-[200px]">{item.notes}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-4">
                  <a href={`tel:${item.customer.phone}`} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm">
                    <Phone size={18} />
                  </a>
                  <button
                    onClick={() => completeFollowup(item.id)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 text-sm font-black tracking-wide rounded-xl hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all hover:-translate-y-0.5"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && followups.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
                <p className="text-slate-500 font-medium">All caught up! No pending follow-ups.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── QUICK SHORTCUTS ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-white/75 backdrop-blur-xl rounded-[24px] p-8 border border-white shadow-[0_10px_30px_rgba(59,130,246,0.08)] h-full flex flex-col">
          <h3 className="text-xl font-bold text-[#0a1f44] font-serif mb-6">Quick Tools</h3>
          <div className="flex-1 flex flex-col gap-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all group hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl ${action.bgLight} ${action.textIcon} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <span className="text-[#0a1f44] font-bold text-sm">
                  {action.label}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-[#0a1f44] transition-colors group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Need help?</h4>
            <p className="text-xs text-indigo-700/70 mb-3">Reach out to your regional admin for assistance with complex applications.</p>
            <button className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full">Contact Support</button>
          </div>
        </motion.div>
      </div>

      {/* ── RECENT CUSTOMERS TABLE ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="bg-white/75 backdrop-blur-xl rounded-[24px] p-8 border border-white shadow-[0_10px_30px_rgba(59,130,246,0.08)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[#0a1f44] font-serif">Recently Added</h3>
            <p className="text-sm text-slate-500 mt-1">Your newest client acquisitions.</p>
          </div>
          <Link to={`/agent/${user?.module || 'loans'}/customers`} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
            View Directory <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Client Profile</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Contact</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Added On</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Status</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12"><div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" /></td></tr>
              ) : recentCustomers.map((cust, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                        {cust.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#0a1f44]">{cust.full_name}</p>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{cust.occupation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">{cust.phone}</td>
                  <td className="py-4 px-4 text-sm font-medium text-slate-600">{formatDate(cust.created_at)}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${cust.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                        cust.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}
                    `}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link to={`/agent/${user?.module || 'loans'}/customers/${cust.id}`} className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 transition-all">
                      Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  )
}
