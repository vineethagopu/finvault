import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight, Banknote, CalendarDays, Calculator, ChevronRight, CheckCircle2,
  Clock, Download, FilePlus2, FileText, HandCoins, IndianRupee, Info,
  Lightbulb, MoreVertical, Plus, ShieldCheck, Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { loanService } from '@/services/loanService'
import type { Loan } from '@/types'
import toast from 'react-hot-toast'

interface EligibilityByPolicy {
  policyId: string; policyName: string; policyNumber?: string
  sumAssured: number; eligibility: number; eligibilityPct: number; outstanding: number; available: number
}
interface Eligibility {
  totalEligibility: number; totalOutstanding: number; totalAvailable: number
  availablePercent: number; utilizedPercent: number; activeAccounts: number
  byPolicy: EligibilityByPolicy[]
}

const ELIGIBILITY_FACTORS = [
  { label: 'Surrender Value', desc: 'Current surrender value of your policies.', icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Policy Type', desc: 'Eligible policy types as per loan guidelines.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Policy Status', desc: 'Policy is active and in-force.', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Premium Payment', desc: 'Regular premium payments maintained.', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Cooling Period', desc: 'Completed cooling period as per policy terms.', icon: Clock, color: 'text-teal-600', bg: 'bg-teal-50' },
]

const QUICK_ACTIONS_LOANS = [
  { label: 'Loan Calculator', desc: 'Calculate EMI and loan details', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'View Loan Statement', desc: 'Download your loan statement', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const QUICK_ACTIONS_ELIGIBILITY = [
  { label: 'Add Loan Manually', desc: 'Add a loan taken outside PolicyNext', icon: FilePlus2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Loan Calculator', desc: 'Calculate EMI and loan details', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50' },
]

const TIPS_LOANS = [
  'Policy loans are subject to eligibility and terms.',
  'Timely repayment helps maintain full benefits.',
  'Interest is charged on the outstanding amount.',
]

const TIPS_ELIGIBILITY = [
  'Eligibility here is a simplified estimate (80% of active LIFE policy sum assured), not a real insurer quote.',
  'Interest is charged on the outstanding amount.',
  'Timely repayment helps maintain full benefits.',
]

const TABS = ['My Loans', 'Loan Eligibility']

const LOAN_TYPE_LABEL: Record<string, string> = {
  HOME_LOAN: 'Home Loan', CAR_LOAN: 'Car Loan', PERSONAL_LOAN: 'Personal Loan', EDUCATION_LOAN: 'Education Loan',
  BUSINESS_LOAN: 'Business Loan', GOLD_LOAN: 'Gold Loan', POLICY_LOAN: 'Policy Loan', OTHER: 'Other',
}

function overviewStats(tab: string, eligibility: Eligibility, nextEmi: { amount: number; date?: string } | null) {
  return [
    {
      label: 'Total Loan Eligibility', value: formatCurrency(eligibility.totalEligibility),
      sub: tab === 'My Loans'
        ? <span className="text-slate-400">Estimated</span>
        : <span className="text-green-600">100% of total eligibility</span>,
      icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50',
    },
    {
      label: 'Available Loan', value: formatCurrency(eligibility.totalAvailable),
      sub: <span className="text-green-600">{eligibility.availablePercent}% of {tab === 'My Loans' ? 'eligibility' : 'total eligibility'}</span>,
      icon: HandCoins, color: 'text-blue-600', bg: 'bg-blue-50',
    },
    {
      label: 'Outstanding Loan', value: formatCurrency(eligibility.totalOutstanding),
      sub: <span className="text-green-600">{eligibility.activeAccounts} Active Loan{eligibility.activeAccounts === 1 ? '' : 's'}</span>,
      icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50',
    },
    {
      label: 'Next EMI Due', value: nextEmi ? formatCurrency(nextEmi.amount) : '—',
      sub: nextEmi?.date ? <span className="text-red-500">Due on {formatDate(nextEmi.date)}</span> : <span className="text-slate-400">None due</span>,
      icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50',
    },
  ]
}

function UtilizationDonut({ availablePercent }: { availablePercent: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#a78bfa" strokeWidth="15" />
      <circle
        cx="60" cy="60" r={r} fill="none" stroke="#22c55e" strokeWidth="15"
        strokeDasharray={`${c * (availablePercent / 100)} ${c}`} strokeLinecap="round"
      />
    </svg>
  )
}

function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
      <Info size={14} className="mt-0.5 shrink-0 text-blue-600" />
      <p className="text-[11px] font-semibold text-[#253261]">{children}</p>
    </div>
  )
}

function LoanSnapshot({ eligibility }: { eligibility: Eligibility }) {
  const items = [
    { label: 'Total Loan Eligibility', value: formatCurrency(eligibility.totalEligibility), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Outstanding', value: formatCurrency(eligibility.totalOutstanding), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Available Loan', value: formatCurrency(eligibility.totalAvailable), icon: HandCoins, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Loan Accounts', value: String(eligibility.activeAccounts), icon: Banknote, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Loan Snapshot</h3>
      <div className="space-y-3.5">
        {items.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon size={15} className={item.color} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#64729b]">{item.label}</p>
                <p className="text-sm font-extrabold text-[#11194f]">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function EligibilitySummary({ eligibility }: { eligibility: Eligibility }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Loan Eligibility Summary</h3>
      <div className="flex items-center gap-3">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="46" fill="none" stroke="#818cf8" strokeWidth="13" />
            <circle
              cx="60" cy="60" r="46" fill="none" stroke="#22c55e" strokeWidth="13"
              strokeDasharray={`${2 * Math.PI * 46 * (eligibility.availablePercent / 100)} ${2 * Math.PI * 46}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[13px] font-extrabold text-[#11194f]">{formatCurrency(eligibility.totalEligibility)}</p>
            <p className="text-[9px] font-semibold text-[#64729b]">Total Eligibility</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64729b]">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Available Loan
            </p>
            <p className="pl-3.5 text-[12px] font-extrabold text-[#11194f]">{formatCurrency(eligibility.totalAvailable)} ({eligibility.availablePercent}%)</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64729b]">
              <span className="h-2 w-2 rounded-full bg-indigo-400" /> Outstanding Loan
            </p>
            <p className="pl-3.5 text-[12px] font-extrabold text-[#11194f]">{formatCurrency(eligibility.totalOutstanding)} ({eligibility.utilizedPercent}%)</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function QuickActions({ items, onAddLoan }: { items: typeof QUICK_ACTIONS_LOANS; onAddLoan?: () => void }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Quick Actions</h3>
      <div className="space-y-1">
        {items.map(item => {
          const Icon = item.icon
          const clickable = item.label === 'Add Loan Manually' && onAddLoan
          return (
            <button
              key={item.label} type="button"
              onClick={clickable ? onAddLoan : () => toast('Coming soon')}
              className="flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-slate-50"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon size={15} className={item.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-[#253261]">{item.label}</p>
                <p className="text-[11px] font-medium text-[#64729b]">{item.desc}</p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-slate-300" />
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function Tips({ items }: { items: string[] }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb size={18} className="text-amber-500" />
        <h3 className="text-sm font-extrabold text-[#11194f]">Tips</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map(tip => (
          <li key={tip} className="flex items-start gap-2">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 fill-green-500 text-white" />
            <span className="text-[12px] font-semibold text-[#34406f]">{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function LoansPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('My Loans')
  const isEligibility = activeTab === 'Loan Eligibility'

  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const res = await loanService.getAll()
      return ((res.data as any).data ?? []) as Loan[]
    },
  })
  const { data: eligibility, isLoading: loadingEligibility } = useQuery({
    queryKey: ['loans-eligibility'],
    queryFn: async () => {
      const res = await loanService.getEligibility()
      return (res.data as any).data as Eligibility
    },
  })

  if (loadingLoans || loadingEligibility || !eligibility) return <DashboardSkeleton />

  const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE')
  const upcomingEmis = activeLoans.filter(l => l.nextEmiDate).sort((a, b) => (a.nextEmiDate ?? '').localeCompare(b.nextEmiDate ?? ''))
  const nextEmi = upcomingEmis.length > 0 ? { amount: Number(upcomingEmis[0].emiAmount), date: upcomingEmis[0].nextEmiDate } : null

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">{isEligibility ? 'Loan Eligibility' : 'Loans'}</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              {isEligibility ? (
                <>
                  <button className="text-green-700" onClick={() => setActiveTab('My Loans')}>Loans</button>
                  <span className="text-slate-400">&gt;</span>
                  <span className="text-[#11194f]">Loan Eligibility</span>
                </>
              ) : (
                <span className="text-[#11194f]">Loans</span>
              )}
            </nav>
          </div>
        </div>

        {isEligibility && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
            <Info size={16} className="shrink-0 text-blue-600" />
            <p className="text-[12px] font-bold text-[#253261]">
              Based on your active life insurance policies, here's a simplified estimate of your loan eligibility.
            </p>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[1fr_285px]">
          <main className="space-y-4">
            <Card padding="sm" className="rounded-lg">
              <h2 className="text-[15px] font-extrabold text-[#11194f]">{isEligibility ? 'Your Loan Eligibility Overview' : 'Loan Overview'}</h2>
              {!isEligibility && (
                <p className="mt-0.5 text-[12px] font-semibold text-[#64729b]">Summary of your loan eligibility and outstanding loans</p>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewStats(activeTab, eligibility, nextEmi).map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.bg}`}>
                        <Icon size={17} className={stat.color} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#64729b]">{stat.label}</p>
                        <p className="text-lg font-extrabold leading-tight text-[#11194f]">{stat.value}</p>
                        <p className="mt-0.5 text-[11px] font-bold">{stat.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <div className="border-b border-slate-200">
              <div className="flex gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'My Loans' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Card padding="sm" className="rounded-lg">
                  <h2 className="mb-3 text-[15px] font-extrabold text-[#11194f]">Active Loan(s)</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-[#34406f]">
                          {['Loan Account No.', 'Loan Type', 'Loan Amount', 'Outstanding Amount', 'Interest Rate', 'Next EMI Due', 'Actions'].map(h => (
                            <th key={h} className="whitespace-nowrap px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeLoans.length === 0 && (
                          <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-slate-400">No active loans yet.</td></tr>
                        )}
                        {activeLoans.map(loan => (
                          <tr key={loan.id} className="text-sm">
                            <td className="whitespace-nowrap px-3 py-4 font-bold text-[#253261]">{loan.accountNumber ?? '—'}</td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <p className="font-bold text-[#253261]">{LOAN_TYPE_LABEL[loan.loanType] ?? loan.loanType}</p>
                              {loan.securedByPolicyId && <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">Secured</span>}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 font-bold text-[#253261]">{formatCurrency(Number(loan.principalAmount))}</td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <p className="font-bold text-[#253261]">{formatCurrency(Number(loan.outstandingAmount))}</p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <p className="font-bold text-[#253261]">{loan.interestRate}% p.a.</p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <p className="font-bold text-[#253261]">{loan.nextEmiDate ? formatDate(loan.nextEmiDate) : '—'}</p>
                              <p className="text-[11px] font-bold text-red-500">{formatCurrency(Number(loan.emiAmount))}</p>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="xs" onClick={() => navigate(`/app/loans/${loan.id}`)}>View Details</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card padding="sm" hover className="rounded-lg" onClick={() => navigate('/app/loans/add')}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                      <FilePlus2 size={17} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-[#11194f]">Add Loan Manually</p>
                      <p className="text-[12px] font-semibold text-[#64729b]">Add a loan taken outside PolicyNext</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-slate-300" />
                  </div>
                </Card>

                {eligibility.byPolicy.length > 0 && (
                  <Card padding="sm" className="rounded-lg">
                    <h2 className="text-[15px] font-extrabold text-[#11194f]">Loan Eligibility Details</h2>
                    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
                      <div className="grid content-start gap-y-3 sm:grid-cols-[170px_1fr]">
                        {[
                          { label: 'Policy Name', value: eligibility.byPolicy[0].policyName },
                          { label: 'Sum Assured', value: formatCurrency(eligibility.byPolicy[0].sumAssured) },
                          { label: 'Loan Eligibility', value: formatCurrency(eligibility.byPolicy[0].eligibility) },
                          { label: 'Available Loan', value: formatCurrency(eligibility.byPolicy[0].available), info: true },
                        ].map(row => (
                          <div key={row.label} className="contents">
                            <p className="text-[12px] font-semibold text-[#64729b]">{row.label}</p>
                            <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#253261]">
                              {row.value}
                              {row.info && <Info size={12} className="text-slate-400" />}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="mb-3 text-[12px] font-bold text-[#253261]">Eligibility Utilization</p>
                        <div className="flex items-center gap-4">
                          <UtilizationDonut availablePercent={eligibility.availablePercent} />
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                              <span className="text-[11px] font-semibold text-[#64729b]">Available Loan</span>
                              <span className="text-[11px] font-extrabold text-[#11194f]">{formatCurrency(eligibility.totalAvailable)} ({eligibility.availablePercent}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 shrink-0 rounded-full bg-purple-400" />
                              <span className="text-[11px] font-semibold text-[#64729b]">Utilized Loan</span>
                              <span className="text-[11px] font-extrabold text-[#11194f]">{formatCurrency(eligibility.totalOutstanding)} ({eligibility.utilizedPercent}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 grid items-center gap-4 lg:grid-cols-2">
                      <div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${eligibility.availablePercent}%` }} />
                        </div>
                        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-[#64729b]">
                          <span>0%</span>
                          <span>{eligibility.availablePercent}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <InfoNote>Loan eligibility may change based on policy performance and outstanding loan amount.</InfoNote>
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {isEligibility && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Card padding="sm" className="rounded-lg">
                  <h2 className="text-[15px] font-extrabold text-[#11194f]">Eligibility by Policy</h2>
                  <p className="mt-0.5 text-[12px] font-semibold text-[#64729b]">Your active life insurance policies and their individual loan eligibility</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-[#34406f]">
                          {['Policy No.', 'Policy Name', 'Sum Assured', 'Loan Eligibility', 'Available Loan', 'Action'].map(h => (
                            <th key={h} className="whitespace-nowrap px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {eligibility.byPolicy.length === 0 && (
                          <tr><td colSpan={6} className="px-3 py-8 text-center text-xs text-slate-400">No active life insurance policies yet.</td></tr>
                        )}
                        {eligibility.byPolicy.map(row => (
                          <tr key={row.policyId} className="text-[13px]">
                            <td className="whitespace-nowrap px-3 py-3.5 font-bold text-[#253261]">{row.policyNumber ?? '—'}</td>
                            <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{row.policyName}</td>
                            <td className="whitespace-nowrap px-3 py-3.5 font-bold text-[#253261]">{formatCurrency(row.sumAssured)}</td>
                            <td className="whitespace-nowrap px-3 py-3.5 font-bold text-[#253261]">{formatCurrency(row.eligibility)} ({row.eligibilityPct}%)</td>
                            <td className="whitespace-nowrap px-3 py-3.5 font-bold text-[#253261]">{formatCurrency(row.available)}</td>
                            <td className="whitespace-nowrap px-3 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <Button variant="outline" size="xs" onClick={() => navigate(`/app/insurance/${row.policyId}`)}>View Details</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3">
                    <InfoNote>Loan eligibility is a simplified estimate — 80% of active life insurance sum assured, minus any outstanding policy-secured loans.</InfoNote>
                  </div>
                </Card>

                <Card padding="sm" className="rounded-lg">
                  <h2 className="text-[15px] font-extrabold text-[#11194f]">Eligibility Factors Considered</h2>
                  <p className="mt-0.5 text-[12px] font-semibold text-[#64729b]">Key factors that determine your loan eligibility</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {ELIGIBILITY_FACTORS.map(factor => {
                      const Icon = factor.icon
                      return (
                        <div key={factor.label} className="flex gap-2.5 lg:flex-col">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${factor.bg}`}>
                            <Icon size={16} className={factor.color} />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-[#253261]">{factor.label}</p>
                            <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#64729b]">{factor.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4">
                    <InfoNote>Loan eligibility may vary based on policy performance, terms and conditions.</InfoNote>
                  </div>
                </Card>
              </motion.div>
            )}
          </main>

          <aside className="space-y-3">
            {isEligibility ? <EligibilitySummary eligibility={eligibility} /> : <LoanSnapshot eligibility={eligibility} />}
            <QuickActions
              items={isEligibility ? QUICK_ACTIONS_ELIGIBILITY : QUICK_ACTIONS_LOANS}
              onAddLoan={() => navigate('/app/loans/add')}
            />
            <Tips items={isEligibility ? TIPS_ELIGIBILITY : TIPS_LOANS} />
          </aside>
        </div>
      </div>
    </div>
  )
}
