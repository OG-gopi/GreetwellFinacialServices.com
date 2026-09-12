import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { GFSLogo } from '../../components/common/GFSLogo';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
        <GFSLogo size="lg" variant="card" className="mx-auto mb-2" />
        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested page or resource does not exist on the Greetwell Financial Services portal.
        </p>
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Go to Login / Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
