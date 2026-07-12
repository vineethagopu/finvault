import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Calendar, Check, CheckCircle2, ChevronDown, CloudUpload,
  Download, Edit3, FileText, Info, Lock, Plus, Shield, Trash2, User, Users,
  WalletCards, Lightbulb, BadgeIndianRupee, ClipboardList, HeartPulse, Home,
  IdCard, MapPin, FileHeart, CircleDollarSign
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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

const DOCS = [
  { icon: Shield, color: 'text-green-600', bg: 'bg-green-50', type: 'Policy Document', description: 'Upload the complete policy document', mandatory: true },
  { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', type: 'Premium Payment Proof', description: 'Upload receipt or proof of premium payment', mandatory: true },
  { icon: IdCard, color: 'text-purple-600', bg: 'bg-purple-50', type: 'Identity Proof', description: 'PAN Card, Aadhaar Card, Passport, etc.', mandatory: true },
  { icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50', type: 'Address Proof', description: 'Aadhaar Card, Bank Passbook, Utility Bill, etc.', mandatory: true },
  { icon: FileHeart, color: 'text-pink-600', bg: 'bg-pink-50', type: 'Nominee Proof (If Any)', description: 'Nominee identity proof (if available)', mandatory: false },
  { icon: HeartPulse, color: 'text-cyan-600', bg: 'bg-cyan-50', type: 'Medical Report (If Any)', description: 'Upload medical report (if applicable)', mandatory: false },
  { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', type: 'Any Other Document (Optional)', description: 'Any other supporting document', mandatory: false },
]

type FieldProps = {
  label: string
  placeholder?: string
  required?: boolean
  type?: 'input' | 'select' | 'date' | 'textarea'
  value?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  hint?: string
  wide?: boolean
}

function Field({ label, placeholder, required, type = 'input', value, prefix, suffix, hint, wide }: FieldProps) {
  const base = 'w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500'
  return (
    <div className={wide ? 'lg:col-span-2' : ''}>
      <label className="mb-1.5 block text-[11px] font-semibold text-[#11194f]">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        {prefix && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</div>}
        {type === 'select' ? (
          <>
            <select className={`${base} appearance-none ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`} value={value ?? ''} onChange={() => {}}>
              {value ? <option value={value}>{value}</option> : <option value="">{placeholder}</option>}
              <option>Term Life Insurance</option>
              <option>HDFC Life</option>
              <option>Spouse</option>
              <option>Son</option>
              <option>20 Years</option>
              <option>15 Years</option>
              <option>Yearly</option>
              <option>Active</option>
              <option>Yes</option>
              <option>No</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </>
        ) : type === 'textarea' ? (
          <textarea className={`${base} h-[62px] resize-none py-2 ${prefix ? 'pl-8' : ''}`} placeholder={placeholder} defaultValue={value} />
        ) : (
          <input
            className={`${base} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
            type={type === 'date' ? 'text' : 'text'}
            placeholder={placeholder}
            defaultValue={value}
          />
        )}
        {type === 'date' && <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />}
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{suffix}</div>}
      </div>
      {hint && <p className="mt-1 text-[10px] text-slate-500">{hint}</p>}
    </div>
  )
}

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

function SnapshotPanel({ variant }: { variant: 'nominee' | 'docs' | 'review' }) {
  const review = variant === 'review'
  const rows = review
    ? [
        [ClipboardList, 'Policy Name', 'Term Life Insurance', 'text-green-600', 'bg-green-50'],
        [User, 'Insured', 'Rajat Sharma', 'text-green-600', 'bg-green-50'],
        [Shield, 'Sum Assured', '\u20b9 10,00,000', 'text-green-600', 'bg-green-50'],
        [Calendar, 'Policy Term', '20 Years', 'text-purple-600', 'bg-purple-50'],
        [WalletCards, 'PPT', '15 Years', 'text-pink-600', 'bg-pink-50'],
        [Calendar, 'Policy Maturity Date', '18 May 2045', 'text-amber-600', 'bg-amber-50'],
        [FileText, 'Total Premium Payable', '\u20b9 1,80,000', 'text-indigo-600', 'bg-indigo-50'],
      ]
    : [
        [ClipboardList, 'Policy Name', 'Term Life Insurance', 'text-green-600', 'bg-green-50'],
        [User, variant === 'docs' ? 'Insured' : 'Life Assured', 'Rajat Sharma', 'text-blue-600', 'bg-blue-50'],
        [BadgeIndianRupee, 'Sum Assured', '\u20b9 10,00,000', 'text-orange-600', 'bg-orange-50'],
        [Calendar, 'Policy Term', '20 Years', 'text-purple-600', 'bg-purple-50'],
        [WalletCards, 'PPT', '15 Years', 'text-pink-600', 'bg-pink-50'],
      ]

  return (
    <div className="space-y-3">
      <Card padding="sm" className="rounded-lg">
        <h3 className="mb-3 text-sm font-bold text-[#11194f]">{variant === 'docs' ? "What you've entered" : 'Policy Snapshot'}</h3>
        <div className="overflow-hidden rounded-lg border border-slate-100">
          {rows.map(([Icon, label, value, color, bg]) => {
            const RowIcon = Icon as typeof Shield
            return (
              <div key={String(label)} className="flex items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${bg}`}>
                  <RowIcon size={14} className={String(color)} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#11194f]">{String(label)}</p>
                  <p className="text-[11px] font-semibold text-[#34406f]">{String(value)}</p>
                </div>
              </div>
            )
          })}
        </div>
        {review && (
          <button className="mt-3 flex h-8 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-[11px] font-bold text-blue-600">
            <Download size={13} /> Download Summary
          </button>
        )}
        {variant === 'docs' && (
          <button className="mt-3 flex h-8 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-[11px] font-bold text-blue-600">
            <Edit3 size={13} /> Edit Details
          </button>
        )}
      </Card>
      <Card padding="sm" className="rounded-lg bg-purple-50/80">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#11194f]">
          <Lightbulb size={16} className="text-purple-600" /> Tips
        </div>
        {(review
          ? ['Please review all details carefully before saving.', 'You can edit any section using the Edit option.', 'Once saved, your policy will be securely stored in your account.', 'Need help? Contact our support team.']
          : variant === 'docs'
            ? ['Upload valid and readable documents.', 'All mandatory documents are required to proceed.', 'You can upload color or scanned copies.', 'Maximum file size allowed is 10MB per file.', 'View supported formats']
            : ['Add at least one nominee.', 'Share allocation must be 100%.', 'You can add both Primary & Contingent nominees.', 'Update details anytime before saving.']
        ).map(item => (
          <div key={item} className="mb-2 flex items-start gap-2 text-[11px] font-semibold leading-relaxed text-[#34406f] last:mb-0">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-600" /> {item}
          </div>
        ))}
      </Card>
    </div>
  )
}

function StepOne({ next }: { next: () => void }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="text-sm font-bold text-[#11194f]">Policy Details</h2>
      <p className="mb-4 text-[11px] text-[#34406f]">Enter basic information about your insurance policy.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field type="select" label="Insurance Type" placeholder="Select Insurance Type" required />
        <Field label="Policy Name" placeholder="Enter Policy Name" required />
        <Field type="select" label="Insurance Provider" placeholder="Select Insurance Provider" required />
        <Field label="Policy Number" placeholder="Enter Policy Number" required />
        <Field type="date" label="Policy Start Date" placeholder="Select Start Date" required />
        <Field type="date" label="Policy Payment End Date (PPT)" placeholder="Select PPT Date" required hint="The date till which premiums are payable." />
        <Field type="date" label="Policy Maturity Date" placeholder="Select Maturity Date" hint="The date on which the policy matures." />
        <Field type="select" label="Policy Term" placeholder="Select Policy Term" />
        <Field label="Sum Assured" placeholder="Enter Sum Assured" required prefix={<span className="text-[11px] font-bold">&#8377;</span>} />
        <Field label="Premium Amount" placeholder="Enter Premium Amount" required prefix={<span className="text-[11px] font-bold">&#8377;</span>} />
        <Field type="select" label="Payment Frequency" placeholder="Select Frequency" />
        <Field type="select" label="Policy Status" placeholder="Select Status" />
        <Field type="date" label="Policy Purchased On" placeholder="Select Purchase Date" />
        <Field type="textarea" label="Notes (Optional)" placeholder="Add any additional notes about this policy" wide />
      </div>
      <p className="-mt-5 mb-4 text-right text-[11px] text-slate-400">0/500</p>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={next}>Save & Continue</Button>
      </div>
    </Card>
  )
}

function StepTwo({ back, next }: { back: () => void; next: () => void }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <h2 className="text-sm font-bold text-[#11194f]">Coverage Details</h2>
      <p className="mb-4 text-[11px] text-[#34406f]">Provide details about the coverage and benefits under your policy.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Field label="Sum Assured" placeholder="Enter Sum Assured" required prefix={<span className="text-[11px] font-bold">&#8377;</span>} />
        <Field type="select" label="Death Benefit" placeholder="Select Death Benefit" />
        <Field type="select" label="Maturity Benefit" placeholder="Select Maturity Benefit" />
        <Field type="select" label="Accidental Death Benefit (ADB)" placeholder="Select ADB" />
        <Field type="select" label="Critical Illness Benefit" placeholder="Select Critical Illness Benefit" />
        <Field type="select" label="Waiver of Premium" placeholder="Select Waiver of Premium" />
        <Field type="select" label="Hospital Cash Benefit" placeholder="Select Hospital Cash Benefit" />
        <Field type="select" label="Daily Allowance Benefit" placeholder="Select Daily Allowance Benefit" />
        <Field label="Other Benefits (Optional)" placeholder="Enter Other Benefits" />
        <Field type="select" label="Rider(s) Opted" placeholder="Select Rider(s) Opted" />
        <Field label="Rider Sum Assured (If Applicable)" placeholder="Enter Rider Sum Assured" prefix={<span className="text-[11px] font-bold">&#8377;</span>} wide />
        <Field type="textarea" label="Additional Coverage Details (Optional)" placeholder="Add any additional details about the coverage" wide />
      </div>
      <p className="-mt-5 mb-4 text-right text-[11px] text-slate-400">0/500</p>
      <FooterNav back={back} next={next} />
      <InfoBar text="You can review and edit the information in the next steps before saving." />
    </Card>
  )
}

function StepThree({ back, next }: { back: () => void; next: () => void }) {
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#11194f]">Nominee Details</h2>
          <p className="text-[11px] text-[#34406f]">Add nominee(s) who will receive the benefits in case of an unfortunate event.</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Plus size={13} />}>Add Nominee</Button>
      </div>
      <InfoBar text="You can add multiple nominees. Total allocation must be 100%." />
      {[
        { name: 'Priya Sharma', relation: 'Spouse', dob: '12 Feb 1988', share: '60', type: 'Primary Nominee' },
        { name: 'Aarav Sharma', relation: 'Son', dob: '24 Jul 2016', share: '40', type: 'Contingent Nominee' },
      ].map((nominee, idx) => (
        <div key={nominee.name} className="mb-3 rounded-lg border border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-[#11194f]">Nominee {idx + 1}</p>
            <button className="flex items-center gap-1 text-[11px] font-bold text-red-500"><Trash2 size={13} /> Remove</button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1.15fr_1fr_0.7fr]">
            <Field label="Nominee Name" value={nominee.name} required />
            <Field type="select" label="Relationship with Life Assured" value={nominee.relation} required />
            <Field type="date" label="Date of Birth" value={nominee.dob} />
            <Field label="Share (%)" value={nominee.share} required suffix={<span className="font-bold">%</span>} />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="mb-2 text-[11px] font-bold text-[#11194f]">Nominee Type <span className="text-red-500">*</span></p>
              <div className="flex flex-wrap gap-6 text-[11px] font-semibold text-[#34406f]">
                {['Primary Nominee', 'Contingent Nominee'].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <span className={`h-4 w-4 rounded-full border ${nominee.type === type ? 'border-green-600 bg-green-600 shadow-[inset_0_0_0_4px_white]' : 'border-slate-300'}`} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Guardian (If Minor)" placeholder="Enter Guardian Name (Optional)" />
          </div>
        </div>
      ))}
      <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-green-50 p-3 lg:grid-cols-4">
        {[
          ['Total Nominee Allocation', '100%', 'Balanced'],
          ['Total Primary Nominee', '60%', ''],
          ['Total Contingent Nominee', '40%', ''],
          ['Total Nominees', '2', ''],
        ].map(([label, value, badge]) => (
          <div key={label} className="border-r border-green-100 last:border-r-0">
            <p className="text-[11px] font-semibold text-[#34406f]">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-[#11194f]">{value}</p>
              {badge && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">{badge}</span>}
            </div>
          </div>
        ))}
      </div>
      <FooterNav back={back} next={next} />
    </Card>
  )
}

function StepFour({ back, next }: { back: () => void; next: () => void }) {
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
            {DOCS.map(doc => {
              const Icon = doc.icon
              return (
                <tr key={doc.type}>
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
                    <button className="flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[11px] font-bold text-blue-600">
                      <CloudUpload size={14} /> Upload File
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <InfoBar text="Ensure all documents are clear and legible. Blurry or incomplete documents may delay verification." />
      <FooterNav back={back} next={next} />
    </Card>
  )
}

function StepFive({ back }: { back: () => void }) {
  const navigate = useNavigate()
  const groups = [
    { icon: Shield, title: 'Policy Details', fields: [['Policy Name', 'Term Life Insurance'], ['Insured', 'Rajat Sharma'], ['Sum Assured', '\u20b9 10,00,000'], ['Policy Term', '20 Years'], ['PPT', '15 Years'], ['Policy Maturity Date', '18 May 2045']] },
    { icon: CloudUpload, title: 'Coverage Details', fields: [['Annual Premium', '\u20b9 12,000'], ['Premium Frequency', 'Yearly'], ['Premium Payment Term (PPT)', '15 Years'], ['Premium Mode', 'Regular Pay'], ['Total Premium Payable', '\u20b9 1,80,000']] },
    { icon: Users, title: 'Nominee Details', fields: [['Total Nominees', '2'], ['Primary Nominee', 'Priya Sharma (60%)'], ['Contingent Nominee', 'Aarav Sharma (40%)'], ['Nominee Allocation', '100% (Balanced)']] },
    { icon: FileText, title: 'Documents Upload', fields: [['Total Documents', '6'], ['Mandatory Documents', '6 / 6 Uploaded'], ['Optional Documents', '0 / 2 Uploaded'], ['All Documents', 'Verified']] },
    { icon: CircleDollarSign, title: 'Additional Information', fields: [['Insured Age', '35 Years'], ['Sum Assured Type', 'Individual'], ['Plan Type', 'Savings Plan'], ['Product Category', 'Life Insurance']] },
  ]
  return (
    <Card padding="sm" className="rounded-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#11194f]">Review Your Policy Details</h2>
          <p className="text-[11px] text-[#34406f]">Please review all the details carefully before saving. You can edit any section if needed.</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Edit3 size={13} />}>Edit All</Button>
      </div>
      {groups.map(group => {
        const Icon = group.icon
        return (
          <div key={group.title} className="mb-3 rounded-lg border border-slate-100 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50"><Icon size={14} className="text-green-600" /></span>
                <p className="text-sm font-bold text-[#11194f]">{group.title}</p>
              </div>
              <button className="flex items-center gap-2 text-[11px] font-bold text-blue-600"><Edit3 size={12} /> Edit <ChevronDown size={13} /></button>
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
      <InfoBar text="By saving, you confirm that all the information provided is true, correct and complete to the best of your knowledge." />
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={back}>Back</Button>
        <Button
          size="lg"
          className="min-w-56 bg-blue-600 hover:bg-blue-700"
          leftIcon={<Lock size={14} />}
          onClick={() => {
            toast.success('Policy saved successfully!')
            navigate('/app/my-plan/plan-details/pol-life')
          }}
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
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Save & Continue Later</Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" rightIcon={<ArrowRight size={14} />} onClick={next}>Save & Continue</Button>
      </div>
    </div>
  )
}

function InfoBar({ text }: { text: string }) {
  return (
    <div className="my-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-700">
      <Info size={14} className="shrink-0" /> {text}
    </div>
  )
}

export function AddPolicyPage() {
  const [step, setStep] = useState(1)
  const go = (target: number) => setStep(Math.min(5, Math.max(1, target)))

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
          <div className="hidden sm:flex items-center gap-4 pt-9">
            <p className="text-xs font-semibold text-[#34406f]">Last login: 18 May 2025, 11:25 AM</p>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              <Shield size={12} /> Secure Session
            </div>
          </div>
        </div>

        <FlowStepper step={step} onStepClick={go} />

        <div className="grid gap-4 xl:grid-cols-[1fr_290px]">
          <div>
            {step === 1 && <StepOne next={() => go(2)} />}
            {step === 2 && <StepTwo back={() => go(1)} next={() => go(3)} />}
            {step === 3 && <StepThree back={() => go(2)} next={() => go(4)} />}
            {step === 4 && <StepFour back={() => go(3)} next={() => go(5)} />}
            {step === 5 && <StepFive back={() => go(4)} />}
          </div>
          <aside className="hidden xl:block">
            {step <= 2 && <WhyPanel step={step} />}
            {step === 3 && <SnapshotPanel variant="nominee" />}
            {step === 4 && <SnapshotPanel variant="docs" />}
            {step === 5 && <SnapshotPanel variant="review" />}
          </aside>
        </div>
      </div>
    </div>
  )
}
