import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, ChevronDown, Menu, LogOut, User, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

interface TopbarProps {
  onMenuClick: () => void
  alertCount?: number
}

export function Topbar({ onMenuClick, alertCount = 0 }: TopbarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await authService.logout()
    } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User'

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-slate-100 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Help */}
        <div className="relative">
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="flex items-center gap-1 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <HelpCircle size={18} />
            <span className="hidden sm:block text-sm font-medium">Help & Support</span>
            <ChevronDown size={14} className={cn('transition-transform', helpOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {helpOpen && (
              <motion.div
                className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              >
                <button className="w-full px-4 py-2 text-sm text-left text-slate-600 hover:bg-slate-50" onClick={() => setHelpOpen(false)}>Help Center</button>
                <button className="w-full px-4 py-2 text-sm text-left text-slate-600 hover:bg-slate-50" onClick={() => setHelpOpen(false)}>Contact Support</button>
                <button className="w-full px-4 py-2 text-sm text-left text-slate-600 hover:bg-slate-50" onClick={() => setHelpOpen(false)}>FAQs</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <Link to="/app/alerts" className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Avatar name={fullName} src={user?.avatar} size="sm" className="bg-green-600" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-none">{fullName}</p>
            </div>
            <ChevronDown size={14} className={cn('text-slate-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    {user?.planType} Plan
                  </span>
                </div>
                <Link to="/app/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <User size={15} /> Profile & Settings
                </Link>
                <Link to="/app/my-plan" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <Shield size={15} /> My Plan
                </Link>
                <div className="border-t border-slate-100 mt-1">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} /> {loggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
