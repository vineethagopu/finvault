import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Briefcase, CalendarDays, Car, Check, CheckCircle2, CreditCard,
  FilePlus2, GraduationCap, Home, Info, Landmark, LayoutGrid, Lightbulb,
  ShieldCheck, User,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'

const LOAN_TYPES = ['Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan', 'Business Loan', 'Loan Against Property', 'Credit Card Loan', 'Policy Loan', 'Others']
const LOAN_PURPOSES = ['Home Purchase', 'Home Renovation', 'Vehicle Purchase', 'Education', 'Medical', 'Business', 'Wedding', 'Travel', 'Debt Consolidation', 'Others']
const INTEREST_TYPES = ['Reducing Balance', 'Flat Rate', 'Fixed', 'Floating']
const REPAYMENT_FREQUENCIES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']
const SECURITY_TYPES = ['None / Unsecured', 'Property', 'Vehicle', 'Gold', 'Fixed Deposit', 'Policy Assignment', 'Others']
const POLICIES = ['Term Life Insurance', 'Whole Life Plan', 'Endowment Plan']
const EMI_DAYS = Array.from({ length: 28 }, (_, i) => String(i + 1))

const WHY_ADD_MANUALLY = [
  'Track loans not fetched automatically.',
  'Get accurate loan summary & insights.',
  'Plan repayments and manage finances better.',
  'Stay informed and avoid missed payments.',
]

const TIPS = [
  'Enter the exact loan details as per your loan document.',
  'Interest rate and tenure help us calculate your eligibility accurately.',
  'You can edit or update loan details anytime.',
]

const POPULAR_LOAN_TYPES = [
  { label: 'Home Loan', icon: Home, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Personal Loan', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Car Loan', icon: Car, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Education Loan', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Business Loan', icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Loan Against Property', icon: Landmark, color: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'Credit Card Loan', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Others', icon: LayoutGrid, color: 'text-slate-500', bg: 'bg-slate-100' },
]

