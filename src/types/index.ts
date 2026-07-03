// GFS Platform – Core TypeScript Types

export type UserRole =
  | 'superadmin'
  | 'loan_admin'
  | 'insurance_admin'
  | 'investment_admin'
  | 'chit_admin'
  | 'loan_agent'
  | 'insurance_agent'
  | 'investment_agent'
  | 'customer'
  | 'processing_team'

export type Module = 'loans' | 'insurance' | 'investments' | 'chits' | 'all'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  module: Module
  branch_id?: string
  avatar_url?: string
  is_active: boolean
  is_blocked: boolean
  verification_status?: 'pending' | 'approved' | 'rejected'
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  name: string
  city: string
  state: string
  address?: string
  manager_id?: string
  is_active: boolean
  created_at: string
}

// ─── Customer ─────────────────────────────────────────────────
export interface Customer {
  id: string
  full_name: string
  email?: string
  phone: string
  alternate_phone?: string
  aadhaar?: string
  pan?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  city?: string
  state?: string
  pincode?: string
  occupation?: string
  employer?: string
  monthly_income?: number
  cibil_score?: number
  bank_name?: string
  account_number?: string
  ifsc_code?: string
  agent_id: string
  branch_id?: string
  module: Module
  notes?: string
  created_at: string
  updated_at: string
}

// ─── Loans ────────────────────────────────────────────────────
export type LoanType = 'personal' | 'education' | 'business' | 'home' | 'vehicle'
export type LoanStatus = 'lead' | 'verification' | 'approved' | 'disbursed' | 'closed' | 'rejected'

export interface Loan {
  id: string
  customer_id: string
  customer?: Customer
  loan_type: LoanType
  loan_amount: number
  interest_rate: number
  tenure_months: number
  emi_amount?: number
  status: LoanStatus
  agent_id: string
  admin_id?: string
  branch_id?: string
  purpose?: string
  disbursement_date?: string
  remarks?: string
  rejection_reason?: string | null
  documents?: Document[]
  created_at: string
  updated_at: string
}

// ─── Insurance ────────────────────────────────────────────────
export type InsuranceType = 'health' | 'life' | 'vehicle' | 'property' | 'travel'
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'claimed'
export type ClaimStatus = 'filed' | 'under_review' | 'approved' | 'rejected' | 'settled'

export interface InsurancePolicy {
  id: string
  customer_id: string
  customer?: Customer
  policy_number: string
  insurance_type: InsuranceType
  provider: string
  sum_assured: number
  premium_amount: number
  premium_frequency: 'monthly' | 'quarterly' | 'annually'
  start_date: string
  end_date: string
  status: PolicyStatus
  agent_id: string
  admin_id?: string
  next_renewal_date?: string
  documents?: Document[]
  created_at: string
  updated_at: string
}

export interface InsuranceClaim {
  id: string
  policy_id: string
  customer_id: string
  claim_amount: number
  claim_date: string
  status: ClaimStatus
  description?: string
  settlement_amount?: number
  settled_date?: string
  created_at: string
}

// ─── Investments ──────────────────────────────────────────────
export type InvestmentType = 'mutual_fund' | 'sip' | 'stocks' | 'fixed_deposit' | 'bonds' | 'gold' | 'chits'
export type RiskLevel = 'low' | 'medium' | 'high'
export type InvestmentStatus = 'active' | 'matured' | 'withdrawn' | 'paused'

export interface Investment {
  id: string
  customer_id: string
  customer?: Customer
  investment_type: InvestmentType
  fund_name?: string
  invested_amount: number
  current_value?: number
  returns_amount?: number
  returns_percentage?: number
  risk_level: RiskLevel
  start_date: string
  maturity_date?: string
  status: InvestmentStatus
  sip_amount?: number
  sip_frequency?: 'weekly' | 'monthly' | 'quarterly'
  agent_id: string
  admin_id?: string
  created_at: string
  updated_at: string
}

// ─── Documents ────────────────────────────────────────────────
export type DocumentType = 'aadhaar' | 'pan' | 'salary_slip' | 'bank_statement' | 'photo' | 'other'

export interface Document {
  id: string
  customer_id?: string
  loan_id?: string
  policy_id?: string
  investment_id?: string
  doc_type: DocumentType
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_by: string
  created_at: string
}

// ─── Audit & Activity ─────────────────────────────────────────
export interface ActivityLog {
  id: string
  user_id: string
  user?: Profile
  action: string
  entity_type: string
  entity_id?: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface LoginHistory {
  id: string
  user_id: string
  ip_address?: string
  device?: string
  browser?: string
  location?: string
  success: boolean
  created_at: string
}

// ─── Notifications ────────────────────────────────────────────
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'reminder'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  link?: string
  created_at: string
}

// ─── CRM ──────────────────────────────────────────────────────
export interface FollowUp {
  id: string
  customer_id: string
  agent_id: string
  scheduled_at: string
  notes?: string
  is_completed: boolean
  created_at: string
}

export interface Note {
  id: string
  customer_id: string
  agent_id: string
  content: string
  created_at: string
}

// ─── Dashboard Stats ──────────────────────────────────────────
export interface DashboardStats {
  total_loans: number
  total_loan_amount: number
  total_policies: number
  total_premium: number
  total_investments: number
  total_investment_amount: number
  total_customers: number
  active_agents: number
  pending_applications: number
  monthly_revenue: number
  monthly_growth: number
}

export interface MonthlyData {
  month: string
  loans: number
  insurance: number
  investments: number
  revenue: number
}
