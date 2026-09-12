import React, { useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface LazyLoadTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  totalItems?: number;
  endMessage?: string;
  className?: string;
}

export const LazyLoadTrigger: React.FC<LazyLoadTriggerProps> = ({
  onLoadMore,
  hasMore,
  isLoading,
  error,
  onRetry,
  totalItems = 0,
  endMessage = "You're all caught up.",
  className = '',
}) => {
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '150px', // Trigger slightly before reaching absolute bottom
        threshold: 0.1,
      }
    );

    const currentTarget = triggerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, error, onLoadMore]);

  return (
    <div className={`py-6 flex flex-col items-center justify-center text-center ${className}`}>
      {/* Target Intersection Element */}
      <div ref={triggerRef} className="h-2 w-full" />

      {/* Loading Skeleton & Spinner */}
      {isLoading && (
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-600 animate-pulse">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Loading more records...</span>
        </div>
      )}

      {/* Error Retry State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center space-y-2 bg-rose-50 px-5 py-3 rounded-2xl border border-rose-200 text-xs text-rose-800">
          <div className="flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg transition-colors cursor-pointer"
            >
              Retry Loading
            </button>
          )}
        </div>
      )}

      {/* All Caught Up Badge */}
      {!hasMore && !isLoading && !error && totalItems > 0 && (
        <div className="flex items-center space-x-2 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200 text-[11px] font-extrabold uppercase font-mono text-slate-500 tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{endMessage}</span>
          <span className="text-slate-400">({totalItems} items)</span>
        </div>
      )}
    </div>
  );
};

export default LazyLoadTrigger;
