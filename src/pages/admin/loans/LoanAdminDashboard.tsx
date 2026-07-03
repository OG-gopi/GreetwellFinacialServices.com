import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  FileText, Clock, CheckCircle, Banknote, XCircle,
  DollarSign, ArrowUpRight, ArrowDownRight, Eye,
  Check, X, ChevronRight, Users, ClipboardList, BarChart2,
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import {
  formatCurrency, formatDate, getLoanTypeLabel,
  getLoanStatusColor, generateInitials, cn,
} from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import type { Loan, LoanStatus } from '@/types'

// ─── Chart Data ────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: 'Jan', applications: 38, approved: 22, disbursed: 18 },
  { month: 'Feb', applications: 45, approved: 28, disbursed: 24 },
  { month: 'Mar', applications: 52, approved: 35, disbursed: 29 },
  { month: 'Apr', applications: 47, approved: 30, disbursed: 25 },
  { month: 'May', applications: 61, approved: 42, disbursed: 36 },
  { month: 'Jun', applications: 58, approved: 38, disbursed: 32 },
]

const loanTypeData = [
  { name: 'Personal', value: 38, color: '#D4AF37' },
  { name: 'Home',     value: 25, color: '#3B82F6' },
  { name: 'Business', value: 20, color: '#10B981' },
  { name: 'Vehicle',  value: 10, color: '#A855F7' },
  { name: 'Education',value: 7,  color: '#F97316' },
]

const TOOLTIP_STYLE = {
  backgroundColor: '#0F1629',
  border: '1px solid #1E2D4A',
  borderRadius: '8px',
  color: '#F0E6C8',
}

