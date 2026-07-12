import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Banknote, CalendarDays, ChevronRight, Download, FilePlus2,
  FileText, HandCoins, Headset, Info, MoreVertical, Percent, ShieldCheck, Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'

const LOAN = {
  accountNo: 'LN1234567890',
  type: 'Policy Loan',
  tag: 'Secured',
  amount: 280000,
  outstanding: 185750,
  principalOutstanding: 170000,
  interestOutstanding: 15750,
  rate: '9.25% p.a.',
  rateNote: '(Reducing)',
  emi: 12750,
  emiDate: '05 Jun 2025',
  status: 'Active',
}

const LOAN_OVERVIEW = [
  { label: 'Policy Name', value: 'Term Life Insurance' },
  { label: 'Sum Assured', value: '₹10,00,000' },
  { label: 'Policy Term', value: '20 Years' },
  { label: 'PPT', value: '15 Years' },
  { label: 'Loan Start Date', value: '10 Apr 2023' },
  { label: 'Loan Maturity Date', value: '09 Apr 2043' },
  { label: 'Loan Tenure', value: '20 Years' },
  { label: 'Loan Purpose', value: 'Personal' },
  { label: 'Loan Status', value: 'Active', badge: true },
  { label: 'Part Prepayment / Foreclosure', value: 'Allowed' },
]

const SECURITY_DETAILS = [
  { label: 'Security Type', value: 'Policy Assignment' },
  { label: 'Policy Ownership', value: 'Self' },
  { label: 'Assignment Date', value: '10 Apr 2023' },
  { label: 'Assignment Status', value: 'Active', badge: true },
  { label: 'Insurer Name', value: 'HDFC Life Insurance Company Limited' },
  { label: 'Policy Number', value: '87654321' },
  { label: 'Policy Premium Paying Term', value: '15 Years' },
  { label: 'Premium Payment Frequency', value: 'Yearly' },
]

const EMI_DETAILS = [
  { label: 'EMI Amount', value: '₹12,750' },
  { label: 'Interest Type', value: 'Reducing Balance' },
  { label: 'Interest Rate', value: '9.25% p.a.' },
  { label: 'EMI Frequency', value: 'Monthly' },
  { label: 'Total No. of EMIs', value: '240' },
  { label: 'EMIs Paid', value: '25' },
  { label: 'EMIs Remaining', value: '215' },
  { label: 'Next EMI Due Date', value: '05 Jun 2025' },
  { label: 'Total Interest Payable', value: '₹1,24,560 (Approx.)' },
]

const REPAYMENT_SCHEDULE = [
  { no: 24, date: '05 Apr 2025', emi: 12750, principal: 11360, interest: 1390, balance: 172420, status: 'Paid' },
  { no: 25, date: '05 May 2025', emi: 12750, principal: 11448, interest: 1302, balance: 170000, status: 'Paid' },
  { no: 26, date: '05 Jun 2025', emi: 12750, principal: 11536, interest: 1214, balance: 158464, status: 'Due' },
  { no: 27, date: '05 Jul 2025', emi: 12750, principal: 11625, interest: 1125, balance: 146839, status: 'Upcoming' },
  { no: 28, date: '05 Aug 2025', emi: 12750, principal: 11715, interest: 1035, balance: 135124, status: 'Upcoming' },
]

const TRANSACTIONS = [
  { date: '05 May 2025', desc: 'EMI Payment - May 2025', mode: 'Auto Debit', amount: 12750 },
  { date: '05 Apr 2025', desc: 'EMI Payment - Apr 2025', mode: 'Auto Debit', amount: 12750 },
  { date: '10 Apr 2023', desc: 'Loan Disbursal', mode: 'NEFT', amount: 280000 },
]

const DOCUMENTS = [
  { name: 'Loan Agreement.pdf', date: '10 Apr 2023', size: '1.2 MB' },
  { name: 'Policy Assignment Letter.pdf', date: '10 Apr 2023', size: '450 KB' },
  { name: 'Loan Statement - FY 2024-25.pdf', date: '01 Apr 2025', size: '820 KB' },
]

