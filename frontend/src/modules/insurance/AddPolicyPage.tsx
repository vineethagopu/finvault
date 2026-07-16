import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, ArrowRight, Calendar, Check, CheckCircle2, ChevronDown, CloudUpload,
  Download, Edit3, FileText, Info, Lock, Plus, Shield, Trash2, User, Users,
  WalletCards, Lightbulb, BadgeIndianRupee, ClipboardList, HeartPulse, Home,
  IdCard, MapPin, FileHeart, CircleDollarSign
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { INSURANCE_TYPES } from '@/constants'
import { policyService } from '@/services/policyService'
import { documentService } from '@/services/documentService'
import { formatCurrency } from '@/utils/formatters'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Policy Details', description: 'Basic policy information' },
  { id: 2, label: 'Coverage Details', description: 'Add coverage information' },
  { id: 3, label: 'Nominee Details', description: 'Add nominee information' },
  { id: 4, label: 'Document Upload', description: 'Upload policy documents' },
  { id: 5, label: 'Review & Save', description: 'Review and confirm' },
]

const WHY_REASONS = [
  'Keep all your policies in one place',
  'Get premium reminders',
  'Track policy renewals',
  'Access policy documents anytime',
]

const DOC_TYPES = [
  { key: 'policy', icon: Shield, color: 'text-green-600', bg: 'bg-green-50', type: 'Policy Document', description: 'Upload the complete policy document', mandatory: true },
  { key: 'premium', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', type: 'Premium Payment Proof', description: 'Upload receipt or proof of premium payment', mandatory: true },
  { key: 'identity', icon: IdCard, color: 'text-purple-600', bg: 'bg-purple-50', type: 'Identity Proof', description: 'PAN Card, Aadhaar Card, Passport, etc.', mandatory: true },
  { key: 'address', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50', type: 'Address Proof', description: 'Aadhaar Card, Bank Passbook, Utility Bill, etc.', mandatory: true },
  { key: 'nominee', icon: FileHeart, color: 'text-pink-600', bg: 'bg-pink-50', type: 'Nominee Proof (If Any)', description: 'Nominee identity proof (if available)', mandatory: false },
  { key: 'medical', icon: HeartPulse, color: 'text-cyan-600', bg: 'bg-cyan-50', type: 'Medical Report (If Any)', description: 'Upload medical report (if applicable)', mandatory: false },
  { key: 'other', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', type: 'Any Other Document (Optional)', description: 'Any other supporting document', mandatory: false },
]

const POLICY_TERMS = ['5 Years', '10 Years', '15 Years', '20 Years', '25 Years', '30 Years']
const PAYMENT_FREQUENCIES = ['ANNUAL', 'HALF_YEARLY', 'QUARTERLY', 'MONTHLY']
const POLICY_STATUSES = ['ACTIVE', 'PENDING', 'LAPSED']

const policySchema = z.object({
  insuranceType: z.string().min(1, 'Insurance type is required'),
  policyName: z.string().min(2, 'Policy name is required'),
  planName: z.string().optional(),
  provider: z.string().min(1, 'Insurance provider is required'),
  policyNumber: z.string().optional(),
  policyStartDate: z.string().min(1, 'Start date is required'),
  policyEndDate: z.string().min(1, 'End/maturity date is required'),
  policyTerm: z.string().optional(),
  sumAssured: z.string().min(1, 'Sum assured is required'),
  premiumAmount: z.string().min(1, 'Premium amount is required'),
  premiumFrequency: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

type PolicyFormData = z.infer<typeof policySchema>

interface NomineeForm {
  fullName: string
  relationship: string
  dateOfBirth: string
  sharePercent: string
  email: string
}

const EMPTY_NOMINEE: NomineeForm = { fullName: '', relationship: '', dateOfBirth: '', sharePercent: '', email: '' }

function FlowStepper({ step, onStepClick }: { step: number; onStepClick: (step: number) => void }) {
  return (
    <Card padding="none" className="rounded-lg p-4">
      <div className="flex items-center gap-3 overflow-x-auto">
        {STEPS.map((item, idx) => {
          const done = step > item.id
          const current = step === item.id
          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => onStepClick(item.id)}
                className="flex min-w-[160px] items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-current={current ? 'step' : undefined}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done ? 'bg-green-500 text-white' : current ? 'bg-green-600 text-white' : 'bg-[#f1f3fb] text-[#11194f]'
                }`}>
                  {done ? <Check size={16} /> : item.id}
                </div>
                <div>
                  <p className={`text-[11px] font-bold ${current || done ? 'text-[#11194f]' : 'text-[#34406f]'}`}>{item.label}</p>
                  <p className="text-[10px] font-medium text-[#34406f]">{done ? 'Completed' : item.description}</p>
                </div>
              </button>
              {idx < STEPS.length - 1 && <div className={`h-0.5 min-w-10 flex-1 ${done ? 'bg-green-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          )
        })}
      </div>
    </Card>
  )
}

function WhyPanel({ step }: { step: number }) {
  const tip = step === 2
    ? 'Add accurate coverage details to better track your benefits and claims.'
    : "You can add your policy details manually if it's not available in our provider list."

  return (
    <div className="space-y-3">
      <Card padding="sm" className="rounded-lg">
        <h3 className="mb-3 text-sm font-bold text-[#11194f]">Why Add Policy Manually?</h3>
        <div className="space-y-3">
          {WHY_REASONS.map(reason => (
            <div key={reason} className="flex items-center gap-2 text-[11px] font-semibold text-[#34406f]">
              <CheckCircle2 size={13} className="text-green-600" /> {reason}
            </div>
          ))}
        </div>
      </Card>
      <Card padding="sm" className="rounded-lg bg-green-50/70">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#11194f]">
          <Shield size={15} className="text-green-600" /> Tip
        </div>
        <p className="text-[11px] font-medium leading-relaxed text-[#34406f]">{tip}</p>
      </Card>
    </div>
  )
}

function SnapshotPanel({ variant, form, nominees }: {
  variant: 'nominee' | 'docs' | 'review'
  form: PolicyFormData
  nominees: NomineeForm[]
}) {
  const review = variant === 'review'
  const typeLabel = INSURANCE_TYPES.find(t => t.value === form.insuranceType)?.label ?? form.insuranceType
  const rows: [React.ElementType, string, string, string, string][] = review
    ? [
        [ClipboardList, 'Policy Name', form.policyName || '—', 'text-green-600', 'bg-green-50'],
        [User, 'Type', typeLabel || '—', 'text-green-600', 'bg-green-50'],
        [Shield, 'Sum Assured', form.sumAssured ? formatCurrency(Number(form.sumAssured)) : '—', 'text-green-600', 'bg-green-50'],
        [Calendar, 'Policy Term', form.policyTerm || '—', 'text-purple-600', 'bg-purple-50'],
        [Calendar, 'Policy End Date', form.policyEndDate || '—', 'text-amber-600', 'bg-amber-50'],
        [FileText, 'Premium Amount', form.premiumAmount ? formatCurrency(Number(form.premiumAmount)) : '—', 'text-indigo-600', 'bg-indigo-50'],
      ]
    : [
        [ClipboardList, 'Policy Name', form.policyName || '—', 'text-green-600', 'bg-green-50'],
        [User, variant === 'docs' ? 'Insurer' : 'Type', variant === 'docs' ? (form.provider || '—') : (typeLabel || '—'), 'text-blue-600', 'bg-blue-50'],
        [BadgeIndianRupee, 'Sum Assured', form.sumAssured ? formatCurrency(Number(form.sumAssured)) : '—', 'text-orange-600', 'bg-orange-50'],
        [Calendar, 'Policy Term', form.policyTerm || '—', 'text-purple-600', 'bg-purple-50'],
      ]

  return (
    <div className="space-y-3">
      <Card padding="sm" className="rounded-lg">
        <h3 className="mb-3 text-sm font-bold text-[#11194f]">{variant === 'docs' ? "What you've entered" : 'Policy Snapshot'}</h3>
        <div className="overflow-hidden rounded-lg border border-slate-100">
          {rows.map(([RowIcon, label, value, color, bg]) => (
            <div key={label} className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${bg}`}>
                <RowIcon size={14} className={color} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#11194f]">{label}</p>
                <p className="text-[11px] font-semibold text-[#34406f]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {variant === 'nominee' && nominees.length > 0 && (
        <Card padding="sm" className="rounded-lg bg-purple-50/80">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#11194f]">
            <Users size={16} className="text-purple-600" /> {nominees.length} Nominee{nominees.length > 1 ? 's' : ''}
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-[#34406f]">
            Total share: {nominees.reduce((s, n) => s + (Number(n.sharePercent) || 0), 0)}%
          </p>
        </Card>
      )}
    </div>
  )
}

function StepOne({ register, errors, next }: {
  register: ReturnType<typeof useForm<PolicyFormData>>['register']
  errors: ReturnType<typeof useForm<PolicyFormData>>['formState']['errors']
  next: () => void
}) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="text-sm font-bold text-[#11194f]">Policy Details</h2>
      <p className="mb-4 text-[11px] text-[#34406f]">Enter basic information about your insurance policy.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Select label="Insurance Type" required {...register('insuranceType')} error={errors.insuranceType?.message}>
          <option value="">Select Insurance Type</option>
          {INSURANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input label="Policy Name" placeholder="Enter Policy Name" required {...register('policyName')} error={errors.policyName?.message} />
        <Input label="Insurance Provider" placeholder="Enter Insurance Provider" required {...register('provider')} error={errors.provider?.message} />
        <Input label="Policy Number" placeholder="Enter Policy Number" {...register('policyNumber')} />
        <Input label="Plan Name" placeholder="e.g. Term Plan, Comprehensive" hint="The specific product/plan name, if different from policy name." {...register('planName')} />
        <Select label="Policy Term" placeholder="Select Policy Term" {...register('policyTerm')}>
          {POLICY_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Policy Start Date" type="date" required {...register('policyStartDate')} error={errors.policyStartDate?.message} rightElement={<Calendar size={13} className="text-slate-400" />} />
        <Input label="Policy End / Maturity Date" type="date" required {...register('policyEndDate')} error={errors.policyEndDate?.message} rightElement={<Calendar size={13} className="text-slate-400" />} />
        <Input label="Sum Assured" type="number" min="0" placeholder="Enter Sum Assured" required leftIcon={<span className="text-xs">₹</span>} {...register('sumAssured')} error={errors.sumAssured?.message} />
        <Input label="Premium Amount" type="number" min="0" placeholder="Enter Premium Amount" required {...register('premiumAmount')} error={errors.premiumAmount?.message} />
        <Select label="Payment Frequency" {...register('premiumFrequency')}>
          {PAYMENT_FREQUENCIES.map(f => <option key={f} value={f}>{f.replace('_', '-')}</option>)}
        </Select>
        <Select label="Policy Status" {...register('status')}>
          {POLICY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Textarea label="Notes (Optional)" placeholder="Add any additional notes about this policy" containerClassName="lg:col-span-2" {...register('notes')} />
      </div>
      <div className="flex items-center justify-between mt-4">
        <Link to="/app/insurance"><Button variant="outline" size="sm">Cancel</Button></Link>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={next}>Save & Continue</Button>
      </div>
    </Card>
  )
}

function StepTwo({ back, next }: { back: () => void; next: () => void }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="text-sm font-bold text-[#11194f]">Coverage Details</h2>
      <p className="mb-4 text-[11px] text-[#34406f]">Optional — describe the coverage and benefits under your policy for your own reference.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Death Benefit" placeholder="e.g. Sum Assured on death" />
        <Field label="Maturity Benefit" placeholder="e.g. Sum Assured on maturity" />
        <Field label="Accidental Death Benefit (ADB)" placeholder="If applicable" />
        <Field label="Critical Illness Benefit" placeholder="If applicable" />
        <Field label="Waiver of Premium" placeholder="If applicable" />
        <Field label="Rider(s) Opted" placeholder="e.g. Critical Illness Rider" />
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
        <Info size={14} className="shrink-0" /> This section is for your own reference only and isn't stored with the policy record.
      </div>
      <FooterNav back={back} next={next} />
    </Card>
  )
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-[#11194f]">{label}</label>
      <input
        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
        placeholder={placeholder}
      />
    </div>
  )
}

function StepThree({ nominees, setNominees, back, next }: {
  nominees: NomineeForm[]
  setNominees: (n: NomineeForm[]) => void
  back: () => void
  next: () => void
}) {
  const update = (idx: number, field: keyof NomineeForm, value: string) => {
    const copy = [...nominees]
    copy[idx] = { ...copy[idx], [field]: value }
    setNominees(copy)
  }
  const add = () => setNominees([...nominees, { ...EMPTY_NOMINEE }])
  const remove = (idx: number) => setNominees(nominees.filter((_, i) => i !== idx))
  const totalShare = nominees.reduce((s, n) => s + (Number(n.sharePercent) || 0), 0)

  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#11194f]">Nominee Details</h2>
          <p className="text-[11px] text-[#34406f]">Add nominee(s) who will receive the benefits in case of an unfortunate event.</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Plus size={13} />} onClick={add}>Add Nominee</Button>
      </div>
      <div className="my-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
        <Info size={14} className="shrink-0" /> You can add multiple nominees. Total allocation must be 100%.
      </div>
      {nominees.length === 0 && (
        <p className="mb-3 text-[11px] text-slate-400">No nominees added yet — click "Add Nominee" (optional).</p>
      )}
      {nominees.map((nominee, idx) => (
        <div key={idx} className="mb-3 rounded-lg border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-[#11194f]">Nominee {idx + 1}</p>
            <button type="button" className="flex items-center gap-1 text-[11px] font-bold text-red-500" onClick={() => remove(idx)}>
              <Trash2 size={13} /> Remove
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Input label="Nominee Name" required value={nominee.fullName} onChange={e => update(idx, 'fullName', e.target.value)} />
            <Input label="Relationship" required value={nominee.relationship} onChange={e => update(idx, 'relationship', e.target.value)} />
            <Input label="Date of Birth" type="date" value={nominee.dateOfBirth} onChange={e => update(idx, 'dateOfBirth', e.target.value)} />
            <Input label="Email (Optional)" type="email" value={nominee.email} onChange={e => update(idx, 'email', e.target.value)} />
            <Input label="Share (%)" required type="number" min="0" max="100" value={nominee.sharePercent} onChange={e => update(idx, 'sharePercent', e.target.value)} />
          </div>
        </div>
      ))}
      {nominees.length > 0 && (
        <div className="mb-4 rounded-lg bg-green-50 p-3">
          <p className="text-[11px] font-semibold text-[#34406f]">Total Nominee Allocation</p>
          <p className="text-lg font-bold text-[#11194f]">{totalShare}%</p>
        </div>
      )}
      <FooterNav back={back} next={next} />
    </Card>
  )
}

function StepFour({ files, setFiles, back, next }: {
  files: Record<string, File | null>
  setFiles: (f: Record<string, File | null>) => void
  back: () => void
  next: () => void
}) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="text-sm font-bold text-[#11194f]">Document Upload</h2>
      <p className="mb-4 text-[11px] text-[#34406f]">Upload clear and valid documents to verify your policy. Supported formats: PDF, JPG, PNG. Max file size: 10MB per file.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50">
              {['Document Type', 'Description', 'Mandatory', 'Upload'].map(h => <th key={h} className="px-4 py-2 text-left text-[11px] font-bold text-[#34406f]">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {DOC_TYPES.map(doc => {
              const Icon = doc.icon
              const file = files[doc.key]
              return (
                <tr key={doc.key}>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-[#11194f]">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${doc.bg}`}>
                        <Icon size={14} className={doc.color} />
                      </span>
                      {doc.type}
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3 text-[11px] font-medium text-[#34406f]">{doc.description}</td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${doc.mandatory ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>{doc.mandatory ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <label className="flex h-8 w-fit cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 text-[11px] font-bold text-blue-600 hover:bg-slate-50">
                      <CloudUpload size={14} /> {file ? file.name.slice(0, 20) : 'Upload File'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => setFiles({ ...files, [doc.key]: e.target.files?.[0] ?? null })}
                      />
                    </label>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="my-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
        <Info size={14} className="shrink-0" /> Ensure all documents are clear and legible. Blurry or incomplete documents may delay verification.
      </div>
      <FooterNav back={back} next={next} />
    </Card>
  )
}

function StepFive({ form, nominees, files, back, submitting, onSave }: {
  form: PolicyFormData
  nominees: NomineeForm[]
  files: Record<string, File | null>
  back: () => void
  submitting: boolean
  onSave: () => void
}) {
  const typeLabel = INSURANCE_TYPES.find(t => t.value === form.insuranceType)?.label ?? form.insuranceType
  const uploadedCount = Object.values(files).filter(Boolean).length
  const mandatoryCount = DOC_TYPES.filter(d => d.mandatory).length
  const mandatoryUploaded = DOC_TYPES.filter(d => d.mandatory && files[d.key]).length

  const groups = [
    { icon: Shield, title: 'Policy Details', fields: [['Policy Name', form.policyName || '—'], ['Type', typeLabel || '—'], ['Provider', form.provider || '—'], ['Sum Assured', form.sumAssured ? formatCurrency(Number(form.sumAssured)) : '—'], ['Policy Term', form.policyTerm || '—'], ['Policy End Date', form.policyEndDate || '—']] },
    { icon: CloudUpload, title: 'Premium Details', fields: [['Premium Amount', form.premiumAmount ? formatCurrency(Number(form.premiumAmount)) : '—'], ['Payment Frequency', form.premiumFrequency ?? 'ANNUAL'], ['Status', form.status ?? 'ACTIVE']] },
    { icon: Users, title: 'Nominee Details', fields: [['Total Nominees', String(nominees.length)], ...nominees.map((n, i) => [`Nominee ${i + 1}`, `${n.fullName || '—'} (${n.sharePercent || 0}%)`] as [string, string])] },
    { icon: FileText, title: 'Documents Upload', fields: [['Total Documents', String(uploadedCount)], ['Mandatory Documents', `${mandatoryUploaded} / ${mandatoryCount} Uploaded`]] },
  ]
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#11194f]">Review Your Policy Details</h2>
          <p className="text-[11px] text-[#34406f]">Please review all the details carefully before saving.</p>
        </div>
      </div>
      {groups.map(group => {
        const Icon = group.icon
        return (
          <div key={group.title} className="mb-3 rounded-lg border border-slate-100 p-3">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50"><Icon size={14} className="text-green-600" /></span>
              <p className="text-sm font-bold text-[#11194f]">{group.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {group.fields.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-[#7080ac]">{label}</p>
                  <p className="mt-0.5 text-[12px] font-bold text-[#253261]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <div className="my-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
        <Info size={14} className="shrink-0" /> By saving, you confirm that all the information provided is true, correct and complete to the best of your knowledge.
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={back} disabled={submitting}>Back</Button>
        <Button
          size="lg"
          className="min-w-56 bg-blue-600 hover:bg-blue-700"
          leftIcon={<Lock size={14} />}
          loading={submitting}
          onClick={onSave}
        >
          <div>
            <p className="leading-none">Save Policy</p>
            <p className="mt-1 text-[10px] font-medium leading-none text-blue-100">Your policy will be saved securely</p>
          </div>
        </Button>
      </div>
    </Card>
  )
}

function FooterNav({ back, next }: { back: () => void; next: () => void }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={back}>Back</Button>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" rightIcon={<ArrowRight size={14} />} onClick={next}>Save & Continue</Button>
    </div>
  )
}

export function AddPolicyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [nominees, setNominees] = useState<NomineeForm[]>([])
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const go = (target: number) => setStep(Math.min(5, Math.max(1, target)))

  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: { premiumFrequency: 'ANNUAL', status: 'ACTIVE' },
  })

  const validateStep1AndGo = async () => {
    const valid = await trigger(['insuranceType', 'policyName', 'provider', 'policyStartDate', 'policyEndDate', 'sumAssured', 'premiumAmount'])
    if (valid) go(2)
  }

  const handleSave = handleSubmit(async (data) => {
    setSubmitting(true)
    try {
      const policy = await policyService.create({
        policyName: data.policyName,
        policyNumber: data.policyNumber || undefined,
        planName: data.planName || undefined,
        insuranceType: data.insuranceType,
        provider: data.provider,
        sumAssured: Number(data.sumAssured),
        premiumAmount: Number(data.premiumAmount),
        premiumFrequency: data.premiumFrequency,
        policyStartDate: data.policyStartDate,
        policyEndDate: data.policyEndDate,
        policyTerm: data.policyTerm ? parseInt(data.policyTerm) : undefined,
        notes: data.notes || undefined,
        nominees: nominees
          .filter(n => n.fullName)
          .map(n => ({
            fullName: n.fullName,
            relationship: n.relationship,
            dateOfBirth: n.dateOfBirth || undefined,
            sharePercent: Number(n.sharePercent) || 0,
            email: n.email || undefined,
          })),
      } as any)

      // Upload any attached documents, linked to the new policy.
      const uploads = DOC_TYPES.filter(d => files[d.key]).map(d =>
        documentService.upload(files[d.key] as File, {
          category: 'INSURANCE',
          policyId: policy.id,
          docType: d.type,
        }).catch(() => null)
      )
      await Promise.all(uploads)

      toast.success('Policy saved successfully!')
      navigate(`/app/insurance/${policy.id}`)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to save policy')
    } finally {
      setSubmitting(false)
    }
  })

  const formValues = getValues()

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px] space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#11194f]">Add My Policy Manually</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <Link to="/app/insurance" className="text-green-700">Insurance</Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Add My Policy Manually</span>
              {step === 5 && <><span className="text-slate-400">&gt;</span><span className="text-[#11194f]">Review & Save</span></>}
            </nav>
          </div>
        </div>

        <FlowStepper step={step} onStepClick={go} />

        <div className="grid gap-4 xl:grid-cols-[1fr_290px]">
          <div>
            {step === 1 && <StepOne register={register} errors={errors} next={validateStep1AndGo} />}
            {step === 2 && <StepTwo back={() => go(1)} next={() => go(3)} />}
            {step === 3 && <StepThree nominees={nominees} setNominees={setNominees} back={() => go(2)} next={() => go(4)} />}
            {step === 4 && <StepFour files={files} setFiles={setFiles} back={() => go(3)} next={() => go(5)} />}
            {step === 5 && <StepFive form={formValues} nominees={nominees} files={files} back={() => go(4)} submitting={submitting} onSave={handleSave} />}
          </div>
          <aside className="hidden xl:block">
            {step <= 2 && <WhyPanel step={step} />}
            {step === 3 && <SnapshotPanel variant="nominee" form={formValues} nominees={nominees} />}
            {step === 4 && <SnapshotPanel variant="docs" form={formValues} nominees={nominees} />}
            {step === 5 && <SnapshotPanel variant="review" form={formValues} nominees={nominees} />}
          </aside>
        </div>
      </div>
    </div>
  )
}
