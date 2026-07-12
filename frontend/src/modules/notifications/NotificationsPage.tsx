import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Trash2, Filter, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Notification {
  id: string
  type: 'ALERT' | 'INFO' | 'SUCCESS' | 'INVESTMENT'
  title: string
  message: string
  time: string
  read: boolean
  category: 'Insurance' | 'Investment' | 'Loan' | 'Account' | 'System'
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'ALERT', title: 'Premium Due Soon', message: 'Your HDFC Health Insurance premium of ₹8,500 is due on June 10, 2025. Pay now to avoid policy lapse.', time: '2 hours ago', read: false, category: 'Insurance' },
  { id: '2', type: 'ALERT', title: 'EMI Due in 5 Days', message: 'Your Home Loan EMI of ₹45,000 to HDFC Bank is due on June 5, 2025.', time: '4 hours ago', read: false, category: 'Loan' },
  { id: '3', type: 'SUCCESS', title: 'Premium Payment Confirmed', message: 'LIC Term Life premium of ₹12,500 for May 2025 has been successfully processed.', time: '1 day ago', read: false, category: 'Insurance' },
  { id: '4', type: 'INVESTMENT', title: 'Portfolio Up 2.3%', message: 'Your investment portfolio gained ₹36,225 (2.3%) this week. HDFC Flexi Cap leads with +3.1%.', time: '2 days ago', read: true, category: 'Investment' },
  { id: '5', type: 'ALERT', title: 'Car Insurance Expiring Soon', message: 'Your Bajaj Allianz Car Insurance expires in 30 days (June 24, 2025). Renew before it lapses.', time: '3 days ago', read: true, category: 'Insurance' },
  { id: '6', type: 'INFO', title: 'Document Uploaded', message: 'Your HDFC Home Loan Agreement has been uploaded and linked to your loan account.', time: '4 days ago', read: true, category: 'Account' },
  { id: '7', type: 'SUCCESS', title: 'Beneficiary Verified', message: 'Priya Sharma has been successfully KYC-verified as a beneficiary for your LIC Term Life policy.', time: '5 days ago', read: true, category: 'Insurance' },
  { id: '8', type: 'INFO', title: 'New Feature: Tax Reports', message: 'You can now generate FY 2024-25 tax deduction reports under Section 80C, 80D, and 24(b).', time: '1 week ago', read: true, category: 'System' },
  { id: '9', type: 'INVESTMENT', title: 'SIP Processed', message: 'Your monthly SIP of ₹10,000 in HDFC Flexi Cap Fund has been processed successfully.', time: '1 week ago', read: true, category: 'Investment' },
  { id: '10', type: 'ALERT', title: 'Overdue Premium', message: 'HDFC Home Insurance premium of ₹2,100 due April 5 is overdue. Pay now to maintain coverage.', time: '3 weeks ago', read: true, category: 'Insurance' },
]

const TYPE_CONFIG = {
  ALERT: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  SUCCESS: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
  INVESTMENT: { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500' },
}

const CATEGORIES = ['All', 'Insurance', 'Investment', 'Loan', 'Account', 'System']

export function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [filter, setFilter] = useState('All')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = notifications.filter(n => {
    const matchCat = filter === 'All' || n.category === filter
    const matchRead = !showUnreadOnly || !n.read
    return matchCat && matchRead
  })

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))

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

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <div className="flex gap-1 shrink-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === cat ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
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

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No notifications</p>
          </div>
        ) : (
          filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type]
            const Icon = cfg.icon
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex gap-3 p-4 rounded-xl border transition-colors group cursor-pointer ${!notif.read ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/60 border-slate-100'}`}
                onClick={() => markRead(notif.id)}
              >
                <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={15} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                      {!notif.read && <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                      className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className={`text-xs mt-0.5 leading-relaxed ${!notif.read ? 'text-slate-600' : 'text-slate-400'}`}>{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-400">{notif.time}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-xs text-slate-400">{notif.category}</span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm">Load older notifications</Button>
        </div>
      )}
    </div>
  )
}
