import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { GFSLogo } from '../../components/common/GFSLogo';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091526] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GFSLogo size="xl" variant="dark" className="mb-2" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1">Greetwell Financial Services Password Recovery</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Instructions Sent</h3>
              <p className="text-xs text-slate-300">
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
              </p>
              <Link to="/login" className="inline-flex items-center text-xs font-bold text-blue-400 hover:text-blue-300">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg">{error}</div>}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase">Registered Email</label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    placeholder="email@greetwell.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 text-xs uppercase tracking-wider"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white">
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