const SUMMARY = [
  { label: 'Loan Amount', value: formatCurrency(LOAN.amount), icon: HandCoins, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Outstanding Amount', value: formatCurrency(LOAN.outstanding), icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Next EMI Due', value: formatCurrency(LOAN.emi), sub: `on ${LOAN.emiDate}`, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Interest Rate', value: LOAN.rate, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Loan Status', value: 'Active', valueClass: 'text-green-600', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

const QUICK_ACTIONS = [
  { label: 'Make Part Payment', desc: 'Pay a part of your outstanding', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Foreclose Loan', desc: 'Close your loan account', icon: Banknote, color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'Download Statement', desc: 'View / download loan statement', icon: Download, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Add Loan Manually', desc: 'Add a loan taken outside PolicyNext', icon: FilePlus2, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const TABS = ['Overview', 'Repayment Schedule', 'Transactions', 'Documents']

function ActiveBadge({ children = 'Active' }: { children?: ReactNode }) {
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

function OutstandingDonut() {
  const r = 44
  const c = 2 * Math.PI * r
  const principalPct = LOAN.principalOutstanding / LOAN.outstanding
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
        <p className="text-sm font-extrabold text-[#11194f]">{formatCurrency(LOAN.outstanding)}</p>
        <p className="text-[10px] font-semibold text-[#64729b]">Outstanding</p>
      </div>
    </div>
  )
}

export function LoanDetailsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')

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
              <ActiveBadge />
            </div>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <button className="text-green-700" onClick={() => navigate('/app/loans')}>Loans</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Loan Details</span>
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-4 pt-2">
            <p className="text-xs font-bold text-[#34406f]">Last login: 18 May 2025, 11:25 AM</p>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              <ShieldCheck size={12} /> Secure Session
            </div>
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
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{LOAN.accountNo}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Loan Type</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{LOAN.type}</p>
                  <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">{LOAN.tag}</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Loan Amount</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(LOAN.amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Outstanding Amount</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(LOAN.outstanding)}</p>
                  <p className="text-[11px] font-medium text-[#64729b]">(Principal)</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Interest Rate</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{LOAN.rate}</p>
                  <p className="text-[11px] font-medium text-[#64729b]">{LOAN.rateNote}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#64729b]">Next EMI Due</p>
                  <p className="mt-1 text-[13px] font-extrabold text-[#11194f]">{LOAN.emiDate}</p>
                  <p className="text-[11px] font-bold text-red-500">{formatCurrency(LOAN.emi)}</p>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-end gap-1">
              <Button variant="outline" size="sm" leftIcon={<Download size={14} />}>Download Loan Statement</Button>
              <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-50">
                <MoreVertical size={16} />
              </button>
            </div>

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
                      <OutstandingDonut />
                      <div className="space-y-3.5">
                        <div>
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64729b]">
                            <span className="h-2 w-2 rounded-full bg-green-500" /> Principal Outstanding
                          </p>
                          <p className="pl-3.5 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(LOAN.principalOutstanding)} (91.5%)</p>
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64729b]">
                            <span className="h-2 w-2 rounded-full bg-indigo-400" /> Interest Outstanding
                          </p>
                          <p className="pl-3.5 text-[13px] font-extrabold text-[#11194f]">{formatCurrency(LOAN.interestOutstanding)} (8.5%)</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
                      <Info size={14} className="mt-0.5 shrink-0 text-blue-600" />
                      <p className="text-[11px] font-semibold text-[#253261]">Interest rate is reducing. EMI amount may change over time.</p>
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
                    Your policy will remain in force as long as the loan and interest are repaid as per the terms.
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
                          {['EMI No.', 'Due Date', 'EMI Amount', 'Principal', 'Interest', 'Balance', 'Status'].map(h => (
                            <th key={h} className="whitespace-nowrap px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {REPAYMENT_SCHEDULE.map(row => (
                          <tr key={row.no} className="text-[13px]">
                            <td className="px-3 py-3 font-bold text-[#253261]">{row.no}</td>
                            <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#34406f]">{row.date}</td>
                            <td className="px-3 py-3 font-bold text-[#253261]">{formatCurrency(row.emi)}</td>
                            <td className="px-3 py-3 font-semibold text-[#34406f]">{formatCurrency(row.principal)}</td>
                            <td className="px-3 py-3 font-semibold text-[#34406f]">{formatCurrency(row.interest)}</td>
                            <td className="px-3 py-3 font-semibold text-[#34406f]">{formatCurrency(row.balance)}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${row.status === 'Paid' ? 'bg-green-50 text-green-700' : row.status === 'Due' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
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
                    {TRANSACTIONS.map(txn => (
                      <div key={txn.desc} className="flex items-center gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                          <Banknote size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-[#253261]">{txn.desc}</p>
                          <p className="text-[11px] font-medium text-[#64729b]">{txn.date} · {txn.mode}</p>
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
                    {DOCUMENTS.map(doc => (
                      <div key={doc.name} className="flex items-center gap-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[13px] font-bold text-[#253261]">{doc.name}</p>
                          <p className="text-[11px] font-medium text-[#64729b]">{doc.date} · {doc.size}</p>
                        </div>
                        <Button variant="outline" size="xs" leftIcon={<Download size={12} />}>Download</Button>
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
                      onClick={item.label === 'Add Loan Manually' ? () => navigate('/app/loans/add') : undefined}
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
              <Button variant="outline" size="sm" className="mt-3 w-full">Contact Support</Button>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
