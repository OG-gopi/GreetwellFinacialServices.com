import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Coins, Briefcase, Clock, Calendar, CheckCircle2,
  FileText, Download, ChevronRight, User, Award, Shield, AlertCircle
} from 'lucide-react'
import { useChitStore } from '@/store/chitStore'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export default function ChitCustomerDashboard() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const { user } = useAuthStore()
  const { groups, customers, payments, auctions, notifications, syncWithSupabase } = useChitStore()

  useEffect(() => {
    syncWithSupabase()
  }, [])

  // Match the logged in customer
  const loggedInCustomer = customers.find(c => c.email.toLowerCase() === user?.email.toLowerCase()) || customers[0]
  const assignedGroup = groups.find(g => g.id === loggedInCustomer.assignedGroupId) || groups[0]

  const customerPayments = payments.filter(p => p.customerId === loggedInCustomer.id)
  const groupAuctions = auctions.filter(a => a.groupId === assignedGroup.id)

  const unpaidDues = loggedInCustomer.pendingInstallments
  const totalPaid = loggedInCustomer.paidInstallments * loggedInCustomer.monthlyInstallment
  const remainingBal = loggedInCustomer.remainingAmount

  // Timeline representation
  const timelineSteps = [
    { label: 'Joined Chit Group', date: loggedInCustomer.joiningDate, desc: `Successfully enrolled in ${assignedGroup.name}`, done: true },
    { label: 'First Payment Received', date: '2026-01-05', desc: 'Installment 1 of ₹25,000 paid', done: loggedInCustomer.paidInstallments >= 1 },
    { label: 'Third Installment Paid', date: '2026-03-05', desc: 'Dividend share applied: +₹4,000', done: loggedInCustomer.paidInstallments >= 3 },
    { label: 'Bidding / Auction Eligibility', date: 'Monthly 5th', desc: 'Participate in monthly auctions for payouts', done: !loggedInCustomer.auctionWon },
    { label: 'Auction Won / Completed Payout', date: loggedInCustomer.auctionWon ? 'Month 3' : 'Future Month', desc: loggedInCustomer.auctionWon ? `Won ₹${loggedInCustomer.auctionAmount?.toLocaleString('en-IN')}` : 'Awaiting bidding win', done: loggedInCustomer.auctionWon },
    { label: 'Total Chit Maturity', date: assignedGroup.endDate, desc: 'All 20 installments settled', done: loggedInCustomer.status === 'Completed' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 text-left">
      
      {/* GFS Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-2xl mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0a1f44] rounded-full flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="GFS Logo" className="w-full h-full object-cover p-1.5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0a1f44] leading-tight">GREETWELL FINANCIAL SERVICES</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Unified Chit Fund Savings &bull; Customer Portal</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mt-4 sm:mt-0">
          Status: Verified Member
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Tab Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Welcome Dashboard Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Chit Value</span>
                  <strong className="block text-2xl font-black text-slate-800 mt-2">₹{assignedGroup.chitAmount.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">Duration: {assignedGroup.durationMonths} months</span>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase">Paid Installments</span>
                  <strong className="block text-2xl font-black text-emerald-600 mt-2">₹{totalPaid.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">{loggedInCustomer.paidInstallments} of {loggedInCustomer.totalInstallments} cleared</span>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                  <span className="text-xs font-bold text-slate-400 uppercase">Remaining Balance</span>
                  <strong className="block text-2xl font-black text-slate-800 mt-2">₹{remainingBal.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">{unpaidDues} months remaining</span>
                </div>
              </div>

              {/* Next Due / Billing Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">Next Installment Due</h4>
                    <p className="text-xs text-blue-700 mt-1">Your monthly savings fee of ₹{loggedInCustomer.monthlyInstallment.toLocaleString('en-IN')} is due on July 5th, 2026.</p>
                  </div>
                </div>
                <button
                  onClick={() => toast.info('Offline Demo: Autopay will debit from your registered bank account on the due date.')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap"
                >
                  Pay Now / Autopay Settings
                </button>
              </div>

              {/* Auction History block */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Monthly Group Auction Logs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr>
                        <th className="px-4 py-3">Auction Month</th>
                        <th className="px-4 py-3">Winner Member</th>
                        <th className="px-4 py-3">Winning Bid</th>
                        <th className="px-4 py-3">Net Payout</th>
                        <th className="px-4 py-3">Dividend Distribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {groupAuctions.map((a, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3">Month {i+1}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{a.winnerName}</td>
                          <td className="px-4 py-3 text-red-500">₹{a.winningBid.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">₹{a.netPayableAmount.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-emerald-600">+₹{a.dividend.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Details / Timeline tab */}
          {activeTab === 'details' && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">My Savings Journey Timeline</h3>
                <p className="text-xs text-slate-400 mt-1">Review the historical progression of your Monthly Chit Savings account.</p>
              </div>

              {/* Timeline diagram */}
              <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-6">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon indicator */}
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 ${
                      step.done ? 'bg-emerald-500 border-emerald-100' : 'bg-slate-200 border-white'
                    }`} />
                    <div>
                      <h4 className={`text-xs font-bold ${step.done ? 'text-slate-800 font-extrabold' : 'text-slate-400 font-semibold'}`}>
                        {step.label}
                      </h4>
                      {step.date && <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{step.date}</span>}
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Payment Statements</h3>
                <p className="text-xs text-slate-400 mt-1">Historical list of monthly savings payments received.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th className="px-4 py-3">Receipt No.</th>
                      <th className="px-4 py-3">Payment Date</th>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Amount Paid</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {customerPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">{p.receiptNumber}</td>
                        <td className="px-4 py-3">{p.paymentDate}</td>
                        <td className="px-4 py-3">{p.month} {p.year}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">₹{p.paidAmount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">{p.paymentMode}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toast.success(`Simulating payment receipt download...`)} className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                            <Download size={12} /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Auction Tab */}
          {activeTab === 'auctions' && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Bidding Dividend Summary</h3>
                <p className="text-xs text-slate-400 mt-1">Summary of dividend benefits distributed from monthly auctions.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wide">Total Earned Dividend</span>
                  <strong className="block text-2xl font-black text-emerald-600 mt-1">₹15,000</strong>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Applied as discount on monthly installments.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide">Auction Payout Status</span>
                  <strong className="block text-xl font-bold text-slate-700 mt-1">
                    {loggedInCustomer.auctionWon ? 'Disbursed / Won' : 'Eligible for future bidding'}
                  </strong>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Min payout bidding limit: 15% discount</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sidebar stats / profile cards */}
        <div className="space-y-8">
          
          {/* Member Profile Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4 border border-blue-200">
              {loggedInCustomer.fullName.charAt(0)}
            </div>
            <h3 className="font-extrabold text-slate-800 text-base leading-none">{loggedInCustomer.fullName}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{loggedInCustomer.id}</p>
            
            <div className="h-px bg-slate-100 my-4" />

            <div className="space-y-3 text-xs font-semibold text-slate-500 text-left">
              <div className="flex justify-between">
                <span>Chit Group:</span>
                <span className="text-slate-800 font-bold">{assignedGroup.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Due:</span>
                <span className="text-slate-800 font-bold">₹{loggedInCustomer.monthlyInstallment.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Member No:</span>
                <span className="text-slate-800 font-bold">Position #{loggedInCustomer.memberNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile:</span>
                <span className="text-slate-800 font-bold">{loggedInCustomer.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Group details Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Saving Scheme Details</h4>
            <div className="space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Start Date</span>
                <span className="text-slate-700">{assignedGroup.startDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Duration Limit</span>
                <span className="text-slate-700">{assignedGroup.durationMonths} Months</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Auction Schedule</span>
                <span className="text-slate-700">{assignedGroup.auctionDate}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Scheme Code</span>
                <span className="text-slate-700 font-mono">{assignedGroup.code}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
