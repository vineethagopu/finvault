import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Trash2, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/formatters'
import { notificationService } from '@/services/notificationService'
import { queryKeys } from '@/services/queryKeys'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: 'ALERT' | 'INFO' | 'SUCCESS' | 'INVESTMENT' | 'SYSTEM'
  title: string
  message: string
  createdAt: string
  isRead: boolean
  category: 'INSURANCE' | 'INVESTMENT' | 'LOAN' | 'ACCOUNT' | 'SYSTEM'
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; dot: string }> = {
  ALERT: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  SUCCESS: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
  INVESTMENT: { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500' },
  SYSTEM: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
}

const CATEGORY_LABEL: Record<string, string> = {
  ALL: 'All', INSURANCE: 'Insurance', INVESTMENT: 'Investment', LOAN: 'Loan', ACCOUNT: 'Account', SYSTEM: 'System',
}
const CATEGORIES = ['ALL', 'INSURANCE', 'INVESTMENT', 'LOAN', 'ACCOUNT', 'SYSTEM']

export function NotificationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(filter, showUnreadOnly),
    queryFn: () =>
      notificationService.getAll<{ data: Notification[]; meta: { unreadCount: number } }>({
        category: filter === 'ALL' ? undefined : filter,
        unreadOnly: showUnreadOnly || undefined,
      }),
  })

  const notifications = data?.data ?? []
  const unreadCount = data?.meta.unreadCount ?? 0

  const markAllRead = async () => {
    await notificationService.markAllRead()
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
  }
  const markRead = async (id: string) => {
    await notificationService.markRead(id)
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
  }
  const deleteNotification = async (id: string) => {
    await notificationService.delete(id)
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    toast.success('Notification deleted')
  }

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <button className="hover:text-green-600" onClick={() => navigate('/app/dashboard')}>Home</button>
          <span>›</span><span className="text-slate-700">Notifications</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-slate-500 mt-0.5">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" leftIcon={<CheckCheck size={13} />} onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <div className="flex gap-1 shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === cat ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${showUnreadOnly ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Bell size={11} /> Unread only
        </button>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No notifications</p>
          </div>
        ) : (
          notifications.map(notif => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.INFO
            const Icon = cfg.icon
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex gap-3 p-4 rounded-xl border transition-colors group cursor-pointer ${!notif.isRead ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/60 border-slate-100'}`}
                onClick={() => !notif.isRead && markRead(notif.id)}
              >
                <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={15} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                      {!notif.isRead && <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                      className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${!notif.isRead ? 'text-slate-600' : 'text-slate-400'}`}>{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-400">{formatDateTime(notif.createdAt)}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-xs text-slate-400">{CATEGORY_LABEL[notif.category] ?? notif.category}</span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
