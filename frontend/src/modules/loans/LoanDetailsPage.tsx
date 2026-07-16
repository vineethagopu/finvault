import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Banknote, CalendarDays, Download, FilePlus2,
  FileText, HandCoins, Headset, Info, Percent, ShieldCheck, Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { loanService } from '@/services/loanService'
import { queryKeys } from '@/services/queryKeys'
import { API_BASE_URL } from '@/constants'
import type { Loan } from '@/types'
import toast from 'react-hot-toast'

const LOAN_TYPE_LABEL: Record<string, string> = {
  HOME_LOAN: 'Home Loan', CAR_LOAN: 'Car Loan', PERSONAL_LOAN: 'Personal Loan', EDUCATION_LOAN: 'Education Loan',
  BUSINESS_LOAN: 'Business Loan', GOLD_LOAN: 'Gold Loan', POLICY_LOAN: 'Policy Loan', OTHER: 'Other',
}

const TABS = ['Overview', 'Repayment Schedule', 'Transactions', 'Documents']

function ActiveBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">{children}</span>
  )
}

function DetailsCard({ title, rows }: { title: string; rows: { label: string; value: string; badge?: boolean }[] }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="mb-4 text-[15px] font-extrabold text-[#11194f]">{title}</h2>
      <div className="grid content-start gap-y-3 sm:grid-cols-[200px_1fr]">
        {rows.map(row => (
          <div key={row.label} className="contents">
            <p className="text-[12px] font-semibold text-[#64729b]">{row.label}</p>
            {row.badge ? (
              <p><ActiveBadge>{row.value}</ActiveBadge></p>
            ) : (
              <p className="text-[13px] font-bold text-[#253261]">{row.value}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function OutstandingDonut({ loan }: { loan: Loan }) {
  const r = 44
  const c = 2 * Math.PI * r
  const outstanding = Number(loan.outstandingAmount)
  const principal = Number(loan.principalAmount)
  const principalPct = outstanding > 0 ? Math.min(1, principal > 0 ? outstanding / principal : 0) : 0
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#818cf8" strokeWidth="13" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="#22c55e" strokeWidth="13"
          strokeDasharray={`${c * principalPct} ${c}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-sm font-extrabold text-[#11194f]">{formatCurrency(outstanding)}</p>
        <p className="text-[10px] font-semibold text-[#64729b]">Outstanding</p>
      </div>
    </div>
  )
}

export function LoanDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('Overview')

  const { data: loan, isLoading } = useQuery({
    queryKey: queryKeys.loans.detail(id),
    queryFn: () => loanService.getById(id as string),
    enabled: !!id,
  })

  const { data: transactions = [] } = useQuery({
    queryKey: queryKeys.loans.transactions(id),
    queryFn: async () =>
      (await loanService.getTransactions<{ id: string; date: string; description: string; amount: number; type: string }[]>(id as string)) ?? [],
    enabled: !!id && activeTab === 'Transactions',
  })

  const { data: documents = [] } = useQuery({
    queryKey: queryKeys.loans.documents(id),
    queryFn: async () =>
      (await loanService.getDocuments<{ document: { id: string; name: string; mimeType: string; size: number; createdAt: string } }[]>(id as string)) ?? [],
    enabled: !!id && activeTab === 'Documents',
  })

  if (isLoading || !loan) return <DashboardSkeleton />

  const emiPayments = loan.emiPayments ?? []
  const paidCount = emiPayments.filter(e => e.status === 'PAID').length
  const outstanding = Number(loan.outstandingAmount)
  const principal = Number(loan.principalAmount)

  const LOAN_OVERVIEW = [
    { label: 'Loan Purpose', value: loan.purpose ?? '—' },
    { label: 'Loan Start Date', value: formatDate(loan.disbursedDate) },
    { label: 'Loan Maturity Date', value: formatDate(loan.maturityDate) },
    { label: 'Loan Tenure', value: `${loan.tenure} months` },
    { label: 'Loan Status', value: loan.status, badge: true },
  ]
  const SECURITY_DETAILS = [
    { label: 'Security Type', value: loan.securityType ?? (loan.securedByPolicyId ? 'Policy Assignment' : 'Unsecured') },
    { label: 'Assignment Status', value: loan.securedByPolicyId ? 'Active' : 'N/A', badge: !!loan.securedByPolicyId },
    { label: 'Lender', value: loan.lender },
    { label: 'Loan Account Number', value: loan.accountNumber ?? '—' },
  ]
  const EMI_DETAILS = [
    { label: 'EMI Amount', value: formatCurrency(Number(loan.emiAmount)) },
    { label: 'Interest Type', value: loan.interestType ?? '—' },
    { label: 'Interest Rate', value: `${loan.interestRate}% p.a.` },
    { label: 'EMI Frequency', value: loan.repaymentFrequency ?? 'Monthly' },
    { label: 'Total No. of EMIs', value: String(loan.tenure) },
    { label: 'EMIs Paid', value: String(paidCount) },
    { label: 'EMIs Remaining', value: String(loan.remainingTenure) },
    { label: 'Next EMI Due Date', value: loan.nextEmiDate ? formatDate(loan.nextEmiDate) : '—' },
  ]

  const SUMMARY = [
    { label: 'Loan Amount', value: formatCurrency(principal), icon: HandCoins, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Outstanding Amount', value: formatCurrency(outstanding), icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Next EMI Due', value: formatCurrency(Number(loan.emiAmount)), sub: loan.nextEmiDate ? `on ${formatDate(loan.nextEmiDate)}` : undefined, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Interest Rate', value: `${loan.interestRate}% p.a.`, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Loan Status', value: loan.status, valueClass: 'text-green-600', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const QUICK_ACTIONS = [
    { label: 'Download Statement', desc: 'View / download loan statement', icon: Download, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Add Loan Manually', desc: 'Add a loan taken outside PolicyNext', icon: FilePlus2, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <button
          type="button"
          className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#34406f] hover:text-green-700"
          onClick={() => navigate('/app/loans')}
        >
          <ArrowLeft size={13} /> Back to Loans
        </button>

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Loan Details</h1>
              <ActiveBadge>{loan.status}</ActiveBadge>
            </div>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <button className="text-green-700" onClick={() => navigate('/app/loans')}>Loans</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Loan Details</span>
            </nav>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_285px]">
          <main className="space-y-4">
            <Card padding="sm" className="rounded-lg">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-[auto_repeat(6,1fr)] lg:items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
                  <HandCoins size={19} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Loan Account No.</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{loan.accountNumber ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Loan Type</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{LOAN_TYPE_LABEL[loan.loanType] ?? loan.loanType}</p>
                  {loan.securedByPolicyId && <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">Secured</span>}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Loan Amount</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(principal)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Outstanding Amount</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(outstanding)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Interest Rate</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{loan.interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Next EMI Due</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{loan.nextEmiDate ? formatDate(loan.nextEmiDate) : '—'}</p>
                  <p className="text-[11px] font-bold text-red-500">{formatCurrency(Number(loan.emiAmount))}</p>
                </div>
              </div>
            </Card>

            <div className="border-b border-slate-200">
              <div className="flex gap-1 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'Overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailsCard title="Loan Overview" rows={LOAN_OVERVIEW} />
                  <Card padding="sm" className="rounded-lg">
                    <h2 className="mb-4 text-[15px] font-extrabold text-[#11194f]">Outstanding Summary</h2>
                    <div className="flex flex-wrap items-center gap-5">
                      <OutstandingDonut loan={loan} />
                      <div className="space-y-3.5">
                        <div>
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64729b]">
                            <span className="h-2 w-2 rounded-full bg-green-500" /> Outstanding
                          </p>
                          <p className="pl-3.5 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(outstanding)}</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64729b]">
                            <span className="h-2 w-2 rounded-full bg-indigo-400" /> Original Principal
                          </p>
                          <p className="pl-3.5 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(principal)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailsCard title="Loan Security Details" rows={SECURITY_DETAILS} />
                  <DetailsCard title="EMI & Repayment Details" rows={EMI_DETAILS} />
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3">
                  <ShieldCheck size={16} className="shrink-0 text-green-600" />
                  <p className="text-[12px] font-bold text-[#253261]">
                    Keep repaying on schedule to maintain a healthy credit profile.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'Repayment Schedule' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="sm" className="rounded-lg">
                  <h2 className="mb-3 text-[15px] font-extrabold text-[#11194f]">Repayment Schedule</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-bold text-[#34406f]">
                          {['Due Date', 'EMI Amount', 'Principal', 'Interest', 'Status'].map(h => (
                            <th key={h} className="whitespace-nowrap px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {emiPayments.length === 0 && (
                          <tr><td colSpan={5} className="px-3 py-8 text-center text-xs text-slate-400">No EMI records yet.</td></tr>
                        )}
                        {emiPayments.map(row => (
                          <tr key={row.id} className="text-[13px]">
                            <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#34406f]">{formatDate(row.dueDate)}</td>
                            <td className="px-3 py-3 font-bold text-[#253261]">{formatCurrency(Number(row.amount))}</td>
                            <td className="px-3 py-3 font-semibold text-[#34406f]">{row.principal ? formatCurrency(Number(row.principal)) : '—'}</td>
                            <td className="px-3 py-3 font-semibold text-[#34406f]">{row.interest ? formatCurrency(Number(row.interest)) : '—'}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${row.status === 'PAID' ? 'bg-green-50 text-green-700' : row.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'Transactions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="sm" className="rounded-lg">
                  <h2 className="mb-3 text-[15px] font-extrabold text-[#11194f]">Transactions</h2>
                  <div className="divide-y divide-slate-50">
                    {transactions.length === 0 && <p className="py-8 text-center text-xs text-slate-400">No transactions yet.</p>}
                    {transactions.map(txn => (
                      <div key={txn.id} className="flex items-center gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                          <Banknote size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#253261]">{txn.description}</p>
                          <p className="text-[11px] font-medium text-[#64729b]">{formatDate(txn.date)}</p>
                        </div>
                        <p className="text-[13px] font-extrabold text-[#11194f]">{formatCurrency(txn.amount)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'Documents' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="sm" className="rounded-lg">
                  <h2 className="mb-3 text-[15px] font-extrabold text-[#11194f]">Documents</h2>
                  <div className="divide-y divide-slate-50">
                    {documents.length === 0 && <p className="py-8 text-center text-xs text-slate-400">No documents uploaded for this loan yet.</p>}
                    {documents.map(d => (
                      <div key={d.document.id} className="flex items-center gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-bold text-[#253261]">{d.document.name}</p>
                          <p className="text-[11px] font-medium text-[#64729b]">{formatDate(d.document.createdAt)} · {(d.document.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <a href={`${API_BASE_URL}/documents/${d.document.id}/download`} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="xs" leftIcon={<Download size={12} />}>Download</Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </main>

          <aside className="space-y-3">
            <Card padding="sm" className="rounded-lg">
              <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Loan Summary</h3>
              <div className="space-y-3.5">
                {SUMMARY.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                        <Icon size={15} className={item.color} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#64729b]">{item.label}</p>
                        <p className={`text-sm font-extrabold ${item.valueClass || 'text-[#11194f]'}`}>{item.value}</p>
                        {item.sub && <p className="text-[11px] font-bold text-orange-500">{item.sub}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Quick Actions</h3>
              <div className="space-y-1">
                {QUICK_ACTIONS.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label} type="button"
                      onClick={item.label === 'Add Loan Manually' ? () => navigate('/app/loans/add') : () => toast('Coming soon')}
                      className="flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                        <Icon size={15} className={item.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#253261]">{item.label}</p>
                        <p className="text-[11px] font-medium text-[#64729b]">{item.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                  <Headset size={15} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-extrabold text-[#11194f]">Need Help?</h3>
              </div>
              <p className="text-[12px] font-semibold leading-relaxed text-[#34406f]">
                Have questions about your loan? Our support team is here to help.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => toast.success('Connecting you to support')}>Contact Support</Button>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
