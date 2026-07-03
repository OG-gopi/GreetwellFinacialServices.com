'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Animated count-up hook ─────────────────────────── */

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = React.useState(0);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

/* ─────────────────────────── Props ─────────────────────────── */

export interface StatCardProps {
  title: string;
  /** The numeric value to animate to */
  value: number;
  /** Formatted display value string. If provided, skips count-up. */
  displayValue?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    label?: string;
  };
  /** Accent color class override, e.g. 'text-emerald-400' */
  color?: string;
  className?: string;
  /** Prefix for the animated number, e.g. '$', '₹' */
  prefix?: string;
  /** Suffix for the animated number, e.g. '%', 'K' */
  suffix?: string;
}

/* ─────────────────────────── StatCard ─────────────────────────── */

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  displayValue,
  subtitle,
  icon,
  trend,
  color = 'text-gold-400',
  className,
  prefix = '',
  suffix = '',
}) => {
  const animatedValue = useCountUp(value);

  const trendPositive = trend?.direction === 'up';

  return (
    <motion.div
      className={cn('stat-card gfs-card rounded-xl p-5 relative overflow-hidden', className)}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(212,175,55,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Subtle gold gradient glow top-right */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-500/5 blur-2xl" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-sm font-medium text-gray-400 leading-tight">{title}</p>
        {icon && (
          <div className={cn('shrink-0 rounded-lg p-2 bg-navy-700/80', color)}>
            {icon}
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="mb-1">
        <span className={cn('text-3xl font-bold tracking-tight', color)}>
          {displayValue ?? `${prefix}${animatedValue.toLocaleString()}${suffix}`}
        </span>
      </div>

      {/* Subtitle + Trend */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        )}

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 shrink-0',
              trendPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400'
            )}
          >
            {trendPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend.percentage}%</span>
            {trend.label && (
              <span className="text-[10px] font-normal opacity-75 ml-0.5">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

StatCard.displayName = 'StatCard';

export { StatCard };
