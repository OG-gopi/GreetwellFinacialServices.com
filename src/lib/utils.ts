import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { LoanType, InsuranceType, InvestmentType, LoanStatus, PolicyStatus, InvestmentStatus, RiskLevel, UserRole } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return formatDate(dateStr)
}

export function calculateEMI(principal: number, rate: number, tenureMonths: number): number {
  const monthlyRate = rate / (12 * 100)
  if (monthlyRate === 0) return principal / tenureMonths
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  return Math.round(emi)
}

export function maskAadhaar(aadhaar?: string): string {
  if (!aadhaar) return '—'
  return `XXXX XXXX ${aadhaar.slice(-4)}`
}

export function maskPAN(pan?: string): string {
  if (!pan) return '—'
  return `${pan.slice(0, 2)}XXXXX${pan.slice(-2)}`
}

export function getLoanTypeLabel(type: LoanType): string {
  const labels: Record<LoanType, string> = {
    personal: 'Personal Loan',
    education: 'Education Loan',
    business: 'Business Loan',
    home: 'Home Loan',
    vehicle: 'Vehicle Loan',
  }
  return labels[type]
}

export function getInsuranceTypeLabel(type: InsuranceType): string {
  const labels: Record<InsuranceType, string> = {
    health: 'Health Insurance',
    life: 'Life Insurance',
    vehicle: 'Vehicle Insurance',
    property: 'Property Insurance',
    travel: 'Travel Insurance',
  }
  return labels[type]
}

export function getInvestmentTypeLabel(type: InvestmentType): string {
  const labels: Record<InvestmentType, string> = {
    mutual_fund: 'Mutual Fund',
    sip: 'SIP',
    stocks: 'Stocks',
    fixed_deposit: 'Fixed Deposit',
    bonds: 'Bonds',
    gold: 'Gold',
    chits: 'Monthly Chit Fund',
  }
  return labels[type]
}

export function getLoanStatusColor(status: LoanStatus): string {
  const colors: Record<LoanStatus, string> = {
    lead: 'badge-pending',
    verification: 'badge-active',
    approved: 'badge-approved',
    disbursed: 'badge-approved',
    closed: 'badge-closed',
    rejected: 'badge-rejected',
  }
  return colors[status]
}

export function getPolicyStatusColor(status: PolicyStatus): string {
  const colors: Record<PolicyStatus, string> = {
    active: 'badge-approved',
    expired: 'badge-closed',
    cancelled: 'badge-rejected',
    pending: 'badge-pending',
    claimed: 'badge-active',
  }
  return colors[status]
}

export function getInvestmentStatusColor(status: InvestmentStatus): string {
  const colors: Record<InvestmentStatus, string> = {
    active: 'badge-approved',
    matured: 'badge-active',
    withdrawn: 'badge-closed',
    paused: 'badge-pending',
  }
  return colors[status]
}

export function getRiskColor(level: RiskLevel): string {
  return { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' }[level]
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    superadmin: 'Super Admin',
    loan_admin: 'Loan Admin',
    insurance_admin: 'Insurance Admin',
    investment_admin: 'Investment Admin',
    chit_admin: 'Chit Admin',
    loan_agent: 'Loan Agent',
    insurance_agent: 'Insurance Agent',
    investment_agent: 'Investment Agent',
    customer: 'Customer',
    processing_team: 'Processing Team',
  }
  return labels[role]
}

export function getRoleModule(role: UserRole): string {
  if (role === 'superadmin') return 'all'
  if (role.includes('loan')) return 'loans'
  if (role.includes('insurance')) return 'insurance'
  if (role.includes('investment')) return 'investments'
  if (role.includes('chit')) return 'chits'
  return 'all'
}

export function isAdmin(role: UserRole): boolean {
  return role.endsWith('_admin') || role === 'superadmin'
}

export function isAgent(role: UserRole): boolean {
  return role.endsWith('_agent')
}

export function truncate(str: string, length: number = 30): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
