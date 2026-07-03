import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import PortalSelectionPage from '@/pages/auth/PortalSelectionPage'

// Chit Fund
import ChitAdminDashboard from '@/pages/chits/admin/ChitAdminDashboard'
import ChitCustomerDashboard from '@/pages/chits/customer/ChitCustomerDashboard'

// Error Pages
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Dashboards
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import GenericDashboardContent from '@/pages/dashboard/GenericDashboardContent'
import AgentDashboard from '@/pages/agent/AgentDashboard'
import CustomersPage from '@/pages/agent/CustomersPage'
import CustomerDetail from '@/pages/agent/CustomerDetail'
import AddCustomerPage from '@/pages/agent/AddCustomerPage'
import EMICalculator from '@/pages/agent/EMICalculator'
import FollowUpsPage from '@/pages/agent/FollowUpsPage'

// Super Admin Pages
import SuperAdminDashboard from '@/pages/superadmin/Dashboard'
import UsersPage from '@/pages/superadmin/UsersPage'
import AuditLogsPage from '@/pages/superadmin/AuditLogsPage'
import AgentApprovalsPage from '@/pages/superadmin/AgentApprovalsPage'

// Agent Portal
import AgentPortalDashboard from '@/pages/agent/AgentPortalDashboard'
import CustomerPortalDashboard from '@/pages/customer/CustomerPortalDashboard'
import ProcessingTeamDashboard from '@/pages/processing/ProcessingTeamDashboard'

// Route Guards
import { RouteGuard } from '@/middleware/RouteGuard'
import HomePage from '@/pages/HomePage'
import AgentSignupPage from '@/pages/AgentSignupPage'

