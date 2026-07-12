import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  footer?: React.ReactNode
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
}

export function Modal({ open, onClose, title, description, children, size = 'md', showClose = true, footer }: ModalProps) {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'relative w-full bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]',
              sizes[size]
            )}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
                <div>
                  {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && (
              <div className="p-6 pt-4 border-t border-slate-100">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Confirm dialog
interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary' | 'outline'
  loading?: boolean
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', loading }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>{cancelText}</Button>
          <Button variant={variant === 'warning' ? 'outline' : variant} size="sm" onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      }
    >
      {description && <p className="text-sm text-slate-600">{description}</p>}
    </Modal>
  )
}
