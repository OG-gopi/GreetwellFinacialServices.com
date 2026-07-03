import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, DollarSign, Calendar, Percent, ShieldCheck } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { formatCurrency } from '@/lib/utils'

export default function EMICalculator() {
  const [principal, setPrincipal] = useState(500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(24) // in months

  // Real-time EMI computation
  const monthlyRate = rate / 12 / 100
  const emi =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1)
      : principal / tenure

  const totalPayment = emi * tenure
  const totalInterest = totalPayment - principal

  // Amortization Schedule calculation
  const schedule = []
  let balance = principal
  for (let month = 1; month <= tenure; month++) {
    const interest = balance * monthlyRate
    const principalPaid = emi - interest
    balance = Math.max(0, balance - principalPaid)
    
    // Only capture first 12 months for readable screen layout preview
    if (month <= 12 || month === tenure) {
      schedule.push({
        month,
        emi: emi,
        principal: principalPaid,
        interest: interest,
        balance: balance
      })
    }
  }

  return (
    <AppShell pageTitle="Loan EMI Calculator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Parameter Panel */}
        <div className="lg:col-span-1 gfs-card p-6 border border-navy-700 bg-navy-850 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-navy-700 pb-3">
            <Calculator className="w-5 h-5 text-gold-500" /> EMI Parameters
          </h2>

          {/* Principal Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-navy-400">
              <span>Principal Amount</span>
              <span className="text-gold-400 font-bold">{formatCurrency(principal)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={principal}
              onChange={e => setPrincipal(parseFloat(e.target.value))}
              className="w-full accent-gold-500 bg-navy-900 h-2 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              value={principal}
              onChange={e => setPrincipal(parseFloat(e.target.value) || 0)}
              className="gfs-input w-full text-sm font-semibold"
            />
          </div>

          {/* Interest rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-navy-400">
              <span>Interest Rate (p.a.)</span>
              <span className="text-gold-400 font-bold">{rate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="24"
              step="0.1"
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value))}
              className="w-full accent-gold-500 bg-navy-900 h-2 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value) || 0)}
              className="gfs-input w-full text-sm font-semibold"
            />
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-navy-400">
              <span>Tenure (Months)</span>
              <span className="text-gold-400 font-bold">{tenure} Months</span>
            </div>
            <input
              type="range"
              min="6"
              max="120"
              step="6"
              value={tenure}
              onChange={e => setTenure(parseInt(e.target.value))}
              className="w-full accent-gold-500 bg-navy-900 h-2 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              value={tenure}
              onChange={e => setTenure(parseInt(e.target.value) || 0)}
              className="gfs-input w-full text-sm font-semibold"
            />
          </div>
        </div>

        {/* Right Computation Screen */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main output indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="gfs-card p-5 bg-navy-900/40 text-center border border-navy-700/60 flex flex-col justify-between h-28">
              <span className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Monthly EMI Installment</span>
              <span className="text-2xl font-bold text-gold-400 mt-2 block">{formatCurrency(emi)}</span>
            </div>
            <div className="gfs-card p-5 bg-navy-900/40 text-center border border-navy-700/60 flex flex-col justify-between h-28">
              <span className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Total Interest Payable</span>
              <span className="text-xl font-bold text-white mt-2 block">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="gfs-card p-5 bg-navy-900/40 text-center border border-navy-700/60 flex flex-col justify-between h-28">
              <span className="text-navy-400 text-xs font-semibold uppercase tracking-wider">Total Amount Repayable</span>
              <span className="text-xl font-bold text-white mt-2 block">{formatCurrency(totalPayment)}</span>
            </div>
          </div>

          {/* Amortization schedule preview table */}
          <div className="gfs-card p-6">
            <h3 className="text-white font-semibold mb-4">Amortization Schedule Preview (First 12 Months)</h3>
            <div className="overflow-x-auto">
              <table className="gfs-table w-full">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Payment (EMI)</th>
                    <th>Principal component</th>
                    <th>Interest component</th>
                    <th>Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={i}>
                      <td className="font-bold text-navy-400">{row.month}</td>
                      <td>{formatCurrency(row.emi)}</td>
                      <td className="text-emerald-400">{formatCurrency(row.principal)}</td>
                      <td className="text-red-400">{formatCurrency(row.interest)}</td>
                      <td className="font-semibold text-white">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
