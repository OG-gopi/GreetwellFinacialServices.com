import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { GFSBrandHeader } from '../../components/common/GFSBrandHeader';

export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setError('Missing email verification token.');
      setLoading(false);
      return;
    }

    api
      .post(`/auth/verify-email/${token}`)
      .then((res) => {
        if (isMounted && res.data.success) {
          setSuccess(true);
          const email = res.data.data?.email || '';
          setUserEmail(email);

          // Automatically redirect to Common Login Page with prefilled email after 2.5 seconds
          setTimeout(() => {
            if (isMounted) {
              navigate(`/login?email=${encodeURIComponent(email)}&verified=true`);
            }
          }, 2500);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(
            err.response?.data?.message || 'Verification link is invalid, expired, or already used.'
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-800 text-slate-900 text-center space-y-6">
        <GFSBrandHeader accentColor="navy" />

        {loading && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verifying Email Address...</h2>
            <p className="text-xs text-slate-500">
              Please wait while we validate your security verification token and activate your account.
            </p>
          </div>
        )}

        {!loading && success && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Email Verified Successfully!</h2>
              <p className="text-xs text-slate-500 font-medium">
                Your GFS Customer Account for <strong className="text-slate-800">{userEmail}</strong> is now fully active.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
              Redirecting you to the common login page to sign in...
            </div>

            <button
              onClick={() => navigate(`/login?email=${encodeURIComponent(userEmail)}&verified=true`)}
              className="w-full py-3.5 px-4 rounded-xl shadow-lg font-bold text-white bg-[#0c5837] hover:bg-[#084229] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {!loading && error && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-xs text-rose-600 font-semibold">{error}</p>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all text-xs inline-flex items-center justify-center gap-2"
              >
                Return to Login Page
              </Link>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Greetwell Financial Services Identity Verification
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
