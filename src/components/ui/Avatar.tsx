import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Variants ─────────────────────────── */

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-20 w-20 text-2xl',
      },
      goldRing: {
        true: 'ring-2 ring-gold-500 ring-offset-2 ring-offset-navy-900',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      goldRing: false,
    },
  }
);

/* ─────────────────────────── Helper ─────────────────────────── */

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic color from name string */
const PALETTE = [
  'bg-blue-600 text-blue-100',
  'bg-emerald-600 text-emerald-100',
  'bg-violet-600 text-violet-100',
  'bg-rose-600 text-rose-100',
  'bg-amber-600 text-amber-100',
  'bg-cyan-600 text-cyan-100',
  'bg-fuchsia-600 text-fuchsia-100',
  'bg-teal-600 text-teal-100',
];

function getColorFromName(name?: string | null): string {
  if (!name) return 'bg-navy-700 text-gray-300';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/* ─────────────────────────── Props ─────────────────────────── */

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  name?: string | null;
  alt?: string;
  goldRing?: boolean;
}

/* ─────────────────────────── Avatar ─────────────────────────── */

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      name,
      alt,
      size,
      goldRing = false,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = React.useState(false);
    const showImage = src && !imgError;
    const initials = getInitials(name);
    const colorClass = getColorFromName(name);

    return (
      <div
        ref={ref}
        role="img"
        aria-label={alt ?? name ?? 'Avatar'}
        className={cn(
          avatarVariants({ size, goldRing }),
          !showImage && colorClass,
          className
        )}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt ?? name ?? 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

/* ─────────────────────────── AvatarGroup ─────────────────────────── */

interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string | null }>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'sm',
  className,
}) => {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((a, i) => (
        <Avatar
          key={i}
          src={a.src}
          name={a.name}
          size={size}
          className="ring-2 ring-navy-800"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            'bg-navy-700 text-gray-300 ring-2 ring-navy-800 text-xs'
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
