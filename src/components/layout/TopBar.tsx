import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Menu,
  Home,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// ─── Breadcrumb helper ────────────────────────────────────────────────────────
const PATH_LABELS: Record<string, string> = {
  dashboard:     'Dashboard',
  users:         'Users',
  loans:         'Loans',
  insurance:     'Insurance',
  investments:   'Investments',
  branches:      'Branches',
  'audit-logs':  'Audit Logs',
  settings:      'Settings',
  agents:        'Agents',
  reports:       'Reports',
  customers:     'Customers',
  'follow-ups':  'Follow-ups',
  calculator:    'Calculator',
  claims:        'Claims',
  new:           'New',
  profile:       'Profile',
}

function useBreadcrumbs(): { label: string; path: string }[] {
  const location = useLocation()
  const segments = location.pathname.replace(/^\//, '').split('/').filter(Boolean)
  const crumbs = [{ label: 'Home', path: '/' }]
  let acc = ''
  for (const seg of segments) {
    acc += `/${seg}`
    crumbs.push({ label: PATH_LABELS[seg] ?? seg, path: acc })
  }
  return crumbs
}

// ─── Role display helpers ──────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  superadmin:       'Super Admin',
  loan_admin:       'Loan Admin',
  insurance_admin:  'Insurance Admin',
  investment_admin: 'Investment Admin',
  loan_agent:       'Loan Agent',
  insurance_agent:  'Insurance Agent',
  investment_agent: 'Investment Agent',
}

// ─── Mock notifications ────────────────────────────────────────────────────────
const MOCK_NOTIFS = [
  { id: '1', title: 'New Loan Application',    time: '2 min ago',  unread: true  },
  { id: '2', title: 'Policy renewal reminder', time: '1 hr ago',   unread: true  },
  { id: '3', title: 'Investment matured',      time: '3 hrs ago',  unread: false },
]

// ─── Props ────────────────────────────────────────────────────────────────────
interface TopBarProps {
  pageTitle?: string
  onMenuToggle?: () => void
}

export default function TopBar({ pageTitle, onMenuToggle }: TopBarProps) {
  const navigate = useNavigate()
  const { user, role, signOut } = useAuthStore()
  const breadcrumbs = useBreadcrumbs()

  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const notifRef   = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const unreadCount = MOCK_NOTIFS.filter((n) => n.unread).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GF'

  const displayTitle = pageTitle ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Dashboard'

  return (
    <header
      className="sticky top-0 z-35 flex items-center justify-between h-20 px-8 md:px-12 text-white overflow-hidden flex-shrink-0"
      style={{
        background: '#081f45', // Solid dark navy (TopBar)
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3)',
      }}
    >

      {/* ── Left: logo + breadcrumbs ─────────────────────────────── */}
      <div className="flex items-center gap-6 min-w-0 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-2">
          <img src="/logo.png" alt="GFS Logo" className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-full shadow-md border-2 border-white/20" />
          <div className="hidden sm:flex items-center ml-2">
            <span className="text-[12px] md:text-[14px] font-extrabold text-white uppercase tracking-widest leading-none">
              Greetwell Financial Services
            </span>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={crumb.path} className="flex items-center gap-1.5">
                {index === 0
                  ? (
                    <button
                      onClick={() => navigate('/')}
                      className="text-white/70 hover:text-[#D4AF37] transition-colors duration-150"
                    >
                      <Home size={13} />
                    </button>
                  )
                  : isLast
                  ? (
                    <span className="font-bold text-[#D4AF37] truncate max-w-[180px]">
                      {crumb.label}
                    </span>
                  )
                  : (
                    <button
                      onClick={() => navigate(crumb.path)}
                      className="text-white/70 hover:text-[#D4AF37] transition-colors duration-150 truncate max-w-[120px]"
                    >
                      {crumb.label}
                    </button>
                  )
                }
                {!isLast && (
                  <ChevronRight size={12} className="text-white/40 flex-shrink-0" />
                )}
              </span>
            )
          })}
        </nav>

        {/* Page title (mobile) */}
        <h1 className="md:hidden text-base font-bold text-[#D4AF37] truncate">
          {displayTitle}
        </h1>
      </div>

      {/* ── Center: page title (desktop) ──────────────────────────────── */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <h1 className="text-base font-bold text-[#D4AF37] tracking-wide font-serif">
          {displayTitle}
        </h1>
      </div>

      {/* ── Right: notification bell + avatar ─────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* ── Notification bell ─────────────────────────────────────── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false) }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white/70 transition-all duration-200 hover:text-[#D4AF37] hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1     }}
                exit={{    opacity: 0, y: -8, scale: 0.96  }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden z-50 bg-white border border-slate-200 shadow-2xl text-slate-800"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50"
                >
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-gold-600 border border-amber-100 font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {/* Items */}
                <ul className="max-h-72 overflow-y-auto no-scrollbar">
                  {MOCK_NOTIFS.map((n) => (
                    <li
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-slate-50 border-b border-slate-100"
                      style={{
                        background: n.unread ? 'rgba(212, 175, 55, 0.02)' : 'transparent',
                      }}
                    >
                      {n.unread && (
                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      )}
                      {!n.unread && <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5" />}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${n.unread ? 'text-slate-950' : 'text-slate-500'}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <button
                  className="w-full py-2.5 text-xs text-gold-600 font-bold transition-colors hover:bg-slate-50 border-t border-slate-100"
                  onClick={() => setNotifOpen(false)}
                >
                  Close notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Avatar dropdown ───────────────────────────────────────── */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false) }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl transition-all duration-200 hover:bg-white/10"
            aria-label="User menu"
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0 bg-[#070b12] border border-[#D4AF37]/35"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {initials}
            </div>

            {/* Name + role (md+) */}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                {user?.full_name ?? 'GFS User'}
              </p>
              <p className="text-[10px] text-white/60 leading-tight">
                {ROLE_LABELS[role ?? ''] ?? role}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1     }}
                exit={{    opacity: 0, y: -8, scale: 0.96  }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-52 rounded-xl overflow-hidden z-50 bg-white border border-slate-200 shadow-2xl text-slate-800"
              >
                {/* User info */}
                <div
                  className="px-4 py-3 border-b border-slate-100 bg-slate-50/50"
                >
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name ?? 'GFS User'}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email ?? ''}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {[
                    { icon: User,     label: 'Profile',  path: '/profile'  },
                    { icon: Settings, label: 'Settings', path: '/settings' },
                  ].map(({ icon: Icon, label, path }) => (
                    <button
                      key={path}
                      onClick={() => { navigate(path); setProfileOpen(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 transition-colors duration-150 hover:text-gold-600 hover:bg-slate-50"
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="py-1 border-t border-slate-100">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
