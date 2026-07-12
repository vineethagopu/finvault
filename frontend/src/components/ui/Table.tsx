import React from 'react'
import { cn } from '@/utils/cn'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Skeleton } from './Skeleton'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  className?: string
  width?: string
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  rowKey?: keyof T | ((row: T) => string)
  onRowClick?: (row: T) => void
  className?: string
  stickyHeader?: boolean
}

export function Table<T extends object>({
  data,
  columns,
  loading,
  emptyMessage = 'No records found',
  emptyIcon,
  onSort,
  sortKey,
  sortDir,
  rowKey = 'id' as keyof T,
  onRowClick,
  className,
  stickyHeader,
}: TableProps<T>) {
  const getKey = (row: T) =>
    typeof rowKey === 'function' ? rowKey(row) : String((row as Record<string, unknown>)[rowKey as string])

  const getValue = (row: T, key: string): unknown => {
    return key.split('.').reduce((obj, k) => (obj as Record<string, unknown>)?.[k], row as unknown)
  }

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return
    const key = String(col.key)
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    onSort(key, newDir)
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer hover:text-slate-700',
                  col.className
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleSort(col)}
              >
                <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                  {col.header}
                  {col.sortable && (
                    <span className="text-slate-400">
                      {sortKey === String(col.key) ? (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  {emptyIcon && <div className="text-4xl mb-2">{emptyIcon}</div>}
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={getKey(row)}
                className={cn(
                  'border-b border-slate-50 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3.5 text-slate-700',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(getValue(row, String(col.key)), row, idx)
                      : String(getValue(row, String(col.key)) ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Pagination
interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: PaginationProps) {
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Showing {from} to {to} of {total} records
      </p>
      <div className="flex items-center gap-1">
        <button
          className="px-2 py-1 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(1)} disabled={page === 1}
        >«</button>
        <button
          className="px-2 py-1 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(page - 1)} disabled={page === 1}
        >‹</button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
          return p <= totalPages ? (
            <button
              key={p}
              className={cn('w-7 h-7 text-xs rounded border transition-colors', p === page ? 'bg-green-600 border-green-600 text-white' : 'border-slate-200 hover:bg-slate-50')}
              onClick={() => onPageChange(p)}
            >{p}</button>
          ) : null
        })}
        <button
          className="px-2 py-1 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        >›</button>
        <button
          className="px-2 py-1 text-xs rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
        >»</button>
        {onLimitChange && (
          <select
            className="ml-2 text-xs border border-slate-200 rounded px-1 py-1 bg-white"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
          </select>
        )}
      </div>
    </div>
  )
}
