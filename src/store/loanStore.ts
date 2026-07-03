import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Loan, LoanStatus, LoanType } from '@/types'

interface LoanFilters {
  status?: LoanStatus
  loan_type?: LoanType
  agent_id?: string
  search?: string
  date_from?: string
  date_to?: string
}

interface LoanState {
  loans: Loan[]
  selectedLoan: Loan | null
  isLoading: boolean
  filters: LoanFilters
  totalCount: number
  page: number
  pageSize: number
  fetchLoans: (agentId?: string, adminId?: string) => Promise<void>
  setSelectedLoan: (loan: Loan | null) => void
  setFilters: (filters: LoanFilters) => void
  setPage: (page: number) => void
  createLoan: (loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>
  updateLoan: (id: string, updates: Partial<Loan>) => Promise<{ error?: string }>
  updateStatus: (id: string, status: LoanStatus, remarks?: string) => Promise<{ error?: string }>
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  selectedLoan: null,
  isLoading: false,
  filters: {},
  totalCount: 0,
  page: 1,
  pageSize: 20,

  fetchLoans: async (agentId?: string, adminId?: string) => {
    set({ isLoading: true })
    try {
      let query = supabase
        .from('loans')
        .select('*, customer:customers(*)', { count: 'exact' })
        .order('created_at', { ascending: false })

      const { filters, page, pageSize } = get()

      if (agentId) query = query.eq('agent_id', agentId)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.loan_type) query = query.eq('loan_type', filters.loan_type)
      if (filters.search) {
        query = query.or(`customer.full_name.ilike.%${filters.search}%,customer.phone.ilike.%${filters.search}%`)
      }
      if (filters.date_from) query = query.gte('created_at', filters.date_from)
      if (filters.date_to) query = query.lte('created_at', filters.date_to)

      query = query.range((page - 1) * pageSize, page * pageSize - 1)

      const { data, count, error } = await query
      if (error) throw error
      set({ loans: (data as Loan[]) || [], totalCount: count || 0 })
    } catch (error) {
      console.error('[GFS Loans] Fetch error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setSelectedLoan: (loan) => set({ selectedLoan: loan }),
  setFilters: (filters) => set({ filters, page: 1 }),
  setPage: (page) => set({ page }),

  createLoan: async (loan) => {
    const { data, error } = await supabase.from('loans').insert(loan).select().single()
    if (error) return { error: error.message }
    set((state) => ({ loans: [data as Loan, ...state.loans] }))
    return {}
  },

  updateLoan: async (id, updates) => {
    const { data, error } = await supabase
      .from('loans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return { error: error.message }
    set((state) => ({
      loans: state.loans.map((l) => (l.id === id ? (data as Loan) : l)),
    }))
    return {}
  },

  updateStatus: async (id, status, remarks) => {
    return get().updateLoan(id, { status, remarks })
  },
}))