import NotificationSimulator from '@/components/NotificationSimulator'

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" theme="light" />
      <NotificationSimulator />
      
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Public Auth Routes */}
        <Route path="/login" element={<RouteGuard requireAuth={false}><PortalSelectionPage /></RouteGuard>} />
        <Route path="/forgot-password" element={<RouteGuard requireAuth={false}><ForgotPasswordPage /></RouteGuard>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Agent Registration Routes */}
        <Route path="/signup/loan-agent" element={<AgentSignupPage agentType="loan-agent" />} />
        <Route path="/signup/insurance-agent" element={<AgentSignupPage agentType="insurance-agent" />} />
        <Route path="/signup/investment-agent" element={<AgentSignupPage agentType="investment-agent" />} />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />


        {/* ─── LOANS PORTAL ─────────────────────────────── */}
        <Route path="/loans" element={<Navigate to="/loans/login" replace />} />
        <Route path="/loans/login" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/loans/register" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/loans/forgot-password" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />

        <Route path="/loans/admin" element={<RouteGuard allowedRoles={['superadmin', 'loan_admin']} allowedModules={['loans', 'all']}><DashboardLayout role="admin" service="loans" /></RouteGuard>}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminDashboard />} />
          <Route path="approvals" element={<SuperAdminDashboard />} />
          <Route path="audit-logs" element={<SuperAdminDashboard />} />
        </Route>

        <Route path="/loans/adviser" element={<RouteGuard allowedRoles={['loan_agent', 'superadmin']} allowedModules={['loans', 'all']}><DashboardLayout role="agent" service="loans" /></RouteGuard>}>
          <Route path="dashboard" element={<AgentPortalDashboard />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/new" element={<AddCustomerPage />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="calculator" element={<EMICalculator />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
        </Route>

        <Route path="/loans/customer" element={<RouteGuard allowedRoles={['customer']} allowedModules={['loans', 'all']}><DashboardLayout role="customer" service="loans" /></RouteGuard>}>
          <Route path="dashboard" element={<CustomerPortalDashboard />} />
          <Route path="applications" element={<GenericDashboardContent />} />
          <Route path="calculator" element={<GenericDashboardContent />} />
          <Route path="repayments" element={<GenericDashboardContent />} />
          <Route path="support" element={<GenericDashboardContent />} />
        </Route>


        {/* ─── INSURANCE PORTAL ─────────────────────────────── */}
        <Route path="/insurance" element={<Navigate to="/insurance/login" replace />} />
        <Route path="/insurance/login" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/insurance/register" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/insurance/forgot-password" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />

        <Route path="/insurance/admin" element={<RouteGuard allowedRoles={['superadmin', 'insurance_admin']} allowedModules={['insurance', 'all']}><DashboardLayout role="admin" service="insurance" /></RouteGuard>}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminDashboard />} />
          <Route path="approvals" element={<SuperAdminDashboard />} />
          <Route path="audit-logs" element={<SuperAdminDashboard />} />
        </Route>

        <Route path="/insurance/adviser" element={<RouteGuard allowedRoles={['insurance_agent', 'superadmin']} allowedModules={['insurance', 'all']}><DashboardLayout role="agent" service="insurance" /></RouteGuard>}>
          <Route path="dashboard" element={<AgentPortalDashboard />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/new" element={<AddCustomerPage />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="calculator" element={<EMICalculator />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
        </Route>

        <Route path="/insurance/customer" element={<RouteGuard allowedRoles={['customer']} allowedModules={['insurance', 'all']}><DashboardLayout role="customer" service="insurance" /></RouteGuard>}>
          <Route path="dashboard" element={<CustomerPortalDashboard />} />
          <Route path="policies" element={<GenericDashboardContent />} />
          <Route path="claims" element={<GenericDashboardContent />} />
          <Route path="renewals" element={<GenericDashboardContent />} />
          <Route path="support" element={<GenericDashboardContent />} />
        </Route>


        {/* ─── INVESTMENT PORTAL ─────────────────────────────── */}
        <Route path="/investment" element={<Navigate to="/investment/login" replace />} />
        <Route path="/investment/login" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/investment/register" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />
        <Route path="/investment/forgot-password" element={<RouteGuard requireAuth={false}><LoginPage /></RouteGuard>} />

        <Route path="/investment/admin" element={<RouteGuard allowedRoles={['superadmin', 'investment_admin']} allowedModules={['investments', 'all']}><DashboardLayout role="admin" service="investments" /></RouteGuard>}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminDashboard />} />
          <Route path="approvals" element={<SuperAdminDashboard />} />
          <Route path="audit-logs" element={<SuperAdminDashboard />} />
        </Route>

        <Route path="/investment/adviser" element={<RouteGuard allowedRoles={['investment_agent', 'superadmin']} allowedModules={['investments', 'all']}><DashboardLayout role="agent" service="investments" /></RouteGuard>}>
          <Route path="dashboard" element={<AgentPortalDashboard />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/new" element={<AddCustomerPage />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="calculator" element={<EMICalculator />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
        </Route>

        <Route path="/investment/customer" element={<RouteGuard allowedRoles={['customer']} allowedModules={['investments', 'all']}><DashboardLayout role="customer" service="investments" /></RouteGuard>}>
          <Route path="dashboard" element={<CustomerPortalDashboard />} />
          <Route path="portfolio" element={<GenericDashboardContent />} />
          <Route path="sip" element={<GenericDashboardContent />} />
          <Route path="funds" element={<GenericDashboardContent />} />
          <Route path="chits" element={<ChitCustomerDashboard />} />
          <Route path="support" element={<GenericDashboardContent />} />
        </Route>



        {/* ─── LEGACY COMPATIBILITY ROUTES (PREVENTS BREAKS) ─── */}
        <Route path="/user/loans" element={<Navigate to="/loans/customer/dashboard" replace />} />
        <Route path="/user/insurance" element={<Navigate to="/insurance/customer/dashboard" replace />} />
        <Route path="/user/investments" element={<Navigate to="/investment/customer/dashboard" replace />} />
        <Route path="/user/chits" element={<Navigate to="/chits/customer/dashboard" replace />} />
        <Route path="/agent/loans" element={<Navigate to="/loans/adviser/dashboard" replace />} />
        <Route path="/agent/insurance" element={<Navigate to="/insurance/adviser/dashboard" replace />} />
        <Route path="/agent/investments" element={<Navigate to="/investment/adviser/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/loans/admin/dashboard" replace />} />
        <Route path="/customer/dashboard" element={<Navigate to="/loans/customer/dashboard" replace />} />
        <Route path="/processing/dashboard" element={<RouteGuard allowedRoles={['processing_team']}><ProcessingTeamDashboard /></RouteGuard>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
