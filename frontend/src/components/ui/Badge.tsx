import React from 'react'
import { cn } from '@/utils/cn'
import { STATUS_COLORS } from '@/constants'

interface BadgeProps {
  status?: string
  className?: string
  children?: React.ReactNode
  dot?: boolean
}

export function Badge({ status, className, children, dot = false }: BadgeProps) {
  const colors = status ? STATUS_COLORS[status.toUpperCase()] : null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        className
      )}
      style={colors ? { backgroundColor: colors.bg, color: colors.text } : undefined}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors?.text || 'currentColor' }} />
      )}
      {children || (colors?.label ?? status)}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge status={status} dot />
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
      NEW
    </span>
  )
}
