import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Shield, Download, FileText, Users, Pencil, AlertTriangle,
  CheckCircle2, Info, Umbrella, Car, Plane, Home, HeartPulse, Headphones,
  UserPlus, ShieldPlus, ClipboardCheck, XCircle, Phone, Mail, Pencil as EditIcon, Trash2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { policyService } from '@/services/policyService'
import { API_BASE_URL } from '@/constants'
import type { Policy, PremiumPayment } from '@/types'
import toast from 'react-hot-toast'

const TABS = ['Policy Overview', 'Coverage Details', 'Premium & Payment', 'Nominee Details', 'Documents', 'Claim Process']

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  LIFE: { icon: Umbrella, color: '#16a34a', bg: '#f0fdf4' },
  VEHICLE: { icon: Car, color: '#2563eb', bg: '#eff6ff' },
  TRAVEL: { icon: Plane, color: '#7c3aed', bg: '#f5f3ff' },
  HOME: { icon: Home, color: '#ea580c', bg: '#fff7ed' },
  HEALTH: { icon: HeartPulse, color: '#db2777', bg: '#fdf2f8' },
  OTHER: { icon: Shield, color: '#64748b', bg: '#f1f5f9' },
}

// Generic per-category educational content — not stored against any specific policy,
// same descriptions apply to every user's policy of that insurance type.
const COVERAGE_ROWS = [
  { icon: Users, iconColor: '#2563eb', iconBg: '#eff6ff', type: 'Primary Cover', desc: 'Provides the core financial protection defined by this policy.' },
  { icon: ShieldPlus, iconColor: '#16a34a', iconBg: '#f0fdf4', type: 'Accidental Benefit', desc: 'Additional benefit in case of an accident, where applicable.' },
  { icon: ClipboardCheck, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'Add-on Riders', desc: 'Any additional riders opted for this policy, if applicable.' },
]
const WHATS_COVERED = [
  'Events covered under the policy\'s standard terms',
  'Add-on riders opted at the time of purchase',
  'Claims made within the policy validity period',
]
const WHATS_NOT_COVERED = [
  'Events explicitly excluded in the policy document',
  'Claims outside the policy validity period',
  'Non-disclosure of material facts at purchase',
]
const CLAIM_STEPS = [
  { step: 1, title: 'Intimate the Claim', desc: 'Notify the insurer about the claim through the app, helpline or email as soon as possible.' },
  { step: 2, title: 'Submit Documents', desc: 'Upload or courier the required documents — claim form, ID proofs and policy bond.' },
  { step: 3, title: 'Verification & Assessment', desc: 'The insurer verifies documents and assesses the claim, and may request additional information.' },
  { step: 4, title: 'Claim Settlement', desc: 'Once approved, the claim amount is transferred to the registered bank account.' },
]

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[44%_1fr] gap-3 py-0.5 border-b border-slate-50 last:border-0">
      <p className="text-[10px] leading-tight text-slate-500">{label}</p>
      <p className="text-[10px] leading-tight font-semibold text-slate-800">{value}</p>
    </div>
  )
}

