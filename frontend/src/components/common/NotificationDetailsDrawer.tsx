import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  Clock,
  CheckCircle2,
  ShieldAlert,
  FileText,
  User,
  HelpCircle,
  CreditCard,
  Briefcase,
  TrendingUp,
  Layers,
  ArrowRight,
  ExternalLink,
  Check,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NotificationDetailsDrawerProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (n: NotificationItem) => void;
  onUpdateActionStatus?: (id: string, status: string) => void;
}

export const NotificationDetailsDrawer: React.FC<NotificationDetailsDrawerProps> = ({
  notification,
  isOpen,
  onClose,
  onToggleRead,
  onUpdateActionStatus,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !notification) return null;

  // Determine role base path
  const role = user?.role;
  let basePath = '/superadmin';
  if (role === 'LOAN_AGENT') basePath = '/loan-agent';
  else if (role === 'INSURANCE_AGENT') basePath = '/insurance-agent';
  else if (role === 'INVESTMENT_AGENT') basePath = '/investment-agent';
  else if (role === 'CUSTOMER') basePath = '/customer';

  // Module Styling
  const getModuleBadge = (moduleStr?: string | null) => {
    const mod = (moduleStr || 'GENERAL').toUpperCase();
    switch (mod) {
      case 'LOANS':
        return { label: 'LOAN SERVICE', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: CreditCard };
      case 'INSURANCE':
        return { label: 'INSURANCE SERVICE', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Briefcase };
      case 'INVESTMENTS':
        return { label: 'INVESTMENT SERVICE', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: TrendingUp };
      case 'DOCUMENTS':
        return { label: 'DOCUMENT VAULT', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: FileText };
      case 'ENQUIRIES':
        return { label: 'ENQUIRY & HELP', bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: HelpCircle };
      case 'CUSTOMERS':
      case 'AGENTS':
      case 'USERS':
        return { label: 'USER MANAGEMENT', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: User };
      default:
        return { label: mod, bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: Layers };
    }
  };

  const badge = getModuleBadge(notification.module);
  const BadgeIcon = badge.icon;

  // Handle direct navigation to target module
  const handleNavigateToEntity = () => {
    onClose();
    if (notification.module === 'DOCUMENTS' || notification.type?.includes('DOCUMENT')) {
      navigate(`${basePath}/documents`);
    } else if (notification.module === 'ENQUIRIES' || notification.type?.includes('ENQUIRY')) {
      navigate(`${basePath}/enquiries`);
    } else if (notification.applicationId || notification.relatedEntity === 'APPLICATION') {
      const appId = notification.applicationId || notification.relatedEntityId;
      if (appId?.startsWith('INS-')) {
        navigate(role === 'SUPER_ADMIN' ? '/superadmin/applications/insurance' : `${basePath}/applications`);
      } else if (appId?.startsWith('INV-')) {
        navigate(role === 'SUPER_ADMIN' ? '/superadmin/applications/investments' : `${basePath}/applications`);
      } else {
        navigate(role === 'SUPER_ADMIN' ? '/superadmin/applications/loans' : `${basePath}/applications`);
      }
    } else if (notification.customerId || notification.relatedEntity === 'USER') {
      navigate(role === 'SUPER_ADMIN' ? '/superadmin/users' : `${basePath}/dashboard`);
    } else {
      navigate(`${basePath}/dashboard`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Drawer Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Notification Details</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {notification.id.slice(0, 8)}...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Badges & Status Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold font-mono px-3 py-1 rounded-lg border ${badge.bg}`}>
                <BadgeIcon className="w-3.5 h-3.5" />
                {badge.label}
              </span>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                Source: {notification.source || 'SYSTEM'}
              </span>

              {notification.actionStatus === 'ACTION_REQUIRED' && (
                <span className="text-xs font-extrabold text-rose-700 bg-rose-100 border border-rose-200 px-3 py-1 rounded-lg flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Action Required
                </span>
              )}
              {notification.actionStatus === 'ACTION_TAKEN' && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Action Taken
                </span>
              )}
            </div>

            {/* Title & Timestamp */}
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-900 leading-snug">{notification.title}</h2>
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {new Date(notification.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Message Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Notification Summary
              </h4>
              <p className="text-sm font-normal text-slate-700 leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>

            {/* Related Information Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                Related Entity Metadata
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
                {notification.applicationId && (
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-500">Application ID:</span>
                    <span className="font-mono font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {notification.applicationId}
                    </span>
                  </div>
                )}

                {notification.customerId && (
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-500">Customer ID:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {notification.customerId}
                    </span>
                  </div>
                )}

                {notification.agentId && (
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-500">Agent ID:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {notification.agentId}
                    </span>
                  </div>
                )}

                {notification.documentId && (
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-500">Document Reference:</span>
                    <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md">
                      {notification.documentId}
                    </span>
                  </div>
                )}

                {notification.relatedEntityId && notification.relatedEntityId !== notification.applicationId && (
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-500">Related {notification.relatedEntity || 'Record'}:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {notification.relatedEntityId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Workflow Navigation Button */}
            <div className="pt-2">
              <button
                onClick={handleNavigateToEntity}
                className="w-full py-3 px-4 bg-[#1d63ed] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>View Related Module & Details</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onToggleRead(notification)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  notification.isRead
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{notification.isRead ? 'Mark as Unread' : 'Mark as Read'}</span>
              </button>
            </div>

            {user?.role !== 'CUSTOMER' && onUpdateActionStatus && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => onUpdateActionStatus(notification.id, 'ACTION_TAKEN')}
                  className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    notification.actionStatus === 'ACTION_TAKEN'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  Action Taken
                </button>
                <button
                  onClick={() => onUpdateActionStatus(notification.id, 'ACTION_REQUIRED')}
                  className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    notification.actionStatus === 'ACTION_REQUIRED'
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  Action Required
                </button>
                <button
                  onClick={() => onUpdateActionStatus(notification.id, 'NOT_REQUIRED')}
                  className={`py-2 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    notification.actionStatus === 'NOT_REQUIRED'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Not Required
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsDrawer;
