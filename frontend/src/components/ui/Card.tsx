import React from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ className, children, hover = false, padding = 'md', ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-100 shadow-sm',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-800', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

// Stat card
interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: React.ReactNode
  iconBg?: string
  trend?: { value: number; label?: string }
  className?: string
  onClick?: () => void
}

export function StatCard({ label, value, subValue, icon, iconBg = '#f0fdf4', trend, className, onClick }: StatCardProps) {
  return (
    <Card className={cn('cursor-default', onClick && 'cursor-pointer', className)} onClick={onClick} hover={!!onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900 truncate">{value}</p>
          {subValue && <p className="mt-0.5 text-xs text-slate-500">{subValue}</p>}
          {trend && (
            <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
