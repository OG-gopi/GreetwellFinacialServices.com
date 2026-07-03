import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useCRMDatabaseStore, CustomerRecord } from '@/store/crmDatabaseStore'
import {
  Users, Search, Filter, ShieldCheck, Mail, Phone,
  MapPin, Calendar, FileText, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, UserMinus, UserCheck,
  Trash2, RotateCcw, ExternalLink, RefreshCw, Send, Clipboard
} from 'lucide-react'
import { toast } from 'sonner'

export default function ProcessingTeamDashboard() {
  const { user } = useAuthStore()
  const { customers, updateCustomerStatus } = useCRMDatabaseStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [selectedCase, setSelectedCase] = useState<CustomerRecord | null>(null)
  
  // Action details
  const [processingNotes, setProcessingNotes] = useState('')
  const [caseStatus, setCaseStatus] = useState<CustomerRecord['status']>('Pending')

  // Filter cases
  const filteredCases = customers.filter((c) => {
    const searchMatch = 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const statusMatch = statusFilter === 'All' || c.status === statusFilter

    return searchMatch && statusMatch
  })

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCase) return

    updateCustomerStatus(selectedCase.id, caseStatus, processingNotes)
    toast.success(`Case status successfully updated to: ${caseStatus}!`)
    setSelectedCase(null)
    setProcessingNotes('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      case 'Under Review':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'Need More Documents':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070b12] text-slate-100 font-sans relative overflow-hidden text-left">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── PROCESSING SIDEBAR ─── */}
      <div className="w-full md:w-64 bg-[#0b121f] border-b md:border-b-0 md:border-r border-white/5 p-5 flex flex-col shrink-0 relative z-30">
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Clipboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm leading-none">GFS Processing</h3>
            <span className="text-[10px] text-indigo-400 font-bold block mt-1 tracking-wider uppercase">Verification Desk</span>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-1.5 flex-grow">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-900 border border-white/5 text-white shadow-md">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Verification Queue</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-white/5 pt-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-850 border border-white/5 flex items-center justify-center font-bold text-white shadow-inner">
            PD
          </div>
          <div>
            <p className="font-extrabold text-white text-xs leading-none">GFS Desk Analyst</p>
            <span className="text-[9px] text-slate-500 block mt-1">ops-verify@gfs.com</span>
          </div>
        </div>

      </div>

      {/* ─── DYNAMIC CONTENT ─── */}
      <div className="flex-grow p-6 md:p-10 max-w-5xl w-full mx-auto relative z-10 max-h-screen overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            Operations Verification Queue
          </h1>
          <p className="text-slate-400 text-sm mt-1">Audit customer applications, verify kyc certificates, and publish processing reports.</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer name, email, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 text-slate-100 placeholder-slate-600"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl py-2.5 px-4 text-xs text-slate-300 focus:outline-none cursor-pointer appearance-none"
            >
              <option value="All">All Verification States</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Need More Documents">Need More Documents</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Grid List vs Detail Action */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* List panel */}
          <div className="flex-grow w-full space-y-3">
            {filteredCases.length === 0 ? (
              <div className="bg-slate-900/40 border border-white/5 p-12 rounded-3xl text-center">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-400 text-sm">No verification cases in queue</p>
              </div>
            ) : (
              filteredCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c)
                    setCaseStatus(c.status)
                    setProcessingNotes(c.processingNotes || '')
                  }}
                  className={`p-4 bg-slate-900/40 border rounded-2xl cursor-pointer flex justify-between items-center transition-all ${
                    selectedCase?.id === c.id ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-white/5 hover:border-slate-800'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{c.fullName}</h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">{c.email}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Action Form Desk */}
          <div className="w-full lg:w-96 shrink-0">
            <AnimatePresence mode="wait">
              {selectedCase ? (
                <motion.div
                  key={selectedCase.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-5 text-xs text-left"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-base font-bold text-white leading-tight">{selectedCase.fullName}</h3>
                    <span className="text-slate-500 mt-0.5 block">File: {selectedCase.documentName}</span>
                  </div>

                  <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 font-semibold text-slate-300">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">Upload Verification report</label>
                      <button
                        type="button"
                        onClick={() => toast.success(`Simulated verification report upload for: ${selectedCase.fullName}`)}
                        className="w-full py-2 bg-slate-950 border border-dashed border-white/10 rounded-lg text-center text-slate-400 hover:text-white"
                      >
                        Upload Clear Scan
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">Set Verification status</label>
                      <select
                        value={caseStatus}
                        onChange={(e) => setCaseStatus(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-slate-300 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Need More Documents">Need More Documents</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-1">Auditor notes & report details</label>
                      <textarea
                        rows={3}
                        value={processingNotes}
                        onChange={(e) => setProcessingNotes(e.target.value)}
                        placeholder="Add compliance notes here..."
                        className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-cyan-500 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md"
                    >
                      Publish Audit Report
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="bg-slate-950/20 border border-dashed border-white/5 rounded-3xl p-8 text-center text-slate-500 h-64 flex flex-col justify-center items-center">
                  <ShieldCheck className="w-10 h-10 text-slate-700 mb-2" />
                  <p className="font-bold text-sm">Select audit case</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-[200px] leading-relaxed">Choose an active customer file from the list to audit document reports.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  )
}
