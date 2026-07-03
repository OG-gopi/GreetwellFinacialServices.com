import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// ─── Zod Schema ───────────────────────────────────────────────
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters required')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetFormData = z.infer<typeof resetSchema>

// ─── Password Strength Logic ──────────────────────────────────
interface StrengthRule {
  label: string
  test: (v: string) => boolean
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'Number', test: (v) => /[0-9]/.test(v) },
  { label: 'Special character (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

interface StrengthInfo {
  score: number          // 0-5
  label: string
  color: string
  barColor: string
}

function getStrength(password: string): StrengthInfo {
  const score = STRENGTH_RULES.filter((r) => r.test(password)).length
  if (score <= 1) return { score, label: 'Very Weak', color: 'text-red-400', barColor: 'bg-red-500' }
  if (score === 2) return { score, label: 'Weak', color: 'text-orange-400', barColor: 'bg-orange-500' }
  if (score === 3) return { score, label: 'Fair', color: 'text-yellow-400', barColor: 'bg-yellow-500' }
  if (score === 4) return { score, label: 'Strong', color: 'text-blue-400', barColor: 'bg-blue-500' }
  return { score, label: 'Very Strong', color: 'text-green-400', barColor: 'bg-green-500' }
}

// ─── Strength Bar ─────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  const strength = useMemo(() => getStrength(password), [password])
  const show = password.length > 0

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 space-y-2 overflow-hidden"
        >
          {/* Segmented bar */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full bg-navy-700 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${i < strength.score ? strength.barColor : ''}`}
                  initial={{ width: 0 }}
                  animate={{ width: i < strength.score ? '100%' : '0%' }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              </div>
            ))}
            <span className={`text-xs font-medium ml-2 w-20 ${strength.color}`}>
              {strength.label}
            </span>
          </div>

          {/* Rule checklist */}
          <div className="grid grid-cols-1 gap-1 pt-1">
            {STRENGTH_RULES.map((rule) => {
              const passed = rule.test(password)
              return (
                <div key={rule.label} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      passed ? 'bg-green-500/20 text-green-400' : 'bg-navy-700 text-navy-500'
                    }`}
                  >
                    {passed ? <Check size={9} /> : <X size={9} />}
                  </div>
                  <span className={`text-xs transition-colors ${passed ? 'text-green-400' : 'text-navy-500'}`}>
                    {rule.label}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  // Keep passwordValue synced for the strength indicator
  const watchedPassword = watch('password', '')

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true)
    setAuthError(null)

    const result = await updatePassword(data.password)

    if (result?.error) {
      setAuthError(result.error)
      setIsSubmitting(false)
      return
    }

    setIsSuccess(true)
    toast.success('Password updated!', { description: 'Your password has been changed successfully.' })

    setTimeout(() => navigate('/login', { replace: true }), 3500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg relative overflow-hidden p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold-500/[0.04] blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/[0.06] blur-3xl" />
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

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-2xl bg-[#070b12] border border-[#D4AF37]/40 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
          >
            <img
              src="/gfs-logo.png"
              alt="GFS"
              className="w-full h-full object-cover scale-110"
            />
          </motion.div>
          <motion.p
            className="text-slate-400 text-xs mt-3 tracking-widest uppercase font-semibold text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Greetwell Financial Services
          </motion.p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {/* ── SUCCESS STATE ── */}
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                >
                  <CheckCircle2 size={38} className="text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
                <p className="text-navy-400 text-sm mb-6">
                  Your password has been successfully reset. Redirecting you to the login page…
                </p>
                <div className="flex items-center justify-center gap-2 text-navy-500 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Redirecting in a moment…
                </div>
              </motion.div>
            ) : (
              /* ── FORM STATE ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Header */}
                <div className="mb-7">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
                    <ShieldCheck size={22} className="text-gold-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Create new password</h2>
                  <p className="text-navy-400 text-sm">
                    Choose a strong password to protect your GFS account.
                  </p>
                </div>

                {/* Error Alert */}
                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mb-5 overflow-hidden"
                    >
                      <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-red-400 text-sm">{authError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* New Password */}
                  <div>
                    <label className="gfs-label">New Password</label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
                      />
                      <input
                        {...register('password', {
                          onChange: (e) => setPasswordValue(e.target.value),
                        })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="gfs-input pl-10 pr-10"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-400 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.password.message}
                      </p>
                    )}

                    {/* Password Strength Indicator */}
                    <StrengthBar password={watchedPassword || passwordValue} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="gfs-label">Confirm New Password</label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none"
                      />
                      <input
                        {...register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        className="gfs-input pl-10 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-gold-400 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Updating password…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Set New Password
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-navy-700/60 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-gold-400 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-navy-600 text-xs mt-6">
          © {new Date().getFullYear()} Greetwell Financial Services. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
