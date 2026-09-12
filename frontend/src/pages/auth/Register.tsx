import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GFSLogo } from '../../components/common/GFSLogo';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedServices, setSelectedServices] = useState<string[]>(['LOANS']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== service));
      }
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        ...formData,
        serviceTypes: selectedServices,
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091526] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <GFSLogo size="xl" variant="dark" className="mb-2" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Customer Registration</h2>
        <p className="mt-1 text-xs text-slate-400">Create your Greetwell Financial Services customer account</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
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
                  className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe (Optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            {/* Service Type Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                Financial Services Required
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['LOANS', 'INSURANCE', 'INVESTMENT'].map((service) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`p-2 rounded-lg border text-center font-semibold transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
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
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors text-xs uppercase tracking-wider"
            >
              {loading ? 'Creating Account...' : 'Complete Customer Registration'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
