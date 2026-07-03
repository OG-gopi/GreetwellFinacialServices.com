'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Props ─────────────────────────── */

export interface EmptyStateProps {
  /** Large icon or illustration */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Action button or element */
  action?: React.ReactNode;
  className?: string;
}

/* ─────────────────────────── EmptyState ─────────────────────────── */

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Icon area */}
      {icon && (
        <motion.div
          className={cn(
            'mb-5 flex items-center justify-center',
            'h-20 w-20 rounded-2xl',
            'bg-navy-700/60 border border-navy-600/60',
            'text-gold-500'
          )}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="[&_svg]:h-9 [&_svg]:w-9">{icon}</span>
        </motion.div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
};

EmptyState.displayName = 'EmptyState';

export { EmptyState };
