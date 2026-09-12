import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (statusStr: string) => {
    switch (statusStr.toUpperCase()) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'VERIFIED':
      case 'COMPLETED':
      case 'ACCEPTED':
      case 'FULFILLED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';

      case 'SUBMITTED':
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';

      case 'UNDER_REVIEW':
      case 'VERIFICATION':
      case 'PENDING_ASSIGNMENT':
      case 'PENDING':
      case 'PENDING_VERIFICATION':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';

      case 'INFORMATION_REQUIRED':
      case 'DOCUMENTS_REQUIRED':
      case 'REPLACEMENT_REQUIRED':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20';

      case 'REJECTED':
      case 'INACTIVE':
      case 'EXPIRED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
    }
  };

  const formattedStatus = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {formattedStatus}
    </span>
  );
};
