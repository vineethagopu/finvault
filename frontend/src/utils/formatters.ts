import { format, parseISO } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function formatDate(date: string | Date): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd MMM yyyy')
  } catch {
    return String(date)
  }
}

export function formatDateShort(date: string | Date): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd/MM/yyyy')
  } catch {
    return String(date)
  }
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd MMM yyyy, hh:mm aa')
  } catch {
    return String(date)
  }
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function maskMobile(mobile: string): string {
  if (!mobile) return ''
  return mobile.replace(/(\d{2})\d{6}(\d{2})/, '$1XXXXXX$2')
}

export function maskEmail(email: string): string {
  if (!email) return ''
  const [user, domain] = email.split('@')
  const masked = user.slice(0, 2) + '****' + user.slice(-1)
  return `${masked}@${domain}`
}

export function truncate(str: string, length = 30): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function getInitials(name: string): string {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function daysFromNow(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getPremiumStatus(dueDate: string): 'overdue' | 'due-soon' | 'upcoming' | 'future' {
  const days = daysFromNow(dueDate)
  if (days < 0) return 'overdue'
  if (days <= 15) return 'due-soon'
  if (days <= 30) return 'upcoming'
  return 'future'
}
