import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, ArrowLeft, Home, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ─── Floating digit ───────────────────────────────────────────
function FloatingDigit({ digit, x, y, delay, size }: {
  digit: string
  x: string
  y: string
  delay: number
  size: number
}) {
  return (
    <motion.div
      className="absolute font-bold text-gold-500/[0.04] select-none pointer-events-none font-serif"
      style={{ left: x, top: y, fontSize: size }}
      animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
      transition={{ duration: 6 + delay, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {digit}
    </motion.div>
  )
}

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { redirectPath, isAuthenticated } = useAuth()

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  const floatingDigits = [
    { digit: '4', x: '5%',  y: '10%', delay: 0,   size: 120 },
    { digit: '0', x: '80%', y: '5%',  delay: 1,   size: 90  },
    { digit: '4', x: '90%', y: '60%', delay: 2,   size: 140 },
    { digit: '0', x: '2%',  y: '70%', delay: 0.5, size: 100 },
    { digit: '4', x: '50%', y: '85%', delay: 1.5, size: 80  },
    { digit: '0', x: '35%', y: '-2%', delay: 2.5, size: 70  },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center login-bg relative overflow-hidden px-4">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-15%] w-[700px] h-[700px] rounded-full bg-gold-500/[0.03] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-navy-700/[0.4] blur-3xl" />
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

      {/* Floating background digits */}
      {floatingDigits.map((d, i) => (
        <FloatingDigit key={i} {...d} />
      ))}

      {/* Main content */}
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
            className="w-14 h-14 object-contain opacity-70 drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]"
          />
        </motion.div>

        {/* Giant 404 */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, type: 'spring', stiffness: 120 }}
        >
          <h1 className="text-[130px] md:text-[160px] font-black leading-none font-serif tracking-tight select-none gold-text">
            404
          </h1>
        </motion.div>

        {/* Compass icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Compass size={32} className="text-gold-500/60" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
          <p className="text-navy-400 text-base leading-relaxed mb-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <p className="text-navy-500 text-sm mb-8">
            If you followed a link, it may be outdated. Try navigating to a valid section of the platform.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent mx-auto mb-8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.65 }}
        />

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          <button
            onClick={handleGoHome}
            className="btn-gold flex items-center justify-center gap-2 py-3 px-8"
          >
            <Home size={16} />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-outline-gold flex items-center justify-center gap-2 py-3 px-8"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          className="mt-10 p-4 rounded-xl bg-navy-800/40 border border-navy-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-start gap-3">
            <MapPin size={15} className="text-navy-500 mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-navy-400 text-xs font-medium mb-0.5">Lost? Try these links:</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {[
                  { label: 'Login', path: '/login' },
                  { label: 'Dashboard', path: isAuthenticated ? redirectPath : '/login' },
                ].map((link) => (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.path)}
                    className="text-gold-400/70 hover:text-gold-400 text-xs transition-colors underline-offset-2 hover:underline"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <p className="text-navy-600 text-xs mt-8">
          © {new Date().getFullYear()} Greetwell Financial Services
        </p>
      </div>
    </div>
  )
}
