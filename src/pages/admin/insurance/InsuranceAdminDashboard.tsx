import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, ShieldAlert, ShieldCheck, HeartPulse, Car, Home, PlusCircle,
  FileText, Activity, Users, AlertTriangle, ArrowUpRight, ArrowDownRight,
  TrendingUp, Landmark, ChevronRight
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock Data
const monthlyPolicies = [
  { month: 'Jan', active: 110, pending: 18, claims: 4 },
  { month: 'Feb', active: 125, pending: 22, claims: 5 },
  { month: 'Mar', active: 142, pending: 15, claims: 3 },
  { month: 'Apr', active: 135, pending: 25, claims: 8 },
  { month: 'May', active: 158, pending: 18, claims: 6 },
  { month: 'Jun', active: 172, pending: 20, claims: 5 },
]

const policyTypes = [
  { name: 'Life', value: 45, color: '#D4AF37' },
  { name: 'Health', value: 30, color: '#3B82F6' },
  { name: 'Motor', value: 15, color: '#10B981' },
  { name: 'Property', value: 10, color: '#A855F7' }
]

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

export default function InsuranceAdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    pendingPolicies: 0,
    expiredPolicies: 0,
    claimsFiled: 0,
    totalPremiums: 0
  })
  const [expiringPolicies, setExpiringPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setIsLoading(true)
    try {
      // Query stats
      const { data: allPolicies } = await supabase
        .from('insurance_policies')
        .select('*, customer:customers(full_name, phone)')
        .eq('is_deleted', false)

      const policies = allPolicies || []
      
      const active = policies.filter(p => p.status === 'active')
      const pending = policies.filter(p => p.status === 'pending')
      const expired = policies.filter(p => p.status === 'expired')
      const totalPremiums = active.reduce((sum, p) => sum + (p.premium_amount || 0), 0)

      setStats({
        totalPolicies: policies.length,
        activePolicies: active.length,
        pendingPolicies: pending.length,
        expiredPolicies: expired.length,
        claimsFiled: 8, // Mocked claims
        totalPremiums
      })

      // Policies expiring in 30 days
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      const expiring = policies.filter(p => {
        if (!p.end_date) return false
        const expiryDate = new Date(p.end_date)
        return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow
      })
      
      setExpiringPolicies(expiring.slice(0, 5))

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Policies', value: stats.totalPolicies, subtitle: 'All business units', icon: <Shield className="w-5 h-5" />, accentColor: '#D4AF37', trend: { value: 12, isUp: true } },
    { title: 'Active Policies', value: stats.activePolicies, subtitle: 'Live portfolios', icon: <ShieldCheck className="w-5 h-5" />, accentColor: '#10B981', trend: { value: 15, isUp: true } },
    { title: 'Pending Approval', value: stats.pendingPolicies, subtitle: 'Underwriting queue', icon: <ShieldAlert className="w-5 h-5" />, accentColor: '#EAB308', trend: { value: 4, isUp: false } },
    { title: 'Total Premiums', value: formatCurrency(stats.totalPremiums), subtitle: 'Recurring value', icon: <TrendingUp className="w-5 h-5" />, accentColor: '#3B82F6', trend: { value: 18, isUp: true } }
  ]

  return (
    <AppShell pageTitle="Insurance Admin Dashboard">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Insurance Administration <span className="gold-text">Dashboard</span>
        </h1>
        <p className="text-navy-400 text-sm mt-1">
          Perform policy underwriting, assess risks, track policy expiries, and verify coverages.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Expiring policies alarm */}
        <div className="lg:col-span-2 gfs-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse" />
            <h3 className="text-foreground font-semibold">Expiries in Next 30 Days</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="gfs-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Policy Type</th>
                  <th>Premium</th>
                  <th>Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-4">Loading expiring policies...</td></tr>
                ) : expiringPolicies.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <p className="text-sm font-semibold text-white">{p.customer?.full_name || '—'}</p>
                      <p className="text-xs text-navy-400">{p.customer?.phone || '—'}</p>
                    </td>
                    <td>{p.policy_type.toUpperCase()}</td>
                    <td className="text-gold-400 font-bold">{formatCurrency(p.premium_amount)}</td>
                    <td className="text-xs text-red-400 font-medium">{formatDate(p.end_date)}</td>
                    <td>
                      <a href="/admin/insurance/policies" className="text-xs text-gold-500 hover:underline flex items-center gap-0.5">
                        Manage <ChevronRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
                {!isLoading && expiringPolicies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-navy-400 text-sm">
                      No policies expiring in the next 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coverage breakdown */}
        <div className="gfs-card p-6">
          <h3 className="text-foreground font-semibold mb-4">Coverage Type Breakdown</h3>
          <div className="space-y-4">
            {policyTypes.map((type, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-navy-300">{type.name} Policies</span>
                  <span className="text-white">{type.value}%</span>
                </div>
                <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${type.value}%`, backgroundColor: type.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
