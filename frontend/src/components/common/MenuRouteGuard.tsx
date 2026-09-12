import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface MenuRouteGuardProps {
  children: React.ReactNode;
}

export const MenuRouteGuard: React.FC<MenuRouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [accessState, setAccessState] = useState<{ allowed: boolean; message?: string }>({ allowed: true });

  useEffect(() => {
    let isMounted = true;
    
    // Skip checking for public auth routes
    if (!user || location.pathname.startsWith('/login') || location.pathname.startsWith('/customer/login') || location.pathname.startsWith('/agent/login')) {
      setChecking(false);
      return;
    }

    setChecking(true);
    api.get(`/menus/check-access?url=${encodeURIComponent(location.pathname)}`)
      .then((res) => {
        if (isMounted) {
          setAccessState({ allowed: res.data.allowed, message: res.data.message });
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err.response?.status === 403) {
            setAccessState({ allowed: false, message: err.response?.data?.message || 'This menu is currently unavailable.' });
          } else {
            // Default to allow on unmapped routes or connection error
            setAccessState({ allowed: true });
          }
        }
      })
      .finally(() => {
        if (isMounted) setChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname, user]);

  if (checking) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-xs font-semibold">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3" />
        Verifying menu availability & permissions...
      </div>
    );
  }

  if (!accessState.allowed) {
    const getDashboardPath = () => {
      if (!user) return '/login';
      switch (user.role) {
        case 'SUPER_ADMIN': return '/superadmin/dashboard';
        case 'LOAN_AGENT': return '/loan-agent/dashboard';
        case 'INSURANCE_AGENT': return '/insurance-agent/dashboard';
        case 'INVESTMENT_AGENT': return '/investment-agent/dashboard';
        case 'CUSTOMER': return '/customer/dashboard';
        default: return '/';
      }
    };

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Menu Unavailable</h2>
            <p className="text-xs font-semibold text-rose-600">
              {accessState.message || 'This menu is currently unavailable.'}
            </p>
            <p className="text-xs text-slate-500 pt-1 leading-relaxed">
              This feature has been deactivated or restricted by the Superadmin. Please contact system support if you believe this is an error.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
