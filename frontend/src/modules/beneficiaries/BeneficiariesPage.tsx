import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Baby, CheckCircle2, ChevronLeft, ChevronRight, Eye, HeartPulse,
  Info, Lightbulb, MoreVertical, PiggyBank, RotateCcw, Search, ShieldCheck,
  Shield, UserPlus, Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Beneficiary {
  id: string
  initials: string
  avatarBg: string
  avatarColor: string
  name: string
  meta: string
  relationship: string
  policy: string
  policyNo: string
  type: 'Primary' | 'Contingent'
  share: string
  status: string
}

const BENEFICIARIES: Beneficiary[] = [
  { id: '1', initials: 'SP', avatarBg: 'bg-purple-50', avatarColor: 'text-purple-600', name: 'Shreya Sharma', meta: 'Daughter | DOB: 12 Jan 2012', relationship: 'Daughter', policy: 'Term Life Insurance', policyNo: 'TLI123456', type: 'Primary', share: '50%', status: 'Active' },
  { id: '2', initials: 'RP', avatarBg: 'bg-blue-50', avatarColor: 'text-blue-600', name: 'Rahul Sharma', meta: 'Son | DOB: 18 Aug 2015', relationship: 'Son', policy: 'Term Life Insurance', policyNo: 'TLI123456', type: 'Primary', share: '30%', status: 'Active' },
  { id: '3', initials: 'SM', avatarBg: 'bg-green-50', avatarColor: 'text-green-600', name: 'Sunita Sharma', meta: 'Spouse | DOB: 22 Mar 1988', relationship: 'Spouse', policy: 'Term Life Insurance', policyNo: 'TLI123456', type: 'Primary', share: '20%', status: 'Active' },
  { id: '4', initials: 'AM', avatarBg: 'bg-amber-50', avatarColor: 'text-amber-600', name: 'Amit Sharma', meta: 'Brother | DOB: 05 May 1990', relationship: 'Brother', policy: 'Term Life Insurance', policyNo: 'TLI123456', type: 'Contingent', share: '100%', status: 'Active' },
  { id: '5', initials: 'PM', avatarBg: 'bg-pink-50', avatarColor: 'text-pink-600', name: 'Pooja Sharma', meta: 'Sister | DOB: 14 Nov 1992', relationship: 'Sister', policy: 'Term Life Insurance', policyNo: 'TLI123456', type: 'Contingent', share: '100%', status: 'Active' },
  { id: '6', initials: 'NN', avatarBg: 'bg-indigo-50', avatarColor: 'text-indigo-600', name: 'Neha Sharma', meta: 'Daughter | DOB: 10 Feb 2018', relationship: 'Daughter', policy: 'Health Insurance Plus', policyNo: 'HP987654', type: 'Primary', share: '100%', status: 'Active' },
]

