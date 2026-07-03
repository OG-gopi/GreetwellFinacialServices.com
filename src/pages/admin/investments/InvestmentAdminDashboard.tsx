import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon,
  Shield, BarChart2, Briefcase, PlusCircle, ArrowUpRight, ArrowDownRight,
  Landmark, Activity, AlertTriangle
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

// Reusable Stat Card
interface StatProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  accentColor: string
  trend?: { value: number; isUp: boolean }
}
function StatCard({ title, value, subtitle, icon, accentColor, trend }: StatProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-navy-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold mt-1 text-white" style={{ color: accentColor }}>{value}</p>
          <p className="text-navy-400 text-xs mt-1">{subtitle}</p>
        </div>
        <div
          className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}25` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend.isUp ? 'text-green-400' : 'text-red-400'}`}>
          {trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{trend.value}% vs last month</span>
        </div>
      )}
    </div>
  )
}

export default function InvestmentAdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalPortfolios: 0,
    totalInvested: 0,
    currentValue: 0,
    totalReturns: 0,
    avgRoi: 0
  })
  const [recentInvestments, setRecentInvestments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setIsLoading(true)
    try {
      const { data: allInvestments } = await supabase
        .from('investments')
        .select('*, customer:customers(full_name, phone)')
        .eq('is_deleted', false)

      const investments = allInvestments || []

      const totalInvested = investments.reduce((sum, i) => sum + (i.invested_amount || 0), 0)
      const currentValue = investments.reduce((sum, i) => sum + (i.current_value || i.invested_amount || 0), 0)
      const totalReturns = currentValue - totalInvested

      setStats({
        totalPortfolios: investments.length,
        totalInvested,
        currentValue,
        totalReturns,
        avgRoi: totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0
      })

      setRecentInvestments(investments.slice(0, 5))

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Portfolios', value: stats.totalPortfolios, subtitle: 'Under management', icon: <Briefcase className="w-5 h-5" />, accentColor: '#D4AF37', trend: { value: 14, isUp: true } },
    { title: 'Total Capital Invested', value: formatCurrency(stats.totalInvested), subtitle: 'Book value', icon: <DollarSign className="w-5 h-5" />, accentColor: '#3B82F6', trend: { value: 20, isUp: true } },
    { title: 'Portfolio Current Value', value: formatCurrency(stats.currentValue), subtitle: 'Market value', icon: <TrendingUp className="w-5 h-5" />, accentColor: '#10B981', trend: { value: 24, isUp: true } },
    { title: 'Average Return (ROI)', value: `${stats.avgRoi.toFixed(2)}%`, subtitle: 'All accounts avg', icon: <Activity className="w-5 h-5" />, accentColor: '#06B6D4', trend: { value: 5, isUp: true } }
  ]

  const riskLevels = [
    { level: 'High Risk (Equity Mutual Funds)', share: 55, color: '#EF4444' },
    { level: 'Moderate Risk (Hybrid Funds)', share: 30, color: '#F59E0B' },
    { level: 'Low Risk (Fixed Income / Debt)', share: 15, color: '#10B981' }
  ]

  return (
    <AppShell pageTitle="Investment Admin Dashboard">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Investments & Portfolios <span className="gold-text">Dashboard</span>
        </h1>
        <p className="text-navy-400 text-sm mt-1">
          Monitor customer assets, track market updates, calculate yields, and manage mutual fund portfolios.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Investments list */}
        <div className="lg:col-span-2 gfs-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Recent Asset Additions</h3>
          <div className="overflow-x-auto">
            <table className="gfs-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Investment Type</th>
                  <th>Fund / Scheme</th>
                  <th>Capital Invested</th>
                  <th>Current Value</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-4">Loading active assets...</td></tr>
                ) : recentInvestments.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <p className="text-sm font-semibold text-white">{item.customer?.full_name || '—'}</p>
                      <p className="text-xs text-navy-400">{item.customer?.phone || '—'}</p>
                    </td>
                    <td><span className="text-xs uppercase px-2 py-0.5 rounded bg-navy-800 text-gold-400">{item.investment_type}</span></td>
                    <td className="text-sm font-medium">{item.fund_name}</td>
                    <td className="text-navy-300 font-semibold">{formatCurrency(item.invested_amount)}</td>
                    <td className="text-emerald-400 font-bold">{formatCurrency(item.current_value || item.invested_amount)}</td>
                  </tr>
                ))}
                {!isLoading && recentInvestments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-navy-400 text-sm">
                      No active investments registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk allocation */}
        <div className="gfs-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Risk Capital Allocation</h3>
          <div className="space-y-4">
            {riskLevels.map((risk, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-navy-300">{risk.level}</span>
                  <span className="text-white">{risk.share}%</span>
                </div>
                <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${risk.share}%`, backgroundColor: risk.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
