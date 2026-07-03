import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import type { Module, UserRole } from '@/types'
import {
  LayoutDashboard, Users, FileText, Calculator, 
  Clock, Shield, TrendingUp, Briefcase, Bell, 
  Search, Menu, X, LogOut, ChevronRight, Coins, AlignJustify, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'

interface DashboardLayoutProps {
  role: 'customer' | 'agent' | 'admin'
  service: Module
}

export default function DashboardLayout({ role: roleProp, service }: DashboardLayoutProps) {
  const role = roleProp as any
  const { user } = useAuthStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Desktop sidebar: open by default
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    let portalLogin = '/login';
    if (location.pathname.startsWith('/loans')) portalLogin = '/loans/login';
    else if (location.pathname.startsWith('/insurance')) portalLogin = '/insurance/login';
    else if (location.pathname.startsWith('/investment')) portalLogin = '/investment/login';
    else if (location.pathname.startsWith('/chits')) portalLogin = '/chits/login';

    await signOut()
    navigate(portalLogin)
  }

  // ─── Dynamic Greeting ───
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // ─── Theme Config based on Service ───
  const themeMap: Record<string, any> = {
    loans: {
      color: 'emerald',
      bgLight: 'bg-emerald-50',
      textActive: 'text-emerald-600',
      bgActive: 'bg-emerald-600',
      borderActive: 'border-emerald-600',
      navActive: 'bg-gradient-to-r from-emerald-50 to-white/50 text-emerald-600 shadow-[0_4px_15px_rgba(59,130,246,0.05)] border border-white',
      toggleColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Loans'
    },
    insurance: {
      color: 'blue',
      bgLight: 'bg-blue-50',
      textActive: 'text-blue-600',
      bgActive: 'bg-blue-600',
      borderActive: 'border-blue-600',
      navActive: 'bg-gradient-to-r from-blue-50 to-white/50 text-blue-600 shadow-[0_4px_15px_rgba(59,130,246,0.05)] border border-white',
      toggleColor: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      icon: <Shield className="w-5 h-5" />,
      label: 'Insurance'
    },
    investments: {
      color: 'amber',
      bgLight: 'bg-amber-50',
      textActive: 'text-amber-600',
      bgActive: 'bg-amber-500',
      borderActive: 'border-amber-500',
      navActive: 'bg-gradient-to-r from-amber-50 to-white/50 text-amber-600 shadow-[0_4px_15px_rgba(59,130,246,0.05)] border border-white',
      toggleColor: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100',
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Investments'
    },
    chits: {
      color: 'blue',
      bgLight: 'bg-blue-50',
      textActive: 'text-blue-600',
      bgActive: 'bg-blue-600',
      borderActive: 'border-blue-600',
      navActive: 'bg-gradient-to-r from-blue-50 to-white/50 text-blue-600 shadow-[0_4px_15px_rgba(59,130,246,0.05)] border border-white',
      toggleColor: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      icon: <Coins className="w-5 h-5" />,
      label: 'Chit Fund'
    },
    all: {
      color: 'slate',
      bgLight: 'bg-slate-50',
      textActive: 'text-slate-600',
      bgActive: 'bg-slate-800',
      borderActive: 'border-slate-800',
      navActive: 'bg-gradient-to-r from-slate-50 to-white/50 text-slate-800 shadow-[0_4px_15px_rgba(59,130,246,0.05)] border border-white',
      toggleColor: 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Admin'
    }
  }
  const theme = themeMap[service as string] || themeMap.all

  // ─── Dynamic Sidebar Links ───
  const getSidebarLinks = () => {
    let portalPrefix = 'loans';
    if (location.pathname.startsWith('/insurance') || service === 'insurance') {
      portalPrefix = 'insurance';
    } else if (location.pathname.startsWith('/investment') || service === 'investments') {
      portalPrefix = 'investment';
    } else if (location.pathname.startsWith('/chits') || service === 'chits') {
      portalPrefix = 'chits';
    }

    let rolePath = 'customer';
    if (role === 'admin' || role === 'superadmin' || role === 'chit_admin') rolePath = 'admin';
    else if (role === 'agent') rolePath = 'adviser';

    const basePath = `/${portalPrefix}/${rolePath}`;
    
    const commonCustomer = [{ label: 'Support', icon: <Search size={20} />, path: `${basePath}/support` }]
    
    if (role === 'customer') {
      switch (service) {
        case 'loans': return [
          { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: `${basePath}/dashboard` },
          { label: 'Loan Applications', icon: <FileText size={20} />, path: `${basePath}/applications` },
          { label: 'EMI Calculator', icon: <Calculator size={20} />, path: `${basePath}/calculator` },
          { label: 'Repayment Status', icon: <Clock size={20} />, path: `${basePath}/repayments` },
          ...commonCustomer
        ]
        case 'insurance': return [
          { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: `${basePath}/dashboard` },
          { label: 'Policies', icon: <Shield size={20} />, path: `${basePath}/policies` },
          { label: 'Claims', icon: <FileText size={20} />, path: `${basePath}/claims` },
          { label: 'Renewals', icon: <Clock size={20} />, path: `${basePath}/renewals` },
          ...commonCustomer
        ]
        case 'investments': return [
          { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: `${basePath}/dashboard` },
          { label: 'Portfolio', icon: <Briefcase size={20} />, path: `${basePath}/portfolio` },
          { label: 'SIP Tracking', icon: <TrendingUp size={20} />, path: `${basePath}/sip` },
          { label: 'Mutual Funds', icon: <FileText size={20} />, path: `${basePath}/funds` },
          { label: 'Monthly Chit Fund', icon: <Coins size={20} />, path: `${basePath}/chits` },
          ...commonCustomer
        ]
      }
    }

    if (role === 'agent') {
      return [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: `${basePath}/dashboard` },
        { label: 'Customers', icon: <Users size={20} />, path: `${basePath}/customers` },
        { label: 'Calculator', icon: <Calculator size={20} />, path: `${basePath}/calculator` },
        { label: 'Follow-ups', icon: <Clock size={20} />, path: `${basePath}/follow-ups` },
      ]
    }

    // Admin links
    return [
      { label: 'Overview', icon: <LayoutDashboard size={20} />, path: `${basePath}/dashboard` },
      { label: 'Users', icon: <Users size={20} />, path: `${basePath}/users` },
      { label: 'Agent Approvals', icon: <Shield size={20} />, path: `${basePath}/approvals` },
      { label: 'System Logs', icon: <FileText size={20} />, path: `${basePath}/audit-logs` }
    ]
  }

  const links = getSidebarLinks()

  if (role === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#070b12]">
        <Outlet />
      </div>
    )
  }

  const RoleTitle = role.charAt(0).toUpperCase() + role.slice(1)
  const ServiceTitle = service.charAt(0).toUpperCase() + service.slice(1)
  const headerTitle = role === 'admin' ? 'Admin Dashboard' : `${ServiceTitle} ${RoleTitle} Dashboard`

  // ─── Shared Sidebar Content ───
  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Logo / Brand */}
      <div className="dash-sidebar-brand h-[88px] flex items-center justify-center border-b border-slate-200/40 shrink-0 px-4 gap-3">
        <div className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center relative overflow-hidden shadow-sm shrink-0 border border-slate-200/20">
          <img src="/logo.png" alt="GFS" className="w-full h-full object-contain z-10 p-1" />
        </div>
        <div className="dash-sidebar-brand-text flex flex-col">
          <span className="font-black text-[#0a1f44] text-[11px] leading-tight tracking-wider uppercase">
            Greetwell
          </span>
          <span className="font-black text-[#0a1f44] text-[11px] leading-tight tracking-wider uppercase">
            Financial Services
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname.includes(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onLinkClick}
              className={`flex items-center px-4 py-3 rounded-full text-[14px] font-black transition-all group my-0.5 ${
                isActive
                  ? theme.navActive
                  : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800'
              }`}
            >
              <div className={`${isActive ? theme.textActive : 'text-slate-400 group-hover:text-slate-600'} transition-colors mr-3 shrink-0`}>
                {link.icon}
              </div>
              <span className="truncate">{link.label}</span>
              {isActive && <ChevronRight size={15} className="ml-auto opacity-50 shrink-0" />}
            </Link>
          )
        })}
      </div>

      {/* Sign Out */}
      <div className="p-4 shrink-0 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="h-screen flex overflow-hidden font-sans relative bg-slate-50 dashboard-layout-root">
      
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-slate-50" />

      {/* ══════════════════════════════════════════
          MOBILE OVERLAY BACKDROP
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="dashboard-sidebar-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MOBILE SIDEBAR DRAWER  (< 768px)
          Slides in from left as an overlay
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="dashboard-sidebar-mobile bg-gradient-to-b from-white to-[#f5f9ff] border-r border-slate-200/60 flex flex-col shadow-2xl"
          >
            {/* Close button inside mobile drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>

            <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          DESKTOP SIDEBAR  (≥ 768px)
          Toggleable via the header button
          Default: OPEN
      ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 272, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="dashboard-sidebar-desktop bg-gradient-to-b from-white to-[#f5f9ff] border-r border-slate-200/60 flex flex-col z-30 shadow-[4px_0_20px_rgba(0,0,0,0.04)] shrink-0 overflow-hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* ── TOP HEADER ── */}
        <header className="dashboard-header bg-white/95 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between shrink-0 z-20 relative shadow-sm">
          
          {/* ── LEFT: Hamburger toggle (always visible) + Logo fallback ── */}
          <div className="dash-header-left flex items-center gap-3">

            {/* 
              MOBILE: opens the mobile drawer
              DESKTOP: toggles the desktop sidebar open/closed
              This button is ALWAYS visible on all screen sizes.
              Default sidebar state = OPEN.
            */}
            <button
              onClick={() => {
                // On mobile (< 768px) → toggle mobile drawer
                // On desktop (≥ 768px) → toggle desktop sidebar
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(prev => !prev)
                } else {
                  setSidebarOpen(prev => !prev)
                }
              }}
              className={`dash-menu-toggle flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 shrink-0 ${
                sidebarOpen
                  ? `${theme.toggleColor}`
                  : 'text-slate-500 bg-white border-slate-200 hover:bg-slate-50'
              }`}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              title={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {sidebarOpen ? (
                  <motion.span
                    key="close-icon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate:  90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <PanelLeftClose size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open-icon"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <PanelLeftOpen size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Logo + brand (shown when sidebar is collapsed on desktop) */}
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="dash-collapsed-brand flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/40 shrink-0">
                    <img src="/logo.png" alt="GFS" className="w-full h-full object-contain p-0.5" />
                  </div>
                  <span className="font-extrabold text-[#0a1f44] text-[11px] tracking-wider hidden sm:block uppercase">
                    GFS Portal
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── CENTER: Greeting ── */}
          <div className="dash-header-center flex justify-center items-center">
            <span className="dash-greeting font-black text-[#0a1f44] tracking-wide">
              {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'} 👋
            </span>
          </div>

          {/* ── RIGHT: Bell + Profile ── */}
          <div className="dash-header-right flex items-center gap-3 relative">
            
            {/* Bell */}
            <Link
              to={`/${role === 'admin' ? 'admin' : role}/${service}/notifications`}
              className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors bg-white shadow-sm border border-slate-100"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </Link>

            {/* Profile Trigger */}
            <div
              onClick={() => setProfileOpen(prev => !prev)}
              className="dash-profile-trigger flex items-center gap-2 cursor-pointer pl-3 pr-1.5 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="dash-profile-name hidden sm:flex flex-col items-end pr-1">
                <span className="text-xs font-black text-[#0a1f44] leading-tight truncate max-w-[100px]">
                  {user?.full_name || 'Demo User'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {role} • {service}
                </span>
              </div>
              <div className={`w-9 h-9 ${theme.bgLight} ${theme.textActive} rounded-full flex items-center justify-center font-black border-2 ${theme.borderActive} shadow-sm text-sm shrink-0`}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="dash-profile-dropdown absolute top-full mt-2 right-0 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 p-2 z-50"
                >
                  <div className="p-3 border-b border-slate-100 mb-1">
                    <p className="text-sm font-black text-[#0a1f44] truncate">{user?.full_name}</p>
                    <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Link
                    to={`/${role === 'admin' ? 'admin' : role}/${service}/profile`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0a1f44] rounded-xl transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    to={`/${role === 'admin' ? 'admin' : role}/${service}/settings`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0a1f44] rounded-xl transition-colors"
                  >
                    Settings
                  </Link>
                  <Link
                    to={`/${role === 'admin' ? 'admin' : role}/${service}/notifications`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0a1f44] rounded-xl transition-colors"
                  >
                    Notifications
                  </Link>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={14} className="mr-2" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="dashboard-main flex-1 overflow-y-auto relative z-10">
          <div className="dashboard-inner-content mx-auto h-full flex flex-col">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}
