import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldOff, ArrowLeft, Home, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { redirectPath, isAuthenticated } = useAuth()

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-red-500/[0.04] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-navy-700/[0.5] blur-3xl" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,175,55,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="/gfs-logo.png"
            alt="GFS"
            className="w-16 h-16 object-contain opacity-80 drop-shadow-[0_0_10px_rgba(212,175,55,0.25)]"
          />
        </motion.div>

        {/* Animated lock icon */}
        <motion.div
          className="relative flex items-center justify-center mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 150 }}
        >
          {/* Pulsing rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-red-500/20"
              style={{ width: 80 + ring * 36, height: 80 + ring * 36 }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.15, 0.5] }}
              transition={{ duration: 3, delay: ring * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          <div className="relative w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <Lock size={36} className="text-red-400" />
          </div>
        </motion.div>

        {/* 403 text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-red-400/70 text-sm font-semibold tracking-[0.3em] uppercase mb-3">
            Error 403
          </p>
          <h1 className="text-5xl font-bold text-white mb-4 font-serif">
            Access <span className="text-red-400">Denied</span>
          </h1>
          <p className="text-navy-400 text-base leading-relaxed mb-2">
            You do not have permission to access this page.
          </p>
          <p className="text-navy-500 text-sm mb-10">
            Your current role does not include the required privileges.
            <br />
            Please contact your administrator if you believe this is an error.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent mx-auto mb-8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6 }}
        />

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            onClick={handleGoBack}
            className="btn-gold flex items-center justify-center gap-2 py-3 px-8"
          >
            <Home size={16} />
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-outline-gold flex items-center justify-center gap-2 py-3 px-8"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>

        {/* Footer info */}
        <motion.div
          className="mt-10 p-4 rounded-xl bg-navy-800/40 border border-navy-700/50 text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <div className="flex items-start gap-3">
            <ShieldOff size={16} className="text-navy-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-navy-400 text-xs font-medium mb-0.5">Why am I seeing this?</p>
              <p className="text-navy-500 text-xs leading-relaxed">
                GFS uses role-based access control (RBAC) to protect sensitive financial data.
                Each user role has specific module permissions. Unauthorized access attempts are
                logged and reported.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
