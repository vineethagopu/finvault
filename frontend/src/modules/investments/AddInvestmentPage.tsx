import { useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, BarChart3, CalendarDays, Check, CheckCircle2, Coins, FileText, Home,
  Info, Landmark, LayoutGrid, Lightbulb, LineChart, PiggyBank,
  ShieldCheck, TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { investmentService } from '@/services/investmentService'
import { queryKeys } from '@/services/queryKeys'
import toast from 'react-hot-toast'

const INVESTMENT_TYPES = [
  { value: 'MUTUAL_FUND', label: 'Mutual Funds' },
  { value: 'STOCKS', label: 'Stocks / Equity' },
  { value: 'FIXED_DEPOSIT', label: 'Fixed Deposits' },
  { value: 'PPF', label: 'PPF' },
  { value: 'NPS', label: 'NPS' },
  { value: 'BONDS', label: 'Bonds / Debentures' },
  { value: 'GOLD_ETF', label: 'Gold / ETF' },
  { value: 'ULIP', label: 'ULIP' },
  { value: 'REAL_ESTATE', label: 'Real Estate (REIT)' },
  { value: 'OTHER', label: 'Others' },
]

const MODES = ['Lumpsum', 'SIP', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']
const ASSET_CLASSES = [
  { value: 'EQUITY', label: 'Equity' }, { value: 'DEBT', label: 'Debt' }, { value: 'HYBRID', label: 'Hybrid' },
  { value: 'COMMODITY', label: 'Commodity' }, { value: 'REAL_ESTATE', label: 'Real Estate' }, { value: 'OTHER', label: 'Others' },
]
const RISK_LEVELS = ['Low', 'Moderate', 'High', 'Very High']
const GOALS = ['Retirement', 'Child Education', 'Wealth Creation', 'Tax Saving', 'Emergency Fund', 'Home Purchase', 'Others']
const LOCK_IN_PERIODS = ['No Lock-in', '1 Year', '3 Years', '5 Years', '15 Years']

const WHY_ADD_MANUALLY = [
  'Track all your investments in one place.',
  'Get a consolidated view of your portfolio.',
  'Better insights for informed decisions.',
  'Plan your financial goals effectively.',
]

const POPULAR_TYPES = [
  { label: 'Mutual Funds', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Stocks / Equity', icon: LineChart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Fixed Deposits', icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'PPF / EPF', icon: PiggyBank, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Bonds / Debentures', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Gold / ETF', icon: Coins, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Real Estate (REIT)', icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Others', icon: LayoutGrid, color: 'text-pink-600', bg: 'bg-pink-50' },
]

const schema = z.object({
  investmentType: z.string().min(1, 'Investment type is required'),
  investmentName: z.string().min(2, 'Investment name is required'),
  provider: z.string().min(1, 'Provider / fund house is required'),
  schemeName: z.string().optional(),
  folioNumber: z.string().optional(),
  amountInvested: z.string().min(1, 'Amount invested is required'),
  investmentDate: z.string().min(1, 'Investment date is required'),
  modeOfInvestment: z.string().min(1, 'Mode of investment is required'),
  assetClass: z.string().min(1, 'Asset class is required'),
  riskLevel: z.string().min(1, 'Risk level is required'),
  investmentGoal: z.string().optional(),
  expectedReturnRate: z.string().optional(),
  lockInPeriod: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="mb-4 text-[15px] font-extrabold text-[#11194f]">{title}</h2>
      {children}
    </Card>
  )
}

function WhyAddManually() {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
          <TrendingUp size={17} className="text-purple-600" />
        </div>
        <h3 className="text-sm font-extrabold text-[#11194f]">Why add manually?</h3>
      </div>
      <ul className="space-y-3">
        {WHY_ADD_MANUALLY.map(item => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 fill-green-500 text-white" />
            <span className="text-[12px] font-semibold text-[#34406f]">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function PopularInvestmentTypes() {
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Popular Investment Types</h3>
      <div className="space-y-3">
        {POPULAR_TYPES.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg}`}>
                <Icon size={14} className={item.color} />
              </div>
              <span className="text-[12px] font-bold text-[#253261]">{item.label}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function Tips() {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb size={18} className="text-amber-500" />
        <h3 className="text-sm font-extrabold text-[#11194f]">Tips</h3>
      </div>
      <p className="text-[12px] font-semibold leading-relaxed text-[#34406f]">
        Ensure the investment details are accurate for better tracking and reporting.
      </p>
    </Card>
  )
}

export function AddInvestmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  // Arrived from the "Invest Online" catalog tiles? Pre-select the matching type
  // so the form doesn't land blank after the user already picked a product.
  const preset = (location.state as { presetInvestmentType?: string } | null)?.presetInvestmentType
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      investmentType: preset && INVESTMENT_TYPES.some(t => t.value === preset) ? preset : '',
      modeOfInvestment: '', assetClass: '',
      riskLevel: '', investmentGoal: '', lockInPeriod: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)
    try {
      const isSip = data.modeOfInvestment === 'SIP'
      const extraNotes = [
        data.schemeName && `Scheme: ${data.schemeName}`,
        data.investmentGoal && `Goal: ${data.investmentGoal}`,
        data.lockInPeriod && `Lock-in: ${data.lockInPeriod}`,
        data.expectedReturnRate && `Expected return: ${data.expectedReturnRate}%`,
        data.notes,
      ].filter(Boolean).join(' · ')

      await investmentService.create({
        investmentName: data.investmentName,
        investmentType: data.investmentType as any,
        provider: data.provider,
        folioNumber: data.folioNumber || undefined,
        amountInvested: Number(data.amountInvested),
        currentValue: Number(data.amountInvested),
        assetClass: data.assetClass as any,
        riskLevel: data.riskLevel,
        investmentDate: data.investmentDate,
        isSip,
        sipAmount: isSip ? Number(data.amountInvested) : undefined,
        sipDay: isSip ? new Date(data.investmentDate).getDate() : undefined,
        status: 'ACTIVE',
        notes: extraNotes || undefined,
      } as any)
      // Same-tab lists (Investments page, Dashboard) refetch immediately — no
      // manual reload needed. Cross-tab/device updates arrive via the SSE stream.
      await queryClient.invalidateQueries({ queryKey: queryKeys.investments.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.investments.overview() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.investments.performance() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      setSaved(true)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to add investment')
    } finally {
      setSubmitting(false)
    }
  })

  const dateField = register('investmentDate')

  if (saved) {
    return (
      <div className="min-h-full bg-white p-4 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-10 max-w-md rounded-xl border border-slate-100 bg-white p-12 text-center shadow-sm"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-[#11194f]">Investment Added!</h2>
          <p className="mb-6 text-sm font-semibold text-[#64729b]">Your investment has been added to your portfolio.</p>
          <Button className="w-full" onClick={() => navigate('/app/investments')}>View Portfolio</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Add My Investment Manually</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <button className="text-green-700" onClick={() => navigate('/app/investments')}>Investments</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Add My Investment Manually</span>
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
          <main>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <SectionCard title="1. Investment Details">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Select label="Investment Type" {...register('investmentType')} error={errors.investmentType?.message}>
                    <option value="">Select Investment Type</option>
                    {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                  <Input label="Investment Name" placeholder="Enter Investment Name" {...register('investmentName')} error={errors.investmentName?.message} />
                  <Input label="Provider / Fund House" placeholder="Enter Provider / Fund House" {...register('provider')} error={errors.provider?.message} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="Scheme / Plan Name (Optional)" placeholder="Enter Scheme / Plan Name" {...register('schemeName')} />
                  <Input label="Folio / Policy / Account Number (Optional)" placeholder="Enter Folio / Policy / Account Number" {...register('folioNumber')} />
                </div>
              </SectionCard>

              <SectionCard title="2. Investment Amount & Date">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Amount Invested (₹)" type="number" min="0" placeholder="Enter Amount Invested" {...register('amountInvested')} error={errors.amountInvested?.message} />
                  <Input
                    label="Investment Date" type="text" placeholder="Select Investment Date"
                    rightElement={<CalendarDays size={15} className="pointer-events-none text-slate-400" />}
                    className="[&::-webkit-calendar-picker-indicator]:hidden"
                    error={errors.investmentDate?.message}
                    {...dateField}
                    onFocus={e => { e.currentTarget.type = 'date'; try { e.currentTarget.showPicker?.() } catch { /* needs user activation */ } }}
                    onBlur={e => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; dateField.onBlur(e) }}
                  />
                  <Select label="Mode of Investment" {...register('modeOfInvestment')} error={errors.modeOfInvestment?.message}>
                    <option value="">Select Mode of Investment</option>
                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </div>
              </SectionCard>

              <SectionCard title="3. Investment Classification">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Select label="Asset Class" {...register('assetClass')} error={errors.assetClass?.message}>
                    <option value="">Select Asset Class</option>
                    {ASSET_CLASSES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </Select>
                  <Select label="Risk Level" {...register('riskLevel')} error={errors.riskLevel?.message}>
                    <option value="">Select Risk Level</option>
                    {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                  <Select label="Investment Goal (Optional)" {...register('investmentGoal')}>
                    <option value="">Select Investment Goal</option>
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </Select>
                </div>
              </SectionCard>

              <SectionCard title="4. Additional Details (Optional)">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Expected Return Rate (%)" type="number" step="0.1" min="0"
                    placeholder="Enter Expected Return Rate"
                    rightElement={<span className="text-sm text-slate-400">%</span>}
                    {...register('expectedReturnRate')}
                  />
                  <Select label="Lock-in Period" {...register('lockInPeriod')}>
                    <option value="">Select Lock-in Period</option>
                    {LOCK_IN_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Textarea label="Notes (Optional)" rows={3} placeholder="Add any notes about this investment" {...register('notes')} />
                </div>
              </SectionCard>

              <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
                <Info size={16} className="shrink-0 text-blue-600" />
                <p className="text-[12px] font-bold text-[#253261]">
                  Adding your investment manually helps us track and analyze your overall portfolio better.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <Button type="button" variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={() => navigate('/app/investments')}>
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate('/app/investments')}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500" loading={submitting}>
                    Save Investment
                  </Button>
                </div>
              </div>
            </form>
          </main>

          <aside className="space-y-3">
            <WhyAddManually />
            <PopularInvestmentTypes />
            <Tips />
          </aside>
        </div>
      </div>
    </div>
  )
}