export function PolicyDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('Policy Overview')

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      const res = await policyService.getById(id as string)
      return (res.data as any).data as Policy
    },
    enabled: !!id,
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['policy-payments', id],
    queryFn: async () => {
      const res = await policyService.getPayments(id as string)
      return ((res.data as any).data ?? []) as PremiumPayment[]
    },
    enabled: !!id && activeTab === 'Premium & Payment',
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['policy-documents', id],
    queryFn: async () => {
      const res = await policyService.getDocuments(id as string)
      return ((res.data as any).data ?? []) as { document: { id: string; name: string; mimeType: string; createdAt: string }; docType?: string }[]
    },
    enabled: !!id && activeTab === 'Documents',
  })

  const handleRemoveNominee = async (nomineeId: string) => {
    if (!id) return
    try {
      await policyService.removeNominee(id, nomineeId)
      toast.success('Nominee removed')
    } catch {
      toast.error('Failed to remove nominee')
    }
  }

  if (isLoading || !policy) return <DashboardSkeleton />

  const meta = TYPE_META[policy.insuranceType] ?? TYPE_META.OTHER
  const Icon = meta.icon
  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0)
  const totalDue = payments.filter(p => p.status !== 'PAID').reduce((s, p) => s + Number(p.amount), 0)
  const nextDue = payments.filter(p => p.status !== 'PAID').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]

  const ACTIONS = [
    { icon: Download, label: 'Download Policy Document', onClick: () => toast('Download requires an uploaded policy document') },
    { icon: FileText, label: 'Request Policy Statement', onClick: () => toast.success('Statement requested') },
    { icon: UserPlus, label: 'Update Nominee', onClick: () => setActiveTab('Nominee Details') },
    { icon: Pencil, label: 'Edit Policy Details', onClick: () => toast('Edit coming soon') },
  ]

  return (
    <div className="min-h-full bg-white p-4 sm:p-5 space-y-3 max-w-[1360px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <nav className="text-[11px] mb-1 flex items-center gap-1">
              <button className="font-semibold text-green-700 hover:text-green-800" onClick={() => navigate('/app/my-plan')}>My Plan</button>
              <span className="text-slate-400">›</span>
              <span className="text-slate-500">Policy Details</span>
            </nav>
            <h1 className="text-xl font-bold text-[#0f2952] leading-tight">Policy Details</h1>
            <p className="text-xs text-slate-500 mt-0.5">View detailed information about your selected policy.</p>
          </div>
        </div>
        <button
          className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 bg-white rounded-md px-3 py-1.5 hover:bg-slate-50"
          onClick={() => navigate('/app/my-plan')}
        >
          <ArrowLeft size={13} /> Back to My Plan
        </button>
      </motion.div>

      {/* Policy header card */}
      <Card padding="none" className="rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.75fr_repeat(3,1fr)_1.15fr] items-center divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
          <div className="flex items-center gap-3 p-3.5">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: meta.bg }}>
              <Icon size={20} style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">{policy.policyName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{policy.provider}</p>
              <p className="text-[11px] text-slate-400">Policy No: {policy.policyNumber ?? '—'}</p>
            </div>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1.5">Status</p>
            <span className="inline-block px-3 py-0.5 bg-green-50 text-green-700 rounded-md text-[11px] font-semibold">{policy.status}</span>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Policy Start Date</p>
            <p className="text-xs font-bold text-slate-900">{formatDate(policy.policyStartDate)}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Policy Term</p>
            <p className="text-xs font-bold text-slate-900">{policy.policyTerm ? `${policy.policyTerm} Years` : '—'}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Policy End Date</p>
            <p className="text-xs font-bold text-slate-900">{formatDate(policy.policyEndDate)}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Sum Insured</p>
            <p className="text-sm font-bold text-green-700">{formatCurrency(Number(policy.sumAssured))}</p>
            <p className="text-[10px] text-slate-400 mt-1">Plan</p>
            <p className="text-[11px] font-semibold text-slate-800">{policy.planName ?? policy.insuranceType}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab ? 'border-green-600 text-green-700 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Policy Overview' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr_0.9fr] gap-3">
            <Card padding="sm" className="rounded-lg p-3">
              <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Policy Overview</h3>
              <div>
                <Row label="Policy / Plan Name" value={policy.policyName} />
                <Row label="Provider / Company" value={policy.provider} />
                <Row label="Policy Number" value={policy.policyNumber ?? '—'} />
                <Row label="Plan" value={policy.planName ?? '—'} />
                <Row label="Sum Insured" value={formatCurrency(Number(policy.sumAssured))} />
                <Row label="Policy Start Date" value={formatDate(policy.policyStartDate)} />
                <Row label="Policy End Date" value={formatDate(policy.policyEndDate)} />
                <Row label="Policy Term" value={policy.policyTerm ? `${policy.policyTerm} Years` : '—'} />
              </div>
              <div className="flex items-center gap-2 p-2 mt-2 bg-blue-50/70 rounded-md">
                <Info size={12} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-slate-600">
                  {policy.status === 'ACTIVE' ? 'This policy is currently active and in good standing.' : `This policy is currently ${policy.status.toLowerCase()}.`}
                </p>
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg p-3">
              <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Premium Summary</h3>
              <div>
                <Row label="Payment Frequency" value={policy.premiumFrequency} />
                <Row label="Premium Amount" value={formatCurrency(Number(policy.premiumAmount))} />
                <Row label="Next Due Date" value={policy.nextPremiumDate ? formatDate(policy.nextPremiumDate) : '—'} />
              </div>
              {policy.nextPremiumDate && (
                <div className="flex items-center gap-2 p-2 mt-2 bg-green-50 rounded-md border border-green-100">
                  <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                  <p className="text-[10px] text-green-700">
                    Your next premium of <strong>{formatCurrency(Number(policy.premiumAmount))}</strong> is due on <strong>{formatDate(policy.nextPremiumDate)}</strong>.
                  </p>
                </div>
              )}
            </Card>

            <Card padding="sm" className="rounded-lg p-3">
              <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Policy Actions</h3>
              <div className="space-y-1.5">
                {ACTIONS.map(a => (
                  <button
                    key={a.label}
                    className="w-full flex items-center gap-2.5 text-[10px] font-medium text-slate-700 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors"
                    onClick={a.onClick}
                  >
                    <a.icon size={14} className="text-slate-500" /> {a.label}
                  </button>
                ))}
                <button
                  className="w-full flex items-center gap-2.5 text-[10px] font-semibold text-red-600 border border-red-200 rounded-md px-3 py-1.5 hover:bg-red-50 transition-colors"
                  onClick={() => setActiveTab('Claim Process')}
                >
                  <AlertTriangle size={14} /> Raise a Claim
                </button>
              </div>
            </Card>
          </div>
        </>
      ) : activeTab === 'Coverage Details' ? (
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Coverage Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {COVERAGE_ROWS.map(row => (
                <div key={row.type} className="p-4 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: row.iconBg }}>
                    <row.icon size={17} style={{ color: row.iconColor }} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mb-1">{row.type}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{row.desc}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(Number(policy.sumAssured))}</p>
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold">{policy.status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-slate-800 mb-3">What's Covered</p>
                <div className="space-y-2">
                  {WHATS_COVERED.map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-green-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <p className="text-xs font-semibold text-slate-800 mb-3">What's Not Covered</p>
                <div className="space-y-2">
                  {WHATS_NOT_COVERED.map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : activeTab === 'Premium & Payment' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Premium Summary</h3>
            <div>
              <Row label="Payment Frequency" value={policy.premiumFrequency} />
              <Row label="Premium Amount" value={formatCurrency(Number(policy.premiumAmount))} />
              <Row label="Next Due Date" value={nextDue ? formatDate(nextDue.dueDate) : '—'} />
              <Row label="Next Due Amount" value={nextDue ? formatCurrency(Number(nextDue.amount)) : '—'} />
              <Row label="Total Premium Paid" value={formatCurrency(totalPaid)} />
              <Row label="Total Premium Due" value={formatCurrency(totalDue)} />
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Payment History</h3>
            </div>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[560px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50">
                    {['Due Date', 'Paid Date', 'Amount', 'Status'].map((h, i, arr) => (
                      <th key={h} className={`text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5 ${i === 0 ? 'rounded-l-lg' : ''} ${i === arr.length - 1 ? 'rounded-r-lg' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-400">No payment records yet.</td></tr>
                  )}
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="px-3 py-3 text-xs font-medium text-slate-700 border-b border-slate-100 whitespace-nowrap">{formatDate(p.dueDate)}</td>
                      <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.paidDate ? formatDate(p.paidDate) : '—'}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100">{formatCurrency(Number(p.amount))}</td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${p.status === 'PAID' ? 'bg-green-50 text-green-700' : p.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'Nominee Details' ? (
        <div className="space-y-4">
          <Card padding="md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Nominee Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Nominees registered under this policy.</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-medium text-white bg-green-600 rounded-lg px-3.5 py-2 hover:bg-green-700"
                onClick={() => navigate('/app/beneficiaries/add')}>
                <UserPlus size={13} /> Add Nominee
              </button>
            </div>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[760px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50">
                    {['Nominee Name', 'Relationship', 'Share (%)', 'Date of Birth', 'Contact', 'Action'].map((h, i, arr) => (
                      <th key={h} className={`text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5 ${i === 0 ? 'rounded-l-lg' : ''} ${i === arr.length - 1 ? 'rounded-r-lg' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(!policy.nominees || policy.nominees.length === 0) && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-400">No nominees added for this policy yet.</td></tr>
                  )}
                  {policy.nominees?.map(n => (
                    <tr key={n.id}>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-[11px] font-bold text-green-700 shrink-0">{n.fullName.slice(0, 1)}</div>
                          <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{n.fullName}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100">{n.relationship}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100">{n.sharePercent}%</td>
                      <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{n.dateOfBirth ? formatDate(n.dateOfBirth) : '—'}</td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        {n.email && <p className="text-[11px] text-slate-600 flex items-center gap-1 whitespace-nowrap"><Mail size={10} /> {n.email}</p>}
                        {n.mobile && <p className="text-[11px] text-slate-600 flex items-center gap-1 whitespace-nowrap"><Phone size={10} /> {n.mobile}</p>}
                        {!n.email && !n.mobile && <span className="text-[11px] text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => toast('Edit nominee coming soon')}>
                            <EditIcon size={12} className="text-slate-500" />
                          </button>
                          <button className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100" onClick={() => handleRemoveNominee(n.id)}>
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
            <Shield size={14} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-700">Nominee information is secured and used only for claim settlement purposes.</p>
          </div>
        </div>
      ) : activeTab === 'Documents' ? (
        <Card padding="md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Policy Documents</h3>
              <p className="text-xs text-slate-500 mt-0.5">All documents related to this policy.</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[700px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50">
                  {['Document Name', 'Document Type', 'Uploaded On', 'Action'].map((h, i, arr) => (
                    <th key={h} className={`text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5 ${i === 0 ? 'rounded-l-lg' : ''} ${i === arr.length - 1 ? 'rounded-r-lg' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-400">No documents uploaded for this policy yet.</td></tr>
                )}
                {documents.map(d => (
                  <tr key={d.document.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0 bg-red-50 text-red-600">
                          {d.document.mimeType.split('/')[1]?.slice(0, 3).toUpperCase() ?? 'DOC'}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{d.document.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{d.docType ?? '—'}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{formatDate(d.document.createdAt)}</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <a
                        className="text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 inline-block"
                        href={`${API_BASE_URL}/documents/${d.document.id}/download`}
                        target="_blank" rel="noreferrer"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card padding="md">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Claim Process</h3>
            <p className="text-xs text-slate-500 mb-5">Follow these steps to raise and track a claim for this policy.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CLAIM_STEPS.map(s => (
                <div key={s.step} className="p-4 rounded-xl border border-slate-100 relative">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3">{s.step}</div>
                  <p className="text-xs font-semibold text-slate-800 mb-1">{s.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 p-4 bg-red-50/60 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-full border border-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} className="text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Need to file a claim?</p>
                  <p className="text-[11px] text-slate-500">Claims helpline: 1800-266-9777 (24×7) · claims@{policy.provider.toLowerCase().replace(/\s/g, '')}.com</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg px-3.5 py-2 hover:bg-red-600"
                onClick={() => toast('Claim intimation form coming soon')}>
                <AlertTriangle size={13} /> Raise a Claim
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Support banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/60 rounded-lg border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full border border-blue-100 flex items-center justify-center shrink-0">
            <Headphones size={15} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Need help with this policy?</p>
            <p className="text-[11px] text-slate-500">Contact our support team for any assistance regarding your policy.</p>
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-500 rounded-md px-3.5 py-1.5 hover:bg-blue-600"
          onClick={() => toast.success('Connecting you to support')}
        >
          <Headphones size={13} /> Contact Support
        </button>
      </div>
    </div>
  )
}
