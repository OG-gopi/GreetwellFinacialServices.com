import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Calendar, Users, Award, Heart, Sparkles, 
  ArrowLeft, Upload, FileText, CheckCircle2, Shield, 
  Briefcase, Check, Mail, Phone, MapPin, Building,
  Lock, Eye, EyeOff, ClipboardList, Info
} from 'lucide-react'
import { useAgentWorkflowStore } from '@/store/agentWorkflowStore'

interface AgentSignupPageProps {
  agentType: 'loan-agent' | 'insurance-agent' | 'investment-agent'
}

export default function AgentSignupPage({ agentType }: AgentSignupPageProps) {
  const navigate = useNavigate()
  const { submitApplication } = useAgentWorkflowStore()
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: '',
    city: '',
    state: '',
    address: '',
    experience: '',
    qualification: '',
    referralCode: '',
    termsAgreed: false,
  })

  // Mock Upload Files States
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState('')
  
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState('')

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePhotoName, setProfilePhotoName] = useState('')
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const agentMeta = {
    'loan-agent': {
      title: 'Loan Agent Partner',
      badge: 'Loans Division',
      color: 'from-emerald-600 to-teal-500',
      accentColor: '#10B981',
      text: 'Earn attractive commissions by helping clients secure fast, transparent, and hassle-free personal, business, and home loans.',
      icon: <Trophy className="w-8 h-8 text-emerald-500" />
    },
    'insurance-agent': {
      title: 'Insurance Agent Partner',
      badge: 'Insurance Division',
      color: 'from-blue-600 to-indigo-500',
      accentColor: '#3B82F6',
      text: 'Secure lives and assets by providing GFS\'s highly reliable term, health, motor, and life insurance policies.',
      icon: <Award className="w-8 h-8 text-blue-500" />
    },
    'investment-agent': {
      title: 'Investment Agent Partner',
      badge: 'Investments Division',
      color: 'from-amber-500 to-orange-500',
      accentColor: '#F59E0B',
      text: 'Empower clients to grow and protect their wealth with expert mutual funds, fixed deposits, and structured SIP planning.',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />
    }
  }[agentType]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    
    setFormData(prev => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Handle Drag & Drop Files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'resume' | 'document' | 'photo') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (fileType === 'resume') {
        setResumeFile(file)
        setResumeName(file.name)
        if (errors.resume) setErrors(prev => ({ ...prev, resume: '' }))
      } else if (fileType === 'document') {
        setDocumentFile(file)
        setDocumentName(file.name)
        if (errors.document) setErrors(prev => ({ ...prev, document: '' }))
      } else if (fileType === 'photo') {
        setProfilePhoto(file)
        setProfilePhotoName(file.name)
        const reader = new FileReader()
        reader.onloadend = () => {
          setProfilePhotoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        if (errors.photo) setErrors(prev => ({ ...prev, photo: '' }))
      }
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required'
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required'
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.dob) newErrors.dob = 'Date of birth is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.address.trim()) newErrors.address = 'Detailed address is required'
    if (!formData.experience) newErrors.experience = 'Industry experience is required'
    if (!formData.qualification) newErrors.qualification = 'Highest qualification is required'
    
    if (!resumeName) newErrors.resume = 'Resume upload is required'
    if (!documentName) newErrors.document = 'Aadhaar / PAN card upload is required'
    if (!profilePhotoName) newErrors.photo = 'Profile photo upload is required'
    if (!formData.termsAgreed) newErrors.termsAgreed = 'You must agree to the GFS Terms of Service'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      const firstErr = Object.keys(errors)[0]
      if (firstErr) {
        setErrors(prev => ({ ...prev, general: 'Please check and fill all mandatory fields properly.' }))
      }
      return
    }

    setIsSubmitting(true)
    
    // Simulate application processing
    setTimeout(() => {
      submitApplication({
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dob,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        experience: formData.experience,
        qualification: formData.qualification,
        referralCode: formData.referralCode || undefined,
        resumeName: resumeName,
        documentName: documentName,
        profilePhotoName: profilePhotoName,
        agentType: agentType
      })
      
      setIsSubmitting(false)
      setShowSuccess(true)
    }, 1500)
  }

  return (
    <div className="partner-portal-light min-h-screen bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-white text-[#334155] flex flex-col justify-between font-sans relative overflow-hidden">
      <style>{`
        .partner-portal-light input,
        .partner-portal-light select,
        .partner-portal-light textarea {
          background-color: #ffffff !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
        }
        .partner-portal-light input::placeholder {
          color: #94a3b8 !important;
        }
        .partner-portal-light label {
          color: #475569 !important;
        }
        .partner-portal-light .bg-slate-900\\/40,
        .partner-portal-light .bg-slate-950\\/40,
        .partner-portal-light .bg-slate-950\\/50 {
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
          color: #334155 !important;
        }
        .partner-portal-light h1,
        .partner-portal-light h2,
        .partner-portal-light h3,
        .partner-portal-light h4,
        .partner-portal-light .text-white,
        .partner-portal-light .text-slate-200 {
          color: #0f172a !important;
        }
        .partner-portal-light .text-slate-300,
        .partner-portal-light .text-slate-400,
        .partner-portal-light .text-slate-500 {
          color: #475569 !important;
        }
        .partner-portal-light .border-white\\/5,
        .partner-portal-light .border-white\\/10 {
          border-color: #e2e8f0 !important;
        }
        .partner-portal-light .border-dashed {
          border-color: #cbd5e1 !important;
        }
        .partner-portal-light .border-dashed:hover {
          border-color: #0284c7 !important;
        }
        .partner-portal-light footer {
          background-color: rgba(255, 255, 255, 0.5) !important;
          border-top: 1px solid #e2e8f0 !important;
          color: #64748b !important;
        }
      `}</style>
      
      {/* Dynamic Background Radial Blur Glowing effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 py-4 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GFS Logo" className="h-10 w-10 object-cover rounded-full" />
            <span className="text-sm font-extrabold uppercase tracking-wider text-slate-200 hidden sm:inline">
              Greetwell Financial Services
            </span>
          </div>
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row items-start gap-12 relative z-10">
        
        {/* Left Info Column */}
        <div className="lg:w-5/12 text-left lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 mb-6">
              <Sparkles className="w-3 h-3" />
              <span>{agentMeta.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-white tracking-tight mb-6 leading-tight">
              Start Your Journey as a <br />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${agentMeta.color}`}>
                {agentMeta.title}
              </span>
            </h1>

            <p className="text-slate-400 text-base mb-8 leading-relaxed">
              {agentMeta.text} Register to start as a verified partner. Super Admins will evaluate your KYC documents and generate credentials within 24 hours.
            </p>

            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 mb-8 text-xs leading-relaxed text-slate-400 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <strong className="text-slate-200 block mb-1">Mandatory Account Verification Process</strong>
                Provide original copies of Aadhaar/PAN cards and your professional resume. This helps our verification desks onboard you swiftly.
              </div>
            </div>

            {/* Why GFS Agent List */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-lg mb-4">Partner Benefits</h3>
              {[
                'Highest payout & attractive slab-based commissions',
                'Dedicated GFS RM (Relationship Manager) support',
                'Advanced digital CRM portal for tracking applications',
                'Access to multi-brand Loan, Insurance & Investment services'
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/20">
                    <Check className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Form Card Column */}
        <div className="lg:w-7/12 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative"
            style={{
              boxShadow: '0 25px 60px rgba(0,0,0,0.45)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5">
                {agentMeta.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold font-serif text-white">Partner Registration</h3>
                <p className="text-slate-400 text-xs mt-0.5">Fill out your profile details & verify documents</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo Upload Row */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-slate-950/40 border border-white/5">
                <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-dashed border-white/10 hover:border-cyan-500 flex items-center justify-center overflow-hidden shrink-0">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-slate-600" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="text-center sm:text-left flex-grow">
                  <span className="block text-slate-200 text-sm font-bold">Profile Photo *</span>
                  <span className="block text-slate-500 text-xs mt-0.5">JPG or PNG. Max 2MB.</span>
                  {errors.photo && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.photo}</p>}
                </div>
              </div>

              {/* Grid 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  {errors.fullName && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.fullName}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Mobile Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      maxLength={10}
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.mobileNumber}</p>}
                </div>
              </div>

              {/* Grid 2: Email & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email Address */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Email Address *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.gender}</p>}
                </div>
              </div>

              {/* Grid 3: DOB & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Date of Birth */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Date of Birth *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
                    />
                  </div>
                  {errors.dob && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.dob}</p>}
                </div>

                {/* Highest Qualification */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Qualification *</label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Qualification</option>
                    <option value="High School">High School (10th/12th)</option>
                    <option value="Graduate">Graduate (B.A. / B.Com. / B.Sc.)</option>
                    <option value="Post Graduate">Post Graduate (M.B.A. / M.Com.)</option>
                    <option value="Professional Certification">Professional Degree / CFA / CA</option>
                  </select>
                  {errors.qualification && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.qualification}</p>}
                </div>
              </div>

              {/* Grid 4: Password Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Password */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Confirm Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Detailed Address *</label>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-slate-500 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Enter permanent or business address details"
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                {errors.address && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.address}</p>}
              </div>

              {/* Grid 5: City, State, Exp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* City */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad"
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  {errors.city && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Telangana"
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  {errors.state && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.state}</p>}
                </div>

                {/* Industry Experience */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Experience *</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Exp</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-2">1 to 2 Years</option>
                    <option value="3-5">3 to 5 Years</option>
                    <option value="5+">5+ Years</option>
                  </select>
                  {errors.experience && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.experience}</p>}
                </div>
              </div>

              {/* Grid 6: Resume & PAN/Aadhaar file uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Resume Upload */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Upload Resume *</label>
                  <div className="relative border border-dashed border-white/10 hover:border-cyan-500/50 rounded-xl bg-slate-950/50 p-5 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer h-32">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'resume')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {resumeName ? (
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1 px-2">{resumeName}</p>
                      </div>
                    ) : (
                      <div className="text-center pointer-events-none">
                        <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-300 block">Resume (PDF/Doc)</span>
                      </div>
                    )}
                  </div>
                  {errors.resume && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.resume}</p>}
                </div>

                {/* Aadhaar / PAN Upload */}
                <div>
                  <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Aadhaar or PAN Card *</label>
                  <div className="relative border border-dashed border-white/10 hover:border-cyan-500/50 rounded-xl bg-slate-950/50 p-5 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer h-32">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'document')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {documentName ? (
                      <div className="text-center">
                        <Shield className="w-8 h-8 text-[#D4AF37] mx-auto mb-1" />
                        <p className="text-xs font-semibold text-slate-200 line-clamp-1 px-2">{documentName}</p>
                      </div>
                    ) : (
                      <div className="text-center pointer-events-none">
                        <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-300 block">Aadhaar / PAN (PDF/Img)</span>
                      </div>
                    )}
                  </div>
                  {errors.document && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.document}</p>}
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Referral Code (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    placeholder="Enter referral / RM code"
                    className="w-full bg-slate-950/70 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="termsAgreed"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onChange={handleChange}
                  className="mt-1 accent-[#25D366] rounded cursor-pointer w-4 h-4"
                />
                <label htmlFor="termsAgreed" className="text-xs text-slate-400 select-none cursor-pointer">
                  I hereby declare that all details entered above are true to my knowledge and I agree to the Greetwell Financial Services <span className="text-cyan-400 underline font-semibold">Terms of Use</span> and <span className="text-cyan-400 underline font-semibold">Privacy Policy</span>.
                </label>
              </div>
              {errors.termsAgreed && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.termsAgreed}</p>}
              {errors.general && <p className="text-rose-500 text-xs font-bold text-center mt-2">{errors.general}</p>}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0f7d70] text-white py-4 rounded-xl font-extrabold text-sm shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <LoaderIcon />
                ) : (
                  <>
                    <span>Submit Application for Approval</span>
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/30 px-6 py-6 text-center text-xs text-slate-500 relative z-50">
        <p>© 2026 Greetwell Financial Services. All Rights Reserved. Private & Confidential.</p>
      </footer>

      {/* Dynamic Success Popup Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              
              <h3 className="text-2xl font-bold font-serif text-white mb-3">Application Submitted!</h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Thank you, <strong className="text-white">{formData.fullName}</strong>. Your partner registration request is successfully submitted and marked as <strong className="text-[#D4AF37]">Pending Verification</strong>.
                <br /><br />
                Our Super Admin team will verify your credentials and upload records shortly. Look out for your welcome email containing credentials!
              </p>

              <button
                onClick={() => {
                  setShowSuccess(false)
                  navigate('/')
                }}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-full font-extrabold text-sm shadow-lg shadow-green-500/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 animate-pulse"
              >
                Back to GFS Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LoaderIcon() {
  return (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  )
}
