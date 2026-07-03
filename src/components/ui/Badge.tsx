import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-navy-700 text-gray-200 border border-navy-600',
        gold:
          'bg-gold-500/20 text-gold-400 border border-gold-500/40',
        success:
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        warning:
          'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        danger:
          'bg-red-500/20 text-red-400 border border-red-500/40',
        info:
          'bg-blue-500/20 text-blue-400 border border-blue-500/40',
        closed:
          'bg-gray-500/20 text-gray-400 border border-gray-500/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
