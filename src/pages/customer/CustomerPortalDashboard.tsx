import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useCRMDatabaseStore } from '@/store/crmDatabaseStore'
import { 
  LayoutDashboard, FileText, Shield, TrendingUp, DollarSign, Briefcase,
  FileCheck, HelpCircle, Upload, ArrowUpRight, CheckCircle2, X
} from 'lucide-react'
import { toast } from 'sonner'

export default function CustomerPortalDashboard() {
  const { user } = useAuthStore()
  const { customers, addTicket } = useCRMDatabaseStore()

  // Find logged in customer detail
  const customerDetail = customers.find(c => c.email.toLowerCase() === user?.email.toLowerCase()) || {
    fullName: user?.full_name || 'Guest Customer',
    mobileNumber: user?.email === 'customer@gfs.com' ? '9121147777' : '9876543201',
    email: user?.email || 'customer@gfs.com',
    gender: 'Male',
    city: 'Hyderabad',
    documentName: 'gfs_welcome_pack.pdf',
    status: 'Approved' as const
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'insurance' | 'investments' | 'documents' | 'support'>('overview')

  // Create ticket states
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketCategory, setTicketCategory] = useState('General')
  const [ticketDesc, setTicketDesc] = useState('')

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      toast.error('Subject and Description are required')
      return
    }
    addTicket({
      customerName: customerDetail.fullName,
      category: ticketCategory,
      subject: ticketSubject,
      description: ticketDesc
    })
    toast.success('Your support ticket has been raised! An agent will respond shortly.')
    setTicketSubject('')
    setTicketDesc('')
    setActiveTab('overview')
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Greeting Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#0a1f44]">Hello, {customerDetail.fullName} 👋</h1>
          <p className="text-slate-500 text-xs mt-1">Here is a centralized summary of your active loans, portfolios, and payouts.</p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 text-xs font-bold">
          Verification Status: {customerDetail.status}
        </div>
      </div>

      {/* Horizontal Sub-Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
          { id: 'loans', label: 'My Loans', icon: <Briefcase size={14} /> },
          { id: 'insurance', label: 'My Policies', icon: <Shield size={14} /> },
          { id: 'investments', label: 'Investments', icon: <TrendingUp size={14} /> },
          { id: 'documents', label: 'My Locker', icon: <FileCheck size={14} /> },
          { id: 'support', label: 'Raise Ticket', icon: <HelpCircle size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-600/10'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Workspace Area */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Metrics Bar */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Name</span>
                <strong className="text-slate-800 text-sm block mt-1">{customerDetail.fullName}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email</span>
                <strong className="text-slate-800 text-sm block mt-1">{customerDetail.email}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Contact</span>
                <strong className="text-slate-800 text-sm block mt-1">{customerDetail.mobileNumber}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch City</span>
                <strong className="text-slate-800 text-sm block mt-1">{customerDetail.city}</strong>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Active Products Queue */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl md:col-span-2 space-y-4 shadow-sm">
                <h3 className="text-base font-bold font-serif text-[#0a1f44]">Active Product Request Queue</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs">
                    <div>
                      <span className="font-extrabold text-slate-700 block">Personal Loan Sourcing</span>
                      <span className="text-slate-400 mt-1 block">Request ID: #GFS-LN-99210</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100">
                      {customerDetail.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs">
                    <div>
                      <span className="font-extrabold text-slate-700 block">HDFC ERGO Term Policy</span>
                      <span className="text-slate-400 mt-1 block">Request ID: #GFS-IN-48092</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border bg-blue-50 text-blue-700 border-blue-100">
                      Approved
                    </span>
                  </div>
                </div>
              </div>

              {/* Locker Summary */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-base font-bold font-serif text-[#0a1f44]">My Locker</h3>
                  <p className="text-slate-500 text-xs mt-1">Direct verification files uploaded by you.</p>
                </div>
                
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="truncate max-w-[140px]">{customerDetail.documentName}</span>
                  <button
                    onClick={() => toast.success(`Simulating download of verified KYC pack.`)}
                    className="text-[10px] font-extrabold text-amber-600 hover:underline"
                  >
                    Download
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab('documents')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  Manage Documents <Upload size={14} />
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: MY LOANS */}
        {activeTab === 'loans' && (
          <motion.div
            key="loans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-800">Personal Loan Sourcing</h3>
                  <span className="text-slate-400 text-xs font-mono">ID: #GFS-LN-99210</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                  {customerDetail.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
                <div>
                  <span className="block text-slate-400 font-medium">Applied Amount</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">₹4,50,000</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Interest Rate</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">10.5% p.a.</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Tenure</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">36 Months</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Estimated EMI</span>
                  <strong className="text-base font-bold text-emerald-600 block mt-0.5">₹14,600 / mo</strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: MY POLICIES */}
        {activeTab === 'insurance' && (
          <motion.div
            key="insurance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-800">HDFC ERGO Term Policy</h3>
                  <span className="text-slate-400 text-xs font-mono">ID: #GFS-IN-48092</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-100">
                  Active / Approved
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                <div>
                  <span className="block text-slate-400 font-medium">Cover Amount</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">₹1,00,00,000</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Premium Payment</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">₹12,400 / year</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Next Renewal</span>
                  <strong className="text-base font-bold text-blue-600 block mt-0.5">June 2027</strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: INVESTMENTS */}
        {activeTab === 'investments' && (
          <motion.div
            key="investments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-800">SBI Bluechip SIP Fund</h3>
                  <span className="text-slate-400 text-xs font-mono">Allocation: 100% Equity</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-100">
                  Approved
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                <div>
                  <span className="block text-slate-400 font-medium">SIP Amount</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">₹5,000 / month</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Total Invested</span>
                  <strong className="text-base font-bold text-[#0a1f44] block mt-0.5">₹60,000</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Current Value</span>
                  <strong className="text-base font-bold text-emerald-600 block mt-0.5">₹68,400 (+14%)</strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: MY LOCKER */}
        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center max-w-md mx-auto shadow-sm">
              <div className="border border-dashed border-slate-200 hover:border-amber-500 rounded-xl bg-slate-50 p-8 flex flex-col items-center justify-center transition-all cursor-pointer h-40">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Click to upload verification files</p>
                <p className="text-slate-400 text-xs mt-1">PDF, JPG up to 5MB</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <motion.div
            key="support"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 p-8 rounded-3xl max-w-xl mx-auto space-y-6 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-bold font-serif text-[#0a1f44] flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-rose-500" /> Raise Support Query
              </h3>
              <p className="text-slate-500 text-xs mt-1">Submit billing queries or document issues directly to GFS help desk.</p>
            </div>

            <form onSubmit={handleAddTicket} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Query Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="General">General / Sourcing query</option>
                  <option value="Billing">EMI Billing / Payouts</option>
                  <option value="Kyc">KYC / Verification Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your query..."
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 text-slate-750"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your issue in detail..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-amber-500 text-slate-750"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0a1f44] hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md"
              >
                Submit Ticket
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  )
}
