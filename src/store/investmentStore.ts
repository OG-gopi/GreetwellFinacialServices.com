import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Investment, InvestmentStatus, InvestmentType } from '@/types'

interface InvestmentFilters {
  status?: InvestmentStatus
  investment_type?: InvestmentType
  agent_id?: string
  search?: string
}

interface InvestmentState {
  investments: Investment[]
  selectedInvestment: Investment | null
  isLoading: boolean
  filters: InvestmentFilters
  totalCount: number
  page: number
  fetchInvestments: (agentId?: string) => Promise<void>
  setSelectedInvestment: (inv: Investment | null) => void
  setFilters: (filters: InvestmentFilters) => void
  setPage: (page: number) => void
  createInvestment: (inv: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<{ error?: string }>
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  investments: [],
  selectedInvestment: null,
  isLoading: false,
  filters: {},
  totalCount: 0,
  page: 1,

  fetchInvestments: async (agentId?: string) => {
    set({ isLoading: true })
    try {
      let query = supabase
        .from('investments')
        .select('*, customer:customers(*)', { count: 'exact' })
        .order('created_at', { ascending: false })

      const { filters } = get()
      if (agentId) query = query.eq('agent_id', agentId)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.investment_type) query = query.eq('investment_type', filters.investment_type)

      const { data, count, error } = await query
      if (error) throw error
      set({ investments: (data as Investment[]) || [], totalCount: count || 0 })
    } catch (error) {
      console.error('[GFS Investments] Fetch error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setSelectedInvestment: (inv) => set({ selectedInvestment: inv }),
  setFilters: (filters) => set({ filters }),
  setPage: (page) => set({ page }),

  createInvestment: async (inv) => {
    const { data, error } = await supabase.from('investments').insert(inv).select().single()
    if (error) return { error: error.message }
    set((state) => ({ investments: [data as Investment, ...state.investments] }))
    return {}
  },

  updateInvestment: async (id, updates) => {
    const { data, error } = await supabase
      .from('investments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) return { error: error.message }
    set((state) => ({
      investments: state.investments.map((i) => (i.id === id ? (data as Investment) : i)),
    }))
    return {}
  },
}))
