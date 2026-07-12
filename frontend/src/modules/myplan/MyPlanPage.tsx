import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, IndianRupee, Landmark, ShieldCheck, Copy, Download, ChevronRight,
  ChevronLeft, Plus, Pencil, Trash2, Search, Filter as FilterIcon, RotateCcw,
  Info, Umbrella, Car, Plane, Home, PawPrint, FileText, Shield, CheckCircle2,
  Headphones, CalendarDays, List, MoreVertical, Wallet, Receipt
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'
import toast from 'react-hot-toast'

// ─── Static plan data (matches PolicyNext UI mock V1) ────────────────────────

const PLAN = {
  month: 'May 2025',
  totalMonthlyCommitment: 11008,
  status: 'Active',
  since: '18 May 2025',
  expires: '18 May 2026',
  planId: 'IND-2025-00012345',
  lastLogin: '18 May 2025, 11:25 AM',
}

type CategoryKey = 'life' | 'vehicle' | 'travel' | 'home' | 'pet'

const CATEGORY_META: Record<CategoryKey, {
  label: string; short: string; icon: React.ElementType; color: string; bg: string; badgeBg: string; badgeText: string
}> = {
  life: { label: 'Life Insurance', short: 'Life', icon: Umbrella, color: '#16a34a', bg: '#f0fdf4', badgeBg: '#dcfce7', badgeText: '#15803d' },
  vehicle: { label: 'Vehicle Insurance', short: 'Vehicle', icon: Car, color: '#2563eb', bg: '#eff6ff', badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
  travel: { label: 'Travel Insurance', short: 'Travel', icon: Plane, color: '#7c3aed', bg: '#f5f3ff', badgeBg: '#ede9fe', badgeText: '#6d28d9' },
  home: { label: 'Home Insurance', short: 'Home', icon: Home, color: '#ea580c', bg: '#fff7ed', badgeBg: '#ffedd5', badgeText: '#c2410c' },
  pet: { label: 'Pet/Animal Insurance', short: 'Pet', icon: PawPrint, color: '#db2777', bg: '#fdf2f8', badgeBg: '#fce7f3', badgeText: '#be185d' },
}

const PROVIDER_STYLE: Record<string, { bg: string; text: string }> = {
  'HDFC Life': { bg: '#fee2e2', text: '#dc2626' },
  'Bajaj Allianz': { bg: '#dbeafe', text: '#1d4ed8' },
  'ICICI Lombard': { bg: '#ffedd5', text: '#ea580c' },
  'HDFC Ergo': { bg: '#fee2e2', text: '#b91c1c' },
  'Future Generali': { bg: '#fecaca', text: '#dc2626' },
}

const POLICIES = [
  {
    id: 'pol-life', category: 'life' as CategoryKey, name: 'Term Life Insurance', provider: 'HDFC Life',
    policyNo: '1234 5678 9012', planType: 'Term Plan', sumInsured: '₹1,00,00,000',
    startDate: '25 May 2025', endDate: '24 May 2045', premium: 1200, dueDate: '25 May 2025',
    dueDay: 25, dueMonth: 'May', dueYear: '2025', daysLeft: 10, dueStatus: 'Due Soon' as const,
  },
  {
    id: 'pol-vehicle', category: 'vehicle' as CategoryKey, name: 'Car Insurance', provider: 'Bajaj Allianz',
    policyNo: '9876 5432 1098', planType: 'Comprehensive', sumInsured: '₹8,00,000',
    startDate: '30 May 2025', endDate: '29 May 2026', premium: 2458, dueDate: '30 May 2025',
    dueDay: 28, dueMonth: 'May', dueYear: '2025', daysLeft: 13, dueStatus: 'Due Soon' as const,
  },
  {
    id: 'pol-travel', category: 'travel' as CategoryKey, name: 'Annual Travel Plan', provider: 'ICICI Lombard',
    policyNo: '5566 7788 1122', planType: 'Annual Multi-Trip', sumInsured: '₹10,00,000',
    startDate: '02 Jun 2025', endDate: '01 Jun 2026', premium: 550, dueDate: '02 Jun 2025',
    dueDay: 30, dueMonth: 'May', dueYear: '2025', daysLeft: 15, dueStatus: 'Upcoming' as const,
  },
  {
    id: 'pol-home', category: 'home' as CategoryKey, name: 'Home Shield Plan', provider: 'HDFC Ergo',
    policyNo: '3344 5566 7788', planType: 'Standard', sumInsured: '₹50,00,000',
    startDate: '05 Jun 2025', endDate: '04 Jun 2026', premium: 1250, dueDate: '05 Jun 2025',
    dueDay: 5, dueMonth: 'Jun', dueYear: '2025', daysLeft: 21, dueStatus: 'Upcoming' as const,
  },
  {
    id: 'pol-pet', category: 'pet' as CategoryKey, name: 'Pet Insurance', provider: 'Future Generali',
    policyNo: '7788 8899 0011', planType: 'Pet Care', sumInsured: '₹2,00,000',
    startDate: '10 Jun 2025', endDate: '09 Jun 2026', premium: 350, dueDate: '10 Jun 2025',
    dueDay: 10, dueMonth: 'Jun', dueYear: '2025', daysLeft: 26, dueStatus: 'Upcoming' as const,
  },
]

const NOMINEES = [
  { id: 'n1', policy: POLICIES[0], name: 'Anita Sharma', email: 'anita.sharma@email.com', phone: '+91 98765 43210', relationship: 'Wife', share: 100, dob: '12 Mar 1988', appointedOn: '18 May 2025' },
  { id: 'n2', policy: POLICIES[1], name: 'Rajat Sharma', email: 'rajat.sharma@email.com', phone: '+91 98765 43210', relationship: 'Self', share: 100, dob: '15 Aug 1990', appointedOn: '18 May 2025' },
  { id: 'n3', policy: POLICIES[2], name: 'Anita Sharma', email: 'anita.sharma@email.com', phone: '+91 98765 43210', relationship: 'Wife', share: 100, dob: '12 Mar 1988', appointedOn: '18 May 2025' },
  { id: 'n4', policy: POLICIES[3], name: 'Rajat Sharma', email: 'rajat.sharma@email.com', phone: '+91 98765 43210', relationship: 'Self', share: 100, dob: '15 Aug 1990', appointedOn: '18 May 2025' },
  { id: 'n5', policy: POLICIES[4], name: 'Anita Sharma', email: 'anita.sharma@email.com', phone: '+91 98765 43210', relationship: 'Wife', share: 100, dob: '12 Mar 1988', appointedOn: '18 May 2025' },
]

const DOCUMENTS = [
  { id: 'd1', name: 'Policy Schedule', ref: 'IND-2025-00012345', policy: 'Term Life Insurance', provider: 'HDFC Life', type: 'Policy Document', year: '2025', uploadedOn: '18 May 2025', time: '11:20 AM', ext: 'pdf' },
  { id: 'd2', name: 'Policy Bond', ref: 'IND-2025-00012345', policy: 'Term Life Insurance', provider: 'HDFC Life', type: 'Policy Document', year: '2025', uploadedOn: '18 May 2025', time: '11:20 AM', ext: 'pdf' },
  { id: 'd3', name: 'Premium Receipt – May 2025', ref: 'IND-2025-00012345', policy: 'Term Life Insurance', provider: 'HDFC Life', type: 'Receipt', year: '2025', uploadedOn: '18 May 2025', time: '11:20 AM', ext: 'jpg' },
  { id: 'd4', name: 'Welcome Letter', ref: 'IND-2025-00012345', policy: 'Term Life Insurance', provider: 'HDFC Life', type: 'General Document', year: '2025', uploadedOn: '18 May 2025', time: '11:20 AM', ext: 'pdf' },
  { id: 'd5', name: 'Claim Intimation Form', ref: '', policy: 'Car Insurance', provider: 'Bajaj Allianz', type: 'Claim Document', year: '2025', uploadedOn: '10 May 2025', time: '09:15 AM', ext: 'pdf' },
  { id: 'd6', name: 'Illustration', ref: 'IND-2025-00012345', policy: 'Term Life Insurance', provider: 'HDFC Life', type: 'Illustration', year: '2025', uploadedOn: '05 May 2025', time: '04:30 PM', ext: 'xls' },
  { id: 'd7', name: 'Terms & Conditions', ref: 'IND-2025-00012345', policy: 'Term Life Insurance', provider: 'HDFC Life', type: 'General Document', year: '2025', uploadedOn: '01 May 2025', time: '10:00 AM', ext: 'pdf' },
]

const TABS = ['Plan Summary', 'Plan Details', 'Premium Calendar', 'Nominees', 'Plan Documents'] as const
type Tab = typeof TABS[number]

const PREMIUM_TOTAL = POLICIES.reduce((s, p) => s + p.premium, 0) // ₹5,808
const UPCOMING_THIS_MONTH = POLICIES.filter(p => p.dueMonth === 'May').reduce((s, p) => s + p.premium, 0) // ₹4,208

// ─── Shared bits ─────────────────────────────────────────────────────────────

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
  const style = PROVIDER_STYLE[name] ?? { bg: '#f1f5f9', text: '#475569' }
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
    Active: 'bg-green-50 text-green-700',
    'Due Soon': 'bg-amber-50 text-amber-700',
    Upcoming: 'bg-blue-50 text-blue-700',
    Overdue: 'bg-red-50 text-red-600',
    Expired: 'bg-slate-100 text-slate-500',
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

function PlanSummaryTab({ onViewDetails }: { onViewDetails: (id: string) => void }) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Your Plan Overview</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          onClick={() => toast.success('Plan summary download started')}>
          Download Plan Summary <Download size={13} />
        </button>
      </div>

      {/* Category tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {POLICIES.map(p => {
          const meta = CATEGORY_META[p.category]
          return (
            <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white">
              <CategoryIcon category={p.category} />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 leading-tight truncate">
                  {p.category === 'life' ? 'Total Life Insurance' : meta.label}
                </p>
                <p className="text-lg font-bold text-slate-900 leading-tight">1</p>
                <p className="text-[10px] text-slate-400">Policy</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Monthly commitment breakdown */}
      <h4 className="text-sm font-semibold text-slate-800 mb-3">Your Monthly Commitment Breakdown</h4>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[820px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50">
              <Th className="rounded-l-lg">Category</Th>
              <Th>Policy / Plan</Th>
              <Th>Provider / Company</Th>
              <Th>Policy No.</Th>
              <Th>Due Date</Th>
              <Th>Monthly Premium (₹)</Th>
              <Th className="rounded-r-lg">Action</Th>
            </tr>
          </thead>
          <tbody>
            {POLICIES.map(p => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="px-3 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={p.category} size="sm" />
                    <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{CATEGORY_META[p.category].label}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.name}</td>
                <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.provider}</td>
                <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.policyNo}</td>
                <td className="px-3 py-3 text-xs font-medium text-red-500 border-b border-slate-100 whitespace-nowrap">{p.dueDate}</td>
                <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{formatCurrency(p.premium)}</td>
                <td className="px-3 py-3 border-b border-slate-100">
                  <button
                    className="text-[11px] font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1 whitespace-nowrap"
                    onClick={() => onViewDetails(p.id)}
                  >
                    View Details <ChevronRight size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 mt-2 bg-green-50 rounded-lg">
        <p className="text-xs font-semibold text-slate-700">Total Monthly Commitment</p>
        <p className="text-sm font-bold text-slate-900">{formatCurrency(PREMIUM_TOTAL)}</p>
      </div>
    </Card>
  )
}

