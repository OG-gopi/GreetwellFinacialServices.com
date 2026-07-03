import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Search, Filter, ShieldCheck, Shield, Mail, Phone, 
  MapPin, Calendar, FileText, CheckCircle2, XCircle, 
  AlertCircle, ChevronRight, UserMinus, UserCheck, 
  Trash2, RotateCcw, ExternalLink, RefreshCw, Send
} from 'lucide-react'
import { useAgentWorkflowStore, AgentApplication } from '@/store/agentWorkflowStore'
import { toast } from 'sonner'

export default function AgentApprovalsPage() {
  const { 
    applications, approveApplication, rejectApplication, 
    holdApplication, suspendAgent, activateAgent, deleteAgent, 
    resetAgentPassword, updateNotes 
  } = useAgentWorkflowStore()

  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'Hold'>('Pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [agentTypeFilter, setAgentTypeFilter] = useState<string>('All')
  const [selectedApp, setSelectedApp] = useState<AgentApplication | null>(null)
  
  // Custom states for Actions
  const [adminNotesText, setAdminNotesText] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  // Filters
  const filteredApps = applications.filter((app) => {
    // Tab match
    const statusMatch = 
      activeTab === 'Pending' ? app.status === 'Pending Verification' :
      activeTab === 'Approved' ? app.status === 'Approved' :
      activeTab === 'Rejected' ? app.status === 'Rejected' :
      app.status === 'Hold'

    // Search match
    const searchMatch = 
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.agentId && app.agentId.toLowerCase().includes(searchTerm.toLowerCase()))

    // Type filter match
    const typeMatch = agentTypeFilter === 'All' || app.agentType === agentTypeFilter

    return statusMatch && searchMatch && typeMatch
  })

  const getAgentBadgeColor = (type: string) => {
    if (type === 'loan-agent') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (type === 'insurance-agent') return 'bg-blue-50 text-blue-700 border-blue-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  const getAgentLabel = (type: string) => {
    if (type === 'loan-agent') return 'Loan Agent'
    if (type === 'insurance-agent') return 'Insurance Agent'
    return 'Investment Agent'
  }

  // Quick Action Handlers
  const handleApprove = (id: string) => {
    approveApplication(id, adminNotesText)
    toast.success('Agent application approved! Unique credentials generated.')
    setSelectedApp(null)
    setAdminNotesText('')
  }

  const handleReject = (id: string) => {
    rejectApplication(id, adminNotesText)
    toast.error('Application rejected. Disapproval email logs queued.')
    setSelectedApp(null)
    setAdminNotesText('')
  }

  const handleHold = (id: string) => {
    holdApplication(id, adminNotesText)
    toast.warning('Application placed on hold pending additional checks.')
    setSelectedApp(null)
    setAdminNotesText('')
  }

  const handleResetPassword = (id: string) => {
    if (!newPassword.trim()) {
      toast.error('Please enter a valid password')
      return
    }
    resetAgentPassword(id, newPassword)
    toast.success('Password updated & Security warning email dispatched!')
    setShowResetModal(false)
    setNewPassword('')
  }

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto text-slate-800 relative z-10 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Agent Partner Onboarding Panel
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review registrations, download KYC certificates, verify qualifications, and approve agent credentials.</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
        {[
          { id: 'Pending', label: 'Pending Approvals', count: applications.filter(a => a.status === 'Pending Verification').length, color: 'text-amber-500 bg-amber-50' },
          { id: 'Approved', label: 'Approved Partners', count: applications.filter(a => a.status === 'Approved').length, color: 'text-emerald-500 bg-emerald-50' },
          { id: 'Hold', label: 'On Hold', count: applications.filter(a => a.status === 'Hold').length, color: 'text-blue-500 bg-blue-50' },
          { id: 'Rejected', label: 'Disapproved', count: applications.filter(a => a.status === 'Rejected').length, color: 'text-rose-500 bg-rose-50' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                setSelectedApp(null)
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all duration-300 ${
                isActive 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : tab.color}`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filters & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, city, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Agent Type dropdown filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={agentTypeFilter}
            onChange={(e) => setAgentTypeFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer"
          >
            <option value="All">All Agent Types</option>
            <option value="loan-agent">Loans Agents Only</option>
            <option value="insurance-agent">Insurance Agents Only</option>
            <option value="investment-agent">Investments Agents Only</option>
          </select>
        </div>
      </div>

      {/* Grid Container: Applications list vs Details */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* List of Applications */}
        <div className="flex-1 w-full space-y-4">
          {filteredApps.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="font-serif font-bold text-slate-700 text-lg">No Applications Found</p>
              <p className="text-slate-500 text-xs mt-1">There are no records in the active search/filters criteria.</p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id
              return (
                <motion.div
                  key={app.id}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setSelectedApp(app)
                    setAdminNotesText(app.adminNotes || '')
                  }}
                  className={`bg-white border p-5 rounded-2xl cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 shadow-sm ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-500/10' 
                      : 'border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Simulated avatar */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 font-extrabold text-blue-600 text-base border border-slate-200">
                      {app.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{app.fullName}</h4>
                        {app.agentId && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 border px-1.5 py-0.5 rounded font-mono font-bold">
                            {app.agentId}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {app.email}
                      </p>
                      <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Submitted: {new Date(app.submissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getAgentBadgeColor(app.agentType)}`}>
                      {getAgentLabel(app.agentType)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Dynamic Action & View Panel */}
        <div className="w-full lg:w-[480px] shrink-0 sticky top-24">
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div
                key={selectedApp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedApp(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
                >
                  <XCircle className="w-6 h-6" />
                </button>

                {/* Profile Card Header */}
                <div className="text-center pb-6 border-b border-slate-100 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 font-serif font-black text-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                    {selectedApp.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedApp.fullName}</h3>
                  <span className={`inline-block mt-2 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${getAgentBadgeColor(selectedApp.agentType)}`}>
                    {getAgentLabel(selectedApp.agentType)}
                  </span>
                  
                  {/* Action Quick Bar */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {/* Call simulation */}
                    <a
                      href={`tel:${selectedApp.mobileNumber}`}
                      onClick={() => toast.info(`Calling applicant: ${selectedApp.fullName} at ${selectedApp.mobileNumber}`)}
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center justify-center shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    {/* WhatsApp greeting redirection */}
                    <a
                      href={`https://wa.me/91${selectedApp.mobileNumber}?text=Hello%20${encodeURIComponent(selectedApp.fullName)},%20this%20is%20Greetwell%20Financial%20Services%20regarding%20your%20Agent%20Application.`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:text-green-500 hover:bg-green-50 hover:border-green-200 transition-colors flex items-center justify-center shadow-sm"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.66.986 3.288 1.488 4.605 1.488 5.25 0 9.533-4.272 9.536-9.519.001-2.546-.993-4.932-2.799-6.735-1.807-1.805-4.205-2.8-6.753-2.801-5.256 0-9.539 4.274-9.543 9.52-.002 2.032.547 3.81 1.588 5.351l-.994 3.632 3.86-.987zm11.252-5.466c-.099-.166-.367-.266-.77-.466-.403-.2-2.378-1.173-2.747-1.306-.37-.133-.639-.2-.907.2-.268.4-.1.77.302.266-.402-.2-1.373-1.272-1.742-1.405-.269-.134-.537-.066-.739.068-.201.133-.872.868-.872 2.115 0 1.247.907 2.451 1.008 2.618.101.166 1.782 2.72 4.318 3.814.603.26 1.074.415 1.442.531.606.192 1.158.165 1.594.1.486-.073 1.493-.6 1.701-1.18.208-.579.208-1.077.146-1.18-.063-.101-.33-.166-.734-.366z"/>
                      </svg>
                    </a>
                    {/* Mail simulation */}
                    <a
                      href={`mailto:${selectedApp.email}?subject=Regarding%20Your%20GFS%20Agent%20Application`}
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center justify-center shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4 text-xs leading-relaxed max-h-[360px] overflow-y-auto pr-1">
                  
                  {/* Personal info */}
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wider text-slate-400 mb-2">Personal Information</h5>
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="block text-slate-400 font-medium">Mobile Number</span>
                        <span className="font-semibold text-slate-900">{selectedApp.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Email</span>
                        <span className="font-semibold text-slate-900 break-all">{selectedApp.email}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Gender</span>
                        <span className="font-semibold text-slate-900">{selectedApp.gender || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium">Date of Birth</span>
                        <span className="font-semibold text-slate-900">{selectedApp.dob || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Address & Qualifications */}
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wider text-slate-400 mb-2">Qualifications & Background</h5>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                      <div>
                        <span className="block text-slate-400 font-medium">Address</span>
                        <span className="font-semibold text-slate-950 block leading-tight">{selectedApp.address || 'Not specified'}</span>
                        <span className="text-slate-500 font-medium block mt-1">{selectedApp.city}, {selectedApp.state}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                        <div>
                          <span className="block text-slate-400 font-medium">Qualification</span>
                          <span className="font-semibold text-slate-900">{selectedApp.qualification || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-medium">Experience</span>
                          <span className="font-semibold text-slate-900">{selectedApp.experience} Years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KYC documents download simulation */}
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wider text-slate-400 mb-2">KYC Documents & Credentials</h5>
                    <div className="space-y-2">
                      {/* Mock Resume Download */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-600" />
                          <span className="font-semibold text-slate-700 truncate max-w-[180px]">{selectedApp.resumeName}</span>
                        </div>
                        <button
                          onClick={() => toast.success(`Simulating download of Resume: ${selectedApp.resumeName}`)}
                          className="text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          Download <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Mock PAN/Aadhaar Download */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-semibold text-slate-700 truncate max-w-[180px]">{selectedApp.documentName}</span>
                        </div>
                        <button
                          onClick={() => toast.success(`Simulating download of PAN/Aadhaar: ${selectedApp.documentName}`)}
                          className="text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          Download <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wider text-slate-400 mb-1">KYC Status</h5>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {selectedApp.status === 'Pending Verification' && (
                        <span className="text-amber-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Pending verification desk
                        </span>
                      )}
                      {selectedApp.status === 'Approved' && (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Approved & active GFS Agent
                        </span>
                      )}
                      {selectedApp.status === 'Hold' && (
                        <span className="text-blue-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Awaiting document clarifications
                        </span>
                      )}
                      {selectedApp.status === 'Rejected' && (
                        <span className="text-rose-500 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Application not approved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Super Admin Notes & Comments */}
                  <div>
                    <label className="block font-extrabold uppercase tracking-wider text-slate-400 mb-2">Admin Evaluation Notes</label>
                    <textarea
                      placeholder="Add custom notes here..."
                      value={adminNotesText}
                      onChange={(e) => {
                        setAdminNotesText(e.target.value)
                        updateNotes(selectedApp.id, e.target.value)
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Bottom Actions Area */}
                <div className="pt-6 border-t border-slate-100 mt-6 space-y-2">
                  {selectedApp.status === 'Pending Verification' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleReject(selectedApp.id)}
                        className="py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleHold(selectedApp.id)}
                        className="py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Hold
                      </button>
                      <button
                        onClick={() => handleApprove(selectedApp.id)}
                        className="py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  )}

                  {selectedApp.status === 'Approved' && (
                    <div className="space-y-2">
                      {/* Active Agent Actions: Suspend/Deactivate, Reset Password */}
                      <div className="flex gap-2">
                        {selectedApp.isActive ? (
                          <button
                            onClick={() => {
                              suspendAgent(selectedApp.id)
                              setSelectedApp(prev => prev ? { ...prev, isActive: false } : null)
                              toast.warning('Agent suspended successfully.')
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <UserMinus className="w-3.5 h-3.5" /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              activateAgent(selectedApp.id)
                              setSelectedApp(prev => prev ? { ...prev, isActive: true } : null)
                              toast.success('Agent reactivated successfully.')
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}
                        <button
                          onClick={() => setShowResetModal(true)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset Pass
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          deleteAgent(selectedApp.id)
                          setSelectedApp(null)
                          toast.success('Agent record deleted.')
                        }}
                        className="w-full py-2.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Account Record
                      </button>
                    </div>
                  )}

                  {selectedApp.status === 'Hold' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleReject(selectedApp.id)}
                        className="py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Application
                      </button>
                      <button
                        onClick={() => handleApprove(selectedApp.id)}
                        className="py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Account
                      </button>
                    </div>
                  )}

                  {selectedApp.status === 'Rejected' && (
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1 shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-evaluate & Approve Account
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-8 text-center text-slate-400 border-dashed h-[480px] flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-bold text-sm text-slate-500">Select an applicant to view details</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Review qualification credentials, download KYC documents, and approve dynamic credentials here.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Password Reset Modal */}
      {showResetModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-950 font-serif mb-2">Reset Password</h3>
            <p className="text-slate-500 text-xs mb-4">Set a secure temporary password for partner agent: <strong>{selectedApp.fullName}</strong>.</p>
            
            <input
              type="text"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResetModal(false)
                  setNewPassword('')
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(selectedApp.id)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