const schema = z.object({
  loanType: z.string().min(1, 'Loan type is required'),
  provider: z.string().min(2, 'Provider / institution is required'),
  accountNumber: z.string().min(2, 'Loan account number is required'),
  purpose: z.string().optional(),
  subPurpose: z.string().optional(),
  tenure: z.string().optional(),
  loanAmount: z.string().min(1, 'Loan amount is required'),
  disbursalDate: z.string().min(1, 'Disbursal date is required'),
  startDate: z.string().min(1, 'Loan start date is required'),
  interestRate: z.string().min(1, 'Interest rate is required'),
  interestType: z.string().min(1, 'Interest type is required'),
  repaymentFrequency: z.string().min(1, 'Repayment frequency is required'),
  emiAmount: z.string().optional(),
  emiDay: z.string().optional(),
  totalEmis: z.string().optional(),
  securityType: z.string().optional(),
  policyAssigned: z.string().optional(),
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

function DateField({ label, placeholder, required, error, field }: {
  label: string; placeholder: string; required?: boolean; error?: string; field: UseFormRegisterReturn
}) {
  return (
    <Input
      label={label} type="text" placeholder={placeholder} required={required}
      rightElement={<CalendarDays size={15} className="pointer-events-none text-slate-400" />}
      className="[&::-webkit-calendar-picker-indicator]:hidden"
      error={error}
      {...field}
      onFocus={e => { e.currentTarget.type = 'date'; try { e.currentTarget.showPicker?.() } catch { /* needs user activation */ } }}
      onBlur={e => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; field.onBlur(e) }}
    />
  )
}

function WhyAddManually() {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
          <FilePlus2 size={17} className="text-purple-600" />
        </div>
        <h3 className="text-sm font-extrabold text-[#11194f]">Why add loan manually?</h3>
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

function Tips() {
  return (
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
    </Card>
  )
}

function PopularLoanTypes() {
  return (
    <Card padding="sm" className="rounded-lg">
      <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Popular Loan Types</h3>
      <div className="space-y-3">
        {POPULAR_LOAN_TYPES.map(item => {
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

export function AddLoanPage() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      loanType: '', purpose: '', interestType: '', repaymentFrequency: '',
      emiDay: '', securityType: '', policyAssigned: '',
    },
  })

  const onSubmit = handleSubmit(() => setSaved(true))

  const disbursalField = register('disbursalDate')
  const startField = register('startDate')

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
          <h2 className="mb-2 text-xl font-extrabold text-[#11194f]">Loan Added!</h2>
          <p className="mb-6 text-sm font-semibold text-[#64729b]">Your loan has been added and will appear in your loan summary.</p>
          <Button className="w-full" onClick={() => navigate('/app/loans')}>View My Loans</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Add Loan Manually</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <button className="text-green-700" onClick={() => navigate('/app/dashboard')}>Home</button>
              <span className="text-slate-400">&gt;</span>
              <button className="text-green-700" onClick={() => navigate('/app/loans')}>Loans</button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Add Loan Manually</span>
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
              <SectionCard title="1. Loan Information">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Select label="Loan Type" required {...register('loanType')} error={errors.loanType?.message}>
                    <option value="">Select Loan Type</option>
                    {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                  <Input label="Loan Provider / Financial Institution" required placeholder="Enter Provider / Institution Name" {...register('provider')} error={errors.provider?.message} />
                  <Input label="Loan Account Number" required placeholder="Enter Loan Account Number" {...register('accountNumber')} error={errors.accountNumber?.message} />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Select label="Loan Purpose" {...register('purpose')}>
                    <option value="">Select Loan Purpose</option>
                    {LOAN_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Input label="Loan Sub Purpose (Optional)" placeholder="Enter Sub Purpose" {...register('subPurpose')} />
                  <Input label="Loan Tenure (Years)" type="number" min="0" placeholder="Enter Tenure" {...register('tenure')} />
                </div>
              </SectionCard>

              <SectionCard title="2. Loan Amount & Date">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="Loan Amount (₹)" required type="number" min="0" placeholder="Enter Loan Amount" {...register('loanAmount')} error={errors.loanAmount?.message} />
                  <DateField label="Disbursal Date" placeholder="Select Disbursal Date" required field={disbursalField} error={errors.disbursalDate?.message} />
                  <DateField label="Loan Start Date" placeholder="Select Loan Start Date" required field={startField} error={errors.startDate?.message} />
                </div>
              </SectionCard>

              <SectionCard title="3. Interest & Repayment Details">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Interest Rate (% p.a.)" required type="number" step="0.01" min="0"
                    placeholder="Enter Interest Rate"
                    rightElement={<span className="text-sm text-slate-400">%</span>}
                    {...register('interestRate')} error={errors.interestRate?.message}
                  />
                  <Select label="Interest Type" required {...register('interestType')} error={errors.interestType?.message}>
                    <option value="">Select Interest Type</option>
                    {INTEREST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                  <Select label="Repayment Frequency" required {...register('repaymentFrequency')} error={errors.repaymentFrequency?.message}>
                    <option value="">Select Repayment Frequency</option>
                    {REPAYMENT_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </Select>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Input label="EMI Amount (₹)" type="number" min="0" placeholder="Enter EMI Amount" {...register('emiAmount')} />
                  <Select label="EMI Day of Month" {...register('emiDay')}>
                    <option value="">Select Day</option>
                    {EMI_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                  <Input label="Total No. of EMIs" type="number" min="0" placeholder="Enter Total EMIs" {...register('totalEmis')} />
                </div>
              </SectionCard>

              <SectionCard title="4. Additional Details (Optional)">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Select label="Collateral / Security Type" {...register('securityType')}>
                    <option value="">Select Security Type</option>
                    {SECURITY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <Select label="Policy Assigned (If any)" {...register('policyAssigned')}>
                    <option value="">Select Policy (If Applicable)</option>
                    {POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </Select>
                  <Textarea label="Notes (Optional)" rows={3} placeholder="Add any notes about this loan" {...register('notes')} />
                </div>
              </SectionCard>

              <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
                <Info size={16} className="shrink-0 text-blue-600" />
                <p className="text-[12px] font-bold text-[#253261]">
                  All fields marked with * are mandatory. Please ensure the information is accurate for better tracking and insights.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <Button type="button" variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={() => navigate('/app/loans')}>
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate('/app/loans')}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500">
                    Save Loan
                  </Button>
                </div>
              </div>
            </form>
          </main>

          <aside className="space-y-3">
            <WhyAddManually />
            <Tips />
            <PopularLoanTypes />
          </aside>
        </div>
      </div>
    </div>
  )
}
