import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, ChevronDown, Download,
  Eye, Landmark, LineChart as LineIcon, PiggyBank, Plus, ShieldCheck, Sparkles,
  Target, TrendingUp, WalletCards
} from 'lucide-react'
import {
  Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/utils/formatters'

const INVESTMENTS = [
  { id: '1', name: 'Flexi Cap Fund - Direct Plan', type: 'Equity Mutual Fund', provider: 'HDFC Mutual Fund', value: 525000, returns: 15.6, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: '2', name: 'Bluechip Fund - Direct Plan', type: 'Equity Mutual Fund', provider: 'SBI Mutual Fund', value: 375000, returns: 11.2, icon: LineIcon, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: '3', name: 'Corporate Bond Fund', type: 'Debt Mutual Fund', provider: 'ICICI Prudential MF', value: 268750, returns: 7.1, icon: Landmark, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: '4', name: 'Term Life Insurance - ULIP', type: 'ULIP', provider: 'HDFC Life', value: 187500, returns: 9.8, icon: BriefcaseBusiness, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: '5', name: 'Government Bond Fund', type: 'Debt Mutual Fund', provider: 'Kotak Mutual Fund', value: 150000, returns: 6.3, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: '6', name: 'Gold ETF', type: 'Others', provider: 'Nippon India MF', value: 68750, returns: 14.2, icon: WalletCards, color: 'text-orange-600', bg: 'bg-orange-50' },
]

const ALLOCATION = [
  { name: 'Equity Funds', value: 60, amount: 1125000, color: '#2563eb' },
  { name: 'Debt Funds', value: 25, amount: 468750, color: '#22c55e' },
  { name: 'ULIP', value: 10, amount: 187500, color: '#7c3aed' },
  { name: 'Others', value: 5, amount: 93750, color: '#f59e0b' },
]

const PERFORMANCE = [
  { month: 'May 24', value: -2 },
  { month: 'Jul 24', value: 8 },
  { month: 'Sep 24', value: 15 },
  { month: 'Nov 24', value: 24 },
  { month: 'Jan 25', value: 11 },
  { month: 'Mar 25', value: 21 },
  { month: 'May 25', value: 30 },
]

const SUMMARY = [
  { label: 'Total Investment Value', value: '₹ 18,75,000', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Invested Amount', value: '₹ 15,20,000', icon: WalletCards, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Returns', value: '₹ 3,55,000 (23.4%)', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Active Investments', value: '6', icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
]

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

function QuickSummary() {
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Quick Summary</h3>
      <div className="space-y-3">
        {SUMMARY.map(item => {
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
      <button className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-[12px] font-bold text-blue-600">
        <Download size={14} /> Download Statement
      </button>
    </Card>
  )
}

function QuickActions() {
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-2 text-sm font-extrabold text-[#11194f]">Quick Actions</h3>
      <div className="divide-y divide-slate-100">
        {QUICK_ACTIONS.map(item => {
          const Icon = item.icon
          return (
            <button key={item.label} className="flex w-full items-center gap-3 py-3 text-left">
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
      <button className="flex items-center gap-2 text-[12px] font-extrabold text-blue-600">
        Explore investment insights <ArrowRight size={14} />
      </button>
    </Card>
  )
}

export function InvestmentsPage() {
  const navigate = useNavigate()

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
            <p className="text-xs font-bold text-[#34406f]">Last login: 18 May 2025, 11:25 AM</p>
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
                    <button className="flex items-center gap-1 text-[12px] font-bold text-blue-600"><Eye size={14} /> View details</button>
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-[#34406f]">Your consolidated investment summary</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ValueTile icon={Landmark} bg="bg-green-50" color="text-green-600" label="Total Investment Value" value="₹ 18,75,000" sub="12.4% (1Y)" />
                <ValueTile icon={WalletCards} bg="bg-blue-50" color="text-blue-600" label="Total Invested Amount" value="₹ 15,20,000" />
                <ValueTile icon={TrendingUp} bg="bg-green-50" color="text-green-600" label="Total Returns" value="₹ 3,55,000" sub="23.4% (1Y)" />
                <ValueTile icon={CalendarDays} bg="bg-purple-50" color="text-purple-600" label="Active Investments" value="6" sub="Across 4 categories" />
              </div>
            </Card>

            <div className="grid gap-3 lg:grid-cols-2">
              <Card padding="sm" className="rounded-lg">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-[#11194f]">Asset Allocation</h2>
                  <button className="text-[11px] font-bold text-blue-600">View breakdown</button>
                </div>
                <div className="grid items-center gap-3 sm:grid-cols-[210px_1fr]">
                  <div className="relative h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={ALLOCATION} dataKey="value" innerRadius={58} outerRadius={80} paddingAngle={0}>
                          {ALLOCATION.map(item => <Cell key={item.name} fill={item.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-sm font-extrabold text-[#11194f]">₹ 18,75,000</p>
                      <p className="text-[10px] font-semibold text-[#64729b]">Total Value</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {ALLOCATION.map(item => (
                      <div key={item.name} className="grid grid-cols-[12px_1fr_44px_82px] items-center gap-2 text-[12px] font-bold">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#253261]">{item.name}</span>
                        <span className="text-[#253261]">{item.value.toFixed(1)}%</span>
                        <span className="text-right text-[#253261]">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card padding="sm" className="rounded-lg">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="mb-2 text-sm font-extrabold text-[#11194f]">Performance (1 Year)</h2>
                    <p className="flex items-center gap-2 text-lg font-extrabold text-green-600">
                      <TrendingUp size={16} /> 12.4% <span className="text-[11px] font-bold text-[#34406f]">Overall return</span>
                    </p>
                  </div>
                  <button className="text-[11px] font-bold text-blue-600">View performance</button>
                </div>
                <div className="h-[155px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE} margin={{ left: -20, right: 5, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#52607f' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#52607f' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Return']} />
                      <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fill="url(#returnGradient)" dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card padding="none" className="rounded-lg overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3">
                <h2 className="text-sm font-extrabold text-[#11194f]">My Investments (6)</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] font-bold text-blue-600" onClick={() => navigate('/app/investments/add')}>
                    <Plus size={14} /> Add My Investment Manually
                  </button>
                  <button className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] font-bold text-blue-600">
                    All Investments <ChevronDown size={13} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto px-3 pb-2">
                <table className="w-full min-w-[850px] border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50">
                      {['Investment Name', 'Type', 'Provider', 'Current Value', 'Returns (1Y)', 'Status', ''].map((h, i) => (
                        <th key={`${h}-${i}`} className="px-3 py-2 text-left text-[10px] font-extrabold text-[#66749d]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INVESTMENTS.map(item => {
                      const Icon = item.icon
                      return (
                        <tr key={item.id}>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${item.bg}`}>
                                <Icon size={12} className={item.color} />
                              </span>
                              <span className="text-[12px] font-extrabold text-[#11194f]">{item.name}</span>
                            </div>
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2 text-[12px] font-bold text-[#34406f]">{item.type}</td>
                          <td className="border-b border-slate-100 px-3 py-2 text-[12px] font-bold text-[#34406f]">{item.provider}</td>
                          <td className="border-b border-slate-100 px-3 py-2 text-[12px] font-extrabold text-[#11194f]">{formatCurrency(item.value)}</td>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <span className="flex items-center gap-1 text-[12px] font-extrabold text-green-600"><TrendingUp size={11} /> {item.returns}%</span>
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-extrabold text-green-700">Active</span>
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
              <div className="border-t border-slate-100 p-3 text-center">
                <button className="h-8 w-full max-w-xs rounded-md border border-slate-200 text-[12px] font-extrabold text-blue-600">
                  View All Investments
                </button>
              </div>
            </Card>
          </main>

          <aside className="space-y-3">
            <QuickSummary />
            <QuickActions />
            <Tips />
          </aside>
        </div>
      </div>
    </div>
  )
}
