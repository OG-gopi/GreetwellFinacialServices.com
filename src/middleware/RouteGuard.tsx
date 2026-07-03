import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole, Module } from '@/types'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  allowedModules?: Module[]
  requireAuth?: boolean
}

export function RouteGuard({ children, allowedRoles, allowedModules, requireAuth = true }: RouteGuardProps) {
  const { isAuthenticated, role, user, isInitialized } = useAuthStore()
  const module = user?.module
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    const portalLoginPath = location.pathname.startsWith('/insurance')
      ? '/insurance/login'
      : location.pathname.startsWith('/investment') || location.pathname.startsWith('/chits')
      ? '/investment/login'
      : location.pathname.startsWith('/loans')
      ? '/loans/login'
      : '/login';
    return <Navigate to={portalLoginPath} state={{ from: location }} replace />
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to appropriate dashboard based on role AND module
    return <Navigate to={getDashboardPath(role, module, location.pathname)} replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (allowedModules && module && !allowedModules.includes(module) && module !== 'all') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export function getDashboardPath(role?: UserRole | null, module?: Module | null, currentPath?: string): string {
  if (!role) return '/login'
  
  // Enforce portal path prefix if known or infer from role/module
  let portal = 'loans';
  if (currentPath) {
    if (currentPath.startsWith('/loans')) portal = 'loans';
    else if (currentPath.startsWith('/insurance')) portal = 'insurance';
    else if (currentPath.startsWith('/investment') || currentPath.startsWith('/chits')) portal = 'investment';
  } else {
    // Infer portal from role or module
    if (role.includes('insurance') || module === 'insurance') portal = 'insurance';
    else if (role.includes('investment') || module === 'investments' || role.includes('chit') || module === 'chits') portal = 'investment';
  }

  switch (role) {
    case 'superadmin':
      return `/${portal}/admin/dashboard`
    case 'loan_admin':
      return `/loans/admin/dashboard`
    case 'insurance_admin':
      return `/insurance/admin/dashboard`
    case 'investment_admin':
    case 'chit_admin':
      return `/investment/admin/dashboard`
    case 'customer':
      return `/${portal === 'investment' ? 'investment' : portal}/customer/dashboard`
    case 'processing_team':
      return `/processing/dashboard`
    case 'loan_agent':
      return `/loans/adviser/dashboard`
    case 'insurance_agent':
      return `/insurance/adviser/dashboard`
    case 'investment_agent':
      return `/investment/adviser/dashboard`
    default:
      return '/login'
  }
}
