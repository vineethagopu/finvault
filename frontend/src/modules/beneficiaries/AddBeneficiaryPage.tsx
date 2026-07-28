import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  AlertCircle, ArrowLeft, ArrowRight, Building2, CalendarDays, Check,
  CheckCircle2, ChartPie, Info, Landmark, ShieldCheck, Users,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { policyService } from '@/services/policyService'
import { beneficiaryService } from '@/services/beneficiaryService'
import { queryKeys } from '@/services/queryKeys'
import type { Policy } from '@/types'
import toast from 'react-hot-toast'

// Real BeneficiaryType enum values (backend/prisma/schema.prisma).
const BENEFICIARY_TYPES = [
  { value: 'NOMINEE', label: 'Nominee', desc: 'For policy claims & legal purposes', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'LEGAL_HEIR', label: 'Legal Heir', desc: 'For legal inheritance of assets', icon: ChartPie, color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'ASSIGNEE', label: 'Assignee', desc: 'For assigned accounts, deposits, mutual funds, etc.', icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'OTHER', label: 'Other Beneficiary', desc: 'For any other assets or properties', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
]

const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']

const WHY_ADD = [
  'Ensure your assets and benefits are distributed as per your wishes.',
  'Avoid legal complications and delays.',
  'Keep your loved ones financially protected.',
  'You can add multiple beneficiaries with different shares.',
]

const IMPORTANT_NOTES = [
  'Ensure details are accurate and up to date.',
  'You can edit or update beneficiaries anytime.',
  'In case of multiple beneficiaries, total allocation must be 100%.',
  'Changes will be applicable to all relevant policies and accounts.',
]

const ALLOCATION = { total: 75, remaining: 25 }

const schema = z.object({
  beneficiaryType: z.string().min(1, 'Select a beneficiary type'),
  fullName: z.string().min(2, 'Full name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  email: z.string().optional(),
  mobile: z.string().min(10, 'Mobile number is required'),
  pan: z.string().optional(),
  sharePercentage: z.string().min(1, 'Share percentage is required'),
  fixedAmount: z.string().optional(),
  policyId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
  guardianName: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="text-[15px] font-extrabold text-[#11194f]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[12px] font-semibold text-[#64729b]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  )
}

function WhyAddBeneficiaries() {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
          <Users size={17} className="text-purple-600" />
        </div>
        <h3 className="text-sm font-extrabold text-[#11194f]">Why add beneficiaries?</h3>
      </div>
      <ul className="space-y-3">
        {WHY_ADD.map(item => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 fill-green-500 text-white" />
            <span className="text-[12px] font-semibold text-[#34406f]">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ImportantNotes() {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle size={17} className="text-amber-500" />
        <h3 className="text-sm font-extrabold text-[#11194f]">Important Notes</h3>
      </div>
      <ul className="space-y-2.5">
        {IMPORTANT_NOTES.map(note => (
          <li key={note} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span className="text-[12px] font-semibold text-[#34406f]">{note}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function AllocationSummary({ totalShare }: { totalShare: number }) {
  const remaining = Math.max(0, 100 - totalShare)
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Current Allocation Summary</h3>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#64729b]">Total Allocation</p>
        <p className="text-[12px] font-extrabold text-[#11194f]">{totalShare}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(100, totalShare)}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#64729b]">Remaining Allocation</p>
        <p className="text-[12px] font-extrabold text-[#11194f]">{remaining}%</p>
      </div>
    </Card>
  )
}

export function AddBeneficiaryPage() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const { data: policies = [] } = useQuery({
    queryKey: queryKeys.policies.list(),
    queryFn: async () => (await policyService.getAll()) ?? [],
  })
  const { data: existingBeneficiaries = [] } = useQuery({
    queryKey: queryKeys.beneficiaries.list(),
    queryFn: async () => (await beneficiaryService.getAll()) ?? [],
  })
  const totalShare = existingBeneficiaries.reduce((s, b) => s + Number(b.sharePercent), 0)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { beneficiaryType: '', relationship: '' },
  })

  const selectedType = watch('beneficiaryType')
  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true)
    try {
      await beneficiaryService.create({
        type: data.beneficiaryType as any,
        fullName: data.fullName,
        dateOfBirth: data.dob,
        relationship: data.relationship,
        email: data.email || undefined,
        mobile: data.mobile,
        pan: data.pan || undefined,
        sharePercent: Number(data.sharePercentage),
        address: [data.address, data.city, data.pinCode].filter(Boolean).join(', ') || undefined,
        policyId: data.policyId || undefined,
      } as any)
      // Same-tab lists (Beneficiaries page) refetch immediately — no manual
      // reload needed. Cross-tab/device updates arrive via the SSE stream.
      await queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.summary() })
      setSaved(true)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to add beneficiary')
    } finally {
      setSubmitting(false)
    }
  })
  const dobField = register('dob')

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
          <h2 className="mb-2 text-xl font-extrabold text-[#11194f]">Beneficiary Added!</h2>
          <p className="mb-6 text-sm font-semibold text-[#64729b]">Your beneficiary has been added successfully.</p>
          <Button className="w-full" onClick={() => navigate('/app/beneficiaries')}>View Beneficiaries</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Add Beneficiary</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <button className="text-green-700" onClick={() => navigate('/app/beneficiaries')}>Beneficiaries</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Add Beneficiary</span>
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
            Add the people or entities who should receive your assets, policy benefits, or account values if you are no longer alive.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_285px]">
          <main>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <SectionCard title="1. Beneficiary Type" subtitle="Select what this beneficiary is for*">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {BENEFICIARY_TYPES.map(type => {
                    const Icon = type.icon
                    const active = selectedType === type.value
                    return (
                      <button
                        key={type.value} type="button"
                        onClick={() => setValue('beneficiaryType', type.value, { shouldValidate: true })}
                        className={`rounded-lg border p-3.5 text-left transition-colors ${active ? 'border-green-500 bg-green-50/40 ring-2 ring-green-100' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <span className={`mb-2.5 inline-block h-4 w-4 rounded-full border-2 ${active ? 'border-green-600 bg-green-600 shadow-[inset_0_0_0_2.5px_white]' : 'border-slate-300'}`} />
                        <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${type.bg}`}>
                          <Icon size={16} className={type.color} />
                        </div>
                        <p className="text-[13px] font-extrabold text-[#11194f]">{type.label}</p>
                        <p className="mt-0.5 text-[11px] font-medium leading-snug text-[#64729b]">{type.desc}</p>
                      </button>
                    )
                  })}
                </div>
                {errors.beneficiaryType && <p className="mt-2 text-xs text-red-600">{errors.beneficiaryType.message}</p>}
              </SectionCard>

              <SectionCard title="2. Beneficiary Details">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Full Name" required placeholder="Enter full name" {...register('fullName')} error={errors.fullName?.message} />
                  <Input
                    label="Date of Birth" required type="text" placeholder="DD/MM/YYYY"
                    rightElement={<CalendarDays size={15} className="pointer-events-none text-slate-400" />}
                    className="[&::-webkit-calendar-picker-indicator]:hidden"
                    error={errors.dob?.message}
                    {...dobField}
                    onFocus={e => { e.currentTarget.type = 'date'; try { e.currentTarget.showPicker?.() } catch { /* needs user activation */ } }}
                    onBlur={e => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; dobField.onBlur(e) }}
                  />
                  <Select label="Relationship with You" required {...register('relationship')} error={errors.relationship?.message}>
                    <option value="">Select relationship</option>
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Email Address" type="email" placeholder="Enter email address" {...register('email')} />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">
                      Mobile Number<span className="ml-0.5 text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-sm text-slate-900 focus:border-green-500 focus:outline-none">
                        <option>+91</option>
                        <option>+1</option>
                        <option>+44</option>
                        <option>+971</option>
                      </select>
                      <input
                        type="tel" placeholder="Enter mobile number"
                        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 ${errors.mobile ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-green-500 focus:ring-green-100'}`}
                        {...register('mobile')}
                      />
                    </div>
                    {errors.mobile && <p className="text-xs text-red-600">{errors.mobile.message}</p>}
                  </div>
                  <Input label="PAN (Optional)" placeholder="Enter PAN number" {...register('pan')} />
                </div>
              </SectionCard>

              <SectionCard title="3. Share / Allocation Details">
                <div className="mb-4">
                  <Select label="Link to Policy (Optional)" {...register('policyId')}>
                    <option value="">Not linked to a specific policy</option>
                    {policies.map(p => <option key={p.id} value={p.id}>{p.policyName}</option>)}
                  </Select>
                </div>
                <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
                  <Input
                    label="Share Percentage (%)" required type="number" min="0" max="100"
                    placeholder="Enter percentage"
                    rightElement={<span className="text-sm text-slate-400">%</span>}
                    {...register('sharePercentage')} error={errors.sharePercentage?.message}
                  />
                  <p className="pb-3 text-center text-[12px] font-bold text-[#64729b]">Or</p>
                  <Input
                    label="Fixed Amount (₹) (Optional)" type="number" min="0"
                    placeholder="Enter amount"
                    rightElement={<span className="text-sm text-slate-400">₹</span>}
                    {...register('fixedAmount')}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
                  <Info size={13} className="shrink-0 text-blue-600" />
                  <p className="text-[11px] font-semibold text-[#253261]">Total allocation across all beneficiaries should be 100%.</p>
                </div>
              </SectionCard>

              <SectionCard title="4. Additional Information">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Address" placeholder="Enter full address" {...register('address')} />
                  <Input label="City" placeholder="Enter city" {...register('city')} />
                  <Input label="PIN Code" placeholder="Enter PIN code" {...register('pinCode')} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-[11px] font-bold text-[#64729b]">If Minor</p>
                    <Input label="Guardian Name (Optional)" placeholder="Enter guardian name" {...register('guardianName')} />
                  </div>
                  <Textarea label="Notes (Optional)" rows={3} placeholder="Add any additional notes" {...register('notes')} />
                </div>
              </SectionCard>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <Button type="button" variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={() => navigate('/app/beneficiaries')}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500" loading={submitting}>
                  Save Beneficiary
                </Button>
              </div>
            </form>
          </main>

          <aside className="space-y-3">
            <WhyAddBeneficiaries />
            <ImportantNotes />
            <AllocationSummary totalShare={totalShare} />
          </aside>
        </div>
      </div>
    </div>
  )
}
