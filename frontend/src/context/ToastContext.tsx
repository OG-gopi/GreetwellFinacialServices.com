import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, message };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}

      {/* Global Top-Right Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-red-900/95 text-white border-red-700 shadow-red-950/20'
                : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-3 pr-2 min-w-0">
              {toast.type === 'success' && (
                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="p-1.5 bg-red-500/20 text-red-300 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg flex-shrink-0">
                  <Info className="w-5 h-5" />
                </div>
              )}
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white leading-snug break-words">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
              aria-label="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
