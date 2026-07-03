import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, DollarSign, Activity, FileText, ChevronRight, RefreshCw, CheckCircle } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AddCustomerPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Combined Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Step 2: Financial Info
    occupation: '',
    employer: '',
    monthlyIncome: '',
    cibilScore: '',
    
    // Step 3: Module Selection
    selectedModule: 'loans', // loans | insurance | investments
    
    // Step 4: Module Details
    // Loans
    loanType: 'personal',
    loanAmount: '',
    tenureMonths: '12',
    purpose: '',
    
    // Insurance
    policyType: 'life',
    premiumAmount: '',
    sumAssured: '',
    paymentFrequency: 'monthly',
    
    // Investments
    investmentType: 'mutual_fund',
    fundName: '',
    investedAmount: '',
    riskLevel: 'medium'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) { toast.error('Full Name is required'); return false }
      if (!formData.phone.trim()) { toast.error('Phone Number is required'); return false }
    } else if (step === 2) {
      if (!formData.monthlyIncome) { toast.error('Monthly Income is required'); return false }
      if (!formData.cibilScore) { toast.error('Bureau CIBIL score is required'); return false }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (!user?.user_id) throw new Error('You must be signed in to register customers')

      // 1. Create customer profile
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({
          full_name: formData.fullName,
          email: formData.email || null,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender,
          address: formData.address || null,
          city: formData.city || null,
          state: formData.state || null,
          pincode: formData.pincode || null,
          occupation: formData.occupation || null,
          employer: formData.employer || null,
          monthly_income: parseFloat(formData.monthlyIncome) || 0,
          cibil_score: parseInt(formData.cibilScore) || 750,
          agent_id: user.user_id
        })
        .select()
        .single()

      if (custErr) throw custErr

      // 2. Create service record according to selection
      if (formData.selectedModule === 'loans') {
        const { error: loanErr } = await supabase
          .from('loans')
          .insert({
            customer_id: customer.id,
            loan_type: formData.loanType,
            loan_amount: parseFloat(formData.loanAmount) || 0,
            tenure_months: parseInt(formData.tenureMonths) || 12,
            purpose: formData.purpose || null,
            status: 'lead',
            agent_id: user.user_id
          })
        if (loanErr) throw loanErr
      } else if (formData.selectedModule === 'insurance') {
        const { error: insErr } = await supabase
          .from('insurance_policies')
          .insert({
            customer_id: customer.id,
            policy_number: `GFS-POL-${Math.floor(100000 + Math.random() * 900000)}`,
            policy_type: formData.policyType,
            sum_assured: parseFloat(formData.sumAssured) || 0,
            premium_amount: parseFloat(formData.premiumAmount) || 0,
            payment_frequency: formData.paymentFrequency,
            status: 'pending',
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            agent_id: user.user_id
          })
        if (insErr) throw insErr
      } else if (formData.selectedModule === 'investments') {
        const { error: invErr } = await supabase
          .from('investments')
          .insert({
            customer_id: customer.id,
            folio_number: `GFS-FOL-${Math.floor(100000 + Math.random() * 900000)}`,
            investment_type: formData.investmentType,
            fund_name: formData.fundName,
            invested_amount: parseFloat(formData.investedAmount) || 0,
            current_value: parseFloat(formData.investedAmount) || 0,
            risk_level: formData.riskLevel,
            agent_id: user.user_id
          })
        if (invErr) throw invErr
      }

      toast.success('Customer profile registered successfully')
      navigate('/agent/customers')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to complete registration')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell pageTitle="Register Customer">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-display font-bold text-foreground mb-6">Customer Registration Wizard</h1>

        {/* Multi-step progress header */}
        <div className="flex justify-between items-center mb-8 border-b border-navy-700/60 pb-4 text-xs font-semibold">
          {[
            { step: 1, label: 'Personal Info' },
            { step: 2, label: 'Financial Info' },
            { step: 3, label: 'Products Selection' },
            { step: 4, label: 'Product Details' }
          ].map(s => (
            <div key={s.step} className="flex items-center gap-1.5">
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border",
                step >= s.step ? "bg-gold-500 text-navy-900 border-gold-500 font-bold" : "border-navy-600 text-navy-400"
              )}>
                {s.step}
              </span>
              <span className={step >= s.step ? "text-gold-400" : "text-navy-400"}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="gfs-card p-6 border border-navy-700 bg-navy-850">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-2">Step 1: Personal Particulars</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="gfs-label">Full Name *</label>
                    <input className="gfs-input" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="gfs-label">Phone Number *</label>
                    <input className="gfs-input" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9999999999" />
                  </div>
                  <div>
                    <label className="gfs-label">Email Address</label>
                    <input className="gfs-input" name="email" value={formData.email} onChange={handleChange} placeholder="john@doe.com" />
                  </div>
                  <div>
                    <label className="gfs-label">Date of Birth</label>
                    <input className="gfs-input" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="gfs-label">Correspondence Address</label>
                  <input className="gfs-input" name="address" value={formData.address} onChange={handleChange} placeholder="Line 1, Landmark..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="gfs-label">City</label>
                    <input className="gfs-input" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="gfs-label">State</label>
                    <input className="gfs-input" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="gfs-label">Pincode</label>
                    <input className="gfs-input" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-2">Step 2: Financial Assessment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="gfs-label">Bureau CIBIL score *</label>
                    <input className="gfs-input" name="cibilScore" type="number" value={formData.cibilScore} onChange={handleChange} placeholder="E.g., 750" />
                  </div>
                  <div>
                    <label className="gfs-label">Monthly Income (INR) *</label>
                    <input className="gfs-input" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} placeholder="E.g., 60000" />
                  </div>
                  <div>
                    <label className="gfs-label">Occupation</label>
                    <input className="gfs-input" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Salaried / Self-Employed" />
                  </div>
                  <div>
                    <label className="gfs-label">Employer Name</label>
                    <input className="gfs-input" name="employer" value={formData.employer} onChange={handleChange} placeholder="TCS / Google" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-2">Step 3: Service Particulars</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: 'loans', label: 'Loans & Advances', desc: 'Secure/Unsecured personal, auto and home loans' },
                    { val: 'insurance', label: 'Insurance Protection', desc: 'Life, health, property coverages underwritings' },
                    { val: 'investments', label: 'Mutual Funds Portfolio', desc: 'Deposit plans, SIP, equity mutual fund indices' }
                  ].map(mod => (
                    <button
                      key={mod.val}
                      onClick={() => setFormData(p => ({ ...p, selectedModule: mod.val }))}
                      className={cn(
                        "p-4 rounded-xl border text-left flex flex-col justify-between min-h-[140px] transition-all",
                        formData.selectedModule === mod.val
                          ? "border-gold-500 bg-gold-500/10"
                          : "border-navy-700 bg-navy-900/20 hover:border-navy-600"
                      )}
                    >
                      <span className={cn("text-sm font-bold", formData.selectedModule === mod.val ? "text-gold-400" : "text-white")}>
                        {mod.label}
                      </span>
                      <p className="text-navy-400 text-xs mt-2">{mod.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400 mb-2">Step 4: Product Specifications</h3>

                {formData.selectedModule === 'loans' && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="gfs-label">Loan Type</label>
                      <select className="gfs-input" name="loanType" value={formData.loanType} onChange={handleChange}>
                        <option value="personal">Personal Loan</option>
                        <option value="home">Home Loan</option>
                        <option value="business">Business Loan</option>
                        <option value="vehicle">Auto/Vehicle Loan</option>
                      </select>
                    </div>
                    <div>
                      <label className="gfs-label">Requested Loan Amount (INR)</label>
                      <input className="gfs-input" name="loanAmount" type="number" value={formData.loanAmount} onChange={handleChange} placeholder="E.g., 500000" />
                    </div>
                    <div>
                      <label className="gfs-label">Requested Tenure (Months)</label>
                      <select className="gfs-input" name="tenureMonths" value={formData.tenureMonths} onChange={handleChange}>
                        <option value="12">12 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                        <option value="60">60 Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="gfs-label">Purpose of Loan</label>
                      <input className="gfs-input" name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Home improvement / Expansion" />
                    </div>
                  </div>
                )}

                {formData.selectedModule === 'insurance' && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="gfs-label">Insurance Type</label>
                      <select className="gfs-input" name="policyType" value={formData.policyType} onChange={handleChange}>
                        <option value="life">Term Life Insurance</option>
                        <option value="health">Family Health Cover</option>
                        <option value="motor">Motor Insurance</option>
                        <option value="property">Home & Property Protection</option>
                      </select>
                    </div>
                    <div>
                      <label className="gfs-label">Sum Assured Amount (INR)</label>
                      <input className="gfs-input" name="sumAssured" type="number" value={formData.sumAssured} onChange={handleChange} placeholder="E.g., 1000000" />
                    </div>
                    <div>
                      <label className="gfs-label">Premium Payment Amount (INR)</label>
                      <input className="gfs-input" name="premiumAmount" type="number" value={formData.premiumAmount} onChange={handleChange} placeholder="E.g., 5000" />
                    </div>
                    <div>
                      <label className="gfs-label">Payment Frequency</label>
                      <select className="gfs-input" name="paymentFrequency" value={formData.paymentFrequency} onChange={handleChange}>
                        <option value="monthly">Monthly Cycle</option>
                        <option value="quarterly">Quarterly Cycle</option>
                        <option value="annual">Annual Term</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.selectedModule === 'investments' && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="gfs-label">Investment Scheme</label>
                      <select className="gfs-input" name="investmentType" value={formData.investmentType} onChange={handleChange}>
                        <option value="mutual_fund">Mutual Funds Equity Plan</option>
                        <option value="sip">SIP Regular Investment</option>
                        <option value="fd">Fixed Deposit (FD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="gfs-label">Fund / Scheme Name</label>
                      <input className="gfs-input" name="fundName" value={formData.fundName} onChange={handleChange} placeholder="E.g., GFS Gold Index Fund" />
                    </div>
                    <div>
                      <label className="gfs-label">Deposit Amount (INR)</label>
                      <input className="gfs-input" name="investedAmount" type="number" value={formData.investedAmount} onChange={handleChange} placeholder="E.g., 100000" />
                    </div>
                    <div>
                      <label className="gfs-label">Risk Profile Category</label>
                      <select className="gfs-input" name="riskLevel" value={formData.riskLevel} onChange={handleChange}>
                        <option value="low">Low Risk Profile</option>
                        <option value="medium">Moderate Risk Profile</option>
                        <option value="high">Aggressive High Risk</option>
                      </select>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard Action buttons */}
          <div className="flex justify-between items-center border-t border-navy-700/60 pt-4 mt-6">
            <button
              disabled={step === 1 || submitting}
              onClick={handlePrev}
              className="btn-outline-gold text-xs font-semibold px-4 py-2.5 rounded-lg border border-gold-500/40 text-gold-400 disabled:opacity-30"
            >
              Previous
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="btn-gold text-xs font-bold px-5 py-2.5 rounded-lg"
              >
                Continue <ChevronRight className="w-4 h-4 inline-block ml-1" />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="btn-gold text-xs font-bold px-6 py-2.5 rounded-lg flex items-center gap-1.5"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {submitting ? 'Registering...' : 'Complete Profile & Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
