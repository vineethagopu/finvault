import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, IndianRupee, Landmark, ShieldCheck, Copy, Download, ChevronRight,
  ChevronLeft, Plus, Pencil, Trash2, Search, Filter as FilterIcon, RotateCcw,
  Info, Umbrella, Car, Plane, Home, PawPrint, HeartPulse, Shield, FileText, CheckCircle2,
  Headphones, CalendarDays, List, MoreVertical, Wallet, Receipt
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, formatDateTime, daysFromNow } from '@/utils/formatters'
import { policyService } from '@/services/policyService'
import { dashboardService } from '@/services/dashboardService'
import { queryKeys } from '@/services/queryKeys'
import { useAuthStore } from '@/store/authStore'
import { API_BASE_URL } from '@/constants'
import type { Policy, DashboardStats, DuePremium } from '@/types'
import toast from 'react-hot-toast'

type CategoryKey = 'life' | 'health' | 'vehicle' | 'travel' | 'home' | 'pet' | 'other'

const CATEGORY_META: Record<CategoryKey, {
  label: string; short: string; icon: React.ElementType; color: string; bg: string; badgeBg: string; badgeText: string
}> = {
  life: { label: 'Life Insurance', short: 'Life', icon: Umbrella, color: '#16a34a', bg: '#f0fdf4', badgeBg: '#dcfce7', badgeText: '#15803d' },
  health: { label: 'Health Insurance', short: 'Health', icon: HeartPulse, color: '#db2777', bg: '#fdf2f8', badgeBg: '#fce7f3', badgeText: '#be185d' },
  vehicle: { label: 'Vehicle Insurance', short: 'Vehicle', icon: Car, color: '#2563eb', bg: '#eff6ff', badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
  travel: { label: 'Travel Insurance', short: 'Travel', icon: Plane, color: '#7c3aed', bg: '#f5f3ff', badgeBg: '#ede9fe', badgeText: '#6d28d9' },
  home: { label: 'Home Insurance', short: 'Home', icon: Home, color: '#ea580c', bg: '#fff7ed', badgeBg: '#ffedd5', badgeText: '#c2410c' },
  pet: { label: 'Pet/Animal Insurance', short: 'Pet', icon: PawPrint, color: '#0891b2', bg: '#ecfeff', badgeBg: '#cffafe', badgeText: '#0e7490' },
  other: { label: 'Other Insurance', short: 'Other', icon: Shield, color: '#64748b', bg: '#f1f5f9', badgeBg: '#e2e8f0', badgeText: '#475569' },
}

// Mirrors backend/src/dashboard/dashboard.service.ts's INSURANCE_KEY_MAP — no dedicated
// PET type in the schema, so OTHER-typed policies are treated as "pet/animal" here too.
function categoryFor(insuranceType: string): CategoryKey {
  switch (insuranceType) {
    case 'LIFE': return 'life'
    case 'HEALTH': return 'health'
    case 'VEHICLE': return 'vehicle'
    case 'TRAVEL': return 'travel'
    case 'HOME': return 'home'
    case 'OTHER': return 'pet'
    default: return 'other'
  }
}

const PROVIDER_STYLE: Record<string, { bg: string; text: string }> = {
  'HDFC Life': { bg: '#fee2e2', text: '#dc2626' },
  'Bajaj Allianz': { bg: '#dbeafe', text: '#1d4ed8' },
  'ICICI Lombard': { bg: '#ffedd5', text: '#ea580c' },
  'HDFC Ergo': { bg: '#fee2e2', text: '#b91c1c' },
  'Future Generali': { bg: '#fecaca', text: '#dc2626' },
}
function providerStyle(name: string) {
  return PROVIDER_STYLE[name] ?? { bg: '#f1f5f9', text: '#475569' }
}

const TABS = ['Plan Summary', 'Plan Details', 'Premium Calendar', 'Nominees', 'Plan Documents'] as const
type Tab = typeof TABS[number]

function CategoryIcon({ category, size = 'md' }: { category: CategoryKey; size?: 'sm' | 'md' }) {
  const meta = CATEGORY_META[category]
  const Icon = meta.icon
  const box = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'
  return (
    <div className={`${box} flex items-center justify-center shrink-0`} style={{ backgroundColor: meta.bg }}>
      <Icon size={size === 'sm' ? 14 : 17} style={{ color: meta.color }} />
    </div>
  )
}

function ProviderLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const style = providerStyle(name)
  const box = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-6 h-6 text-[10px]'
  return (
    <div className={`${box} rounded-md flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: style.bg, color: style.text }}>
      {name.slice(0, 1)}
    </div>
  )
}

function StatusChip({ label }: { label: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-green-50 text-green-700', ACTIVE: 'bg-green-50 text-green-700',
    'Due Soon': 'bg-amber-50 text-amber-700', 'due-soon': 'bg-amber-50 text-amber-700',
    Upcoming: 'bg-blue-50 text-blue-700', upcoming: 'bg-blue-50 text-blue-700',
    Overdue: 'bg-red-50 text-red-600', overdue: 'bg-red-50 text-red-600',
    Expired: 'bg-slate-100 text-slate-500', EXPIRED: 'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[label] ?? 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5 whitespace-nowrap ${className}`}>{children}</th>
}

function InfoBanner({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Info size={14} className="text-blue-500 shrink-0" />
        {children}
      </div>
      {action}
    </div>
  )
}

// ─── Tab 1: Plan Summary ─────────────────────────────────────────────────────

function PlanSummaryTab({ policies, onViewDetails }: { policies: Policy[]; onViewDetails: (id: string) => void }) {
  const total = policies.reduce((s, p) => s + Number(p.premiumAmount), 0)
  const byCategory = policies.reduce<Record<string, number>>((acc, p) => {
    const key = categoryFor(p.insuranceType)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Your Plan Overview</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          onClick={() => toast.success('Plan summary download started')}>
          Download Plan Summary <Download size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {(Object.keys(byCategory) as CategoryKey[]).map(key => {
          const meta = CATEGORY_META[key]
          return (
            <div key={key} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white">
              <CategoryIcon category={key} />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 leading-tight truncate">{meta.label}</p>
                <p className="text-lg font-bold text-slate-900 leading-tight">{byCategory[key]}</p>
                <p className="text-[10px] text-slate-400">{byCategory[key] === 1 ? 'Policy' : 'Policies'}</p>
              </div>
            </div>
          )
        })}
        {policies.length === 0 && <p className="text-xs text-slate-400 col-span-full py-4 text-center">No policies yet — add your first one to see it here.</p>}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 mb-3">Your Monthly Commitment Breakdown</h4>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[820px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50">
              <Th className="rounded-l-lg">Category</Th>
              <Th>Policy / Plan</Th>
              <Th>Provider / Company</Th>
              <Th>Policy No.</Th>
              <Th>Next Due Date</Th>
              <Th>Premium (₹)</Th>
              <Th className="rounded-r-lg">Action</Th>
            </tr>
          </thead>
          <tbody>
            {policies.map(p => {
              const key = categoryFor(p.insuranceType)
              return (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="px-3 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={key} size="sm" />
                      <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{CATEGORY_META[key].label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.policyName}</td>
                  <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.provider}</td>
                  <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.policyNumber ?? '—'}</td>
                  <td className="px-3 py-3 text-xs font-medium text-red-500 border-b border-slate-100 whitespace-nowrap">{p.nextPremiumDate ? formatDate(p.nextPremiumDate) : '—'}</td>
                  <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{formatCurrency(Number(p.premiumAmount))}</td>
                  <td className="px-3 py-3 border-b border-slate-100">
                    <button
                      className="text-[11px] font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1 whitespace-nowrap"
                      onClick={() => onViewDetails(p.id)}
                    >
                      View Details <ChevronRight size={11} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 mt-2 bg-green-50 rounded-lg">
        <p className="text-xs font-semibold text-slate-700">Total Monthly Commitment</p>
        <p className="text-sm font-bold text-slate-900">{formatCurrency(total)}</p>
      </div>
    </Card>
  )
}

// ─── Tab 2: Plan Details ─────────────────────────────────────────────────────

function PlanDetailsTab({ policies, onViewDetails }: { policies: Policy[]; onViewDetails: (id: string) => void }) {
  const [category, setCategory] = useState('All Categories')
  const [provider, setProvider] = useState('All Providers')
  const [status, setStatus] = useState('All Status')

  const providers = [...new Set(policies.map(p => p.provider))]
  const filtered = policies.filter(p =>
    (category === 'All Categories' || CATEGORY_META[categoryFor(p.insuranceType)].short === category) &&
    (provider === 'All Providers' || p.provider === provider) &&
    (status === 'All Status' || p.status === status)
  )

  const activeCount = policies.filter(p => p.status === 'ACTIVE').length
  const dueSoonCount = policies.filter(p => p.nextPremiumDate && daysFromNow(p.nextPremiumDate) <= 15 && daysFromNow(p.nextPremiumDate) >= 0).length
  const overdueCount = policies.filter(p => p.nextPremiumDate && daysFromNow(p.nextPremiumDate) < 0).length
  const expiredCount = policies.filter(p => p.status === 'EXPIRED' || p.status === 'LAPSED').length

  const selectCls = 'text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2'

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select className={selectCls} value={category} onChange={e => setCategory(e.target.value)}>
            {['All Categories', ...Object.values(CATEGORY_META).map(m => m.short)].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className={selectCls} value={provider} onChange={e => setProvider(e.target.value)}>
            {['All Providers', ...providers].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className={selectCls} value={status} onChange={e => setStatus(e.target.value)}>
            {['All Status', 'ACTIVE', 'EXPIRED', 'LAPSED', 'PENDING'].map(o => <option key={o}>{o}</option>)}
          </select>
          <button
            className="ml-auto text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5"
            onClick={() => toast.success('Export started')}
          >
            Export Plan Details <Download size={13} />
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[1000px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <Th className="rounded-l-lg">Policy / Plan</Th>
                <Th>Category</Th>
                <Th>Provider / Company</Th>
                <Th>Policy No.</Th>
                <Th>Plan</Th>
                <Th>Sum Insured / Coverage</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Status</Th>
                <Th className="rounded-r-lg">Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const key = categoryFor(p.insuranceType)
                const meta = CATEGORY_META[key]
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={key} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{p.policyName}</p>
                          <p className="text-[10px] text-slate-400 whitespace-nowrap">{meta.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: meta.badgeBg, color: meta.badgeText }}>
                        {meta.short}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ProviderLogo name={p.provider} />
                        <span className="text-xs text-slate-700 whitespace-nowrap">{p.provider}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.policyNumber ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.planName ?? '—'}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{formatCurrency(Number(p.sumAssured))}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{formatDate(p.policyStartDate)}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{formatDate(p.policyEndDate)}</td>
                    <td className="px-3 py-3 border-b border-slate-100"><StatusChip label={p.status} /></td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <button
                        className="text-[11px] font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1 whitespace-nowrap"
                        onClick={() => onViewDetails(p.id)}
                      >
                        View Details <ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-xs text-slate-400">No policies match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="md">
          <h4 className="text-sm font-semibold text-slate-800 mb-4">Category Wise Summary</h4>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(CATEGORY_META) as CategoryKey[]).filter(k => k !== 'other').map(key => {
              const meta = CATEGORY_META[key]
              const Icon = meta.icon
              const count = policies.filter(p => categoryFor(p.insuranceType) === key).length
              return (
                <div key={key} className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center" style={{ borderColor: meta.color + '40' }}>
                    <Icon size={15} style={{ color: meta.color }} />
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">{meta.label}</p>
                  <p className="text-sm font-bold text-slate-800">{count}</p>
                  <p className="text-[9px] text-slate-400">{count === 1 ? 'Policy' : 'Policies'}</p>
                </div>
              )
            })}
          </div>
        </Card>

        <Card padding="md">
          <h4 className="text-sm font-semibold text-slate-800 mb-4">Status Legend</h4>
          <div className="space-y-3">
            {[
              { dot: '#22c55e', label: 'Active', desc: 'Policy is active and premiums are up to date.' },
              { dot: '#f59e0b', label: 'Due Soon', desc: 'Premium due within next 15 days.' },
              { dot: '#f87171', label: 'Overdue', desc: 'Premium is overdue.' },
              { dot: '#94a3b8', label: 'Expired', desc: 'Policy has expired.' },
            ].map(l => (
              <div key={l.label} className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: l.dot }} />
                <div>
                  <p className="text-xs font-semibold text-slate-700">{l.label}</p>
                  <p className="text-[11px] text-slate-500">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md" className="bg-green-50/60 border-green-100">
          <p className="text-xs text-slate-500 mb-0.5">Total Policies</p>
          <p className="text-2xl font-bold text-slate-900 mb-4">{policies.length}</p>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between"><span className="font-medium text-slate-700">Active Policies</span><span className="font-bold text-slate-900">{activeCount}</span></div>
            <div className="flex items-center justify-between"><span className="font-medium text-amber-600">Policies Due Soon</span><span className="font-bold text-amber-600">{dueSoonCount}</span></div>
            <div className="flex items-center justify-between"><span className="font-medium text-red-500">Overdue Policies</span><span className="font-bold text-red-500">{overdueCount}</span></div>
            <div className="flex items-center justify-between"><span className="font-medium text-slate-500">Expired Policies</span><span className="font-bold text-slate-600">{expiredCount}</span></div>
          </div>
        </Card>
      </div>

      <InfoBanner>
        Keep your policies updated and never miss a premium payment to ensure uninterrupted coverage for you and your family.
      </InfoBanner>
    </div>
  )
}

// ─── Tab 3: Premium Calendar ─────────────────────────────────────────────────

function PremiumCalendarTab({ stats, month }: { stats: DashboardStats; month: Date }) {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const firstDayOffset = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth()
  const dueDays: Record<number, string> = {}
  stats.duePremiums.forEach(p => {
    const d = new Date(p.dueDate)
    if (d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()) {
      dueDays[d.getDate()] = p.status === 'overdue' ? 'overdue' : p.status === 'due-soon' ? 'dueSoon' : 'upcoming'
    }
  })

  const legend = [
    { color: '#22c55e', label: 'Paid' },
    { color: '#f59e0b', label: 'Due Soon (Next 15 Days)' },
    { color: '#3b82f6', label: 'Upcoming' },
    { color: '#ef4444', label: 'Overdue' },
  ]

  const totalDuePremium = stats.duePremiums.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Premium Calendar</h3>
            <p className="text-xs text-slate-500 mt-0.5">View all upcoming and paid premiums in calendar view.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium ${view === 'calendar' ? 'bg-green-50 text-green-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                onClick={() => setView('calendar')}
              >
                <CalendarDays size={13} /> Calendar View
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-l border-slate-200 ${view === 'list' ? 'bg-green-50 text-green-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                onClick={() => setView('list')}
              >
                <List size={13} /> List View
              </button>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${view === 'calendar' ? 'lg:grid-cols-[340px_1fr]' : ''} gap-5`}>
          {view === 'calendar' && (
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOffset }, (_, i) => (
                  <div key={`prev-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const due = dueDays[day]
                  const isToday = isCurrentMonth && day === today.getDate()
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-full text-[11px] relative
                        ${isToday ? 'bg-green-600 text-white font-bold' : due ? 'font-semibold text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                      style={due && !isToday ? { backgroundColor: due === 'dueSoon' ? '#fef3c7' : due === 'overdue' ? '#fee2e2' : '#dbeafe' } : undefined}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-2">Legend</p>
                <div className="space-y-1.5">
                  {legend.map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-[11px] text-slate-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Upcoming Premiums</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50">
                    <Th className="rounded-l-lg">Date</Th>
                    <Th>Policy / Plan</Th>
                    <Th>Provider / Company</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th className="rounded-r-lg">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.duePremiums.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-slate-400">No premiums due this month. 🎉</td></tr>
                  )}
                  {stats.duePremiums.map((p: DuePremium) => {
                    const d = new Date(p.dueDate)
                    const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={p.id}>
                        <td className="px-3 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className={`w-1 h-9 rounded-full ${p.status === 'due-soon' ? 'bg-amber-400' : p.status === 'overdue' ? 'bg-red-400' : 'bg-blue-400'}`} />
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-none">{String(d.getDate()).padStart(2, '0')}</p>
                              <p className="text-[10px] text-slate-400">{d.toLocaleDateString('en-US', { month: 'short' })}<br />{d.getFullYear()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{p.policyName}</p>
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <ProviderLogo name={p.insurer} />
                            <span className="text-xs text-slate-700 whitespace-nowrap">{p.insurer}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{formatCurrency(p.amount)}</td>
                        <td className="px-3 py-3 border-b border-slate-100">
                          <div>
                            <StatusChip label={p.status} />
                            {daysLeft >= 0 && <p className="text-[10px] text-slate-400 mt-1">{daysLeft} days left</p>}
                          </div>
                        </td>
                        <td className="px-3 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Button size="xs" variant="outline" className="text-xs" onClick={() => toast.success(`Payment initiated for ${p.policyName}`)}>Pay Now</Button>
                            <button className="p-1 rounded hover:bg-slate-100"><MoreVertical size={13} className="text-slate-400" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mt-5 p-4 bg-slate-50/70 rounded-xl">
          {[
            { icon: IndianRupee, iconBg: '#dcfce7', iconColor: '#16a34a', label: 'Total Monthly Commitment', value: formatCurrency(stats.totalMonthlyCommitment) },
            { icon: Receipt, iconBg: '#f1f5f9', iconColor: '#64748b', label: 'Paid This Month', value: formatCurrency(0) },
            { icon: Calendar, iconBg: '#ffedd5', iconColor: '#ea580c', label: 'Due This Month', value: formatCurrency(totalDuePremium) },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: s.iconBg }}>
                <s.icon size={16} style={{ color: s.iconColor }} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">{s.label}</p>
                <p className="text-sm font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <InfoBanner
        action={
          <Button size="xs" className="shrink-0" onClick={() => toast.success('AutoPay setup coming soon')}>Set Up AutoPay</Button>
        }
      >
        Set up AutoPay to ensure your premiums are paid on time and never miss a due date.
      </InfoBanner>
    </div>
  )
}

// ─── Tab 4: Nominees ─────────────────────────────────────────────────────────

function NomineesTab({ policies }: { policies: Policy[] }) {
  const navigate = useNavigate()
  const rows = policies.flatMap(p => (p.nominees ?? []).map(n => ({ nominee: n, policy: p })))

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Nominees</h3>
            <p className="text-xs text-slate-500 mt-0.5">People who will receive the benefits in case of an unfortunate event.</p>
          </div>
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => navigate('/app/beneficiaries/add')}>Add Nominee</Button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <Th className="rounded-l-lg">Policy / Plan</Th>
                <Th>Nominee Name</Th>
                <Th>Relationship</Th>
                <Th>Share (%)</Th>
                <Th>Date of Birth</Th>
                <Th>Appointed On</Th>
                <Th className="rounded-r-lg">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-slate-400">No nominees added yet.</td></tr>
              )}
              {rows.map(({ nominee: n, policy: p }) => {
                const key = categoryFor(p.insuranceType)
                return (
                  <tr key={n.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={key} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{p.policyName}</p>
                          <p className="text-[10px] text-slate-400 whitespace-nowrap">{p.provider}</p>
                          <p className="text-[10px] text-slate-400 whitespace-nowrap">Policy No: {p.policyNumber ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{n.fullName}</p>
                      {n.email && <p className="text-[10px] text-slate-400 whitespace-nowrap">{n.email}</p>}
                      {n.mobile && <p className="text-[10px] text-slate-400 whitespace-nowrap">{n.mobile}</p>}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{n.relationship}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100">{n.sharePercent}%</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{n.dateOfBirth ? formatDate(n.dateOfBirth) : '—'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{formatDate(n.createdAt)}</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => navigate(`/app/insurance/${p.id}`)}>
                          <Pencil size={12} className="text-slate-500" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100"
                          onClick={async () => {
                            try { await policyService.removeNominee(p.id, n.id); toast.success('Nominee removed') } catch { toast.error('Failed to remove nominee') }
                          }}
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <InfoBanner>
        Ensure your nominee details are up to date to avoid any delays in claim settlement.
      </InfoBanner>

      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
        <ShieldCheck size={14} className="text-green-600 shrink-0" />
        <p className="text-xs text-green-700">Nominee information is secured and used only for claim settlement purposes.</p>
      </div>
    </div>
  )
}

// ─── Tab 5: Plan Documents ───────────────────────────────────────────────────

function extLabel(mimeType: string): { label: string; bg: string; text: string } {
  if (mimeType.includes('pdf')) return { label: 'PDF', bg: '#fee2e2', text: '#dc2626' }
  if (mimeType.includes('image')) return { label: 'IMG', bg: '#dcfce7', text: '#16a34a' }
  return { label: 'DOC', bg: '#d1fae5', text: '#059669' }
}

function PlanDocumentsTab() {
  const [search, setSearch] = useState('')
  const [policyFilter, setPolicyFilter] = useState('All Policies')

  const { data: links = [], isLoading } = useQuery({
    queryKey: queryKeys.policies.allDocuments(),
    queryFn: async () =>
      (await policyService.getAllDocuments<{
        docType?: string; createdAt: string
        document: { id: string; name: string; mimeType: string; createdAt: string }
        policy: { id: string; policyName: string; provider: string; policyNumber?: string }
      }[]>()) ?? [],
  })

  const policyNames = [...new Set(links.map(l => l.policy.policyName))]
  const filtered = links.filter(l =>
    (search === '' || l.document.name.toLowerCase().includes(search.toLowerCase()) || l.policy.policyName.toLowerCase().includes(search.toLowerCase())) &&
    (policyFilter === 'All Policies' || l.policy.policyName === policyFilter)
  )

  const selectCls = 'text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2'

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Plan Documents</h3>
            <p className="text-xs text-slate-500 mt-0.5">View and download all your policy and plan related documents.</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-green-100"
              placeholder="Search documents by name or policy"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select className={selectCls} value={policyFilter} onChange={e => setPolicyFilter(e.target.value)}>
            {['All Policies', ...policyNames].map(o => <option key={o}>{o}</option>)}
          </select>
          <button className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2" onClick={() => { setSearch(''); setPolicyFilter('All Policies') }}>
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <Th className="rounded-l-lg">Document Name</Th>
                <Th>Policy / Plan</Th>
                <Th>Document Type</Th>
                <Th>Uploaded On</Th>
                <Th className="rounded-r-lg">Action</Th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-xs text-slate-400">No policy documents uploaded yet.</td></tr>
              )}
              {filtered.map(l => {
                const ext = extLabel(l.document.mimeType)
                return (
                  <tr key={l.document.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0"
                          style={{ backgroundColor: ext.bg, color: ext.text }}>
                          {ext.label}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{l.document.name}</p>
                          {l.policy.policyNumber && <p className="text-[10px] text-slate-400 whitespace-nowrap">{l.policy.policyNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-700 whitespace-nowrap">{l.policy.policyName}</p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">{l.policy.provider}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{l.docType ?? '—'}</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-700 whitespace-nowrap">{formatDate(l.document.createdAt)}</p>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <a
                          className="text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 inline-block"
                          href={`${API_BASE_URL}/documents/${l.document.id}/download`}
                          target="_blank" rel="noreferrer"
                        >
                          Download
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <InfoBanner
        action={
          <button
            onClick={() => toast.success('Connecting you to support')}
            className="text-xs font-medium text-slate-600 border border-slate-200 bg-white rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Headphones size={12} /> Contact Support
          </button>
        }
      >
        Can't find a document you're looking for? Contact our support team.
      </InfoBanner>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function MyPlanPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const initialTab: Tab = location.pathname.endsWith('premium-calendar') ? 'Premium Calendar' : 'Plan Summary'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [calendarMonth] = useState(new Date())

  const { data: policies = [], isLoading: loadingPolicies } = useQuery({
    queryKey: queryKeys.policies.list(),
    queryFn: async () => (await policyService.getAll()) ?? [],
  })

  const monthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: queryKeys.dashboard.stats(monthLabel),
    queryFn: () => dashboardService.getStats(monthLabel),
  })

  if (loadingPolicies || loadingStats || !stats) return <DashboardSkeleton />

  const copyPlanId = () => {
    navigator.clipboard?.writeText(stats.plan.planId)
    toast.success('Plan ID copied')
  }

  const viewPolicyDetails = (id: string) => navigate(`/app/my-plan/plan-details/${id}`)

  const TAB_COMPONENTS: Record<Tab, React.ReactNode> = {
    'Plan Summary': <PlanSummaryTab policies={policies} onViewDetails={viewPolicyDetails} />,
    'Plan Details': <PlanDetailsTab policies={policies} onViewDetails={viewPolicyDetails} />,
    'Premium Calendar': <PremiumCalendarTab stats={stats} month={calendarMonth} />,
    'Nominees': <NomineesTab policies={policies} />,
    'Plan Documents': <PlanDocumentsTab />,
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0f2952]">My Plan</h1>
            {activeTab === 'Plan Summary' ? (
              <p className="text-sm text-slate-500 mt-0.5">View and manage your overall plan details in one place.</p>
            ) : (
              <nav className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <button className="hover:text-green-600" onClick={() => setActiveTab('Plan Summary')}>My Plan</button>
                <span>›</span><span className="text-slate-600 font-medium">{activeTab}</span>
              </nav>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <p className="text-xs text-slate-500">Last login: {user?.lastLogin ? formatDateTime(user.lastLogin) : '—'}</p>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <Shield size={11} /> Secure Session
            </div>
          </div>
        </div>
      </motion.div>

      <Card padding="none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={19} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Month &amp; Year</p>
              <p className="text-sm font-bold text-slate-900">{monthLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <IndianRupee size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Total Monthly Commitment</p>
              <p className="text-base font-bold text-slate-900">{formatCurrency(stats.totalMonthlyCommitment)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <Landmark size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Plan Status</p>
              <p className="text-base font-bold text-slate-900 leading-tight">{stats.plan.status}</p>
              <p className="text-[10px] text-slate-400">Since {formatDate(stats.plan.startDate)}</p>
              <p className="text-[10px] text-green-600">Expires on {formatDate(stats.plan.expiryDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={19} className="text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Plan ID</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 truncate">{stats.plan.planId}</p>
                <button className="p-1 rounded hover:bg-slate-100 shrink-0" onClick={copyPlanId}>
                  <Copy size={12} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab ? 'border-green-600 text-green-700 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {TAB_COMPONENTS[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
