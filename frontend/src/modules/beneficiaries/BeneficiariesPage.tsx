import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Eye,
  Info, Lightbulb, RotateCcw, Search, ShieldCheck,
  Shield, UserPlus, Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatDate, formatDateTime, getInitials } from '@/utils/formatters'
import { beneficiaryService } from '@/services/beneficiaryService'
import { useAuthStore } from '@/store/authStore'
import type { Beneficiary } from '@/types'

interface BeneficiaryRow extends Beneficiary {
  policy?: { id: string; policyName: string; policyNumber?: string } | null
}
interface Summary {
  total: number; primary: number; other: number; policiesWithBeneficiaries: number
  byPolicy: { policyName: string; count: number }[]
}

const AVATAR_COLORS = [
  { bg: 'bg-purple-50', text: 'text-purple-600' }, { bg: 'bg-blue-50', text: 'text-blue-600' },
  { bg: 'bg-green-50', text: 'text-green-600' }, { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-pink-50', text: 'text-pink-600' }, { bg: 'bg-indigo-50', text: 'text-indigo-600' },
]
function avatarStyle(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const TYPE_LABEL: Record<string, string> = { NOMINEE: 'Nominee', LEGAL_HEIR: 'Legal Heir', ASSIGNEE: 'Assignee', OTHER: 'Other' }
const TYPE_PILL: Record<string, string> = { NOMINEE: 'bg-green-50 text-green-700', LEGAL_HEIR: 'bg-amber-50 text-amber-700', ASSIGNEE: 'bg-blue-50 text-blue-700', OTHER: 'bg-slate-100 text-slate-600' }

const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']

const TIPS = [
  'Ensure your beneficiary details are up to date.',
  'Keep share percentage total 100% across your beneficiaries.',
  'Update nominee details for smooth claim settlement.',
]

export function BeneficiariesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [relationship, setRelationship] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const res = await beneficiaryService.getAll()
      return ((res.data as any).data ?? []) as BeneficiaryRow[]
    },
  })
  const { data: summary } = useQuery({
    queryKey: ['beneficiaries-summary'],
    queryFn: async () => {
      const res = await beneficiaryService.getSummary()
      return (res.data as any).data as Summary
    },
  })

  const filtered = useMemo(() => beneficiaries.filter(b =>
    (!search || b.fullName.toLowerCase().includes(search.toLowerCase()) || (b.policy?.policyName ?? '').toLowerCase().includes(search.toLowerCase())) &&
    (!relationship || b.relationship === relationship) &&
    (!typeFilter || b.type === typeFilter)
  ), [beneficiaries, search, relationship, typeFilter])

  const STATS = [
    { label: 'Total Beneficiaries', value: String(summary?.total ?? 0), sub: 'Across all policies', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Nominees', value: String(summary?.primary ?? 0), sub: summary && summary.total > 0 ? `${Math.round((summary.primary / summary.total) * 100)}% of total` : '—', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Other Beneficiaries', value: String(summary?.other ?? 0), sub: summary && summary.total > 0 ? `${Math.round((summary.other / summary.total) * 100)}% of total` : '—', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Policies with Beneficiaries', value: String(summary?.policiesWithBeneficiaries ?? 0), sub: 'Linked policies', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  const resetFilters = () => { setSearch(''); setRelationship(''); setTypeFilter(''); setPage(1) }

  if (isLoading) return <DashboardSkeleton />

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
            <p className="text-xs font-bold text-[#34406f]">Last login: {user?.lastLogin ? formatDateTime(user.lastLogin) : '—'}</p>
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
                  value={relationship} onChange={e => { setRelationship(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Relationship</option>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                  value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Types</option>
                  {Object.entries(TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
                    {filtered.map(b => {
                      const avatar = avatarStyle(b.fullName)
                      return (
                        <tr key={b.id} className="text-[13px]">
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${avatar.bg} ${avatar.text}`}>
                                {getInitials(b.fullName)}
                              </div>
                              <div>
                                <p className="font-bold text-[#253261]">{b.fullName}</p>
                                <p className="text-[11px] font-medium text-[#64729b]">{b.relationship}{b.dateOfBirth ? ` | DOB: ${formatDate(b.dateOfBirth)}` : ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{b.relationship}</td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            {b.policy ? (
                              <>
                                <p className="font-bold text-[#253261]">{b.policy.policyName}</p>
                                {b.policy.policyNumber && <p className="text-[11px] font-medium text-[#64729b]">Policy No: {b.policy.policyNumber}</p>}
                              </>
                            ) : (
                              <span className="text-[#64729b]">Not linked</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${TYPE_PILL[b.type]}`}>
                              {TYPE_LABEL[b.type]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 font-bold text-[#253261]">{b.sharePercent}%</td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${b.isVerified ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{b.isVerified ? 'Verified' : 'Unverified'}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <div className="flex items-center gap-0.5 text-slate-400">
                              <button type="button" title="View" className="rounded p-1.5 hover:bg-slate-50 hover:text-blue-600"><Eye size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
                <p className="text-[12px] font-semibold text-[#64729b]">Showing {filtered.length} of {beneficiaries.length} beneficiaries</p>
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
                {(summary?.byPolicy ?? []).length === 0 && (
                  <p className="text-[12px] text-slate-400">No beneficiaries yet.</p>
                )}
                {summary?.byPolicy.map(item => (
                  <div key={item.policyName} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                      <ShieldCheck size={15} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#253261]">{item.policyName}</p>
                      <p className="text-[11px] font-medium text-[#64729b]">{item.count} Beneficiar{item.count === 1 ? 'y' : 'ies'}</p>
                    </div>
                  </div>
                ))}
              </div>
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
