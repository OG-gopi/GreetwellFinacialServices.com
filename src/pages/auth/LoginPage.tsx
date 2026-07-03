import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Eye, EyeOff, Lock, Loader2, AlertCircle, ShieldCheck, CheckCircle2,
  Briefcase, Shield, TrendingUp, User, Building, Smartphone, ArrowRight, ArrowLeft,
  Mail, CheckSquare, Square, ChevronDown
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { useAgentWorkflowStore } from '@/store/agentWorkflowStore'
import { getDashboardPath } from '@/middleware/RouteGuard'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { signIn, isAuthenticated } = useAuth()
  const { setUser, user } = useAuthStore()

  // Tab State matches the top tabs in the new UI
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot-password'>('signin')

  // Sign In State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Custom Portal Switcher dropdown state
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false)

  // Login OTP & Lockout State
  const [isVerifyingLoginOtp, setIsVerifyingLoginOtp] = useState(false)
  const [loginOtpCode, setLoginOtpCode] = useState('')
  const [generatedLoginOtp, setGeneratedLoginOtp] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState(3)
  const [pendingUserPayload, setPendingUserPayload] = useState<any>(null)
  
  // Registration State
  const [signupStep, setSignupStep] = useState<1|2|3|4|5>(1)
  const [signupService, setSignupService] = useState<'loans' | 'insurance' | 'investments' | 'chits' | null>('loans')
  const [signupRole, setSignupRole] = useState<'customer' | 'agent' | null>('customer')
  const [signupData, setSignupData] = useState({
    firstName: '', lastName: '', identifier: '', gender: '', companyName: '', password: '', confirmPassword: ''
  })
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpValue, setOtpValue] = useState('')

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1|2|3>(1)
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)

  const getPortalFromPath = () => {
    const path = location.pathname;
    if (path.startsWith('/loans')) return 'loans';
    if (path.startsWith('/insurance')) return 'insurance';
    if (path.startsWith('/investment') || path.startsWith('/chits')) return 'investments';
    return null;
  };
  const activePortal = getPortalFromPath();

  const getPortalName = (portal: string | null) => {
    if (portal === 'loans') return 'Loans';
    if (portal === 'insurance') return 'Insurance';
    if (portal === 'investments') return 'Investment';
    return 'GFS';
  };

  const isRoleAllowedInPortal = (userRole: string, userModule: string, portal: string | null): boolean => {
    if (!portal) return true;
    if (userRole === 'superadmin' || userRole === 'processing_team') return true;
    
    if (portal === 'loans') {
      return userRole === 'loan_admin' || userRole === 'loan_agent' || (userRole === 'customer' && userModule === 'loans');
    }
    if (portal === 'insurance') {
      return userRole === 'insurance_admin' || userRole === 'insurance_agent' || (userRole === 'customer' && userModule === 'insurance');
    }
    if (portal === 'investments') {
      return userRole === 'investment_admin' || userRole === 'investment_agent' || userRole === 'chit_admin' || (userRole === 'customer' && (userModule === 'investments' || userModule === 'chits'));
    }
    return false;
  };

  const checkLockout = (emailKey: string): boolean => {
    const lockoutTime = localStorage.getItem(`gfs_lockout_${emailKey.toLowerCase()}`)
    if (lockoutTime) {
      const hoursPassed = (Date.now() - Number(lockoutTime)) / (1000 * 60 * 60)
      if (hoursPassed < 24) {
        const remainingHours = Math.ceil(24 - hoursPassed)
        setAuthError(`Daily OTP limit exceeded. Locked out for ${remainingHours} more hours.`)
        return true
      } else {
        localStorage.removeItem(`gfs_lockout_${emailKey.toLowerCase()}`)
      }
    }
    return false
  }

  const handleVerifyLoginOtp = () => {
    if (loginOtpCode !== generatedLoginOtp) {
      const nextAttempts = remainingAttempts - 1
      setRemainingAttempts(nextAttempts)
      if (nextAttempts <= 0) {
        localStorage.setItem(`gfs_lockout_${email.toLowerCase()}`, Date.now().toString())
        setAuthError('Daily OTP limit exceeded. Locked out for 24 hours.')
        setIsVerifyingLoginOtp(false)
        toast.error('Too many incorrect attempts! Your account has been locked for 24 hours.')
      } else {
        toast.error(`Incorrect OTP code. ${nextAttempts} attempts remaining before daily lockout!`)
      }
      return
    }

    // Success!
    setUser(pendingUserPayload)
    toast.success(`Welcome back, ${pendingUserPayload.full_name}!`, { icon: '👋' })
    setIsVerifyingLoginOtp(false)
    
    // Redirect
    const targetPath = getDashboardPath(pendingUserPayload.role, pendingUserPayload.module, location.pathname)
    navigate(targetPath, { replace: true })
  }

  useEffect(() => {
    if (location.pathname.endsWith('/register') || location.pathname.endsWith('/signup')) {
      setActiveTab('signup');
    } else if (location.pathname.endsWith('/forgot-password')) {
      setActiveTab('forgot-password');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = getDashboardPath(user.role, user.module, location.pathname)
      navigate(targetPath, { replace: true })
    }
  }, [isAuthenticated, user, navigate, location.pathname])

  useEffect(() => {
    setAuthError(null)
  }, [activeTab])

  if (isAuthenticated) {
    return null
  }

  // ─── LOGIN HANDLER ───
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAgreed) {
      toast.error('Please agree to the Terms of Use before signing in.')
      return
    }
    
    // Check lockout first
    if (checkLockout(email)) return

    setIsSubmitting(true)
    setAuthError(null)

    setTimeout(() => {
      // Find all registrations matching the typed email
      const matchedApps = useAgentWorkflowStore.getState().applications.filter(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      )

      // Find the one corresponding to the current active portal
      const matchedApp = matchedApps.find(app => {
        if (activePortal === 'loans') {
          return app.agentType === 'loan-agent' || (app.agentType === 'customer' && app.dob === 'loans')
        }
        if (activePortal === 'insurance') {
          return app.agentType === 'insurance-agent' || (app.agentType === 'customer' && app.dob === 'insurance')
        }
        if (activePortal === 'investments') {
          return app.agentType === 'investment-agent' || (app.agentType === 'customer' && app.dob === 'investments')
        }
        return false
      })

      // Smart helper: if registered in other portals but not this one
      if (matchedApps.length > 0 && !matchedApp) {
        const registeredPortals = matchedApps.map(app => {
          if (app.agentType === 'loan-agent' || (app.agentType === 'customer' && app.dob === 'loans')) return 'Loans'
          if (app.agentType === 'insurance-agent' || (app.agentType === 'customer' && app.dob === 'insurance')) return 'Insurance'
          if (app.agentType === 'investment-agent' || (app.agentType === 'customer' && app.dob === 'investments')) return 'Investment'
          return null
        }).filter(Boolean)
        
        setAuthError(`This email is registered for the ${registeredPortals.join(' & ')} Portal. Please sign in there, or register for the ${getPortalName(activePortal)} Portal.`)
        setIsSubmitting(false)
        return
      }

      let matchedPayload: any = null

      if (matchedApp) {
        if (matchedApp.status === 'Pending Verification') {
          setAuthError('Your application is currently under admin verification.')
          setIsSubmitting(false)
          return
        }
        if (matchedApp.status === 'Hold') {
          setAuthError('Your application has been placed on Hold. Please contact GFS Verification Desk.')
          setIsSubmitting(false)
          return
        }
        if (matchedApp.status === 'Rejected') {
          setAuthError('Currently, your application has not been approved.')
          setIsSubmitting(false)
          return
        }
        
        // Approved agent check password
        if (password !== matchedApp.password) {
          setAuthError('Invalid credentials entered.')
          setIsSubmitting(false)
          return
        }

        const agentRole = matchedApp.agentType === 'insurance-agent' ? 'insurance_agent' : matchedApp.agentType === 'investment-agent' ? 'investment_agent' : (matchedApp.agentType === 'customer' ? 'customer' : 'loan_agent')
        const agentModule = matchedApp.agentType === 'insurance-agent' ? 'insurance' : matchedApp.agentType === 'investment-agent' ? 'investments' : (matchedApp.agentType === 'customer' ? matchedApp.dob : 'loans') 

        const resolvedRole = matchedApp.agentType === 'customer' ? 'customer' : agentRole
        const resolvedModule = matchedApp.agentType === 'customer' ? matchedApp.dob : agentModule

        if (!isRoleAllowedInPortal(resolvedRole, resolvedModule, activePortal)) {
          setAuthError(`Your account is not registered for the ${getPortalName(activePortal)} Portal.`)
          setIsSubmitting(false)
          return
        }

        matchedPayload = {
          id: matchedApp.id,
          user_id: matchedApp.id,
          role: resolvedRole as any,
          is_active: matchedApp.isActive,
          is_blocked: false,
          verification_status: 'approved',
          created_at: matchedApp.submissionDate,
          updated_at: new Date().toISOString(),
          email: matchedApp.email,
          full_name: matchedApp.fullName,
          module: resolvedModule
        }
      } else {
        // Default fallback bypass for standard demo profiles
        if (email === 'pending@gfs.com') {
          setAuthError('Your account is currently under admin verification.')
          setIsSubmitting(false)
          return
        }

        // Demo login fallback
        let mockModule: 'loans' | 'insurance' | 'investments' | 'chits' = 'loans'
        if (email.includes('insurance')) mockModule = 'insurance'
        if (email.includes('investments')) mockModule = 'investments'
        if (email.includes('chit')) mockModule = 'chits'

        let roleToNavigate = 'loan_agent'
        if (mockModule === 'insurance') roleToNavigate = 'insurance_agent'
        if (mockModule === 'investments') roleToNavigate = 'investment_agent'
        if (mockModule === 'chits') roleToNavigate = 'chit_admin'
        
        if (email.includes('customer') || email === 'ramesh@gfs.com') roleToNavigate = 'customer'
        if (email.includes('admin') || email.includes('demo')) roleToNavigate = 'superadmin'
        if (email.includes('ops') || email.includes('processing') || email.includes('verify')) roleToNavigate = 'processing_team'

        if (!isRoleAllowedInPortal(roleToNavigate, mockModule, activePortal)) {
          setAuthError(`Your account is not registered for the ${getPortalName(activePortal)} Portal.`)
          setIsSubmitting(false)
          return
        }

        matchedPayload = {
          id: 'demo-user-123',
          user_id: 'demo-user-123',
          role: roleToNavigate as any,
          is_active: true,
          is_blocked: false,
          verification_status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: email || 'demo@greetwell.com',
          full_name: roleToNavigate === 'customer' ? 'Demo Customer' : (roleToNavigate === 'superadmin' ? 'Demo Admin' : (roleToNavigate === 'processing_team' ? 'GFS compliance Officer' : 'Demo Agent')),
          module: mockModule
        }
      }

      if (matchedPayload) {
        setUser(matchedPayload)
        toast.success(`Welcome back, ${matchedPayload.full_name}!`, { icon: '👋' })
        
        // Redirect immediately to dashboard
        const targetPath = getDashboardPath(matchedPayload.role, matchedPayload.module, location.pathname)
        navigate(targetPath, { replace: true })
      }
      setIsSubmitting(false)
    }, 600)
  }

  // ─── REGISTRATION HANDLERS ───
  const checkPasswordStrength = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
    }
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAgreed) {
      toast.error('Please agree to the Terms of Use before signing up.')
      return
    }
    // Check if they are already registered for the selected portal
    const targetEmail = signupData.identifier.includes('@') ? signupData.identifier.toLowerCase() : `${signupData.identifier.toLowerCase()}@gfs.com`
    const alreadyRegistered = useAgentWorkflowStore.getState().applications.some(
      (a) => a.email.toLowerCase() === targetEmail && (
        (signupRole === 'agent' && a.agentType === (signupService === 'loans' ? 'loan-agent' : signupService === 'insurance' ? 'insurance-agent' : 'investment-agent')) ||
        (signupRole === 'customer' && a.agentType === 'customer' && a.dob === signupService)
      )
    )
    if (alreadyRegistered) {
      toast.error(`This email is already registered as a ${signupRole === 'agent' ? 'advisor' : 'customer'} for the ${signupService} Portal.`)
      return
    }
    if (!signupData.identifier || !signupData.gender || !signupData.password) {
      toast.error('Please fill in all mandatory fields.')
      return
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    setSignupStep(4) // Go to OTP
  }

  const handleVerifyOTP = () => {
    if (otpValue.length < 4) {
      toast.error('Please enter a valid OTP.')
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      // Save details to store so they can log in immediately
      const newApp = {
        id: `app-${Date.now()}`,
        fullName: `${signupData.firstName} ${signupData.lastName}`,
        mobileNumber: signupData.identifier.includes('@') ? '9999999999' : signupData.identifier,
        email: signupData.identifier.includes('@') ? signupData.identifier : `${signupData.identifier}@gfs.com`,
        gender: signupData.gender.toLowerCase(),
        dob: signupService || 'loans', // Store module key inside dob
        city: 'Hyderabad',
        state: 'Telangana',
        address: signupRole === 'agent' ? 'GFS Registered Adviser' : 'GFS Registered Customer',
        experience: 'N/A',
        qualification: 'Graduate',
        resumeName: 'customer_profile.pdf',
        documentName: 'AadharCard.pdf',
        profilePhotoName: 'avatar.png',
        agentType: signupRole === 'agent' 
          ? (signupService === 'loans' ? 'loan-agent' : signupService === 'insurance' ? 'insurance-agent' : 'investment-agent') 
          : 'customer' as any,
        password: signupData.password,
        isActive: true,
        status: 'Approved' as any,
        submissionDate: new Date().toISOString()
      }

      useAgentWorkflowStore.setState((state) => ({
        applications: [newApp, ...state.applications]
      }))

      setIsSubmitting(false)
      setSignupStep(5) // Success
    }, 1500)
  }

  // ─── FORGOT PASSWORD HANDLERS ───
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotIdentifier) return toast.error('Enter email or mobile')
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setForgotStep(2)
    }, 800)
  }

  const handleForgotVerifyOTP = () => {
    if (forgotOtp.length < 4) return toast.error('Enter valid OTP')
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setForgotStep(3)
    }, 800)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('Password reset successfully! You can now log in.')
      setActiveTab('signin')
      setForgotStep(1)
    }, 1000)
  }

  // Common UI classes for inputs
  const inputWrapperStyle = "flex items-center w-full bg-[#f0f4f8] rounded-xl px-4 py-3.5 transition-colors focus-within:bg-[#e6eff6] focus-within:ring-2 focus-within:ring-cyan-500/20"
  const inputStyle = "w-full bg-transparent border-none outline-none text-[#0a1f44] font-medium text-[15px] placeholder-slate-400 ml-3"
  const labelStyle = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-white flex items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-300/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-[950px] bg-white rounded-[2rem] shadow-2xl flex flex-col lg:flex-row relative z-10 overflow-hidden h-[680px] my-4">
        
        {/* ── LEFT PANEL (Auth Form) ── */}
        <div className="w-full lg:w-[45%] flex flex-col px-6 sm:px-10 pt-5 pb-2 bg-white relative h-full">
          
          {/* Top Tabs */}
          <div className="flex w-full border-b border-slate-100 mb-6 shrink-0 sticky top-0 bg-white z-10 pt-4">
            <button 
              onClick={() => { setActiveTab('signin'); setSignupStep(1); }}
              className={`flex-1 pb-4 text-[14px] font-bold text-center transition-colors relative whitespace-nowrap ${activeTab === 'signin' ? 'text-[#00b4d8]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
              {activeTab === 'signin' && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00b4d8]" />}
            </button>
            <button 
              onClick={() => { setActiveTab('signup'); setSignupStep(1); }}
              className={`flex-1 pb-4 text-[14px] font-bold text-center transition-colors relative whitespace-nowrap ${activeTab === 'signup' ? 'text-[#00b4d8]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
              {activeTab === 'signup' && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00b4d8]" />}
            </button>
            <button 
              onClick={() => setActiveTab('forgot-password')}
              className={`flex-1 pb-4 text-[14px] font-bold text-center transition-colors relative whitespace-nowrap ${activeTab === 'forgot-password' ? 'text-[#00b4d8]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Password recovery
              {activeTab === 'forgot-password' && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00b4d8]" />}
            </button>
          </div>

          <div className="flex-1 flex flex-col w-full mx-auto max-w-[380px] relative overflow-y-auto no-scrollbar pb-6">
            
            {/* Header / Logo (Visible on all tabs) */}
            <div className="flex flex-col items-center mb-3 shrink-0 mt-2">
              <div className="w-12 h-12 bg-[#0a1f44] rounded-full flex items-center justify-center relative overflow-hidden shadow-lg border border-slate-100 mb-2">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/30 to-transparent"></div>
                <img src="/logo.png" alt="GFS Logo" className="w-full h-full object-cover z-10 p-1" />
              </div>
              <h1 className="font-serif font-bold text-[#0a1f44] text-[16px] leading-tight tracking-tight text-center whitespace-nowrap">
                GREETWELL FINANCIAL SERVICES
              </h1>
            </div>

            {/* ── SIGN IN TAB ── */}
            {activeTab === 'signin' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1 w-full">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-[#0a1f44] font-serif mb-1 tracking-tight">Welcome Back</h2>
                  <p className="text-[12px] text-slate-400 font-medium">Please sign in to access your digital portfolio.</p>
                </div>

                <AnimatePresence>
                  {authError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-600 text-[13px] font-medium">{authError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Premium Portal Switcher */}
                <div className="relative mb-6 text-left">
                  <label className={labelStyle}>Access Interface</label>
                  <button
                    type="button"
                    onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
                    className="w-full bg-[#f0f4f8] hover:bg-[#e6eff6] rounded-xl py-3 px-4 flex items-center justify-between transition-colors border border-transparent focus:border-cyan-500/30"
                  >
                    <div className="flex items-center gap-3">
                      {(activePortal === 'loans' || !activePortal) && <Briefcase size={16} className="text-emerald-500" />}
                      {activePortal === 'insurance' && <Shield size={16} className="text-blue-500" />}
                      {activePortal === 'investments' && <TrendingUp size={16} className="text-amber-500" />}
                      <span className="font-extrabold text-[#0a1f44] text-[13px] capitalize">
                        {(activePortal === 'investments' ? 'Investment' : (activePortal || 'loans'))} Portal
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${isPortalDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isPortalDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {[
                          { id: 'loans', label: 'Loans Portal', desc: 'Personal & business financing', icon: <Briefcase size={16} className="text-emerald-500" />, path: '/loans/login' },
                          { id: 'insurance', label: 'Insurance Portal', desc: 'Life, health & vehicle policies', icon: <Shield size={16} className="text-blue-500" />, path: '/insurance/login' },
                          { id: 'investments', label: 'Investment Portal', desc: 'SIP, mutual funds & chit funds', icon: <TrendingUp size={16} className="text-amber-500" />, path: '/investment/login' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setIsPortalDropdownOpen(false)
                              setAuthError(null)
                              navigate(item.path)
                            }}
                            className={`w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 ${
                              activePortal === item.id ? 'bg-[#f0f4f8]/50' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                              {item.icon}
                            </div>
                            <div>
                              <strong className="block text-[#0a1f44] text-[12px] font-bold">{item.label}</strong>
                              <span className="block text-slate-400 text-[10px]">{item.desc}</span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!isVerifyingLoginOtp ? (
                  <form onSubmit={handleEmailLogin} className="space-y-6">
                  <div>
                    <label className={labelStyle}>LOGIN / EMAIL</label>
                    <div className={inputWrapperStyle}>
                      <Mail size={18} className="text-slate-400" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (authError) setAuthError(null)
                        }}
                        placeholder="user@example.com"
                        className={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>PASSWORD</label>
                    <div className={inputWrapperStyle}>
                      <Lock size={18} className="text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (authError) setAuthError(null)
                        }}
                        placeholder="••••••••"
                        className={inputStyle}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 ml-2">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" onClick={() => setTermsAgreed(!termsAgreed)} className="text-[#00b4d8] flex-shrink-0">
                      {termsAgreed ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-300" />}
                    </button>
                    <span className="text-[13px] font-medium text-slate-500">I agree to GFS Portal <a href="#" className="text-[#00b4d8] font-bold hover:underline">Terms of use</a></span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-[0_8px_20px_rgba(0,180,216,0.3)] hover:-translate-y-0.5 transition-all mt-6"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                  </button>

                  <button type="button" onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 mt-4 text-[13px] font-bold text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft size={14} /> Back to Home Interface
                  </button>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[11px] font-bold text-slate-400">Bank-grade secure GFS portal. All connection points logged.</span>
                  </div>
                  </form>
                ) : (
                  <div className="flex flex-col text-center space-y-6 mt-4">
                    <Smartphone size={40} className="text-cyan-500 mx-auto mb-2 animate-bounce" />
                    <div>
                      <h3 className="text-xl font-bold text-[#0a1f44] font-serif">Enter Secure OTP</h3>
                      <p className="text-[12px] text-slate-500 mt-1">We sent a 6-digit verification code to <span className="font-extrabold text-[#0a1f44]">{email}</span>. Please verify your identity.</p>
                    </div>
                    
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtpCode}
                      onChange={(e) => setLoginOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-3xl font-bold tracking-[0.5em] w-56 mx-auto bg-[#f0f4f8] rounded-xl py-4 outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="••••••"
                    />

                    <div className="space-y-3">
                      <button
                        onClick={handleVerifyLoginOtp}
                        disabled={isSubmitting}
                        className="w-full bg-[#00b4d8] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#0096c7] transition-all"
                      >
                        Verify & Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVerifyingLoginOtp(false)
                          setLoginOtpCode('')
                          setAuthError(null)
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 block mx-auto underline"
                      >
                        Cancel / Use Another Email
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SIGN UP TAB ── */}
            {activeTab === 'signup' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1 w-full pb-6 min-h-0">
                
                {signupStep === 1 && (
                  <div className="flex flex-col">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-[#0a1f44] font-serif mb-2 tracking-tight">Join GFS</h2>
                      <p className="text-[13px] text-slate-400 font-medium">
                        Configure your registration target and access role.
                      </p>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Choose target portal */}
                      <div>
                        <label className={labelStyle}>TARGET MODULE / PORTAL</label>
                        <select
                          value={signupService || 'loans'}
                          onChange={(e) => setSignupService(e.target.value as any)}
                          className="w-full bg-[#f0f4f8] rounded-xl px-4 py-3.5 outline-none font-bold text-[#0a1f44] text-[14px] focus:ring-2 focus:ring-cyan-500/20"
                        >
                          <option value="loans">Loans Portal</option>
                          <option value="insurance">Insurance Portal</option>
                          <option value="investments">Investment Portal</option>
                        </select>
                      </div>

                      {/* Choose role */}
                      <div>
                        <label className={labelStyle}>REGISTRATION LEVEL / ROLE</label>
                        <select
                          value={signupRole || 'customer'}
                          onChange={(e) => setSignupRole(e.target.value as any)}
                          className="w-full bg-[#f0f4f8] rounded-xl px-4 py-3.5 outline-none font-bold text-[#0a1f44] text-[14px] focus:ring-2 focus:ring-cyan-500/20"
                        >
                          <option value="customer">Member / Customer</option>
                          <option value="agent">Advisor / Agent</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSignupStep(3)}
                        className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-[0_8px_20px_rgba(0,180,216,0.3)] hover:-translate-y-0.5 transition-all mt-4"
                      >
                        Continue to Personal Details
                      </button>
                    </div>
                  </div>
                )}

                {signupStep === 3 && (
                  <div className="flex flex-col flex-1 relative overflow-hidden h-full min-h-0">
                    <div className="shrink-0 relative pt-2">
                      <button onClick={() => setSignupStep(1)} className="absolute top-2 left-0 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"><ArrowLeft size={14} className="mr-1" /> Back</button>
                      <div className="text-center mb-6 mt-4">
                        <h2 className="text-2xl font-bold text-[#0a1f44] font-serif mb-1 tracking-tight">
                          {signupService === 'loans' && 'Loan User Sign Up'}
                          {signupService === 'insurance' && 'Insurance User Sign Up'}
                          {signupService === 'investments' && 'Investment User Sign Up'}
                        </h2>
                        <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-50 text-[#00b4d8] tracking-wider">
                          GFS Digital {signupService} Portal
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pb-4 px-1 pr-2 -mx-1 custom-scrollbar min-h-0">
                      <form onSubmit={handleSignupSubmit} className="space-y-4">
                      
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>FIRST NAME</label>
                          <div className={inputWrapperStyle}>
                            <User size={18} className="text-slate-400" />
                            <input type="text" value={signupData.firstName} onChange={(e) => setSignupData({...signupData, firstName: e.target.value})} placeholder="John" className={inputStyle} required />
                          </div>
                        </div>
                        <div>
                          <label className={labelStyle}>LAST NAME</label>
                          <div className={inputWrapperStyle}>
                            <input type="text" value={signupData.lastName} onChange={(e) => setSignupData({...signupData, lastName: e.target.value})} placeholder="Doe" className={`${inputStyle} ml-0 px-2`} required />
                          </div>
                        </div>
                      </div>

                      {/* Identifier */}
                      <div>
                        <label className={labelStyle}>MOBILE OR EMAIL</label>
                        <div className={inputWrapperStyle}>
                          <Mail size={18} className="text-slate-400" />
                          <input type="text" value={signupData.identifier} onChange={(e) => setSignupData({...signupData, identifier: e.target.value})} placeholder="Email or 10-digit number" className={inputStyle} required />
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className={labelStyle}>GENDER</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Male', 'Female', 'Other'].map(g => (
                            <button type="button" key={g} onClick={() => setSignupData({...signupData, gender: g})} className={`py-2.5 rounded-lg text-xs font-bold transition-all ${signupData.gender === g ? 'bg-[#00b4d8] text-white shadow-sm' : 'bg-[#f0f4f8] text-slate-500 hover:bg-[#e6eff6]'}`}>{g}</button>
                          ))}
                        </div>
                      </div>

                      {/* Password Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>PASSWORD</label>
                          <div className={inputWrapperStyle}>
                            <Lock size={18} className="text-slate-400" />
                            <input type={showSignupPassword ? 'text' : 'password'} value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} placeholder="Create" className={inputStyle} required />
                            <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="text-slate-400 hover:text-slate-600 ml-1 mr-1">{showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                          </div>
                        </div>
                        <div>
                          <label className={labelStyle}>CONFIRM</label>
                          <div className={inputWrapperStyle}>
                            <input type={showConfirmPassword ? 'text' : 'password'} value={signupData.confirmPassword} onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})} placeholder="Verify" className={`${inputStyle} ml-0 px-2 ${signupData.confirmPassword && signupData.password !== signupData.confirmPassword ? 'text-red-500' : ''}`} required />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-400 hover:text-slate-600 ml-1 mr-1">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                          </div>
                        </div>
                      </div>

                      {/* Agent Specific Field */}
                      {signupRole === 'agent' && (
                        <div>
                          <label className={labelStyle}>COMPANY / AGENCY NAME</label>
                          <div className={inputWrapperStyle}>
                            <Building size={18} className="text-slate-400" />
                            <input type="text" value={signupData.companyName} onChange={(e) => setSignupData({...signupData, companyName: e.target.value})} placeholder="Your Agency Name" className={inputStyle} required />
                          </div>
                        </div>
                      )}

                        <div className="flex items-center gap-2 mt-4 pt-2 shrink-0">
                          <button type="button" onClick={() => setTermsAgreed(!termsAgreed)} className="text-[#00b4d8] flex-shrink-0">
                            {termsAgreed ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-300" />}
                          </button>
                          <span className="text-[13px] font-medium text-slate-500">I agree to GFS Portal <a href="#" className="text-[#00b4d8] font-bold hover:underline">Terms of use</a></span>
                        </div>
                        <button type="submit" className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-[0_8px_20px_rgba(0,180,216,0.3)] hover:-translate-y-0.5 transition-all mt-4 shrink-0">
                          Continue
                        </button>
                      </form>
                    </div>
                  </div>
                )}
                
                {signupStep === 4 && (
                  <div className="flex flex-col text-center mt-8">
                    <Smartphone size={40} className="text-cyan-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#0a1f44] font-serif mb-2">Verify Contact</h2>
                    <p className="text-[13px] text-slate-500 mb-8">Enter the 4-digit code sent to {signupData.identifier}</p>
                    <input
                      type="text" maxLength={4} value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-3xl font-bold tracking-[0.5em] w-48 mx-auto bg-[#f0f4f8] rounded-xl py-4 mb-6 outline-none focus:ring-2 focus:ring-cyan-500" placeholder="••••"
                    />
                    <button onClick={handleVerifyOTP} disabled={isSubmitting} className="w-full bg-[#00b4d8] text-white py-3.5 rounded-xl font-bold text-[15px]">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Code'}
                    </button>
                  </div>
                )}

                {signupStep === 5 && (
                  <div className="flex flex-col items-center justify-center text-center flex-1 py-10">
                    <ShieldCheck size={60} className="text-emerald-500 mb-6" />
                    <h2 className="text-3xl font-bold text-[#0a1f44] font-serif mb-2">Account Created!</h2>
                    <p className="text-slate-500 text-[14px] mb-8 max-w-[280px]">Your account has been successfully created and verified.</p>
                    <button onClick={() => { setActiveTab('signin'); setSignupStep(1); }} className="w-full bg-[#0a1f44] text-white py-3.5 rounded-xl font-bold text-[15px]">
                      Proceed to Login
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── FORGOT PASSWORD TAB ── */}
            {activeTab === 'forgot-password' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1 w-full pt-8">
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-[#0a1f44] font-serif mb-2 tracking-tight">Reset Password</h2>
                      <p className="text-[13px] text-slate-400 font-medium">Enter your registered email or mobile to get a reset code.</p>
                    </div>
                    <div>
                      <label className={labelStyle}>IDENTIFIER</label>
                      <div className={inputWrapperStyle}>
                        <Mail size={18} className="text-slate-400" />
                        <input type="text" value={forgotIdentifier} onChange={(e) => setForgotIdentifier(e.target.value)} placeholder="Mobile or Email" className={inputStyle} required />
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white py-3.5 rounded-xl font-bold text-[15px]">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Code'}
                    </button>
                  </form>
                )}
                {/* Steps 2 & 3 simplified for matching flow... */}
                {forgotStep === 2 && (
                  <div className="flex flex-col relative pt-6">
                    <button onClick={() => setForgotStep(1)} className="absolute -top-4 left-0 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"><ArrowLeft size={14} className="mr-1" /> Back</button>
                    <div className="text-center mt-4">
                      <h2 className="text-2xl font-bold text-[#0a1f44] font-serif mb-2">Verify OTP</h2>
                      <p className="text-[13px] text-slate-500 mb-8">Enter the 4-digit code sent to {forgotIdentifier}</p>
                      <input type="text" maxLength={4} value={forgotOtp} onChange={(e) => setForgotOtp(e.target.value)} className="text-center text-3xl font-bold tracking-[0.5em] w-48 mx-auto bg-[#f0f4f8] rounded-xl py-4 mb-6 outline-none" placeholder="••••" />
                      <button onClick={handleForgotVerifyOTP} disabled={isSubmitting} className="w-full bg-[#00b4d8] text-white py-3.5 rounded-xl font-bold text-[15px]">Verify</button>
                    </div>
                  </div>
                )}
                {forgotStep === 3 && (
                  <div className="flex flex-col relative pt-6">
                    <button onClick={() => setForgotStep(2)} className="absolute -top-4 left-0 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"><ArrowLeft size={14} className="mr-1" /> Back</button>
                    <form onSubmit={handleResetPassword} className="space-y-6 mt-4">
                      <h2 className="text-2xl font-bold text-[#0a1f44] font-serif mb-2 text-center">New Password</h2>
                      <div className={inputWrapperStyle}>
                        <input type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="New strong password" className={inputStyle} required />
                      </div>
                      <button type="submit" disabled={isSubmitting} className="w-full bg-[#00b4d8] text-white py-3.5 rounded-xl font-bold text-[15px]">Reset & Login</button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>

        {/* ── RIGHT PANEL (Illustration & Branding) ── */}
        <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985] relative overflow-hidden flex-col items-center justify-between p-8 text-center h-[680px]">
          
          {/* Subtle background glow */}
          <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
          
          {/* Top Badge */}
          <div className="flex flex-col items-center gap-2 z-10 mt-6">
            <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
              <img src="/logo.png" alt="Icon" className="w-full h-full object-contain opacity-90" />
            </div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">GFS DIGITAL PORTAL</span>
          </div>

          {/* Main Copy */}
          <div className="z-10 max-w-[360px] mt-6">
            <h2 className="text-2xl font-bold text-white font-serif mb-3 leading-snug">Welcome to the GFS<br/>Greetwell digital wallet</h2>
            <p className="text-[13px] text-blue-200/80 font-medium leading-relaxed">
              Access your Unified Dashboard, verify underwriting reviews, and track client portfolios from one premium hub.
            </p>
          </div>

          {/* Abstract Illustration Art */}
          <div className="relative w-full max-w-[360px] h-[240px] z-10 mt-6 flex items-center justify-center perspective-1000 scale-90">
            
            {/* The rising arrow */}
            <div className="absolute inset-0 flex items-center justify-center transform -rotate-[15deg]">
              <div className="w-48 h-12 bg-gradient-to-r from-transparent to-cyan-400 relative">
                <div className="absolute right-[-16px] top-[-16px] w-0 h-0 border-l-[24px] border-l-cyan-400 border-t-[22px] border-t-transparent border-b-[22px] border-b-transparent"></div>
              </div>
            </div>

            {/* Dashboard floating panels */}
            <div className="absolute flex gap-2 transform rotate-[5deg] translate-y-6 shadow-2xl">
              <div className="w-32 h-32 bg-[#041228] border-2 border-cyan-500 rounded-lg p-3 relative overflow-hidden">
                <div className="w-full h-full flex items-end gap-1 relative z-10">
                  <div className="w-2 h-6 bg-pink-500 rounded-sm" />
                  <div className="w-2 h-12 bg-amber-500 rounded-sm" />
                  <div className="w-2 h-10 bg-cyan-500 rounded-sm" />
                  <div className="w-2 h-16 bg-pink-500 rounded-sm" />
                  <div className="w-2 h-8 bg-amber-500 rounded-sm" />
                </div>
                <svg className="absolute inset-0 w-full h-full opacity-50 z-0" preserveAspectRatio="none">
                  <path d="M0,20 L30,40 L60,10 L90,50 L120,30" stroke="#00b4d8" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className="w-20 h-32 bg-[#041228] border-2 border-cyan-500/50 rounded-lg transform translate-y-4 -translate-x-4 flex items-center justify-center relative">
                 <div className="w-10 h-10 rounded-full border-4 border-amber-400" />
                 <div className="absolute w-2 h-6 bg-amber-400 right-4 bottom-8 rotate-45 rounded-full" />
              </div>
            </div>

            {/* Floating avatars (Abstract) */}
            <div className="absolute left-10 bottom-10 w-8 h-16 bg-blue-500 rounded-sm transform -rotate-12 flex flex-col items-center">
              <div className="w-6 h-6 bg-[#ffb088] rounded-full -mt-3 shadow-md" />
              <div className="w-8 h-2 bg-amber-400 absolute top-4 left-4 rotate-45 rounded-full shadow-lg" />
            </div>
            
            <div className="absolute right-10 bottom-4 w-8 h-16 bg-blue-500 rounded-sm flex flex-col items-center">
              <div className="w-6 h-6 bg-[#ffb088] rounded-full -mt-3 shadow-md" />
            </div>
            
            {/* Money stack */}
            <div className="absolute bottom-[-10px] w-20 h-4 bg-emerald-500 transform skew-x-[-20deg] shadow-lg border border-emerald-400" />
            <div className="absolute bottom-[-5px] w-20 h-4 bg-emerald-600 transform skew-x-[-20deg] shadow-lg border border-emerald-500" />

          </div>

          <div className="mt-auto pt-8 z-10 text-[11px] text-blue-200/50">
            © 2026 Greetwell Financial. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  )
}
