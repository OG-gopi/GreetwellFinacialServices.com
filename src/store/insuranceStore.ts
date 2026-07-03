import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { InsurancePolicy, PolicyStatus, InsuranceType } from '@/types'

interface InsuranceFilters {
  status?: PolicyStatus
  insurance_type?: InsuranceType
  agent_id?: string
  search?: string
}

interface InsuranceState {
  policies: InsurancePolicy[]
  selectedPolicy: InsurancePolicy | null
  isLoading: boolean
  filters: InsuranceFilters
  totalCount: number
  page: number
  fetchPolicies: (agentId?: string) => Promise<void>
  setSelectedPolicy: (policy: InsurancePolicy | null) => void
  setFilters: (filters: InsuranceFilters) => void
  setPage: (page: number) => void
  createPolicy: (policy: Omit<InsurancePolicy, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error?: string }>
  updatePolicy: (id: string, updates: Partial<InsurancePolicy>) => Promise<{ error?: string }>
}

export const useInsuranceStore = create<InsuranceState>((set, get) => ({
  policies: [],
  selectedPolicy: null,
  isLoading: false,
  filters: {},
  totalCount: 0,
  page: 1,

  fetchPolicies: async (agentId?: string) => {
    set({ isLoading: true })
    try {
      let query = supabase
        .from('insurance_policies')
        .select('*, customer:customers(*)', { count: 'exact' })
        .order('created_at', { ascending: false })

      const { filters } = get()
      if (agentId) query = query.eq('agent_id', agentId)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.insurance_type) query = query.eq('insurance_type', filters.insurance_type)

      const { data, count, error } = await query
      if (error) throw error
      set({ policies: (data as InsurancePolicy[]) || [], totalCount: count || 0 })
    } catch (error) {
      console.error('[GFS Insurance] Fetch error:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setSelectedPolicy: (policy) => set({ selectedPolicy: policy }),
  setFilters: (filters) => set({ filters }),
  setPage: (page) => set({ page }),

  createPolicy: async (policy) => {
    const { data, error } = await supabase.from('insurance_policies').insert(policy).select().single()
    if (error) return { error: error.message }
    set((state) => ({ policies: [data as InsurancePolicy, ...state.policies] }))
    return {}
  },

  updatePolicy: async (id, updates) => {
    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) return { error: error.message }
    set((state) => ({
      policies: state.policies.map((p) => (p.id === id ? (data as InsurancePolicy) : p)),
    }))
    return {}
  },
}))