// ─── Tab 2: Plan Details ─────────────────────────────────────────────────────

function PlanDetailsTab({ onViewDetails }: { onViewDetails: (id: string) => void }) {
  const [category, setCategory] = useState('All Categories')
  const [provider, setProvider] = useState('All Providers')
  const [status, setStatus] = useState('All Status')

  const filtered = POLICIES.filter(p =>
    (category === 'All Categories' || CATEGORY_META[p.category].short === category) &&
    (provider === 'All Providers' || p.provider === provider) &&
    (status === 'All Status' || status === 'Active')
  )

  const selectCls = 'text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2'

  return (
    <div className="space-y-4">
      <Card padding="md">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select className={selectCls} value={category} onChange={e => setCategory(e.target.value)}>
            {['All Categories', ...Object.values(CATEGORY_META).map(m => m.short)].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className={selectCls} value={provider} onChange={e => setProvider(e.target.value)}>
            {['All Providers', ...POLICIES.map(p => p.provider)].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className={selectCls} value={status} onChange={e => setStatus(e.target.value)}>
            {['All Status', 'Active', 'Expired'].map(o => <option key={o}>{o}</option>)}
          </select>
          <button
            className="ml-auto text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5"
            onClick={() => toast.success('Export started')}
          >
            Export Plan Details <Download size={13} />
          </button>
        </div>

        {/* Policies table */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[1000px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <Th className="rounded-l-lg">Policy / Plan</Th>
                <Th>Category</Th>
                <Th>Provider / Company</Th>
                <Th>Policy No.</Th>
                <Th>Plan Type</Th>
                <Th>Sum Insured / Coverage</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Status</Th>
                <Th className="rounded-r-lg">Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const meta = CATEGORY_META[p.category]
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={p.category} size="sm" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{p.name}</p>
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
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.policyNo}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.planType}</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{p.sumInsured}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.startDate}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.endDate}</td>
                    <td className="px-3 py-3 border-b border-slate-100"><StatusChip label="Active" /></td>
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
      </Card>

      {/* Summary panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="md">
          <h4 className="text-sm font-semibold text-slate-800 mb-4">Category Wise Summary</h4>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(CATEGORY_META) as CategoryKey[]).map(key => {
              const meta = CATEGORY_META[key]
              const Icon = meta.icon
              return (
                <div key={key} className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center" style={{ borderColor: meta.color + '40' }}>
                    <Icon size={15} style={{ color: meta.color }} />
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">{meta.label}</p>
                  <p className="text-sm font-bold text-slate-800">1</p>
                  <p className="text-[9px] text-slate-400">Policy</p>
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
          <p className="text-2xl font-bold text-slate-900 mb-4">{POLICIES.length}</p>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between"><span className="font-medium text-slate-700">Active Policies</span><span className="font-bold text-slate-900">{POLICIES.length}</span></div>
            <div className="flex items-center justify-between"><span className="font-medium text-amber-600">Policies Due Soon</span><span className="font-bold text-amber-600">0</span></div>
            <div className="flex items-center justify-between"><span className="font-medium text-red-500">Overdue Policies</span><span className="font-bold text-red-500">0</span></div>
            <div className="flex items-center justify-between"><span className="font-medium text-slate-500">Expired Policies</span><span className="font-bold text-slate-600">0</span></div>
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

function PremiumCalendarTab() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // May 2025 — starts on Thursday, 31 days; dues on 25, 28, 30; today = 18
  const firstDayOffset = 4
  const daysInMonth = 31
  const dueDays: Record<number, string> = { 25: 'dueSoon', 28: 'dueSoon', 30: 'upcoming' }

  const legend = [
    { color: '#22c55e', label: 'Paid' },
    { color: '#f59e0b', label: 'Due Soon (Next 15 Days)' },
    { color: '#3b82f6', label: 'Upcoming' },
    { color: '#a78bfa', label: 'Future' },
    { color: '#ef4444', label: 'Overdue' },
  ]

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Premium Calendar</h3>
            <p className="text-xs text-slate-500 mt-0.5">View all upcoming and paid premiums in calendar view.</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">
              <option>All Categories</option>
              {Object.values(CATEGORY_META).map(m => <option key={m.short}>{m.short}</option>)}
            </select>
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
          {/* Calendar */}
          {view === 'calendar' && (
            <div className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft size={14} className="text-slate-500" /></button>
                <p className="text-sm font-semibold text-slate-800">{PLAN.month}</p>
                <button className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight size={14} className="text-slate-500" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOffset }, (_, i) => (
                  <div key={`prev-${i}`} className="aspect-square flex items-center justify-center text-[11px] text-slate-300">{27 + i}</div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const due = dueDays[day]
                  const isToday = day === 18
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-full text-[11px] relative
                        ${isToday ? 'bg-green-600 text-white font-bold' : due ? 'font-semibold text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                      style={due && !isToday ? { backgroundColor: due === 'dueSoon' ? '#fef3c7' : '#dbeafe' } : undefined}
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

          {/* Upcoming premiums list */}
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
                  {POLICIES.map(p => (
                    <tr key={p.id}>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`w-1 h-9 rounded-full ${p.dueStatus === 'Due Soon' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">{String(p.dueDay).padStart(2, '0')}</p>
                            <p className="text-[10px] text-slate-400">{p.dueMonth}<br />{p.dueYear}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <CategoryIcon category={p.category} size="sm" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{p.name}</p>
                            <p className="text-[10px] text-slate-400 whitespace-nowrap">{CATEGORY_META[p.category].label}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <ProviderLogo name={p.provider} />
                          <span className="text-xs text-slate-700 whitespace-nowrap">{p.provider}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{formatCurrency(p.premium)}</td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div>
                          <StatusChip label={p.dueStatus} />
                          <p className="text-[10px] text-slate-400 mt-1">{p.daysLeft} days left</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Button size="xs" variant="outline" className="text-xs" onClick={() => toast.success(`Payment initiated for ${p.name}`)}>Pay Now</Button>
                          <button className="p-1 rounded hover:bg-slate-100"><MoreVertical size={13} className="text-slate-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center mt-5 p-4 bg-slate-50/70 rounded-xl">
          {[
            { icon: IndianRupee, iconBg: '#dcfce7', iconColor: '#16a34a', label: 'Total Monthly Commitment', value: formatCurrency(PLAN.totalMonthlyCommitment) },
            { icon: Receipt, iconBg: '#f1f5f9', iconColor: '#64748b', label: 'Paid This Month', value: formatCurrency(0) },
            { icon: Calendar, iconBg: '#ffedd5', iconColor: '#ea580c', label: 'Upcoming This Month', value: formatCurrency(UPCOMING_THIS_MONTH) },
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
          <button className="text-xs font-medium text-slate-600 border border-slate-200 bg-white rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1 justify-self-start lg:justify-self-end">
            View Payment History <ChevronRight size={12} />
          </button>
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

function NomineesTab() {
  const navigate = useNavigate()
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
              {NOMINEES.map(n => (
                <tr key={n.id}>
                  <td className="px-3 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon category={n.policy.category} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{n.policy.name}</p>
                        <p className="text-[10px] text-slate-400 whitespace-nowrap">{n.policy.provider}</p>
                        <p className="text-[10px] text-slate-400 whitespace-nowrap">Policy No: {n.policy.policyNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{n.name}</p>
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">{n.email}</p>
                    <p className="text-[10px] text-slate-400 whitespace-nowrap">{n.phone}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{n.relationship}</td>
                  <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100">{n.share}%</td>
                  <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{n.dob}</td>
                  <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{n.appointedOn}</td>
                  <td className="px-3 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => toast('Edit nominee coming soon')}>
                        <Pencil size={12} className="text-slate-500" />
                      </button>
                      <button className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100" onClick={() => toast.error('Delete requires confirmation')}>
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <InfoBanner
        action={
          <a className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap flex items-center gap-1 cursor-pointer">
            Learn more about nominees
          </a>
        }
      >
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

const EXT_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pdf: { bg: '#fee2e2', text: '#dc2626', label: 'PDF' },
  jpg: { bg: '#dcfce7', text: '#16a34a', label: 'JPG' },
  xls: { bg: '#d1fae5', text: '#059669', label: 'XLS' },
}

function PlanDocumentsTab() {
  const [search, setSearch] = useState('')
  const [policyFilter, setPolicyFilter] = useState('All Policies')
  const [typeFilter, setTypeFilter] = useState('All Document Types')
  const [yearFilter, setYearFilter] = useState('All Years')

  const filtered = DOCUMENTS.filter(d =>
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()) || d.policy.toLowerCase().includes(search.toLowerCase())) &&
    (policyFilter === 'All Policies' || d.policy === policyFilter) &&
    (typeFilter === 'All Document Types' || d.type === typeFilter) &&
    (yearFilter === 'All Years' || d.year === yearFilter)
  )

  const selectCls = 'text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2'
  const reset = () => { setSearch(''); setPolicyFilter('All Policies'); setTypeFilter('All Document Types'); setYearFilter('All Years') }

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Plan Documents</h3>
            <p className="text-xs text-slate-500 mt-0.5">View and download all your policy and plan related documents.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-green-100"
                placeholder="Search documents by name or policy"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5">
              <FilterIcon size={12} /> Filter
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select className={selectCls} value={policyFilter} onChange={e => setPolicyFilter(e.target.value)}>
            {['All Policies', ...new Set(DOCUMENTS.map(d => d.policy))].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className={selectCls} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {['All Document Types', ...new Set(DOCUMENTS.map(d => d.type))].map(o => <option key={o}>{o}</option>)}
          </select>
          <select className={selectCls} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
            {['All Years', '2025'].map(o => <option key={o}>{o}</option>)}
          </select>
          <button className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2" onClick={reset}>
            <RotateCcw size={11} /> Reset
          </button>
          <button
            className="ml-auto text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5"
            onClick={() => toast.success('Preparing download of all documents')}
          >
            <Download size={13} /> Download All
          </button>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <Th className="rounded-l-lg">Document Name</Th>
                <Th>Policy / Plan</Th>
                <Th>Document Type</Th>
                <Th>Year</Th>
                <Th>Uploaded On</Th>
                <Th className="rounded-r-lg">Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const ext = EXT_STYLE[d.ext] ?? EXT_STYLE.pdf
                return (
                  <tr key={d.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0"
                          style={{ backgroundColor: ext.bg, color: ext.text }}>
                          {ext.label}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{d.name}</p>
                          {d.ref && <p className="text-[10px] text-slate-400 whitespace-nowrap">{d.ref}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-700 whitespace-nowrap">{d.policy}</p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">{d.provider}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{d.type}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100">{d.year}</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-700 whitespace-nowrap">{d.uploadedOn}</p>
                      <p className="text-[10px] text-slate-400">{d.time}</p>
                    </td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 whitespace-nowrap"
                          onClick={() => toast.success(`Downloading ${d.name}`)}
                        >
                          Download
                        </button>
                        <button className="p-1 rounded hover:bg-slate-100"><MoreVertical size={13} className="text-slate-400" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <p className="text-xs text-slate-500">Showing 1 to {filtered.length} of {DOCUMENTS.length} documents</p>
          <div className="flex items-center gap-2">
            <select className="text-xs text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5">
              <option>10 per page</option><option>25 per page</option>
            </select>
            <div className="flex items-center gap-1">
              {['|<', '<'].map(s => (
                <button key={s} className="w-7 h-7 text-[11px] text-slate-400 border border-slate-200 rounded-lg hover:bg-slate-50">{s}</button>
              ))}
              <button className="w-7 h-7 text-[11px] font-semibold text-white bg-green-600 rounded-lg">1</button>
              {['>', '>|'].map(s => (
                <button key={s} className="w-7 h-7 text-[11px] text-slate-400 border border-slate-200 rounded-lg hover:bg-slate-50">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <InfoBanner
        action={
          <button className="text-xs font-medium text-slate-600 border border-slate-200 bg-white rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5 whitespace-nowrap">
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
  const initialTab: Tab = location.pathname.endsWith('premium-calendar') ? 'Premium Calendar' : 'Plan Summary'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const copyPlanId = () => {
    navigator.clipboard?.writeText(PLAN.planId)
    toast.success('Plan ID copied')
  }

  const viewPolicyDetails = (id: string) => navigate(`/app/my-plan/plan-details/${id}`)

  const TAB_COMPONENTS: Record<Tab, React.ReactNode> = {
    'Plan Summary': <PlanSummaryTab onViewDetails={viewPolicyDetails} />,
    'Plan Details': <PlanDetailsTab onViewDetails={viewPolicyDetails} />,
    'Premium Calendar': <PremiumCalendarTab />,
    'Nominees': <NomineesTab />,
    'Plan Documents': <PlanDocumentsTab />,
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
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
            <p className="text-xs text-slate-500">Last login: {PLAN.lastLogin}</p>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <Shield size={11} /> Secure Session
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plan header strip */}
      <Card padding="none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={19} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Month &amp; Year</p>
              <select className="text-sm font-bold text-slate-900 bg-transparent -ml-0.5 cursor-pointer focus:outline-none">
                <option>{PLAN.month}</option>
                <option>Jun 2025</option>
                <option>Jul 2025</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <IndianRupee size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Total Monthly Commitment</p>
              <p className="text-base font-bold text-slate-900">{formatCurrency(PLAN.totalMonthlyCommitment)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <Landmark size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Plan Status</p>
              <p className="text-base font-bold text-slate-900 leading-tight">{PLAN.status}</p>
              <p className="text-[10px] text-slate-400">Since {PLAN.since}</p>
              <p className="text-[10px] text-green-600">Expires on {PLAN.expires}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={19} className="text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Plan ID</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 truncate">{PLAN.planId}</p>
                <button className="p-1 rounded hover:bg-slate-100 shrink-0" onClick={copyPlanId}>
                  <Copy size={12} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
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
