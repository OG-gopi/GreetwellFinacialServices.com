import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Coins, Plus, Edit, Trash2, Download, Search, Check, FileText, Upload,
  Users, TrendingUp, Calendar, AlertCircle, CheckCircle2, CreditCard, ChevronRight
} from 'lucide-react'
import { useChitStore, ChitGroup, ChitCustomer, ChitPayment, ChitAuction } from '@/store/chitStore'
import { toast } from 'sonner'

export default function ChitAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'

  const {
    groups, customers, payments, auctions,
    createGroup, updateGroup, deleteGroup,
    addCustomer, updateCustomer, deleteCustomer,
    addPayment, addAuction, syncWithSupabase
  } = useChitStore()

  useEffect(() => {
    syncWithSupabase()
  }, [])

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState('All')

  // Modals state
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAuctionModal, setShowAuctionModal] = useState(false)

  // Form states
  const [groupForm, setGroupForm] = useState({
    name: '', code: '', chitAmount: 500000, monthlyInstallment: 25000, durationMonths: 20,
    totalMembers: 20, startDate: '', endDate: '', auctionDate: 'Every 5th', status: 'Active' as const, description: ''
  })
  
  const [customerForm, setCustomerForm] = useState({
    fullName: '', fatherName: '', gender: 'male' as const, dateOfBirth: '', mobileNumber: '', alternateMobile: '',
    email: '', aadhaarNumber: '', panNumber: '', occupation: '', monthlyIncome: 50000, nomineeName: '', nomineeRelationship: '',
    address: '', village: '', city: '', district: '', state: '', pincode: '', joiningDate: '', status: 'Active' as const,
    assignedGroupId: '', memberNumber: 1, positionNumber: 1, joiningAmount: 25000, monthlyInstallment: 25000,
    totalInstallments: 20, paidInstallments: 0, pendingInstallments: 20, remainingAmount: 500000, currentBalance: 0,
    auctionEligibility: true, auctionWon: false
  })

  const [paymentForm, setPaymentForm] = useState({
    customerId: '', paymentDate: '', month: 'June', year: 2026, paidAmount: 25000, penalty: 0, lateFee: 0, discount: 0,
    paymentMode: 'UPI' as const, transactionId: '', remarks: '', status: 'Paid' as const
  })

  const [auctionForm, setAuctionForm] = useState({
    groupId: '', auctionDate: '', winnerName: '', memberNumber: 1, winningBid: 50000, discountPercentage: 10,
    dividend: 2500, netPayableAmount: 450000, paymentStatus: 'Pending' as const, auctionNotes: ''
  })

  // Set default forms when opening modals
  useEffect(() => {
    if (groups.length > 0) {
      setCustomerForm(f => ({ ...f, assignedGroupId: groups[0].id }))
      setAuctionForm(f => ({ ...f, groupId: groups[0].id }))
    }
    if (customers.length > 0) {
      setPaymentForm(f => ({ ...f, customerId: customers[0].id }))
    }
  }, [groups, customers])

  // Calculation for stats
  const activeGroups = groups.filter(g => g.status === 'Active').length
  const upcomingGroups = groups.filter(g => g.status === 'Upcoming').length
  const completedGroups = groups.filter(g => g.status === 'Closed').length
  const totalCustomers = customers.length
  
  const totalCollection = payments.reduce((acc, p) => acc + p.paidAmount, 0)
  const pendingCollection = customers.reduce((acc, c) => acc + c.currentBalance, 0) + 125000 // mock pending
  const todayCollection = 45000 // mock today
  const latePayments = customers.filter(c => c.pendingInstallments > 0).length

  // Handlers
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    createGroup(groupForm)
    toast.success('Chit Group created successfully!')
    setShowGroupModal(false)
    setGroupForm({
      name: '', code: '', chitAmount: 500000, monthlyInstallment: 25000, durationMonths: 20,
      totalMembers: 20, startDate: '', endDate: '', auctionDate: 'Every 5th', status: 'Active', description: ''
    })
  }

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedGrp = groups.find(g => g.id === customerForm.assignedGroupId)
    const installment = selectedGrp ? selectedGrp.monthlyInstallment : 25000
    const totalAmt = selectedGrp ? selectedGrp.chitAmount : 500000
    const duration = selectedGrp ? selectedGrp.durationMonths : 20

    addCustomer({
      ...customerForm,
      monthlyInstallment: installment,
      joiningAmount: installment,
      totalInstallments: duration,
      remainingAmount: totalAmt,
      pendingInstallments: duration
    })
    toast.success('Customer added and assigned to Group!')
    setShowCustomerModal(false)
  }

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    const customer = customers.find(c => c.id === paymentForm.customerId)
    if (!customer) return

    const selectedGrp = groups.find(g => g.id === customer.assignedGroupId)

    addPayment({
      customerId: customer.id,
      customerName: customer.fullName,
      groupName: selectedGrp ? selectedGrp.name : 'Unknown Group',
      paymentDate: paymentForm.paymentDate || new Date().toISOString().split('T')[0],
      month: paymentForm.month,
      year: paymentForm.year,
      paidAmount: Number(paymentForm.paidAmount),
      balanceAmount: Math.max(0, customer.monthlyInstallment - Number(paymentForm.paidAmount)),
      penalty: Number(paymentForm.penalty),
      lateFee: Number(paymentForm.lateFee),
      discount: Number(paymentForm.discount),
      paymentMode: paymentForm.paymentMode,
      transactionId: paymentForm.transactionId,
      collectedBy: 'Linga Prasad Goud',
      remarks: paymentForm.remarks,
      status: paymentForm.status
    })

    toast.success(`Payment receipt generated for ${customer.fullName}!`)
    setShowPaymentModal(false)
  }

  const handleRecordAuction = (e: React.FormEvent) => {
    e.preventDefault()
    const group = groups.find(g => g.id === auctionForm.groupId)
    if (!group) return

    addAuction({
      groupId: group.id,
      groupName: group.name,
      auctionDate: auctionForm.auctionDate || new Date().toISOString().split('T')[0],
      winnerName: auctionForm.winnerName,
      memberNumber: Number(auctionForm.memberNumber),
      winningBid: Number(auctionForm.winningBid),
      discountPercentage: Number(auctionForm.discountPercentage),
      dividend: Number(auctionForm.dividend),
      netPayableAmount: Number(group.chitAmount - auctionForm.winningBid),
      paymentStatus: auctionForm.paymentStatus,
      auctionNotes: auctionForm.auctionNotes
    })

    // Update customer who won the auction
    const winningCustomer = customers.find(c => c.fullName.toLowerCase() === auctionForm.winnerName.toLowerCase())
    if (winningCustomer) {
      updateCustomer(winningCustomer.id, {
        auctionWon: true,
        auctionAmount: group.chitAmount - auctionForm.winningBid,
        discount: auctionForm.winningBid,
        dividend: auctionForm.dividend,
        netAmountReceived: group.chitAmount - auctionForm.winningBid - auctionForm.dividend
      })
    }

    toast.success(`Auction recorded. Winner: ${auctionForm.winnerName}`)
    setShowAuctionModal(false)
  }

  const handleExport = (reportType: string) => {
    toast.success(`Downloading ${reportType} Report in Excel format...`)
  }

  // Filter lists
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.mobileNumber.includes(searchTerm)
    const matchesGroup = filterGroup === 'All' || c.assignedGroupId === filterGroup
    return matchesSearch && matchesGroup
  })

  // Recharts Mock Data
  const monthlyData = [
    { name: 'Jan', Paid: 240000, Pending: 40000 },
    { name: 'Feb', Paid: 310000, Pending: 25000 },
    { name: 'Mar', Paid: 280000, Pending: 55000 },
    { name: 'Apr', Paid: 350000, Pending: 30000 },
    { name: 'May', Paid: 410000, Pending: 20000 },
    { name: 'Jun', Paid: 390000, Pending: 15000 },
  ]

  const statusData = [
    { name: 'Paid Collections', value: totalCollection },
    { name: 'Pending Collections', value: pendingCollection },
  ]

  const COLORS = ['#10B981', '#EF4444']

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 text-left">
      
      {/* Company Branding Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-2xl mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0a1f44] rounded-full flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="GFS Logo" className="w-full h-full object-cover p-1.5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0a1f44] leading-tight">GREETWELL FINANCIAL SERVICES</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Monthly Chit Fund Portal &bull; Admin Desk</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full">
            Admin Profile: Linga Prasad Goud
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Chit Groups', value: groups.length, desc: `${activeGroups} Active | ${upcomingGroups} Upcoming`, color: 'border-blue-500 bg-blue-50/50' },
                { title: 'Monthly Collections', value: `₹${totalCollection.toLocaleString('en-IN')}`, desc: `Today: ₹${todayCollection.toLocaleString('en-IN')}`, color: 'border-emerald-500 bg-emerald-50/50' },
                { title: 'Pending Collection', value: `₹${pendingCollection.toLocaleString('en-IN')}`, desc: `${latePayments} Overdue Members`, color: 'border-red-400 bg-red-50/50' },
                { title: 'Total Customers', value: totalCustomers, desc: 'Active joined members', color: 'border-purple-500 bg-purple-50/50' }
              ].map((c, i) => (
                <div key={i} className={`p-6 bg-white border-l-4 rounded-xl border-y border-r border-slate-200 shadow-sm ${c.color}`}>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{c.title}</span>
                  <strong className="text-2xl font-black text-slate-800 block mt-2">{c.value}</strong>
                  <span className="text-xs text-slate-400 block mt-1 font-medium">{c.desc}</span>
                </div>
              ))}
            </div>

            {/* Charts & Graphs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Collection Graph */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl lg:col-span-2 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Collections Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Paid" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pending" fill="#FECACA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Paid vs Pending Pie Chart */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Paid vs Pending Share</h3>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-semibold text-slate-600">Paid Collections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 bg-red-500 rounded-full" />
                    <span className="text-xs font-semibold text-slate-600">Pending</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800">Quick Portal Operations</h3>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowGroupModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm">
                  <Plus size={16} /> Create Chit Group
                </button>
                <button onClick={() => setShowCustomerModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm">
                  <Plus size={16} /> Add Customer
                </button>
                <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-all">
                  <Plus size={16} /> Record Payment
                </button>
                <button onClick={() => setShowAuctionModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-all">
                  <Plus size={16} /> Record Monthly Auction
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: CHIT GROUPS */}
        {activeTab === 'groups' && (
          <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Active & Upcoming Chit Groups</h2>
                <p className="text-xs text-slate-400 mt-1">Create and manage chit saving pools.</p>
              </div>
              <button onClick={() => setShowGroupModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all">
                <Plus size={14} /> Add New Group
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Group Name</th>
                    <th className="px-6 py-4">Group Code</th>
                    <th className="px-6 py-4">Chit Value</th>
                    <th className="px-6 py-4">Monthly Installment</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Auction Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {groups.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{g.name}</td>
                      <td className="px-6 py-4 font-mono">{g.code}</td>
                      <td className="px-6 py-4">₹{g.chitAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">₹{g.monthlyInstallment.toLocaleString('en-IN')}/mo</td>
                      <td className="px-6 py-4">{g.durationMonths} Months ({g.totalMembers} Members)</td>
                      <td className="px-6 py-4">{g.auctionDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          g.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          g.status === 'Upcoming' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => toast.success(`Edit Group config simulated.`)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => deleteGroup(g.id)} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CUSTOMERS */}
        {activeTab === 'customers' && (
          <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Chit Member Directory</h2>
                <p className="text-xs text-slate-400 mt-1">Review personal files, documents, and payout status.</p>
              </div>
              <button onClick={() => setShowCustomerModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all">
                <Plus size={14} /> Register New Member
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="flex-1 flex items-center bg-slate-100 border border-slate-200 rounded-xl px-4 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, Name, or Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-700 ml-2 w-full"
                />
              </div>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                <option value="All">All Chit Groups</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Customer List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Customer ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Mobile</th>
                    <th className="px-6 py-4">Group</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Installments Paid</th>
                    <th className="px-6 py-4">Auction Status</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCustomers.map((c) => {
                    const group = groups.find(g => g.id === c.assignedGroupId)
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono font-bold text-slate-500">{c.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{c.fullName}</td>
                        <td className="px-6 py-4">{c.mobileNumber}</td>
                        <td className="px-6 py-4">{group ? group.name : 'Unassigned'}</td>
                        <td className="px-6 py-4">No. {c.memberNumber}</td>
                        <td className="px-6 py-4">
                          <span className="text-emerald-600 font-bold">{c.paidInstallments}</span> / {c.totalInstallments}
                        </td>
                        <td className="px-6 py-4">
                          {c.auctionWon ? (
                            <span className="text-amber-600 font-extrabold flex items-center gap-1">
                              Won (M{c.auctionMonth})
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">Eligible</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-600 uppercase">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => toast.success(`Documents verified for ${c.fullName}.`)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500" title="Verify Docs">
                              <Upload size={13} />
                            </button>
                            <button onClick={() => deleteCustomer(c.id)} className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: COLLECTIONS & PAYMENTS */}
        {activeTab === 'collections' && (
          <motion.div key="collections" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Monthly Collections & Receipts</h2>
                <p className="text-xs text-slate-400 mt-1">Record and download customer payment receipts.</p>
              </div>
              <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all">
                <Plus size={14} /> Record Payment
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Receipt No.</th>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Chit Group</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Installment Month</th>
                    <th className="px-6 py-4">Paid Amount</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{p.receiptNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{p.customerName}</td>
                      <td className="px-6 py-4">{p.groupName}</td>
                      <td className="px-6 py-4">{p.paymentDate}</td>
                      <td className="px-6 py-4">{p.month} {p.year}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">₹{p.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{p.paymentMode}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toast.success(`Simulating receipt PDF generation...`)} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                          <FileText size={12} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 5: AUCTIONS */}
        {activeTab === 'auctions' && (
          <motion.div key="auctions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Bidding & Auction Management</h2>
                <p className="text-xs text-slate-400 mt-1">Record monthly bidding results and distribute dividends.</p>
              </div>
              <button onClick={() => setShowAuctionModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all">
                <Plus size={14} /> Record Auction Result
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Auction Date</th>
                    <th className="px-6 py-4">Group</th>
                    <th className="px-6 py-4">Winner Name</th>
                    <th className="px-6 py-4">Winning Bid Foregone</th>
                    <th className="px-6 py-4">Dividend/Member</th>
                    <th className="px-6 py-4">Net Payout Amount</th>
                    <th className="px-6 py-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {auctions.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">{a.auctionDate}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{a.groupName}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{a.winnerName} (No.{a.memberNumber})</td>
                      <td className="px-6 py-4 font-bold text-red-500">₹{a.winningBid.toLocaleString('en-IN')} ({a.discountPercentage}%)</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">+₹{a.dividend.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">₹{a.netPayableAmount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          a.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {a.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 6: REPORTS */}
        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Financial Reports & Exports</h2>
              <p className="text-xs text-slate-400 mt-1">Export chit collections and billing logs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Collections Report', desc: 'Detailed log of all monthly payments received.', type: 'Collections' },
                { title: 'Due & Pending Report', desc: 'Overdue customers list with late fee charges.', type: 'Pending Collections' },
                { title: 'Auction Logs', desc: 'History of bids foregone, net payouts, and dividends.', type: 'Auction History' },
                { title: 'Annual Tax Summary', desc: 'Consolidated profit/loss and dividend distributions.', type: 'Annual Statement' },
                { title: 'Member KYC Status', desc: 'Audit log of uploaded credentials and documents.', type: 'KYC Log' }
              ].map((r, i) => (
                <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{r.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => handleExport(r.type)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors">
                      <Download size={13} /> Excel
                    </button>
                    <button onClick={() => handleExport(r.type)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors shadow-sm">
                      <FileText size={13} /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ─── MODALS ─── */}

      {/* 1. Add Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden text-xs">
            <div className="bg-[#0a1f44] p-5 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Create New Chit Group</span>
              <button onClick={() => setShowGroupModal(false)} className="text-slate-300 hover:text-white font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4 font-semibold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Group Name *</label>
                  <input type="text" required value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} placeholder="e.g. Gold Chit 5L" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Group Code *</label>
                  <input type="text" required value={groupForm.code} onChange={e => setGroupForm({...groupForm, code: e.target.value})} placeholder="e.g. GC5L-20" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Total Chit Amount (₹) *</label>
                  <input type="number" required value={groupForm.chitAmount} onChange={e => setGroupForm({...groupForm, chitAmount: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Monthly Installment (₹) *</label>
                  <input type="number" required value={groupForm.monthlyInstallment} onChange={e => setGroupForm({...groupForm, monthlyInstallment: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Duration (Months) *</label>
                  <input type="number" required value={groupForm.durationMonths} onChange={e => setGroupForm({...groupForm, durationMonths: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Members Limit *</label>
                  <input type="number" required value={groupForm.totalMembers} onChange={e => setGroupForm({...groupForm, totalMembers: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Auction Date *</label>
                  <input type="text" required value={groupForm.auctionDate} onChange={e => setGroupForm({...groupForm, auctionDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea rows={2} value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
              </div>
              <button type="submit" className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Create Group</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden text-xs my-8 max-h-[90vh] flex flex-col">
            <div className="bg-[#0a1f44] p-5 text-white flex justify-between items-center shrink-0">
              <span className="font-bold text-sm">Register New Chit Member</span>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-300 hover:text-white font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4 font-semibold text-slate-600 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Full Name *</label>
                  <input type="text" required value={customerForm.fullName} onChange={e => setCustomerForm({...customerForm, fullName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Father's Name *</label>
                  <input type="text" required value={customerForm.fatherName} onChange={e => setCustomerForm({...customerForm, fatherName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Gender *</label>
                  <select value={customerForm.gender} onChange={e => setCustomerForm({...customerForm, gender: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">DOB *</label>
                  <input type="date" required value={customerForm.dateOfBirth} onChange={e => setCustomerForm({...customerForm, dateOfBirth: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Assigned Chit Group *</label>
                  <select value={customerForm.assignedGroupId} onChange={e => setCustomerForm({...customerForm, assignedGroupId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} (Code: {g.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Mobile Number *</label>
                  <input type="text" required value={customerForm.mobileNumber} onChange={e => setCustomerForm({...customerForm, mobileNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Email *</label>
                  <input type="email" required value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Aadhaar Number *</label>
                  <input type="text" required value={customerForm.aadhaarNumber} onChange={e => setCustomerForm({...customerForm, aadhaarNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">PAN Number *</label>
                  <input type="text" required value={customerForm.panNumber} onChange={e => setCustomerForm({...customerForm, panNumber: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Member Position (1-20) *</label>
                  <input type="number" required min={1} value={customerForm.memberNumber} onChange={e => setCustomerForm({...customerForm, memberNumber: Number(e.target.value), positionNumber: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Occupation *</label>
                  <input type="text" required value={customerForm.occupation} onChange={e => setCustomerForm({...customerForm, occupation: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Nominee Name *</label>
                  <input type="text" required value={customerForm.nomineeName} onChange={e => setCustomerForm({...customerForm, nomineeName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Relationship to Nominee *</label>
                  <input type="text" required value={customerForm.nomineeRelationship} onChange={e => setCustomerForm({...customerForm, nomineeRelationship: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="block mb-1">Permanent Address *</label>
                <textarea required rows={2} value={customerForm.address} onChange={e => setCustomerForm({...customerForm, address: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
              </div>
              <button type="submit" className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shrink-0">Submit Enrollment</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden text-xs">
            <div className="bg-[#0a1f44] p-5 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Record Installment Payment</span>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-300 hover:text-white font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Select Member *</label>
                <select value={paymentForm.customerId} onChange={e => setPaymentForm({...paymentForm, customerId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} (ID: {c.id})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Amount Paid (₹) *</label>
                  <input type="number" required value={paymentForm.paidAmount} onChange={e => setPaymentForm({...paymentForm, paidAmount: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Payment Date</label>
                  <input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">For Month *</label>
                  <select value={paymentForm.month} onChange={e => setPaymentForm({...paymentForm, month: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Payment Mode *</label>
                  <select value={paymentForm.paymentMode} onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Transaction/Ref ID</label>
                  <input type="text" value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} placeholder="e.g. TXN9982" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Status *</label>
                  <select value={paymentForm.status} onChange={e => setPaymentForm({...paymentForm, status: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                    <option value="Paid">Paid (Full)</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">Record Payment & Receipt</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Record Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl overflow-hidden text-xs">
            <div className="bg-[#0a1f44] p-5 text-white flex justify-between items-center">
              <span className="font-bold text-sm">Record Monthly Bidding / Auction</span>
              <button onClick={() => setShowAuctionModal(false)} className="text-slate-300 hover:text-white font-bold text-base">&times;</button>
            </div>
            <form onSubmit={handleRecordAuction} className="p-6 space-y-4 font-semibold text-slate-600">
              <div>
                <label className="block mb-1">Select Chit Group *</label>
                <select value={auctionForm.groupId} onChange={e => setAuctionForm({...auctionForm, groupId: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium">
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Value: ₹{g.chitAmount})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Winner Full Name *</label>
                  <input type="text" required value={auctionForm.winnerName} onChange={e => setAuctionForm({...auctionForm, winnerName: e.target.value})} placeholder="Enter name" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Member Number *</label>
                  <input type="number" required value={auctionForm.memberNumber} onChange={e => setAuctionForm({...auctionForm, memberNumber: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Winning Bid (Foregone) *</label>
                  <input type="number" required value={auctionForm.winningBid} onChange={e => setAuctionForm({...auctionForm, winningBid: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Discount %</label>
                  <input type="number" value={auctionForm.discountPercentage} onChange={e => setAuctionForm({...auctionForm, discountPercentage: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
                <div>
                  <label className="block mb-1">Dividend / Member</label>
                  <input type="number" value={auctionForm.dividend} onChange={e => setAuctionForm({...auctionForm, dividend: Number(e.target.value)})} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none font-medium" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">Submit Auction Entry</button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  )
}
