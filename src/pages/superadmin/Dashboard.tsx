import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'
import {
  Users, DollarSign, Shield, TrendingUp, AlertCircle, Clock,
  Briefcase, Activity, ArrowUpRight, BarChart3, ChevronDown, ChevronRight,
  Sparkles, Download, Edit, Trash2, Eye, HelpCircle, FileText, CheckCircle2,
  Lock, Settings, Smartphone, Mail, MessageSquare, Terminal, UserCheck, LogOut
} from 'lucide-react'
import { useCRMDatabaseStore, CustomerRecord, CRMTransaction, SupportTicket } from '@/store/crmDatabaseStore'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

// Sub-Views
import UsersPage from '@/pages/superadmin/UsersPage'
import AgentApprovalsPage from '@/pages/superadmin/AgentApprovalsPage'
import AuditLogsPage from '@/pages/superadmin/AuditLogsPage'
import ChitAdminDashboard from '@/pages/chits/admin/ChitAdminDashboard'
import InvestmentView from '@/components/dashboard/InvestmentView'
import GenericDatabaseListView from '@/components/dashboard/GenericDatabaseListView'

export default function SuperAdminDashboard() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { 
    customers, transactions, tickets, moduleControls, 
    updateCustomerStatus, deleteCustomer, addTransaction, toggleModule 
  } = useCRMDatabaseStore()

  const getPortalPrefix = () => {
    const path = location.pathname
    if (path.startsWith('/loans')) return '/loans'
    if (path.startsWith('/insurance')) return '/insurance'
    if (path.startsWith('/investment')) return '/investment'
    return '/loans'
  }
  const portalPrefix = getPortalPrefix()

  const getInitialSubmenu = () => {
    const path = location.pathname
    if (path.endsWith('/users')) return 'Users Control'
    if (path.endsWith('/approvals')) return 'Agent Approvals'
    if (path.endsWith('/audit-logs')) return 'Audit Logs'
    return 'Overview'
  }

  // Sidebar accordions state
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [activeSubmenu, setActiveSubmenu] = useState<string>(getInitialSubmenu())

  useEffect(() => {
    const path = location.pathname
    if (path.endsWith('/users')) {
      setActiveSubmenu('Users Control')
      setExpandedModule('administrative')
    } else if (path.endsWith('/approvals')) {
      setActiveSubmenu('Agent Approvals')
      setExpandedModule('administrative')
    } else if (path.endsWith('/audit-logs')) {
      setActiveSubmenu('Audit Logs')
      setExpandedModule('administrative')
    } else if (path.endsWith('/dashboard')) {
      setActiveSubmenu('Overview')
    }
  }, [location.pathname])

  const toggleExpand = (mod: string) => {
    setExpandedModule(expandedModule === mod ? null : mod)
  }

  // Search & Filter state for content grids
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Edit/View modal states
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCity, setEditCity] = useState('')

  // Dashboard Stats calculation
  const totalCustomersCount = customers.length
  const totalLoansCount = customers.filter(c => c.status === 'Approved').length * 2
  const totalPoliciesCount = customers.filter(c => c.status === 'Approved').length + 3
  const pendingApprovalsCount = customers.filter(c => c.status === 'Pending').length
  const underReviewCount = customers.filter(c => c.status === 'Under Review').length
  const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((acc, t) => acc + t.amount, 0) + 1245000

  // Quick export simulation
  const handleExport = (datasetName: string) => {
    toast.success(`Exporting ${datasetName} report to Excel/PDF! Check your downloads folder shortly.`)
  }

  // Edit action submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    
    // Simulate updating customer details in store
    useCRMDatabaseStore.setState((state) => ({
      customers: state.customers.map((c) => 
        c.id === selectedCustomer.id 
          ? { ...c, fullName: editName, mobileNumber: editPhone, city: editCity } 
          : c
      )
    }))

    toast.success('Customer details updated successfully!')
    setSelectedCustomer(null)
    setIsEditing(false)
  }

  // Delete action
  const handleDeleteCustomer = (id: string) => {
    deleteCustomer(id)
    toast.success('Customer record deleted permanently.')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0f1d] text-slate-100 font-sans relative overflow-hidden">
      
      {/* Absolute Decorative Glow Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── MASTER ACCORDION SIDEBAR ── */}
      <div className="w-full md:w-72 bg-[#0f172a] border-b md:border-b-0 md:border-r border-slate-800 p-5 flex flex-col shrink-0 relative z-30 select-none max-h-screen overflow-y-auto no-scrollbar">
        
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-5">
          <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-white/10">
            <img src="/logo.png" alt="GFS Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-white text-sm tracking-wide leading-none">GFS Super Admin</h3>
            <span className="text-[10px] text-cyan-400 font-bold block mt-1 tracking-widest uppercase">Master Control Center</span>
          </div>
        </div>

        {/* Expandable Module List Accordion */}
        <div className="space-y-2 flex-grow text-left">
          <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-3">Main Modules</span>
          
          {/* Accordion Item: Loans */}
          <div>
            <button
              onClick={() => toggleExpand('loans')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'loans' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Loans</span>
              </div>
              {expandedModule === 'loans' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'loans' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['Loan Applications', 'Personal Loans', 'Home Loans', 'Vehicle Loans', 'Pending Approvals', 'Active Loans'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500 shadow-[0_2px_8px_rgba(16,185,129,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Insurance */}
          <div>
            <button
              onClick={() => toggleExpand('insurance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'insurance' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Insurance</span>
              </div>
              {expandedModule === 'insurance' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'insurance' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Policy Requests', 'Claims Management'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-blue-300 bg-blue-500/15 border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Investments */}
          <div>
            <button
              onClick={() => toggleExpand('investments')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'investments' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Investments</span>
              </div>
              {expandedModule === 'investments' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'investments' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['SIP Investments', 'Mutual Funds', 'Fixed Deposits', 'Gold Investments', 'Investment Reports', 'Portfolio Tracking', 'Monthly Chit Fund'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-amber-300 bg-amber-500/15 border-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Agents */}
          <div>
            <button
              onClick={() => toggleExpand('agents')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'agents' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Agents</span>
              </div>
              {expandedModule === 'agents' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'agents' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['Agent List', 'KYC Verification', 'Performance Tracking', 'Commission Reports'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-purple-300 bg-purple-500/15 border-purple-500 shadow-[0_2px_8px_rgba(168,85,247,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Customers */}
          <div>
            <button
              onClick={() => toggleExpand('customers')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'customers' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Customers</span>
              </div>
              {expandedModule === 'customers' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'customers' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['Customer List', 'Customer Profiles', 'Uploaded Documents', 'Customer Activity Logs'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500 shadow-[0_2px_8px_rgba(6,182,212,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Finance & Payments */}
          <div>
            <button
              onClick={() => toggleExpand('finance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'finance' ? 'bg-[#D4AF37] text-white shadow-md shadow-yellow-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-gold-400" />
                <span>Finance & Payments</span>
              </div>
              {expandedModule === 'finance' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'finance' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['Transactions', 'EMI Collections', 'Commission Payments', 'Wallet Management', 'Revenue Reports'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-yellow-300 bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_2px_8px_rgba(212,175,55,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Portal Controls */}
          <div>
            <button
              onClick={() => toggleExpand('controls')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'controls' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Portal Controls</span>
              </div>
              {expandedModule === 'controls' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'controls' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {['Manage All Portals', 'Enable/Disable Modules', 'Control Permissions', 'API Settings', 'SMS Gateway'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubmenu(sub)}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub 
                          ? 'text-rose-300 bg-rose-500/15 border-rose-500 shadow-[0_2px_8px_rgba(244,63,94,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item: Administrative */}
          <div>
            <button
              onClick={() => toggleExpand('administrative')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                expandedModule === 'administrative' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Administrative</span>
              </div>
              {expandedModule === 'administrative' ? <ChevronDown className="w-3.5 h-3.5 text-white" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <AnimatePresence>
              {expandedModule === 'administrative' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pl-7 mt-1.5 space-y-1.5 overflow-hidden"
                >
                  {[
                    { label: 'Users Control', path: '/users' },
                    { label: 'Agent Approvals', path: '/approvals' },
                    { label: 'Audit Logs', path: '/audit-logs' }
                  ].map(sub => (
                    <button
                      key={sub.label}
                      onClick={() => {
                        setActiveSubmenu(sub.label)
                        navigate(`${portalPrefix}/admin${sub.path}`)
                      }}
                      className={`w-full block text-left py-2 px-3 rounded-lg text-[11px] font-extrabold transition-all border-l-2 ${
                        activeSubmenu === sub.label 
                          ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500 shadow-[0_2px_8px_rgba(6,182,212,0.15)] font-black' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fallback Direct Control links */}
          <button
            onClick={() => {
              setExpandedModule(null)
              setActiveSubmenu('Overview')
              navigate(`${portalPrefix}/admin/dashboard`)
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
              activeSubmenu === 'Overview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Master Dashboard</span>
          </button>
        </div>

        {/* Super Admin Info footer */}
        <div className="mt-auto border-t border-white/5 pt-5 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-white shadow-inner">
              SA
            </div>
            <div className="text-left">
              <p className="font-extrabold text-white text-xs leading-none">Super Administrator</p>
              <span className="text-[9px] text-slate-500 font-mono mt-1 block">superadmin@gfs.com</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut()
              navigate(`${portalPrefix}/login`)
            }}
            className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ─── DYNAMIC CONTENT PANE ─── */}
      <div className="flex-grow p-6 md:p-10 max-w-6xl w-full mx-auto relative z-10 text-left max-h-screen overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          
          {/* SUBVIEW: SIP Investments */}
          {activeSubmenu === 'SIP Investments' && (
            <motion.div
              key="sip-investments"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              <InvestmentView type="sip" title="SIP Investment" />
            </motion.div>
          )}

          {/* SUBVIEW: Mutual Funds */}
          {activeSubmenu === 'Mutual Funds' && (
            <motion.div
              key="mutual-funds"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              <InvestmentView type="mutual_fund" title="Mutual Fund" />
            </motion.div>
          )}

          {/* SUBVIEW: Fixed Deposits */}
          {activeSubmenu === 'Fixed Deposits' && (
            <motion.div
              key="fixed-deposits"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              <InvestmentView type="fixed_deposit" title="Fixed Deposit" />
            </motion.div>
          )}

          {/* SUBVIEW: Gold Investments */}
          {activeSubmenu === 'Gold Investments' && (
            <motion.div
              key="gold-investments"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              <InvestmentView type="gold" title="Gold Investment" />
            </motion.div>
          )}

          {/* SUBVIEW: Monthly Chit Fund */}
          {activeSubmenu === 'Monthly Chit Fund' && (
            <motion.div
              key="monthly-chit-fund"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              <ChitAdminDashboard />
            </motion.div>
          )}

          {/* SUBVIEW: Users Control */}
          {activeSubmenu === 'Users Control' && (
            <motion.div
              key="users-control"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-2 shadow-2xl border border-white/5"
            >
              <UsersPage />
            </motion.div>
          )}

          {/* SUBVIEW: Agent Approvals */}
          {activeSubmenu === 'Agent Approvals' && (
            <motion.div
              key="agent-approvals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-2 shadow-2xl border border-white/5"
            >
              <AgentApprovalsPage />
            </motion.div>
          )}

          {/* SUBVIEW: Audit Logs */}
          {activeSubmenu === 'Audit Logs' && (
            <motion.div
              key="audit-logs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-2 shadow-2xl border border-white/5"
            >
              <AuditLogsPage />
            </motion.div>
          )}

          {/* SUBVIEW 1: OVERVIEW DASHBOARD */}
          {activeSubmenu === 'Overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-gold-400" />
                    GFS CRM Analytics Console
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">Multi-portal overview metrics, live transaction logs, and security clearances.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport('Analytics Dashboard')}
                    className="px-4 py-2.5 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Export Report
                  </button>
                </div>
              </div>

              {/* 9 Real-Time Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {[
                  { label: 'Total Customers', val: totalCustomersCount, color: 'text-cyan-400', icon: <Users className="w-4 h-4 text-cyan-400" /> },
                  { label: 'Total Agents', val: 3, color: 'text-purple-400', icon: <Users className="w-4 h-4 text-purple-400" /> },
                  { label: 'Total Loans', val: totalLoansCount, color: 'text-emerald-400', icon: <Briefcase className="w-4 h-4 text-emerald-400" /> },
                  { label: 'Total Policies', val: totalPoliciesCount, color: 'text-blue-400', icon: <Shield className="w-4 h-4 text-blue-400" /> },
                  { label: 'Total Investments', val: '₹12,45,000', color: 'text-amber-400', icon: <TrendingUp className="w-4 h-4 text-amber-400" /> },
                  { label: 'Pending Approvals', val: pendingApprovalsCount, color: 'text-yellow-400', icon: <Clock className="w-4 h-4 text-yellow-400" /> },
                  { label: 'Under Review', val: underReviewCount, color: 'text-indigo-400', icon: <Activity className="w-4 h-4 text-indigo-400" /> },
                  { label: 'Est Revenue', val: `₹${totalRevenue.toLocaleString()}`, color: 'text-emerald-500', icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
                  { label: 'Support Tickets', val: tickets.length, color: 'text-rose-400', icon: <AlertCircle className="w-4 h-4 text-rose-400" /> },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <span className={`text-xl font-bold font-serif block ${stat.color}`}>{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Advanced Graphs and Live Operations Feed Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recharts Area Chart for revenue progression */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-sm lg:col-span-2 h-80 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold font-serif text-white">Monthly Revenue Progression</h3>
                    <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-white/5 text-slate-400 font-bold rounded">Live</span>
                  </div>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={[
                      { month: 'Jan', revenue: 450000 },
                      { month: 'Feb', revenue: 780000 },
                      { month: 'Mar', revenue: 610000 },
                      { month: 'Apr', revenue: 950000 },
                      { month: 'May', revenue: totalRevenue },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={0.15} fill="url(#colorRevenue)" />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Operations Audit log feed */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-sm h-80 flex flex-col justify-between">
                  <h3 className="text-base font-bold font-serif text-white mb-4">Central Dispatch Alerts</h3>
                  <div className="divide-y divide-white/5 overflow-y-auto flex-grow pr-1.5">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="py-2.5 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-bold text-slate-300 block">{tx.customerName}</span>
                          <span className="text-slate-500">{tx.type} payout request</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 block">₹{tx.amount.toLocaleString()}</span>
                          <span className="text-slate-500">{new Date(tx.date).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* SUBVIEW 2: DYNAMIC CUSTOMER / PRODUCT TABLES */}
          {activeSubmenu !== 'Overview' && 
           !['Users Control', 'Agent Approvals', 'Audit Logs', 'Monthly Chit Fund', 'SIP Investments', 'Mutual Funds', 'Fixed Deposits', 'Gold Investments'].includes(activeSubmenu) && (
            <motion.div
              key="subviews"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {expandedModule === 'loans' && activeSubmenu !== 'Enable/Disable Modules' && (
                <div className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-850">
                  <GenericDatabaseListView moduleType="loans" submenuName={activeSubmenu} />
                </div>
              )}
              {expandedModule === 'insurance' && activeSubmenu === 'Claims Management' && (
                <div className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-850">
                  <GenericDatabaseListView moduleType="claims" submenuName={activeSubmenu} />
                </div>
              )}
              {expandedModule === 'insurance' && activeSubmenu !== 'Claims Management' && activeSubmenu !== 'Enable/Disable Modules' && (
                <div className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-850">
                  <GenericDatabaseListView moduleType="insurance" submenuName={activeSubmenu} />
                </div>
              )}
              {expandedModule === 'agents' && (
                <div className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-850">
                  <GenericDatabaseListView moduleType="agents" submenuName={activeSubmenu} />
                </div>
              )}
              {expandedModule === 'customers' && activeSubmenu === 'Uploaded Documents' && (
                <div className="bg-slate-50 rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-850">
                  <GenericDatabaseListView moduleType="documents" submenuName={activeSubmenu} />
                </div>
              )}

              {/* Default headers and customer list fallbacks */}
              {((expandedModule === 'customers' && activeSubmenu !== 'Uploaded Documents') || (!['loans', 'insurance', 'agents'].includes(expandedModule || '')) || activeSubmenu === 'Enable/Disable Modules') && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
                    <div>
                      <span className="text-slate-500 font-extrabold uppercase text-[10px] tracking-widest">{expandedModule} / module sub-view</span>
                      <h2 className="text-2xl font-bold font-serif text-white mt-1">{activeSubmenu} View</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Export buttons */}
                      <button
                        onClick={() => handleExport(activeSubmenu)}
                        className="px-4.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-sm border border-white/5"
                      >
                        <Download className="w-4 h-4" /> Export Excel
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubmenu('Overview')
                          toast.success('Returned to Master Analytics dashboard.')
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 font-bold text-xs"
                      >
                        Close Sub-View
                      </button>
                    </div>
                  </div>

              {/* Expandable Module: Enable/Disable Toggle Controls */}
              {activeSubmenu === 'Enable/Disable Modules' && (
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-sm text-left max-w-xl mx-auto space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-white font-serif">CRM Module Controls</h3>
                    <p className="text-slate-400 text-xs mt-1">Enable or disable core GFS functional modules instantly across all user dashboards.</p>
                  </div>
                  <div className="space-y-3.5">
                    {[
                      { id: 'loans', label: 'Loans Underwriting module', desc: 'Allows customers to apply for personal/home loans.' },
                      { id: 'insurance', label: 'Insurance Policy Sourcing Desk', desc: 'Toggles Health & Life policyrequests.' },
                      { id: 'investments', label: 'SIP Portfolio Allocation Engine', desc: 'Enables mutual funds investment locker.' }
                    ].map((mod) => (
                      <div key={mod.id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                        <div>
                          <strong className="text-slate-200 text-sm block">{mod.label}</strong>
                          <span className="text-slate-500 text-xs mt-0.5 block">{mod.desc}</span>
                        </div>
                        <button
                          onClick={() => {
                            toggleModule(mod.id as any)
                            toast.success(`Module ${mod.id} state toggled!`)
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                            moduleControls[mod.id as keyof typeof moduleControls] 
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-600/20 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {moduleControls[mod.id as keyof typeof moduleControls] ? 'Active / Enabled' : 'Disabled'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General lists container with Search & Edit / Delete action rows */}
              {activeSubmenu !== 'Enable/Disable Modules' && (
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-sm">
                  
                  {/* Search and Filters row */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search current data list..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 text-slate-100 placeholder-slate-600"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Table Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                          <th className="py-4 px-4">Customer Name</th>
                          <th className="py-4 px-4">Contact</th>
                          <th className="py-4 px-4">City</th>
                          <th className="py-4 px-4">Verification State</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                        {customers
                          .filter(c => statusFilter === 'All' || c.status === statusFilter)
                          .filter(c => c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((cust) => (
                            <tr key={cust.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                    {cust.fullName.charAt(0)}
                                  </div>
                                  <span className="font-bold text-white">{cust.fullName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="block">{cust.email}</span>
                                <span className="text-slate-500 text-[10px] block mt-0.5">{cust.mobileNumber}</span>
                              </td>
                              <td className="py-4 px-4 text-slate-400">{cust.city}</td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                  cust.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  cust.status === 'Under Review' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {cust.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right space-x-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedCustomer(cust)
                                    setEditName(cust.fullName)
                                    setEditPhone(cust.mobileNumber)
                                    setEditCity(cust.city)
                                    setIsEditing(true)
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors inline-flex"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(cust.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-colors inline-flex border border-rose-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}
            </>)}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Edit Customer Drawer Dialog */}
      {isEditing && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative text-left">
            <h3 className="text-lg font-bold text-white font-serif mb-4">Edit Customer Record</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-semibold text-slate-300">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

function LoaderIcon() {
  return (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  )
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
    </svg>
  )
}

function LayoutDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}
