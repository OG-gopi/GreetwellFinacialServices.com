import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  useAuthStore 
} from '@/store/authStore'
import { 
  useAgentWorkflowStore, LeadRecord 
} from '@/store/agentWorkflowStore'
import { 
  LayoutDashboard, Users, FileText, DollarSign, Shield, 
  TrendingUp, Award, Bell, ClipboardList, Settings, CheckSquare, 
  MapPin, Phone, Mail, FileCheck, HelpCircle, User, 
  LogOut, Plus, ArrowUpRight, CheckCircle2, ChevronRight, Edit2
} from 'lucide-react'
import { 
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts'
import { toast } from 'sonner'

export default function AgentPortalDashboard() {
  const { user } = useAuthStore()
  const { leads, updateLeadStatus, assignLeadToAgent, applications } = useAgentWorkflowStore()
  
  // Find current agent application in store for verified details
  const agentProfile = applications.find(a => a.email === user?.email)
  const agentType = (agentProfile?.agentType || 'loan-agent') as 'loan-agent' | 'insurance-agent' | 'investment-agent'

  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'requests' | 'earnings' | 'documents' | 'notifications' | 'tasks' | 'performance' | 'settings'>('overview')

  // Theme settings based on Agent Type
  const theme = {
    'loan-agent': {
      label: 'Loans Agent Portal',
      badge: 'Loans Expert',
      color: 'emerald',
      bgGradient: 'from-emerald-600 to-teal-500',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      icon: <DollarSign className="w-5 h-5" />,
      rate: '2.0% Flat'
    },
    'insurance-agent': {
      label: 'Insurance Partner Portal',
      badge: 'Insurance Officer',
      color: 'blue',
      bgGradient: 'from-blue-600 to-indigo-500',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      icon: <Shield className="w-5 h-5" />,
      rate: '3.5% Slab'
    },
    'investment-agent': {
      label: 'Wealth Advisor Portal',
      badge: 'Certified Wealth Advisor',
      color: 'amber',
      bgGradient: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      icon: <TrendingUp className="w-5 h-5" />,
      rate: '1.5% Upfront'
    }
  }[agentType]

  // Filter leads based on agent service type
  const getFilteredLeads = () => {
    const serviceLabel = agentType === 'loan-agent' ? 'Loans' : agentType === 'insurance-agent' ? 'Insurance' : 'Investments'
    return leads.filter((l) => l.serviceType === serviceLabel)
  }

  const agentLeads = getFilteredLeads()

  // Dynamic metrics
  const totalLeads = agentLeads.length
  const convertedLeads = agentLeads.filter(l => ['Approved', 'Disbursed'].includes(l.status)).length
  const pendingLeads = agentLeads.filter(l => ['New', 'Contacted', 'In Progress'].includes(l.status)).length
  
  // Earnings formula
  const commissionRate = agentProfile?.commissionRate || 2.0
  const totalEarnings = convertedLeads * 12500 // Mock commission: 12.5k per converted customer
  
  // Tasks state
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Call client Karan Malhotra regarding loan papers', done: false },
    { id: 2, text: 'Upload signature verification proof', done: true },
    { id: 3, text: 'Complete mandatory compliance quiz', done: false },
    { id: 4, text: 'Send product brochures to Ramesh', done: false }
  ])

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    toast.success('Task checklist updated!')
  }

  // Create lead states
  const [showAddLead, setShowAddLead] = useState(false)
  const [newLeadName, setNewLeadName] = useState('')
  const [newLeadPhone, setNewLeadPhone] = useState('')
  const [newLeadAmount, setNewLeadAmount] = useState('')

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadName.trim() || !newLeadPhone.trim()) {
      toast.error('Name and Phone are mandatory')
      return
    }
    const serviceLabel = agentType === 'loan-agent' ? 'Loans' : agentType === 'insurance-agent' ? 'Insurance' : 'Investments'
    assignLeadToAgent({
      customerName: newLeadName,
      phone: newLeadPhone,
      serviceType: serviceLabel,
      amount: newLeadAmount ? `₹${Number(newLeadAmount).toLocaleString()}` : undefined,
      status: 'New',
      lastNotes: 'Self sourced lead added by Agent.'
    })
    toast.success('New client lead registered successfully!')
    setNewLeadName('')
    setNewLeadPhone('')
    setNewLeadAmount('')
    setShowAddLead(false)
  }

  // Change lead status states
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState<LeadRecord | null>(null)
  const [updatedStatus, setUpdatedStatus] = useState<LeadRecord['status']>('New')
  const [statusNotes, setStatusNotes] = useState('')

  const handleUpdateStatus = () => {
    if (!selectedLeadForStatus) return
    updateLeadStatus(selectedLeadForStatus.id, updatedStatus, statusNotes)
    toast.success('Customer lead pipeline status updated!')
    setSelectedLeadForStatus(null)
    setStatusNotes('')
  }

  // Settings Password strength indicator
  const [oldPassword, setOldPassword] = useState('')
  const [changePass, setChangePass] = useState('')
  const [changeConfirmPass, setChangeConfirmPass] = useState('')

  const handlePassChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (changePass.length < 6) {
      toast.error('New Password must be at least 6 characters')
      return
    }
    if (changePass !== changeConfirmPass) {
      toast.error('Confirm Passwords do not match')
      return
    }
    toast.success('Credentials updated securely!')
    setOldPassword('')
    setChangePass('')
    setChangeConfirmPass('')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F9FF] text-slate-800 font-sans">
      
      {/* Dynamic Responsive Sidebar */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200/80 p-4 md:p-5 flex flex-col md:flex-col shrink-0 justify-between">
        
        <div className="flex flex-col md:block">
          {/* Logo and Name Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-8 border-b border-slate-100 pb-3 md:pb-5">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${theme.bgGradient} flex items-center justify-center text-white shrink-0 shadow-md`}>
                {theme.icon}
              </div>
              <div className="text-left">
                <h3 className="font-extrabold text-slate-900 leading-none text-xs md:text-sm">{theme.label}</h3>
                <span className="text-[9px] md:text-[10px] text-slate-400 font-bold block mt-1 tracking-wider uppercase">{theme.badge}</span>
              </div>
            </div>
            {/* Show GFS ID on mobile right-aligned */}
            <div className="md:hidden text-right">
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 border rounded-md text-slate-600 font-bold">{agentProfile?.agentId}</span>
            </div>
          </div>

          {/* Menu list: Horizontal scroll on mobile, Vertical stack on desktop/4K */}
          <div className="flex flex-row md:flex-col gap-1.5 md:gap-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none shrink-0">
            {[
              { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'leads', label: 'My Leads', icon: <Users className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'requests', label: 'Request', icon: <FileText className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'earnings', label: 'Payouts', icon: <DollarSign className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'documents', label: 'Locker', icon: <FileCheck className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 md:w-5 md:h-5" /> },
            ].map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all duration-300 shrink-0 whitespace-nowrap ${
                    isActive 
                      ? `bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10` 
                      : `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Profile Card Summary - Sticky bottom on desktop/4K */}
        <div className="hidden md:flex mt-auto border-t border-slate-100 pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border">
              {agentProfile?.fullName.split(' ').map(n => n[0]).join('') || 'AG'}
            </div>
            <div className="text-left">
              <p className="font-extrabold text-slate-900 text-xs leading-none">{agentProfile?.fullName}</p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">{agentProfile?.agentId}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Tab content pane */}
      <div className="flex-grow p-6 md:p-10 max-w-5xl w-full mx-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 text-left"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-3xl font-bold font-serif text-slate-950">Welcome back, {agentProfile?.fullName}!</h2>
                  <p className="text-slate-500 text-sm mt-1">Here is your Greetwell Financial Services business summary for today.</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full border ${theme.borderColor} ${theme.bgLight} ${theme.textColor} text-xs font-bold font-mono`}>
                  Commission rate: {theme.rate}
                </div>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">My Leads</span>
                  <span className={`text-3xl font-bold font-serif block mt-1 ${theme.textColor}`}>{totalLeads}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Assigned customers</span>
                </div>
                
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Disbursed / Approved</span>
                  <span className="text-3xl font-bold font-serif text-emerald-600 block mt-1">{convertedLeads}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Successfully closed</span>
                </div>

                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Pipeline pending</span>
                  <span className="text-3xl font-bold font-serif text-blue-500 block mt-1">{pendingLeads}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">In active processing</span>
                </div>

                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm text-left">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Earnings (Est)</span>
                  <span className="text-3xl font-bold font-serif text-emerald-600 block mt-1">₹{totalEarnings.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Commission payout</span>
                </div>
              </div>

              {/* Grid: Leads summary & quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Recent leads table */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold font-serif text-slate-900">Recent Customer Pipeline</h3>
                    <button onClick={() => setActiveTab('leads')} className={`text-xs font-bold ${theme.textColor} hover:underline`}>
                      View All Leads
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {agentLeads.length === 0 ? (
                      <p className="text-slate-400 text-xs py-4">No leads assigned yet.</p>
                    ) : (
                      agentLeads.slice(0, 3).map((lead) => (
                        <div key={lead.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{lead.customerName}</span>
                            <span className="text-slate-400">{lead.phone}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">{lead.amount || 'N/A'}</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-1 ${
                              ['Approved', 'Disbursed'].includes(lead.status) ? 'bg-emerald-50 text-emerald-600' :
                              lead.status === 'Rejected' ? 'bg-rose-50 text-rose-500' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Performance Analytics Widget */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900">Performance Rating</h3>
                    <p className="text-slate-400 text-xs mt-1">Sourced from customer ratings & disbursal velocity.</p>
                  </div>
                  
                  <div className="py-4 text-center">
                    <div className="inline-flex w-24 h-24 rounded-full border-8 border-slate-100 border-t-emerald-500 items-center justify-center shadow-inner relative">
                      <span className="text-2xl font-black font-serif text-slate-900">{agentProfile?.performanceScore || 85}%</span>
                    </div>
                    <span className="block text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-wider">Excellent Rating</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`w-full py-2.5 rounded-xl ${theme.bgColor} hover:opacity-90 text-white font-extrabold text-xs transition-opacity flex items-center justify-center gap-1.5`}
                  >
                    View Analytics Report <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: LEADS LIST */}
          {activeTab === 'leads' && (
            <motion.div
              key="leads"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex justify-between items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-950">Customer Leads</h2>
                  <p className="text-slate-500 text-xs mt-1">Manage pipeline status, follow-up notes, and submit disbursals.</p>
                </div>
                <button
                  onClick={() => setShowAddLead(true)}
                  className={`px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm`}
                >
                  <Plus className="w-4 h-4" /> Add Sourced Lead
                </button>
              </div>

              {/* Leads grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentLeads.length === 0 ? (
                  <div className="bg-white border p-12 rounded-3xl text-center md:col-span-2">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No leads assigned</p>
                  </div>
                ) : (
                  agentLeads.map((lead) => (
                    <div key={lead.id} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-slate-900 text-base">{lead.customerName}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            ['Approved', 'Disbursed'].includes(lead.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            lead.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                            'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">Phone: {lead.phone}</p>
                        {lead.amount && <p className="text-slate-950 font-bold text-xs mt-1">Amount: {lead.amount}</p>}
                        {lead.lastNotes && <p className="text-slate-400 text-xs italic mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">"{lead.lastNotes}"</p>}
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedLeadForStatus(lead)
                          setUpdatedStatus(lead.status)
                          setStatusNotes(lead.lastNotes || '')
                        }}
                        className={`w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1`}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Update Status & Notes
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Sourced Lead Modal */}
              {showAddLead && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left">
                    <h3 className="text-lg font-bold text-slate-950 font-serif mb-4">Register Sourced Lead</h3>
                    <form onSubmit={handleAddLead} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Customer Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newLeadName}
                          onChange={(e) => setNewLeadName(e.target.value)}
                          placeholder="e.g. Ramesh Reddy"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          value={newLeadPhone}
                          onChange={(e) => setNewLeadPhone(e.target.value)}
                          placeholder="10-digit mobile"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Requested Amount (Optional)</label>
                        <input
                          type="number"
                          value={newLeadAmount}
                          onChange={(e) => setNewLeadAmount(e.target.value)}
                          placeholder="e.g. 500000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddLead(false)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800"
                        >
                          Add Lead
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Status Update Modal */}
              {selectedLeadForStatus && (
                <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left">
                    <h3 className="text-lg font-bold text-slate-950 font-serif mb-2">Update Pipeline Status</h3>
                    <p className="text-slate-400 text-xs mb-4">Customer: <strong>{selectedLeadForStatus.customerName}</strong></p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Status</label>
                        <select
                          value={updatedStatus}
                          onChange={(e) => setUpdatedStatus(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none appearance-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Approved">Approved</option>
                          <option value="Disbursed">Disbursed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Follow-up Notes / Comments</label>
                        <textarea
                          rows={2}
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          placeholder="Enter details of your interaction..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForStatus(null)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateStatus}
                          className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 3: CUSTOMER REQUESTS FORM */}
          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm text-left max-w-2xl mx-auto space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-blue-500" /> Submit Service Request
                </h3>
                <p className="text-slate-400 text-xs mt-1">Submit documents or raise support queries directly to the GFS backend operations desk.</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                toast.success('Service Request submitted successfully!')
                e.currentTarget.reset()
              }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Request Type *</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none appearance-none"
                  >
                    <option value="KycUpload">KYC Document Upload</option>
                    <option value="DisbursalRequest">Disbursal Request / Payout check</option>
                    <option value="Query">Product Policy Query</option>
                    <option value="Other">Other support ticket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Description / Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe customer request details in length..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors shadow"
                >
                  Submit Request to Operations Desk
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 4: EARNINGS & SLAB PAYOUTS */}
          {activeTab === 'earnings' && (
            <motion.div
              key="earnings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-950">Earnings & Payouts</h2>
                <p className="text-slate-500 text-xs mt-1">Track disbursed payouts, active commission slabs, and withdraw rewards.</p>
              </div>

              {/* Earnings summary widget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Commission Earned</span>
                  <span className="text-3xl font-bold font-serif text-slate-950 block mt-1">₹{totalEarnings.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Sourced this quarter</span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Slab level</span>
                  <span className="text-3xl font-bold font-serif text-emerald-600 block mt-1">Silver Level</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">Next slab at 5 disbursals</span>
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    onClick={() => {
                      if (totalEarnings === 0) {
                        toast.error('No earnings available to withdraw yet!')
                        return
                      }
                      toast.success(`Withdrawal of ₹${totalEarnings.toLocaleString()} requested! Funds will reflect in registered bank within 48 hours.`)
                    }}
                    className={`w-full py-2.5 rounded-xl ${theme.bgColor} hover:opacity-90 text-white font-extrabold text-xs transition-opacity flex items-center justify-center gap-1.5`}
                  >
                    Simulate Payout Withdrawal <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Commission Structure list */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-serif text-slate-900">Commission Slab Structure</h3>
                <div className="divide-y divide-slate-100">
                  {[
                    { slab: 'Slab 1: 0 - 2 Sales', rate: 'Standard baseline commission' },
                    { slab: 'Slab 2: 3 - 5 Sales', rate: 'Standard commission + 10% bonus payout weight' },
                    { slab: 'Slab 3: 6+ Sales', rate: 'Standard commission + 25% premium milestone payout' }
                  ].map((s, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 text-sm">{s.slab}</span>
                      <span className="text-slate-500 font-medium">{s.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: DOCUMENTS LOCKER */}
          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-950">Documents Locker</h2>
                <p className="text-slate-500 text-xs mt-1">Download certified marketing catalogs, compliance certificates, and commission structures.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Agent Certified Certificate', desc: 'GFS authorized partner license.', format: 'PDF (1.2 MB)' },
                  { title: 'Loans product detail manual', desc: 'All interest ratios, rules, and details.', format: 'PDF (2.4 MB)' },
                  { title: 'Marketing Leaflet Design', desc: 'Slab catalogs to share with clients.', format: 'ZIP (8.5 MB)' }
                ].map((doc, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
                    <div>
                      <FileText className="w-8 h-8 text-blue-500 mb-2" />
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h4>
                      <p className="text-slate-400 text-[10px] mt-1">{doc.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{doc.format}</span>
                      <button
                        onClick={() => toast.success(`Simulating download of: ${doc.title}`)}
                        className={`text-xs font-bold ${theme.textColor} hover:underline`}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 6: INTERNAL ALERTS */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm text-left space-y-4 max-w-2xl mx-auto"
            >
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-900">Internal Alerts Center</h3>
                <p className="text-slate-400 text-xs">Stay updated with latest policy improvements and dashboard assignments.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  { title: 'Agent Partner account approved!', body: 'Congratulations, your onboarding credentials are live and verified by GFS cyber-ops.', time: '2 days ago' },
                  { title: 'New Customer lead assigned', body: 'A premium client requesting high-volume services has been placed into your leads queue.', time: '1 day ago' },
                  { title: 'System-wide Commission payout slab improvements', body: 'Milestone slab bonuses have been increased by 10% for the current financial quarter.', time: '12 hours ago' }
                ].map((item, idx) => (
                  <div key={idx} className="py-4 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="text-slate-400 font-medium">{item.time}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 7: TASKS & CHECKLIST */}
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm text-left space-y-4 max-w-xl mx-auto"
            >
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-900">Agent Tasks & Checklist</h3>
                <p className="text-slate-400 text-xs">Daily customer follow-up schedule checklist.</p>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      readOnly
                      className="accent-[#25D366] rounded cursor-pointer w-4 h-4"
                    />
                    <span className={`text-xs font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 8: PERFORMANCE CHART */}
          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-950">Analytics & Conversion Trends</h2>
                <p className="text-slate-500 text-xs mt-1">Track monthly conversion velocity, disbursal records, and targets.</p>
              </div>

              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm h-80">
                <h3 className="text-sm font-bold font-serif text-slate-800 mb-4">Monthly Leads Conversion Metrics</h3>
                
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={[
                    { month: 'Jan', Sourced: 12, Converted: 5 },
                    { month: 'Feb', Sourced: 15, Converted: 8 },
                    { month: 'Mar', Sourced: 18, Converted: 10 },
                    { month: 'Apr', Sourced: 22, Converted: 12 },
                    { month: 'May', Sourced: 25, Converted: 16 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="Sourced" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Converted" fill={theme.bgColor === 'bg-emerald-500' ? '#10B981' : theme.bgColor === 'bg-blue-600' ? '#3B82F6' : '#F59E0B'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm text-left max-w-xl mx-auto space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Secure Settings</h3>
                <p className="text-slate-400 text-xs mt-1">Configure your login credentials and verify registered data details.</p>
              </div>

              <form onSubmit={handlePassChangeSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Old Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter old password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">New Secure Password</label>
                  <input
                    type="password"
                    required
                    value={changePass}
                    onChange={(e) => setChangePass(e.target.value)}
                    placeholder="New secure password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={changeConfirmPass}
                    onChange={(e) => setChangeConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors shadow"
                >
                  Save Account Settings & Password
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  )
}