const STATS = [
  { label: 'Total Beneficiaries', value: '12', sub: 'Across all policies', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Primary Beneficiaries', value: '8', sub: '67% of total', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Contingent Beneficiaries', value: '4', sub: '33% of total', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Policies with Beneficiaries', value: '10', sub: 'Active policies', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
]

const POLICIES = ['Term Life Insurance', 'Health Insurance Plus']
const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Brother', 'Sister']
const STATUSES = ['Active', 'Inactive']

const SUMMARY = [
  { label: 'Term Life Insurance', count: '6 Beneficiaries', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Health Insurance Plus', count: '3 Beneficiaries', icon: HeartPulse, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Child Plan', count: '2 Beneficiaries', icon: Baby, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Retirement Plan', count: '1 Beneficiary', icon: PiggyBank, color: 'text-blue-600', bg: 'bg-blue-50' },
]

const TIPS = [
  'Ensure your beneficiary details are up to date.',
  'Keep share percentage total 100% for primary beneficiaries.',
  'Update nominee details for smooth claim settlement.',
]

export function BeneficiariesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [policy, setPolicy] = useState('')
  const [relationship, setRelationship] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => BENEFICIARIES.filter(b =>
    (!search || b.name.toLowerCase().includes(search.toLowerCase()) || b.policy.toLowerCase().includes(search.toLowerCase()) || b.policyNo.toLowerCase().includes(search.toLowerCase())) &&
    (!policy || b.policy === policy) &&
    (!relationship || b.relationship === relationship) &&
    (!status || b.status === status)
  ), [search, policy, relationship, status])

  const resetFilters = () => { setSearch(''); setPolicy(''); setRelationship(''); setStatus(''); setPage(1) }

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Beneficiaries</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Beneficiaries</span>
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-4 pt-2">
            <p className="text-xs font-bold text-[#34406f]">Last login: 18 May 2025, 11:25 AM</p>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              <ShieldCheck size={12} /> Secure Session
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
          <Info size={16} className="shrink-0 text-blue-600" />
          <p className="text-[12px] font-bold text-[#253261]">
            Manage your nominee and beneficiary details for all your policies and plans.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_285px]">
          <main className="space-y-4">
            <Card padding="sm" className="rounded-lg">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.bg}`}>
                        <Icon size={17} className={stat.color} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#64729b]">{stat.label}</p>
                        <p className="text-lg font-extrabold leading-tight text-[#11194f]">{stat.value}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-[#64729b]">{stat.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[190px] flex-1">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search by name or policy..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-[12px] font-semibold text-slate-800 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <select
                  value={policy} onChange={e => { setPolicy(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Policies</option>
                  {POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select
                  value={relationship} onChange={e => { setRelationship(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Relationship</option>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                  value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Status</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button variant="outline" size="sm" leftIcon={<RotateCcw size={13} />} onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-[#34406f]">
                      {['Beneficiary Name', 'Relationship', 'Policy / Plan', 'Beneficiary Type', 'Share (%)', 'Status', 'Actions'].map(h => (
                        <th key={h} className="whitespace-nowrap px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(b => (
                      <tr key={b.id} className="text-[13px]">
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${b.avatarBg} ${b.avatarColor}`}>
                              {b.initials}
                            </div>
                            <div>
                              <p className="font-bold text-[#253261]">{b.name}</p>
                              <p className="text-[11px] font-medium text-[#64729b]">{b.meta}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{b.relationship}</td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <p className="font-bold text-[#253261]">{b.policy}</p>
                          <p className="text-[11px] font-medium text-[#64729b]">Policy No: {b.policyNo}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${b.type === 'Primary' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {b.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-bold text-[#253261]">{b.share}</td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <span className="inline-block rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">{b.status}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <div className="flex items-center gap-0.5 text-slate-400">
                            <button type="button" title="View" className="rounded p-1.5 hover:bg-slate-50 hover:text-blue-600"><Eye size={15} /></button>
                            <button type="button" title="More" className="rounded p-1.5 hover:bg-slate-50"><MoreVertical size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-10 text-center text-sm font-semibold text-[#64729b]">
                          No beneficiaries match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-4">
                <p className="text-[12px] font-semibold text-[#64729b]">Showing 1 to {filtered.length} of 12 beneficiaries</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[1, 2].map(n => (
                    <button
                      key={n} type="button" onClick={() => setPage(n)}
                      className={`h-8 w-8 rounded-lg text-[12px] font-bold transition-colors ${page === n ? 'bg-blue-600 text-white' : 'border border-slate-200 text-[#34406f] hover:bg-slate-50'}`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button" disabled={page === 2} onClick={() => setPage(p => Math.min(2, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg bg-green-50/60">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <ShieldCheck size={17} className="text-green-700" />
                </div>
                <div className="min-w-[220px] flex-1">
                  <p className="text-sm font-extrabold text-[#11194f]">Keep your loved ones protected</p>
                  <p className="text-[12px] font-semibold text-[#64729b]">
                    Review and update your beneficiary details regularly to ensure hassle-free claim settlement.
                  </p>
                </div>
                <Button variant="outline">Learn More</Button>
              </div>
            </Card>
          </main>

          <aside className="space-y-3">
            <Card padding="sm" className="rounded-lg text-center">
              <h3 className="mb-3 text-left text-sm font-extrabold text-[#11194f]">Add Beneficiary</h3>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <UserPlus size={24} className="text-green-600" />
              </div>
              <p className="mx-auto mb-4 max-w-[210px] text-[12px] font-semibold text-[#34406f]">
                Add a new beneficiary or nominee to your policy or plan.
              </p>
              <Button className="w-full" leftIcon={<UserPlus size={14} />} onClick={() => navigate('/app/beneficiaries/add')}>
                Add Beneficiary
              </Button>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Beneficiary Summary</h3>
              <div className="space-y-3.5">
                {SUMMARY.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                        <Icon size={15} className={item.color} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#253261]">{item.label}</p>
                        <p className="text-[11px] font-medium text-[#64729b]">{item.count}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button type="button" className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-green-700 hover:underline">
                View Policy-wise Details <ArrowRight size={12} />
              </button>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#11194f]">Tips</h3>
              </div>
              <ul className="space-y-2.5">
                {TIPS.map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 fill-green-500 text-white" />
                    <span className="text-[12px] font-semibold text-[#34406f]">{tip}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-green-700 hover:underline">
                Learn more about beneficiaries <ArrowRight size={12} />
              </button>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
