// GFS – Greetwell Financial Services
// Supabase Client Configuration

import { createClient } from '@supabase/supabase-js'
import type { Profile, Customer, Loan, InsurancePolicy, Investment } from '@/types'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (supabaseUrl === 'https://placeholder-project.supabase.co') {
  console.warn('[GFS] Supabase environment variables not set. Running in offline/demo mode with placeholder credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'gfs-auth-token',
  },
  global: {
    headers: {
      'x-application-name': 'gfs-platform',
    },
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Customer, 'id'>>
      }
      loans: {
        Row: Loan
        Insert: Omit<Loan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Loan, 'id'>>
      }
      insurance_policies: {
        Row: InsurancePolicy
        Insert: Omit<InsurancePolicy, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InsurancePolicy, 'id'>>
      }
      investments: {
        Row: Investment
        Insert: Omit<Investment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Investment, 'id'>>
      }
    }
  }
}

// Type re-exports
export type { Profile, Customer, Loan, InsurancePolicy, Investment } from '@/types'
