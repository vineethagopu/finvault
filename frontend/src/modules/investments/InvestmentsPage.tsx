import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, ChevronDown, Download,
  Eye, Landmark, LineChart as LineIcon, PiggyBank, Plus, ShieldCheck, Sparkles,
  Target, TrendingUp, WalletCards
} from 'lucide-react'
import {
  Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { investmentService } from '@/services/investmentService'
import { queryKeys } from '@/services/queryKeys'
import { useAuthStore } from '@/store/authStore'
import type { Investment } from '@/types'
import toast from 'react-hot-toast'

const TYPE_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  MUTUAL_FUND: { icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
  STOCKS: { icon: LineIcon, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  BONDS: { icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ULIP: { icon: BriefcaseBusiness, color: 'text-purple-600', bg: 'bg-purple-50' },
  FIXED_DEPOSIT: { icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
  GOLD_ETF: { icon: WalletCards, color: 'text-orange-600', bg: 'bg-orange-50' },
}
const DEFAULT_ICON = { icon: BarChart3, color: 'text-slate-600', bg: 'bg-slate-50' }

const ASSET_CLASS_COLOR: Record<string, string> = {
  EQUITY: '#2563eb', DEBT: '#22c55e', HYBRID: '#7c3aed', COMMODITY: '#f59e0b', REAL_ESTATE: '#ec4899', OTHER: '#64748b',
}
const ASSET_CLASS_LABEL: Record<string, string> = {
  EQUITY: 'Equity Funds', DEBT: 'Debt Funds', HYBRID: 'Hybrid Funds', COMMODITY: 'Commodities', REAL_ESTATE: 'Real Estate', OTHER: 'Others',
}

interface Overview {
  totalInvested: number; totalValue: number; gain: number; gainPercent: number
  activeCount: number; categoryCount: number
  allocation: { assetClass: string; amount: number; percent: number }[]
}
interface Performance { series: { month: string; value: number }[]; hasHistory: boolean }

const QUICK_ACTIONS = [
  { label: 'Invest Now', desc: 'Explore new investment options', icon: PiggyBank, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'SIP Calculator', desc: 'Plan your SIP investments', icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Goal Planner', desc: 'Plan for your financial goals', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Switch / Redeem', desc: 'Manage your investments', icon: BriefcaseBusiness, color: 'text-amber-600', bg: 'bg-amber-50' },
]

function ValueTile({ icon: Icon, bg, color, label, value, sub }: {
  icon: React.ElementType
  bg: string
  color: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg}`}>
        <Icon size={20} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-[#253261]">{label}</p>
        <p className="text-lg font-extrabold leading-tight text-[#11194f]">{value}</p>
        {sub && <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-green-600"><TrendingUp size={11} /> {sub}</p>}
      </div>
    </div>
  )
}

function QuickSummary({ overview }: { overview: Overview }) {
  const items = [
    { label: 'Total Investment Value', value: formatCurrency(overview.totalValue), icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Invested Amount', value: formatCurrency(overview.totalInvested), icon: WalletCards, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Returns', value: `${formatCurrency(overview.gain)} (${overview.gainPercent}%)`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Investments', value: String(overview.activeCount), icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Quick Summary</h3>
      <div className="space-y-3">
        {items.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.bg}`}>
                <Icon size={16} className={item.color} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#64729b]">{item.label}</p>
                <p className={`text-[13px] font-extrabold ${item.label === 'Total Returns' ? 'text-green-600' : 'text-[#11194f]'}`}>{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>
      <button className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-[12px] font-bold text-blue-600" onClick={() => toast('Statement download coming soon')}>
        <Download size={14} /> Download Statement
      </button>
    </Card>
  )
}

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  const handlers: Record<string, () => void> = {
    'Invest Now': () => navigate('/app/invest-online'),
    'SIP Calculator': () => toast('SIP Calculator is coming soon'),
    'Goal Planner': () => toast('Goal Planner is coming soon'),
    'Switch / Redeem': () => toast('Switch / Redeem is coming soon'),
  }
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-2 text-sm font-extrabold text-[#11194f]">Quick Actions</h3>
      <div className="divide-y divide-slate-100">
        {QUICK_ACTIONS.map(item => {
          const Icon = item.icon
          return (
            <button key={item.label} onClick={handlers[item.label]} className="flex w-full items-center gap-3 py-3 text-left">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.bg}`}>
                <Icon size={15} className={item.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-extrabold text-[#11194f]">{item.label}</p>
                <p className="text-[10px] font-semibold text-[#64729b]">{item.desc}</p>
              </div>
              <ArrowRight size={14} className="text-[#11194f]" />
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function Tips() {
  return (
    <Card padding="sm" className="rounded-lg bg-purple-50/80">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={22} className="text-purple-600" />
        <h3 className="text-lg font-extrabold text-[#11194f]">Tips</h3>
      </div>
      <p className="mb-4 text-[12px] font-bold leading-relaxed text-[#253261]">
        Stay invested for the long term to maximize your returns.
      </p>
      <button onClick={() => toast('Investment insights are coming soon')} className="flex items-center gap-2 text-[12px] font-extrabold text-blue-600">
        Explore investment insights <ArrowRight size={14} />
      </button>
    </Card>
  )
}

export function InvestmentsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: investments = [], isLoading: loadingList } = useQuery({
    queryKey: queryKeys.investments.list(),
    queryFn: async () => (await investmentService.getAll()) ?? [],
  })
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: queryKeys.investments.overview(),
    queryFn: () => investmentService.getOverview<Overview>(),
  })
  const { data: performance, isLoading: loadingPerformance } = useQuery({
    queryKey: queryKeys.investments.performance(),
    queryFn: () => investmentService.getPerformance<Performance>(),
  })

  if (loadingList || loadingOverview || loadingPerformance || !overview || !performance) return <DashboardSkeleton />

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Investments</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Investments</span>
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-4 pt-9">
            <p className="text-xs font-bold text-[#34406f]">Last login: {user?.lastLogin ? formatDateTime(user.lastLogin) : '—'}</p>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              <ShieldCheck size={12} /> Secure Session
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_285px]">
          <main className="space-y-3">
            <Card padding="sm" className="rounded-lg">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-extrabold text-[#11194f]">Investments Overview</h2>
                    <button onClick={() => toast('Detailed portfolio view is coming soon')} className="flex items-center gap-1 text-[12px] font-bold text-blue-600"><Eye size={14} /> View details</button>
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#34406f]">Your consolidated investment summary</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ValueTile icon={Landmark} bg="bg-green-50" color="text-green-600" label="Total Investment Value" value={formatCurrency(overview.totalValue)} sub={overview.gainPercent ? `${overview.gainPercent}%` : undefined} />
                <ValueTile icon={WalletCards} bg="bg-blue-50" color="text-blue-600" label="Total Invested Amount" value={formatCurrency(overview.totalInvested)} />
                <ValueTile icon={TrendingUp} bg="bg-green-50" color="text-green-600" label="Total Returns" value={formatCurrency(overview.gain)} sub={`${overview.gainPercent}%`} />
                <ValueTile icon={CalendarDays} bg="bg-purple-50" color="text-purple-600" label="Active Investments" value={String(overview.activeCount)} sub={`Across ${overview.categoryCount} categories`} />
              </div>
            </Card>

            <div className="grid gap-3 lg:grid-cols-2">
              <Card padding="sm" className="rounded-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-[#11194f]">Asset Allocation</h2>
                  <button onClick={() => toast('Full breakdown view is coming soon')} className="text-[11px] font-bold text-blue-600">View breakdown</button>
                </div>
                {overview.allocation.length === 0 ? (
                  <p className="py-8 text-center text-[12px] text-slate-400">No investments yet — add one to see your allocation.</p>
                ) : (
                  <div className="grid items-center gap-3 sm:grid-cols-[210px_1fr]">
                    <div className="relative h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={overview.allocation} dataKey="amount" innerRadius={58} outerRadius={80} paddingAngle={0}>
                            {overview.allocation.map(item => <Cell key={item.assetClass} fill={ASSET_CLASS_COLOR[item.assetClass] ?? '#64748b'} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-sm font-extrabold text-[#11194f]">{formatCurrency(overview.totalValue)}</p>
                        <p className="text-[10px] font-semibold text-[#64729b]">Total Value</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {overview.allocation.map(item => (
                        <div key={item.assetClass} className="grid grid-cols-[12px_1fr_44px_82px] items-center gap-2 text-[12px] font-bold">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ASSET_CLASS_COLOR[item.assetClass] ?? '#64748b' }} />
                          <span className="text-[#253261]">{ASSET_CLASS_LABEL[item.assetClass] ?? item.assetClass}</span>
                          <span className="text-[#253261]">{item.percent.toFixed(1)}%</span>
                          <span className="text-right text-[#253261]">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card padding="sm" className="rounded-lg">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="mb-2 text-sm font-extrabold text-[#11194f]">Portfolio Value Over Time</h2>
                    {performance.hasHistory ? (
                      <p className="flex items-center gap-2 text-lg font-extrabold text-green-600">
                        <TrendingUp size={16} /> {formatCurrency(overview.totalValue)} <span className="text-[11px] font-bold text-[#34406f]">Current value</span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold text-[#34406f]">Not enough history yet</p>
                    )}
                  </div>
                </div>
                {performance.hasHistory ? (
                  <div className="h-[155px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performance.series} margin={{ left: -20, right: 5, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#52607f' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#52607f' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                        <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fill="url(#returnGradient)" dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[155px] flex-col items-center justify-center text-center px-4">
                    <p className="text-[12px] font-semibold text-[#64729b]">Trends will appear here once you've used PolicyNext for a few months.</p>
                  </div>
                )}
              </Card>
            </div>

            <Card padding="none" className="rounded-lg overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
                <h2 className="text-sm font-extrabold text-[#11194f]">My Investments ({investments.length})</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] font-bold text-blue-600" onClick={() => navigate('/app/investments/add')}>
                    <Plus size={14} /> Add My Investment Manually
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto px-3 pb-2">
                <table className="w-full min-w-[850px] border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50">
                      {['Investment Name', 'Type', 'Provider', 'Current Value', 'Returns', 'Status', ''].map((h, i) => (
                        <th key={`${h}-${i}`} className="px-3 py-2 text-left text-[10px] font-extrabold text-[#66749d]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {investments.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-slate-400">No investments yet — add your first one.</td></tr>
                    )}
                    {investments.map(item => {
                      const { icon: Icon, color, bg } = TYPE_ICON[item.investmentType] ?? DEFAULT_ICON
                      const invested = Number(item.amountInvested)
                      const value = Number(item.currentValue)
                      const returnPct = invested > 0 ? ((value - invested) / invested) * 100 : 0
                      const isPositive = returnPct >= 0
                      return (
                        <tr key={item.id}>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${bg}`}>
                                <Icon size={12} className={color} />
                              </span>
                              <span className="text-[12px] font-extrabold text-[#11194f]">{item.investmentName}</span>
                            </div>
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2 text-[12px] font-bold text-[#34406f]">{item.investmentType.replace(/_/g, ' ')}</td>
                          <td className="border-b border-slate-100 px-3 py-2 text-[12px] font-bold text-[#34406f]">{item.provider}</td>
                          <td className="border-b border-slate-100 px-3 py-2 text-[12px] font-extrabold text-[#11194f]">{formatCurrency(value)}</td>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <span className={`flex items-center gap-1 text-[12px] font-extrabold ${isPositive ? 'text-green-600' : 'text-red-500'}`}><TrendingUp size={11} /> {returnPct.toFixed(1)}%</span>
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-extrabold text-green-700">{item.status}</span>
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2 text-right">
                            <ArrowRight size={15} className="ml-auto text-blue-600" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </main>

          <aside className="space-y-3">
            <QuickSummary overview={overview} />
            <QuickActions navigate={navigate} />
            <Tips />
          </aside>
        </div>
      </div>
    </div>
  )
}
