import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  Send, ShieldCheck, KeyRound, Lock, Eye, EyeOff
} from 'lucide-react'
import { useAgentWorkflowStore } from '@/store/agentWorkflowStore'

// ─── Background Orb ───────────────────────────────────────────
function BackgroundOrb({ x, y, size, color }: { x: string; y: string; size: string; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export default function ForgotPasswordPage() {
  const { resetAgentPassword, applications, addNotification } = useAgentWorkflowStore()
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Email, 2: OTP, 3: New Pass, 4: Success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Password strength check
  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 6) score += 20
    if (pass.length >= 8) score += 20
    if (/[A-Z]/.test(pass)) score += 20
    if (/[0-9]/.test(pass)) score += 20
    if (/[^A-Za-z0-9]/.test(pass)) score += 20
    return score
  }

  const strength = getPasswordStrength(newPassword)

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    setIsSubmitting(true)
    setAuthError(null)

    setTimeout(() => {
      // Find in applications list
      const agent = applications.find(a => a.email.toLowerCase() === email.toLowerCase())

      if (!agent && email !== 'admin@gfs.com' && email !== 'customer@gfs.com') {
        setAuthError('We could not find any GFS account with that email address.')
        setIsSubmitting(false)
        return
      }

      // Generate a mock 6-digit OTP code
      const generated = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedOtp(generated)
      
      // Dispatch in-app simulation notification
      addNotification({
        type: 'SMS',
        recipient: agent?.mobileNumber || '9121147777',
        body: `GFS Security: Your password reset verification OTP is ${generated}. Valid for 10 minutes.`
      })

      addNotification({
        type: 'Email',
        recipient: email,
        subject: 'Reset password authentication code',
        body: `Dear User,\n\nWe received a request to reset your GFS portal credentials. Use the code: ${generated} to authenticate.\n\nGFS Cyber Center.`
      })

      setIsSubmitting(false)
      setStep(2)
      toast.success('Security OTP dispatched successfully!')
    }, 800)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp !== generatedOtp && otp !== '123456') {
      setAuthError('Invalid OTP code. Please check the notification drawer or enter 123456.')
      return
    }
    setAuthError(null)
    setStep(3)
  }

  const handleResetPassSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      // Find agent and update
      const matchedAgent = applications.find(a => a.email.toLowerCase() === email.toLowerCase())
      if (matchedAgent) {
        resetAgentPassword(matchedAgent.id, newPassword)
      }
      setIsSubmitting(false)
      setStep(4)
      toast.success('Your credentials have been securely updated!')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b12] relative overflow-hidden p-4">
      {/* Animated background orbs */}
      <BackgroundOrb x="-10%" y="-10%" size="500px" color="rgba(212,175,55,0.05)" />
      <BackgroundOrb x="60%" y="60%" size="400px" color="rgba(26,51,128,0.08)" />

      <div className="w-full max-w-md relative z-10 font-sans">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-[#D4AF37]/30 p-1 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="GFS" className="w-full h-full object-cover rounded-xl" />
          </div>
          <p className="text-slate-500 text-xs mt-3 tracking-widest uppercase font-bold text-center">
            Greetwell Financial Services
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: EMAIL REQUEST */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-left"
              >
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center mb-4">
                    <Send className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-serif">Forgot Password</h2>
                  <p className="text-slate-400 text-xs mt-1">Enter your registered email below to receive a secure OTP code.</p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@gfs.com"
                        className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0f7d70] text-white py-3.5 rounded-xl font-extrabold text-sm shadow flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send OTP Verification'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: OTP CODE VERIFICATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-left"
              >
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center mb-4">
                    <KeyRound className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-serif">Enter OTP</h2>
                  <p className="text-slate-400 text-xs mt-1">We sent a secure code to your registered device. Enter it below.</p>
                </div>

                {/* Simulated Developer OTP Assistant banner */}
                <div className="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-cyan-300 text-xs leading-relaxed">
                  <strong>Demo Mode Assistant:</strong>
                  <br />
                  Sent OTP is: <strong className="text-white font-mono">{generatedOtp}</strong>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-center tracking-[8px] font-mono text-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3.5 rounded-xl font-extrabold text-sm shadow flex items-center justify-center gap-1.5"
                  >
                    Confirm & Verify OTP
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-left"
              >
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-serif">New Credentials</h2>
                  <p className="text-slate-400 text-xs mt-1">Please enter your new strong password below.</p>
                </div>

                <form onSubmit={handleResetPassSubmit} className="space-y-4">
                  {/* New password input */}
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength visualizer */}
                  {newPassword && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Strength Check:</span>
                        <span className={strength <= 40 ? 'text-rose-500' : strength <= 80 ? 'text-amber-500' : 'text-emerald-500'}>
                          {strength <= 40 ? 'Weak' : strength <= 80 ? 'Good' : 'Strong'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-950/80 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            strength <= 40 ? 'bg-rose-500' : strength <= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Confirm password input */}
                  <div>
                    <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-extrabold text-sm shadow flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Update Secure Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS RESET */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-emerald-500 animate-bounce" />
                </div>

                <h2 className="text-2xl font-bold text-white font-serif mb-2">Reset Successful</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Your GFS credentials have been securely updated. You can now sign in using your new password.
                </p>

                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-full font-extrabold text-sm shadow block transition-transform transform hover:-translate-y-0.5"
                >
                  Go to Sign In
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Back Link */}
        {step < 4 && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
