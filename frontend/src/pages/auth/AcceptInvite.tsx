import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, UserCheck, Shield, KeyRound, Smartphone, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GFSLogo } from '../../components/common/GFSLogo';

export const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // OTP inputs
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/invite/${token}`);
        if (res.data.success) {
          const data = res.data.data;
          setInvitationDetails(data);
          setFormData((prev) => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
          }));

          const isAgent = ['LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT'].includes(data.role);
          if (!isAgent || (data.isEmailVerified && data.isMobileVerified)) {
            setIsVerified(true);
          } else {
            // Auto-fill OTP in dev mode for quick verification convenience
            if (data.emailOtp) setEmailOtp(data.emailOtp);
            if (data.mobileOtp) setMobileOtp(data.mobileOtp);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired invitation token.');
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyToken();
  }, [token]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingOtp(true);
    setError('');
    setOtpSuccessMsg('');

    try {
      const res = await api.post(`/auth/invite/${token}/verify-otp`, {
        emailOtp,
        mobileOtp,
      });

      if (res.data.success) {
        setIsVerified(true);
        setOtpSuccessMsg('Identity & OTP Verification Successful! Please set up your password below.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please verify Email & Mobile OTPs.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/auth/invite/${token}/accept`, formData);
      if (res.data.success) {
        const { token: authToken, user } = res.data.data;
        login(authToken, user);

        switch (user.role) {
          case 'SUPER_ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'LOAN_AGENT':
            navigate('/loan-agent/dashboard');
            break;
          case 'INSURANCE_AGENT':
            navigate('/insurance-agent/dashboard');
            break;
          case 'INVESTMENT_AGENT':
            navigate('/investment-agent/dashboard');
            break;
          case 'CUSTOMER':
            navigate('/customer/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password and activate account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#091526] flex flex-col items-center justify-center">
        <GFSLogo size="xl" variant="dark" />
        <div className="mt-6 flex flex-col items-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
          <p className="text-xs font-bold text-emerald-300 tracking-wider uppercase">Verifying security token...</p>
        </div>
      </div>
    );
  }

  const isAgent = invitationDetails && ['LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT'].includes(invitationDetails.role);

  return (
    <div className="min-h-screen bg-[#091526] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GFSLogo size="xl" variant="dark" className="mb-2" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {isAgent ? 'Agent Portal Onboarding' : 'Accept Invitation'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {isAgent ? 'Verify security OTPs and configure your agent account access' : 'Setup your account password to activate access'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {otpSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          {invitationDetails && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Profile Overview:</span>
                {invitationDetails.agentIdCode && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                    ID: {invitationDetails.agentIdCode}
                  </span>
                )}
                {invitationDetails.customerIdCode && !invitationDetails.agentIdCode && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                    ID: {invitationDetails.customerIdCode}
                  </span>
                )}
              </div>
              <p>Email: <strong className="text-white">{invitationDetails.email}</strong></p>
              <p>Pre-assigned Role: <strong className="text-emerald-400 uppercase">{invitationDetails.role.replace(/_/g, ' ')}</strong></p>
              {invitationDetails.education && (
                <p>Education: <strong className="text-slate-300">{invitationDetails.education}</strong></p>
              )}
            </div>
          )}

          {/* STEP 1: OTP VERIFICATION FOR AGENTS */}
          {isAgent && !isVerified && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div className="border-t border-slate-700 pt-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Step 1: Verify Security OTP Codes
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Enter the 6-digit OTP codes sent to your registered Email and Mobile Phone.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Email Verification OTP
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Mobile Verification OTP
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-emerald-500"
                    placeholder="654321"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {verifyingOtp ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Verifying Security OTPs...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Verify OTPs & Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PASSWORD CREATION (Unlocked after OTP verification for Agents, or default for Customers) */}
          {isVerified && (
            <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
              <div className="border-t border-slate-700 pt-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-emerald-400" /> Step 2: Configure Account Password
                </h3>
                <p className="text-[11px] text-slate-400 mb-2">
                  Create a secure password to activate your portal login.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase">
                    Last Name <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                    placeholder="Last Name (Optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase">Create Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-white bg-[#0c5837] hover:bg-[#084229] transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {submitting ? 'Activating Account...' : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Activate Account & Sign In
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
