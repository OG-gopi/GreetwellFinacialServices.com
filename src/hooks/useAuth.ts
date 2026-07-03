import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { getDashboardPath } from '@/middleware/RouteGuard'
import type { UserRole } from '@/types'

export function useAuth() {
  const { user, role, isAuthenticated, isLoading, signOut, initialize } = useAuthStore()

  useEffect(() => {
    if ((supabase as any).supabaseUrl.includes('placeholder-project.supabase.co')) {
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await initialize()
      }
      if (event === 'SIGNED_OUT') {
        useAuthStore.getState().setUser(null)
      }
      if (event === 'TOKEN_REFRESHED' && session) {
        // Session refreshed silently
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const redirectPath = getDashboardPath(role)
  const isSuperAdmin = role === 'superadmin'
  const isAdmin = role?.endsWith('_admin') || false
  const isAgent = role?.endsWith('_agent') || false
  const module = getModuleFromRole(role)

  async function signIn(email: string, password: string) {
    if ((supabase as any).supabaseUrl.includes('placeholder-project.supabase.co')) {
      // Mock Authentication for offline demo mode
      const normalizedEmail = email.toLowerCase().trim()
      let mockRole: UserRole = 'superadmin'
      let mockName = 'GFS Executive Officer'
      
      if (normalizedEmail.startsWith('superadmin')) {
        mockRole = 'superadmin'
        mockName = 'GFS Chief Executive'
      } else if (normalizedEmail.startsWith('loanadmin')) {
        mockRole = 'loan_admin'
        mockName = 'GFS Head of Loans'
      } else if (normalizedEmail.startsWith('insuranceadmin')) {
        mockRole = 'insurance_admin'
        mockName = 'GFS Head of Insurance'
      } else if (normalizedEmail.startsWith('investmentadmin')) {
        mockRole = 'investment_admin'
        mockName = 'GFS Head of Investments'
      } else if (normalizedEmail.startsWith('loanagent')) {
        mockRole = 'loan_agent'
        mockName = 'GFS Loan Specialist'
      } else if (normalizedEmail.startsWith('insuranceagent')) {
        mockRole = 'insurance_agent'
        mockName = 'GFS Insurance Specialist'
      } else if (normalizedEmail.startsWith('investmentagent')) {
        mockRole = 'investment_agent'
        mockName = 'GFS Wealth Specialist'
      } else if (normalizedEmail.startsWith('agent')) {
        mockRole = 'loan_agent'
        mockName = 'GFS Advisor'
      } else {
        mockRole = 'superadmin'
        mockName = 'GFS Demo Admin'
      }

      const mockProfile = {
        id: 'mock-user-id',
        user_id: 'mock-user-id',
        full_name: mockName,
        email: normalizedEmail,
        role: mockRole,
        module: getModuleFromRole(mockRole) as any,
        is_active: true,
        is_blocked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      useAuthStore.getState().setUser(mockProfile)
      return { data: { user: mockProfile } }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { data }
  }

  // OTP MOCK
  async function generateOTP(mobileOrEmail: string) {
    // In a real scenario, this calls Supabase OTP endpoint
    // For offline demo, just return success immediately
    return { data: { message: 'OTP sent successfully to ' + mobileOrEmail } }
  }

  async function verifyOTP(mobileOrEmail: string, otp: string, service?: string | null) {
    if ((supabase as any).supabaseUrl.includes('placeholder-project.supabase.co')) {
      // Mock Authentication for OTP
      let mockRole: UserRole = 'loan_agent'
      let mockName = 'GFS Customer'
      
      if (service === 'insurance') mockRole = 'insurance_agent'
      else if (service === 'investments') mockRole = 'investment_agent'
      
      const mockProfile = {
        id: 'mock-user-id-otp',
        user_id: 'mock-user-id-otp',
        full_name: mockName,
        email: mobileOrEmail.includes('@') ? mobileOrEmail : `${mobileOrEmail}@gfs.com`,
        phone: mobileOrEmail.includes('@') ? '' : mobileOrEmail,
        role: mockRole,
        module: getModuleFromRole(mockRole) as any,
        is_active: true,
        is_blocked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      useAuthStore.getState().setUser(mockProfile)
      return { data: { user: mockProfile } }
    }

    // Real Supabase verify (if implemented)
    const { data, error } = await supabase.auth.verifyOtp({ email: mobileOrEmail, token: otp, type: 'magiclink' })
    if (error) return { error: error.message }
    return { data }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: error.message }
    return { data }
  }

  async function sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: error.message }
    return {}
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: error.message }
    return {}
  }

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    isAdmin,
    isAgent,
    module,
    redirectPath,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    generateOTP,
    verifyOTP,
  }
}

function getModuleFromRole(role?: UserRole | null): string {
  if (!role) return 'all'
  if (role === 'superadmin') return 'all'
  if (role.includes('loan')) return 'loans'
  if (role.includes('insurance')) return 'insurance'
  if (role.includes('investment')) return 'investments'
  return 'all'
}