// ─── Sub-Components ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE} className="p-3 text-sm">
      <p className="text-gold-400 font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-6">
          <span>{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  accentColor?: string
  trend?: { value: number; isUp: boolean }
  delay?: number
}
function StatCard({ title, value, subtitle, icon, accentColor = '#D4AF37', trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card group cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-navy-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: accentColor }}>{value}</p>
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
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LoanAdminDashboard() {
  const { user } = useAuthStore()
  const [recentLoans, setRecentLoans] = useState<Loan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0,
    disbursed: 0, rejected: 0, totalDisbursed: 0,
  })

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const [loansRes, recentRes] = await Promise.all([
        supabase
          .from('loans')
          .select('id, status, loan_amount')
          .eq('is_deleted', false),
        supabase
          .from('loans')
          .select('*, customer:customers(full_name, phone), agent:profiles!loans_agent_id_fkey(full_name)')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(8),
      ])

      const allLoans = loansRes.data || []
      setStats({
        total:         allLoans.length,
        pending:       allLoans.filter(l => ['lead', 'verification'].includes(l.status)).length,
        approved:      allLoans.filter(l => l.status === 'approved').length,
        disbursed:     allLoans.filter(l => l.status === 'disbursed').length,
        rejected:      allLoans.filter(l => l.status === 'rejected').length,
        totalDisbursed:allLoans.filter(l => l.status === 'disbursed').reduce((s, l) => s + (l.loan_amount || 0), 0),
      })
      setRecentLoans((recentRes.data as unknown as Loan[]) || [])
    } catch (err) {
      console.error('[LoanAdminDashboard]', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStatusChange(loanId: string, newStatus: LoanStatus) {
    const { error } = await supabase
      .from('loans')
      .update({ status: newStatus, admin_id: user?.user_id, updated_at: new Date().toISOString() })
      .eq('id', loanId)

    if (error) {
      toast.error('Failed to update loan status')
      return
    }
    toast.success(`Loan ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`)
    setRecentLoans(prev => prev.map(l => l.id === loanId ? { ...l, status: newStatus } : l))
    setStats(prev => ({
      ...prev,
      pending:  prev.pending - 1,
      approved: newStatus === 'approved' ? prev.approved + 1 : prev.approved,
      rejected: newStatus === 'rejected' ? prev.rejected + 1 : prev.rejected,
    }))
  }

  const statCards = [
    { title: 'Total Applications', value: stats.total,     subtitle: 'All time',          icon: <FileText className="w-5 h-5" />,   accentColor: '#D4AF37', trend: { value: 14, isUp: true },  delay: 0 },
    { title: 'Pending Review',     value: stats.pending,   subtitle: 'Awaiting decision', icon: <Clock className="w-5 h-5" />,      accentColor: '#EAB308', trend: { value: 3,  isUp: false }, delay: 0.05 },
    { title: 'Approved',           value: stats.approved,  subtitle: 'Ready to disburse', icon: <CheckCircle className="w-5 h-5" />,accentColor: '#10B981', trend: { value: 18, isUp: true },  delay: 0.1 },
    { title: 'Disbursed',          value: stats.disbursed, subtitle: 'Funds released',    icon: <Banknote className="w-5 h-5" />,   accentColor: '#3B82F6', trend: { value: 12, isUp: true },  delay: 0.15 },
    { title: 'Rejected',           value: stats.rejected,  subtitle: 'Declined',          icon: <XCircle className="w-5 h-5" />,    accentColor: '#EF4444', trend: { value: 2,  isUp: false }, delay: 0.2 },
    { title: 'Total Disbursed',    value: formatCurrency(stats.totalDisbursed), subtitle: 'Cumulative amount', icon: <DollarSign className="w-5 h-5" />, accentColor: '#D4AF37', trend: { value: 22, isUp: true }, delay: 0.25 },
  ]

  const quickActions = [
    { label: 'Review Applications', icon: <ClipboardList className="w-5 h-5" />, color: '#D4AF37', href: '/admin/loans/applications' },
    { label: 'Manage Agents',       icon: <Users className="w-5 h-5" />,          color: '#3B82F6', href: '/admin/users' },
    { label: 'View Reports',        icon: <BarChart2 className="w-5 h-5" />,      color: '#10B981', href: '/admin/reports' },
  ]

  return (
    <AppShell pageTitle="Loan Admin Dashboard">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Loan Administration <span className="gold-text">Dashboard</span>
        </h1>
        <p className="text-navy-400 text-sm mt-1">
          Manage loan applications, approvals, and disbursements across all branches.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Applications Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="lg:col-span-2 gfs-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-foreground font-semibold">Monthly Applications</h3>
              <p className="text-navy-400 text-xs mt-0.5">Applications vs approvals vs disbursements</p>
            </div>
            <span className="badge-approved text-xs">+14% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
              <XAxis dataKey="month" tick={{ fill: '#8A9BBE', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A9BBE', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#8A9BBE', fontSize: '12px' }} />
              <Bar dataKey="applications" name="Applications" fill="#D4AF37"  radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved"     name="Approved"     fill="#10B981"  radius={[4, 4, 0, 0]} />
              <Bar dataKey="disbursed"    name="Disbursed"    fill="#3B82F6"  radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Loan Type Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="gfs-card p-6"
        >
          <div className="mb-4">
            <h3 className="text-foreground font-semibold">Loan Type Distribution</h3>
            <p className="text-navy-400 text-xs mt-0.5">By application count</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={loanTypeData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                {loanTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {loanTypeData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-navy-300">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Applications + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="lg:col-span-2 gfs-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-semibold">Recent Applications</h3>
              <p className="text-navy-400 text-xs mt-0.5">Latest loan submissions</p>
            </div>
            <a href="/admin/loans/applications" className="text-gold-500 text-xs hover:text-gold-400 flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </a>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-navy-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="gfs-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {recentLoans.map((loan, idx) => {
                      const customer = (loan as any).customer
                      const isPending = ['lead', 'verification'].includes(loan.status)
                      return (
                        <motion.tr
                          key={loan.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                        >
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold shrink-0">
                                {generateInitials(customer?.full_name || 'UN')}
                              </div>
                              <span className="text-sm text-foreground font-medium truncate max-w-[120px]">
                                {customer?.full_name || '—'}
                              </span>
                            </div>
                          </td>
                          <td><span className="text-navy-300 text-xs">{getLoanTypeLabel(loan.loan_type)}</span></td>
                          <td><span className="text-gold-400 font-semibold text-sm">{formatCurrency(loan.loan_amount)}</span></td>
                          <td>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getLoanStatusColor(loan.status))}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                          <td><span className="text-navy-400 text-xs">{formatDate(loan.created_at)}</span></td>
                          <td>
                            {isPending ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleStatusChange(loan.id, 'approved')}
                                  className="p-1 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(loan.id, 'rejected')}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-navy-500 text-xs">—</span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                  {!isLoading && recentLoans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-navy-400 py-8">No loan applications found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="gfs-card p-6 flex flex-col gap-4"
        >
          <div className="mb-2">
            <h3 className="text-foreground font-semibold">Quick Actions</h3>
            <p className="text-navy-400 text-xs mt-0.5">Jump to key workflows</p>
          </div>
          {quickActions.map(action => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-navy-700 hover:border-gold-500/40 bg-navy-800/40 hover:bg-navy-800/70 transition-all group"
            >
              <div
                className="p-2.5 rounded-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15`, border: `1px solid ${action.color}25` }}
              >
                <div style={{ color: action.color }}>{action.icon}</div>
              </div>
              <span className="text-foreground text-sm font-medium group-hover:text-gold-400 transition-colors">
                {action.label}
              </span>
              <ChevronRight className="w-4 h-4 text-navy-500 ml-auto group-hover:text-gold-500 transition-colors" />
            </a>
          ))}

          {/* Pending alert */}
          {stats.pending > 0 && (
            <div className="mt-2 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-semibold">Action Required</span>
              </div>
              <p className="text-navy-300 text-xs">
                {stats.pending} application{stats.pending !== 1 ? 's' : ''} awaiting your review.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  )
}
