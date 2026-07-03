import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a circle (for avatars) */
  circle?: boolean;
  /** Height shorthand (Tailwind h-* value, e.g. "4", "6", "10") */
  height?: string;
  /** Width shorthand (Tailwind w-* value or "full") */
  width?: string;
  /** Number of repeated rows */
  rows?: number;
}

const SkeletonRow: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-md bg-navy-700/60',
      'before:absolute before:inset-0',
      'before:-translate-x-full',
      'before:animate-[shimmer_1.5s_infinite]',
      'before:bg-gradient-to-r',
      'before:from-transparent before:via-white/[0.06] before:to-transparent',
      className
    )}
    aria-hidden="true"
  />
);

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, circle = false, height, width, rows = 1, style, ...props }, ref) => {
    const h = height ? `h-${height}` : 'h-4';
    const w = width ? (width === 'full' ? 'w-full' : `w-${width}`) : 'w-full';
    const shape = circle ? 'rounded-full' : 'rounded-md';

    if (rows > 1) {
      return (
        <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow
              key={i}
              className={cn(
                h,
                // Last row slightly shorter for natural look
                i === rows - 1 ? 'w-4/5' : w,
                shape
              )}
            />
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} style={style} {...props}>
        <SkeletonRow className={cn(h, w, shape, className)} />
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

/* ─────────────────────────── Preset Skeletons ─────────────────────────── */

/** A full card-shaped skeleton for loading state placeholders */
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'rounded-xl border border-navy-700/60 bg-navy-800 p-6 flex flex-col gap-4',
      className
    )}
    aria-hidden="true"
  >
    <div className="flex items-center gap-3">
      <SkeletonRow className="h-10 w-10 rounded-full" />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonRow className="h-4 w-1/3" />
        <SkeletonRow className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton rows={3} />
  </div>
);

/** Table row skeleton */
const SkeletonTableRow: React.FC<{ cols?: number; className?: string }> = ({
  cols = 5,
  className,
}) => (
  <div className={cn('flex items-center gap-4 py-3 px-4', className)} aria-hidden="true">
    {Array.from({ length: cols }).map((_, i) => (
      <SkeletonRow key={i} className={cn('h-4 flex-1', i === 0 && 'max-w-[3rem]')} />
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonTableRow };
