import React from 'react';
import { GFSLogo } from './GFSLogo';

interface GFSBrandHeaderProps {
  portalTitle?: string;
  accentColor?: 'navy' | 'emerald' | 'blue' | 'gold';
  size?: 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'raw' | 'card';
  className?: string;
}

export const GFSBrandHeader: React.FC<GFSBrandHeaderProps> = ({
  portalTitle,
  size = 'xl',
  variant = 'raw',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-2 select-none ${className}`}>
      {/* Official GFS Logo Asset */}
      <GFSLogo size={size} variant={variant} />

      {/* Optional Portal Title Badge */}
      {portalTitle && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/40 text-[11px] font-semibold text-amber-300 tracking-wider uppercase shadow-sm">
          <span>{portalTitle}</span>
        </div>
      )}
    </div>
  );
};

export default GFSBrandHeader;
