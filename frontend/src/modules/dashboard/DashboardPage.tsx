import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Shield, TrendingUp, Upload, FileText, Users, User,
  Calendar, CreditCard, ArrowRight, FolderOpen, Landmark
} from 'lucide-react'
import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { dashboardService } from '@/services/dashboardService'
import { queryKeys } from '@/services/queryKeys'
import { formatCurrency, formatDate, formatDateTime, getPremiumStatus } from '@/utils/formatters'
import type { DashboardStats } from '@/types'

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'due-soon': { bg: '#fff7ed', text: '#c2410c', label: 'Due Soon' },
  upcoming: { bg: '#eff6ff', text: '#1d4ed8', label: 'Upcoming' },
  overdue: { bg: '#fee2e2', text: '#dc2626', label: 'Overdue' },
  future: { bg: '#f1f5f9', text: '#64748b', label: 'Upcoming' },
}

const INSURANCE_META: Record<string, { icon: string; label: string; bg: string }> = {
  life: { icon: '🛡️', label: 'Life Insurance', bg: '#f0fdf4' },
  vehicle: { icon: '🚗', label: 'Vehicle Insurance', bg: '#eff6ff' },
  travel: { icon: '✈️', label: 'Travel Insurance', bg: '#f5f3ff' },
  home: { icon: '🏠', label: 'Home Insurance', bg: '#fff7ed' },
  health: { icon: '❤️', label: 'Health Insurance', bg: '#fef2f2' },
  pet: { icon: '🐾', label: 'Pet/Animal Insurance', bg: '#fdf2f8' },
}

const QUICK_ACTIONS = [
  { icon: Shield, label: 'View My Plan', path: '/app/my-plan', color: '#16a34a', bg: '#f0fdf4' },
  { icon: Upload, label: 'Upload Document', path: '/app/documents', color: '#2563eb', bg: '#eff6ff' },
  { icon: TrendingUp, label: 'Track Investments', path: '/app/investments', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: FileText, label: 'My Documents', path: '/app/documents', color: '#d97706', bg: '#fff7ed' },
  { icon: Users, label: 'Beneficiaries', path: '/app/beneficiaries', color: '#0891b2', bg: '#ecfeff' },
  { icon: User, label: 'Update Profile', path: '/app/profile', color: '#64748b', bg: '#f1f5f9' },
]

// Brand-ish avatar colors for known providers; deterministic fallback otherwise
const PROVIDER_COLORS = [
  { bg: '#fee2e2', text: '#dc2626' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#ffedd5', text: '#ea580c' },
  { bg: '#f3e8ff', text: '#9333ea' },
  { bg: '#dcfce7', text: '#16a34a' },
]
function providerColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return PROVIDER_COLORS[Math.abs(hash) % PROVIDER_COLORS.length]
}

// Fallback data shown only when the API is unreachable (demo mode)
const FALLBACK_STATS: DashboardStats = {
  plan: { type: 'Individual Plan', planId: 'IND-2025-00012345', status: 'Active', startDate: '2025-05-18', expiryDate: '2026-05-18', price: 0 },
  totalPolicies: 6,
  totalMonthlyCommitment: 11008,
  insuranceSummary: { life: 1, vehicle: 1, travel: 1, home: 1, health: 0, pet: 1 },
  duePremiums: [
    { id: '1', insurer: 'HDFC Life', policyName: 'Term Life Insurance', dueDate: '2025-05-25', amount: 1200, status: 'due-soon' },
    { id: '2', insurer: 'Care Health Insurance', policyName: 'Health Insurance', dueDate: '2025-05-28', amount: 1850, status: 'due-soon' },
    { id: '3', insurer: 'Bajaj Allianz', policyName: 'Car Insurance', dueDate: '2025-05-30', amount: 2458, status: 'upcoming' },
  ],
  investmentOverview: {
    total: 3,
    monthlyDue: 2000,
    items: [
      { id: '1', company: 'SBI Mutual Fund', type: 'SIP', dueDate: '2025-05-27', amount: 1000 },
      { id: '2', company: 'ICICI Prudential', type: 'SIP', dueDate: '2025-05-30', amount: 500 },
      { id: '3', company: 'HDFC Mutual Fund', type: 'SIP', dueDate: '2025-05-31', amount: 500 },
    ]
  },
  loanOverview: {
    total: 1,
    monthlyEmi: 3500,
    items: [
      { id: '1', provider: 'HDFC Bank', loanType: 'Personal Loan', dueDate: '2025-05-28', emiAmount: 3500 }
    ]
  }
}

