import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Size map ─────────────────────────── */

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

/* ─────────────────────────── Props ─────────────────────────── */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: keyof typeof sizeClasses;
  hideCloseButton?: boolean;
  className?: string;
}

/* ─────────────────────────── Modal ─────────────────────────── */

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideCloseButton = false,
  className,
}) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                key="modal-overlay"
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  key="modal-content"
                  className={cn(
                    'relative w-full rounded-2xl border border-navy-700/80',
                    'bg-navy-800 shadow-2xl shadow-black/50',
                    'focus:outline-none',
                    sizeClasses[size],
                    className
                  )}
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Gold accent top border */}
                  <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

                  {/* Header */}
                  {(title || !hideCloseButton) && (
                    <div className="flex items-start justify-between px-6 py-5 border-b border-navy-700/60">
                      <div className="flex-1 min-w-0 pr-4">
                        {title && (
                          <DialogPrimitive.Title className="text-lg font-semibold text-white leading-tight">
                            {title}
                          </DialogPrimitive.Title>
                        )}
                        {description && (
                          <DialogPrimitive.Description className="mt-1 text-sm text-gray-400">
                            {description}
                          </DialogPrimitive.Description>
                        )}
                      </div>

                      {!hideCloseButton && (
                        <DialogPrimitive.Close
                          onClick={onClose}
                          className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-navy-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
                          aria-label="Close modal"
                        >
                          <X className="h-5 w-5" />
                        </DialogPrimitive.Close>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="px-6 py-5">{children}</div>
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};

Modal.displayName = 'Modal';

export { Modal };
