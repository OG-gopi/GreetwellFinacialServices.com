import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Shield, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PortalSelectionPage() {
  const navigate = useNavigate()

  const portals = [
    {
      id: 'loans',
      title: 'Loans Portal',
      description: 'Access personal, home, and business loan applications and management.',
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
      colorClass: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
      accentColor: 'text-emerald-500',
      path: '/loans/login',
    },
    {
      id: 'insurance',
      title: 'Insurance Portal',
      description: 'Manage health, term, life, and general insurance policies and claims.',
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      colorClass: 'hover:border-blue-500/50 hover:bg-blue-500/5',
      accentColor: 'text-blue-500',
      path: '/insurance/login',
    },
    {
      id: 'investments',
      title: 'Investment Portal',
      description: 'Track mutual funds, active SIPs, and wealth growth portfolios.',
      icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
      colorClass: 'hover:border-amber-500/50 hover:bg-amber-500/5',
      accentColor: 'text-amber-500',
      path: '/investment/login',
    },
  ]

  return (
    <div className="min-h-screen bg-[#071327] flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-[800px] bg-white rounded-[2rem] shadow-2xl p-8 sm:p-12 relative z-10 flex flex-col items-center">
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#0a1f44] rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border border-slate-100 mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/30 to-transparent"></div>
            <img src="/logo.png" alt="GFS Logo" className="w-full h-full object-cover z-10 p-1.5" />
          </div>
          <h1 className="font-serif font-bold text-[#0a1f44] text-[22px] tracking-tight text-center uppercase">
            Greetwell Financial Services
          </h1>
          <p className="text-[14px] text-slate-400 font-semibold mt-1">Unified Digital Hub</p>
        </div>

        <div className="text-center mb-10 max-w-[500px]">
          <h2 className="text-3xl font-bold text-[#0a1f44] font-serif mb-2 tracking-tight">Select Portal</h2>
          <p className="text-[14px] text-slate-500 font-medium">
            Please choose the specific financial category portal you wish to access or register for.
          </p>
        </div>

        {/* Portals list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
          {portals.map((portal) => (
            <button
              key={portal.id}
              onClick={() => navigate(portal.path)}
              className={`flex flex-col p-6 bg-[#f8fafc] border border-slate-100 rounded-2xl transition-all duration-300 text-left group ${portal.colorClass}`}
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                {portal.icon}
              </div>
              <h3 className="font-extrabold text-[#0a1f44] text-[17px] mb-2 flex items-center gap-1.5 group-hover:text-slate-900">
                {portal.title}
              </h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                {portal.id === 'investments' ? 'Wealth & SIP' : portal.id}
              </p>
              <p className="text-slate-500 text-[13px] leading-relaxed mb-4 flex-grow">
                {portal.description}
              </p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${portal.accentColor} group-hover:underline mt-auto`}>
                Enter Portal <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 text-[13px] font-bold text-slate-400 hover:text-slate-700 transition-colors border border-transparent hover:border-slate-100 px-5 py-2.5 rounded-full"
        >
          <ArrowLeft size={14} /> Back to main website
        </button>

        <div className="mt-8 pt-6 border-t border-slate-50 w-full text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Greetwell Financial Services. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  )
}