function monthOptions(count = 6): string[] {
  const now = new Date()
  return Array.from({ length: count }, (_, i) =>
    format(new Date(now.getFullYear(), now.getMonth() + i, 1), 'MMM yyyy')
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const months = useMemo(() => monthOptions(), [])
  const [selectedMonth, setSelectedMonth] = useState(months[0])

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: queryKeys.dashboard.stats(selectedMonth),
    queryFn: () => dashboardService.getStats(selectedMonth),
    refetchInterval: 30_000,        // live refresh every 30s
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    retry: 1,
  })

  if (isLoading) return <DashboardSkeleton />

  const isLive = !isError && !!data
  const stats = data ?? FALLBACK_STATS

  const insuranceItems = Object.entries(stats.insuranceSummary).filter(([, v]) => v > 0)
  const totalDuePremium = stats.duePremiums.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back,</p>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {user?.firstName} {user?.lastName} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your account today.</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <p className="text-xs text-slate-500">
              Last login: {user?.lastLogin ? formatDateTime(user.lastLogin) : '—'}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                <Shield size={11} /> Secure Session
              </div>
              {isLive ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live · {format(new Date(dataUpdatedAt), 'hh:mm:ss aa')}
                </div>
              ) : (
                <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                  Demo data · API offline
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Your Plan"
          value={stats.plan.type}
          subValue={`Plan ID: ${stats.plan.planId}`}
          icon={<User size={18} className="text-green-600" />}
          iconBg="#f0fdf4"
        />
        <StatCard
          label="Plan Status"
          value={stats.plan.status}
          subValue={`Since ${formatDate(stats.plan.startDate)} · Expires on ${formatDate(stats.plan.expiryDate)}`}
          icon={<Calendar size={18} className="text-blue-600" />}
          iconBg="#eff6ff"
        />
        <StatCard
          label="Plan Price"
          value={`${formatCurrency(stats.plan.price)} / year`}
          subValue="Billed annually"
          icon={<CreditCard size={18} className="text-purple-600" />}
          iconBg="#f5f3ff"
        />
        <StatCard
          label="Total Policies"
          value={`${stats.totalPolicies} Policies`}
          subValue="Across all categories"
          icon={<Shield size={18} className="text-orange-600" />}
          iconBg="#fff7ed"
        />
      </div>

      {/* Month selector + Insurance summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Month &amp; Year</p>
              </div>
              <select
                className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              >
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FolderOpen size={18} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Total Monthly Commitment</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.totalMonthlyCommitment)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Your Insurance Summary</h3>
            <Link to="/app/insurance" className="text-xs text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
              View All Insurance <ArrowRight size={12} />
            </Link>
          </div>
          {insuranceItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active insurance policies yet. Add your first policy to see it here.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {insuranceItems.map(([type, count]) => {
                const meta = INSURANCE_META[type] ?? { icon: '📋', label: `${type} Insurance`, bg: '#f1f5f9' }
                return (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: meta.bg }}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 leading-tight truncate">{meta.label}</p>
                      <p className="text-base font-bold text-slate-800 leading-tight">{count}</p>
                      <p className="text-[10px] text-slate-400">{count === 1 ? 'Policy' : 'Policies'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Due Premiums + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">This Month Due Premium</h3>
            <Link to="/app/my-plan/premium-calendar" className="text-xs text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
              View All Due Premiums <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-0">
            <div className="grid grid-cols-5 pb-2 mb-1 border-b border-slate-100">
              {['Insurance Company', 'Policy/Plan', 'Due Date', 'Amount', 'Action'].map(h => (
                <p key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-1">{h}</p>
              ))}
            </div>
            {stats.duePremiums.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No premiums due in {selectedMonth}. You're all caught up 🎉</p>
            )}
            {stats.duePremiums.map((p) => {
              const status = getPremiumStatus(p.dueDate)
              const style = STATUS_STYLES[status]
              const color = providerColor(p.insurer)
              return (
                <div key={p.id} className="grid grid-cols-5 items-center py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: color.bg, color: color.text }}>
                      {p.insurer.slice(0, 1)}
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate">{p.insurer}</p>
                  </div>
                  <p className="text-xs text-slate-600 px-1 truncate">{p.policyName}</p>
                  <p className="text-xs font-medium px-1" style={{ color: style.text }}>{formatDate(p.dueDate)}</p>
                  <p className="text-xs font-semibold text-slate-800 px-1">{formatCurrency(p.amount)}</p>
                  <div className="px-1">
                    <Button size="xs" className="text-xs">Pay Now</Button>
                  </div>
                </div>
              )
            })}
            {stats.duePremiums.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 mt-2 bg-red-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600">Total Due Premium (This Month)</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(totalDuePremium)}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, path, color, bg }) => (
              <Link
                key={label}
                to={path}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-[11px] font-medium text-slate-600 text-center leading-tight">{label}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Investments + Loans row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Investments */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Investments Overview</p>
                <p className="text-xs text-slate-500">Total Investments: {stats.investmentOverview.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-500">This Month Due Amount</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(stats.investmentOverview.monthlyDue)}</p>
              </div>
              <Link to="/app/investments" className="text-xs text-green-600 font-medium flex items-center gap-1">
                View All Investments <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="space-y-0">
            <div className="grid grid-cols-5 pb-2 mb-1 border-b border-slate-100">
              {['Investment Company', 'Investment Type', 'Due Date', 'Amount', 'Action'].map(h => (
                <p key={h} className="text-[10px] font-semibold text-slate-400 uppercase">{h}</p>
              ))}
            </div>
            {stats.investmentOverview.items.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No SIPs due in {selectedMonth}.</p>
            )}
            {stats.investmentOverview.items.map((item) => {
              const color = providerColor(item.company)
              return (
                <div key={item.id} className="grid grid-cols-5 items-center py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: color.bg, color: color.text }}>
                      {item.company.slice(0, 1)}
                    </div>
                    <p className="text-xs text-slate-700 truncate">{item.company}</p>
                  </div>
                  <p className="text-xs text-slate-600">{item.type}</p>
                  <p className="text-xs font-medium text-orange-600">{formatDate(item.dueDate)}</p>
                  <p className="text-xs font-semibold text-slate-800">{formatCurrency(item.amount)}</p>
                  <div><Button size="xs" variant="outline" className="text-xs">Pay Now</Button></div>
                </div>
              )
            })}
            {stats.investmentOverview.items.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 mt-2 bg-red-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600">Total Due Amount (This Month)</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(stats.investmentOverview.monthlyDue)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Loans */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Landmark size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Loans Overview</p>
                <p className="text-xs text-slate-500">Total Loans: {stats.loanOverview.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-slate-500">This Month EMI Amount</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(stats.loanOverview.monthlyEmi)}</p>
              </div>
              <Link to="/app/loans" className="text-xs text-green-600 font-medium flex items-center gap-1">
                View All Loans <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="space-y-0">
            <div className="grid grid-cols-5 pb-2 mb-1 border-b border-slate-100">
              {['Loan Provider', 'Loan Type', 'Due Date', 'EMI Amount', 'Action'].map(h => (
                <p key={h} className="text-[10px] font-semibold text-slate-400 uppercase">{h}</p>
              ))}
            </div>
            {stats.loanOverview.items.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No EMIs due in {selectedMonth}.</p>
            )}
            {stats.loanOverview.items.map((item) => {
              const color = providerColor(item.provider)
              return (
                <div key={item.id} className="grid grid-cols-5 items-center py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: color.bg, color: color.text }}>
                      {item.provider.slice(0, 1)}
                    </div>
                    <p className="text-xs text-slate-700 truncate">{item.provider}</p>
                  </div>
                  <p className="text-xs text-slate-600">{item.loanType}</p>
                  <p className="text-xs font-medium text-orange-600">{formatDate(item.dueDate)}</p>
                  <p className="text-xs font-semibold text-slate-800">{formatCurrency(item.emiAmount)}</p>
                  <div><Button size="xs" variant="outline" className="text-xs">Pay Now</Button></div>
                </div>
              )
            })}
            {stats.loanOverview.items.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 mt-2 bg-red-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600">Total EMI Due (This Month)</p>
                <p className="text-sm font-bold text-red-600">{formatCurrency(stats.loanOverview.monthlyEmi)}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom notice */}
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
        <Shield size={14} className="text-green-600 shrink-0" />
        <p className="text-xs text-green-700">Keep your policies, investments &amp; loans up to date to stay financially secure.</p>
      </div>
    </div>
  )
}
