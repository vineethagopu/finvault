import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Shield, ShieldCheck, TrendingUp, Banknote,
  FolderOpen, Users, Settings, BarChart3, Bell, ChevronLeft, ChevronRight, X,
  ShoppingCart, PenLine,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Logo } from './Logo'
import { useAuthStore } from '@/store/authStore'
import { NewBadge } from '@/components/ui/Badge'
import { useUIStore } from '@/store/uiStore'

const NAV = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'My Plan', path: '/app/my-plan', icon: Shield },
  { label: 'Invest Online', path: '/app/invest-online', icon: ShoppingCart, badge: 'NEW' },
  { label: 'Insurance', path: '/app/insurance', icon: ShieldCheck },
  { label: 'Investments', path: '/app/investments', icon: TrendingUp },
  { label: 'Loans', path: '/app/loans', icon: Banknote },
  { label: 'Documents', path: '/app/documents', icon: FolderOpen },
  { label: 'Beneficiaries', path: '/app/beneficiaries', icon: Users },
  { label: 'Profile & Settings', path: '/app/profile', icon: Settings },
  { label: 'Reports', path: '/app/reports', icon: BarChart3, badge: 'NEW' },
  { label: 'Alerts & Messages', path: '/app/alerts', icon: Bell, count: 3 },
  { label: 'Buy Investments Online', path: '/app/buy-investments', icon: PenLine, badge: 'NEW' },
]

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const { user } = useAuthStore()
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore()
  const location = useLocation()

  const collapsed = !mobile && sidebarCollapsed
  const isInvestments = location.pathname.startsWith('/app/investments')

  return (
    <aside className={cn(
      'flex flex-col bg-white border-r border-slate-100 transition-all duration-300',
      collapsed ? 'w-16' : 'w-60',
      mobile && 'w-72 h-full'
    )}>
      {/* Header */}
      <div className={cn('flex items-center justify-between p-4 border-b border-slate-100', collapsed && 'justify-center px-2')}>
        {!collapsed && <Logo size="sm" />}
        {collapsed && <Logo size="sm" variant="icon" />}
        {mobile ? (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={toggleSidebarCollapsed}
            className={cn('p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100', collapsed && 'hidden')}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className={cn('shrink-0', isActive && 'text-green-600')} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && <NewBadge />}
                  {'count' in item && item.count ? (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.count}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Sidebar footer */}
      {!collapsed && user && (
        <div className="p-3 mt-auto">
          <div className="p-4 bg-slate-50 rounded-lg text-center border border-slate-100">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs font-semibold text-green-800">
              {isInvestments ? 'Track and grow your wealth' : "Secure your family's future"}
            </p>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              {isInvestments ? 'View all your investments in one place and make smarter decisions.' : 'Complete your profile and add your nominees today.'}
            </p>
            <button className="mt-3 w-full py-2 text-xs font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              {isInvestments ? 'Explore Investments' : 'Complete Now'}
            </button>
          </div>
          <div className="mt-6 px-1">
            <p className="text-[11px] text-slate-400">© 2025 PolicyNext</p>
            <p className="text-[11px] text-slate-400 mt-1">All rights reserved.</p>
          </div>
        </div>
      )}

      {collapsed && (
        <button
          onClick={toggleSidebarCollapsed}
          className="p-3 border-t border-slate-100 flex justify-center text-slate-400 hover:text-slate-600"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </aside>
  )
}
