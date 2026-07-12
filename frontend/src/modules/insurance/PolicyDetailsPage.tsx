import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Shield, Download, FileText, Users, Pencil, AlertTriangle,
  CheckCircle2, Info, Umbrella, Car, Plane, Home, PawPrint, Headphones,
  UserPlus, ShieldPlus, ClipboardCheck, XCircle, Phone, Mail, Pencil as EditIcon, Trash2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

const TABS = ['Policy Overview', 'Coverage Details', 'Premium & Payment', 'Nominee Details', 'Documents', 'Claim Process']

interface PolicyDetail {
  name: string
  provider: string
  policyNo: string
  icon: React.ElementType
  color: string
  bg: string
  planType: string
  sumInsured: string
  startDate: string
  endDate: string
  policyTerm: string
  premiumPaymentTerm: string
  paymentFrequency: string
  annualPremium: string
  nextDueDate: string
  nextDueAmount: string
  totalPremiumPaid: string
  totalPremiumDue: string
  paymentMode: string
  policyholder: string
}

const POLICY_DETAILS: Record<string, PolicyDetail> = {
  'pol-life': {
    name: 'Term Life Insurance', provider: 'HDFC Life', policyNo: '1234 5678 9012',
    icon: Umbrella, color: '#16a34a', bg: '#f0fdf4',
    planType: 'Individual', sumInsured: '₹1,00,00,000',
    startDate: '18 May 2025', endDate: '17 May 2055', policyTerm: '30 Years', premiumPaymentTerm: '30 Years',
    paymentFrequency: 'Yearly', annualPremium: '₹14,400', nextDueDate: '25 May 2026', nextDueAmount: '₹14,400',
    totalPremiumPaid: '₹14,400', totalPremiumDue: '₹4,17,600', paymentMode: 'Auto Debit (UPI)',
    policyholder: 'Rajat Sharma',
  },
  'pol-vehicle': {
    name: 'Car Insurance', provider: 'Bajaj Allianz', policyNo: '9876 5432 1098',
    icon: Car, color: '#2563eb', bg: '#eff6ff',
    planType: 'Comprehensive', sumInsured: '₹8,00,000',
    startDate: '30 May 2025', endDate: '29 May 2026', policyTerm: '1 Year', premiumPaymentTerm: '1 Year',
    paymentFrequency: 'Monthly', annualPremium: '₹29,496', nextDueDate: '30 May 2025', nextDueAmount: '₹2,458',
    totalPremiumPaid: '₹0', totalPremiumDue: '₹29,496', paymentMode: 'Auto Debit (UPI)',
    policyholder: 'Rajat Sharma',
  },
  'pol-travel': {
    name: 'Annual Travel Plan', provider: 'ICICI Lombard', policyNo: '5566 7788 1122',
    icon: Plane, color: '#7c3aed', bg: '#f5f3ff',
    planType: 'Annual Multi-Trip', sumInsured: '₹10,00,000',
    startDate: '02 Jun 2025', endDate: '01 Jun 2026', policyTerm: '1 Year', premiumPaymentTerm: '1 Year',
    paymentFrequency: 'Monthly', annualPremium: '₹6,600', nextDueDate: '02 Jun 2025', nextDueAmount: '₹550',
    totalPremiumPaid: '₹0', totalPremiumDue: '₹6,600', paymentMode: 'Auto Debit (UPI)',
    policyholder: 'Rajat Sharma',
  },
  'pol-home': {
    name: 'Home Shield Plan', provider: 'HDFC Ergo', policyNo: '3344 5566 7788',
    icon: Home, color: '#ea580c', bg: '#fff7ed',
    planType: 'Standard', sumInsured: '₹50,00,000',
    startDate: '05 Jun 2025', endDate: '04 Jun 2026', policyTerm: '1 Year', premiumPaymentTerm: '1 Year',
    paymentFrequency: 'Monthly', annualPremium: '₹15,000', nextDueDate: '05 Jun 2025', nextDueAmount: '₹1,250',
    totalPremiumPaid: '₹0', totalPremiumDue: '₹15,000', paymentMode: 'Auto Debit (UPI)',
    policyholder: 'Rajat Sharma',
  },
  'pol-pet': {
    name: 'Pet Insurance', provider: 'Future Generali', policyNo: '7788 8899 0011',
    icon: PawPrint, color: '#db2777', bg: '#fdf2f8',
    planType: 'Pet Care', sumInsured: '₹2,00,000',
    startDate: '10 Jun 2025', endDate: '09 Jun 2026', policyTerm: '1 Year', premiumPaymentTerm: '1 Year',
    paymentFrequency: 'Monthly', annualPremium: '₹4,200', nextDueDate: '10 Jun 2025', nextDueAmount: '₹350',
    totalPremiumPaid: '₹0', totalPremiumDue: '₹4,200', paymentMode: 'Auto Debit (UPI)',
    policyholder: 'Rajat Sharma',
  },
}

const COVERAGE_ROWS = [
  { icon: Users, iconColor: '#2563eb', iconBg: '#eff6ff', type: 'Life Cover', desc: 'Provides financial protection to your family in case of your unfortunate demise.' },
  { icon: ShieldPlus, iconColor: '#16a34a', iconBg: '#f0fdf4', type: 'Accidental Death Benefit', desc: 'Additional benefit in case of death due to an accident.' },
  { icon: ClipboardCheck, iconColor: '#7c3aed', iconBg: '#f5f3ff', type: 'Total and Permanent Disability', desc: 'Provides benefit in case of total and permanent disability.' },
]

const WHATS_COVERED = [
  'Death due to natural causes, illness or accident',
  'Accidental death benefit (additional payout)',
  'Total and permanent disability benefit',
  'Terminal illness advance payout',
]

const WHATS_NOT_COVERED = [
  'Death due to suicide within first 12 months',
  'Death due to pre-existing conditions not disclosed',
  'Death while engaging in hazardous activities',
  'Death due to intoxication or substance abuse',
]

const PAYMENT_HISTORY = [
  { id: 'ph1', date: '18 May 2025', amount: '₹14,400', mode: 'Auto Debit (UPI)', status: 'Paid', receipt: true },
  { id: 'ph2', date: '25 May 2026', amount: '₹14,400', mode: 'Auto Debit (UPI)', status: 'Upcoming', receipt: false },
]

const POLICY_DOCS = [
  { id: 'pd1', name: 'Policy Schedule', type: 'Policy Document', uploadedOn: '18 May 2025', ext: 'PDF', bg: '#fee2e2', text: '#dc2626' },
  { id: 'pd2', name: 'Policy Bond', type: 'Policy Document', uploadedOn: '18 May 2025', ext: 'PDF', bg: '#fee2e2', text: '#dc2626' },
  { id: 'pd3', name: 'Premium Receipt – May 2025', type: 'Receipt', uploadedOn: '18 May 2025', ext: 'JPG', bg: '#dcfce7', text: '#16a34a' },
  { id: 'pd4', name: 'Welcome Letter', type: 'General Document', uploadedOn: '18 May 2025', ext: 'PDF', bg: '#fee2e2', text: '#dc2626' },
  { id: 'pd5', name: 'Terms & Conditions', type: 'General Document', uploadedOn: '01 May 2025', ext: 'PDF', bg: '#fee2e2', text: '#dc2626' },
]

const CLAIM_STEPS = [
  { step: 1, title: 'Intimate the Claim', desc: 'Notify the insurer about the claim through the app, helpline or email as soon as possible.' },
  { step: 2, title: 'Submit Documents', desc: 'Upload or courier the required documents — claim form, death certificate, ID proofs and policy bond.' },
  { step: 3, title: 'Verification & Assessment', desc: 'The insurer verifies documents and assesses the claim, and may request additional information.' },
  { step: 4, title: 'Claim Settlement', desc: 'Once approved, the claim amount is transferred to the nominee’s registered bank account.' },
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
  const { id } = useParams()
  const policy = POLICY_DETAILS[id ?? ''] ?? POLICY_DETAILS['pol-life']
  const [activeTab, setActiveTab] = useState('Policy Overview')
  const Icon = policy.icon

  const ACTIONS = [
    { icon: Download, label: 'Download Policy Document', onClick: () => toast.success('Downloading policy document') },
    { icon: FileText, label: 'Request Policy Statement', onClick: () => toast.success('Statement requested') },
    { icon: UserPlus, label: 'Update Nominee', onClick: () => navigate('/app/beneficiaries') },
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
          <div className="hidden sm:flex items-center gap-3">
            <p className="text-xs text-slate-500">Last login: 18 May 2025, 11:25 AM</p>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <Shield size={11} /> Secure Session
            </div>
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
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: policy.bg }}>
              <Icon size={20} style={{ color: policy.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">{policy.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{policy.provider}</p>
              <p className="text-[11px] text-slate-400">Policy No: {policy.policyNo}</p>
            </div>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1.5">Status</p>
            <span className="inline-block px-3 py-0.5 bg-green-50 text-green-700 rounded-md text-[11px] font-semibold">Active</span>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Policy Start Date</p>
            <p className="text-xs font-bold text-slate-900">{policy.startDate}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Policy Term</p>
            <p className="text-xs font-bold text-slate-900">{policy.policyTerm}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Policy End Date</p>
            <p className="text-xs font-bold text-slate-900">{policy.endDate}</p>
          </div>
          <div className="p-3.5">
            <p className="text-[11px] text-slate-500 mb-1">Sum Insured</p>
            <p className="text-sm font-bold text-green-700">{policy.sumInsured}</p>
            <p className="text-[10px] text-slate-400 mt-1">Premium Payment Term</p>
            <p className="text-[11px] font-semibold text-slate-800">{policy.premiumPaymentTerm}</p>
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
          {/* Overview grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr_0.9fr] gap-3">
            {/* Policy Overview */}
            <Card padding="sm" className="rounded-lg p-3">
              <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Policy Overview</h3>
              <div>
                <Row label="Policy / Plan Name" value={policy.name} />
                <Row label="Provider / Company" value={policy.provider} />
                <Row label="Policy Number" value={policy.policyNo} />
                <Row label="Plan Type" value={policy.planType} />
                <Row label="Sum Insured" value={policy.sumInsured} />
                <Row label="Policy Start Date" value={policy.startDate} />
                <Row label="Policy End Date" value={policy.endDate} />
                <Row label="Premium Payment Term" value={policy.premiumPaymentTerm} />
                <Row label="Policy Term" value={policy.policyTerm} />
                <Row label="Policyholder" value={policy.policyholder} />
              </div>
              <div className="flex items-center gap-2 p-2 mt-2 bg-blue-50/70 rounded-md">
                <Info size={12} className="text-blue-500 shrink-0" />
                <p className="text-[10px] text-slate-600">This policy is currently active and in good standing.</p>
              </div>
            </Card>

            {/* Premium Summary */}
            <Card padding="sm" className="rounded-lg p-3">
              <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Premium Summary</h3>
              <div>
                <Row label="Payment Frequency" value={policy.paymentFrequency} />
                <Row label="Annual Premium" value={policy.annualPremium} />
                <Row label="Next Due Date" value={policy.nextDueDate} />
                <Row label="Next Due Amount" value={policy.nextDueAmount} />
                <Row label="Total Premium Paid" value={policy.totalPremiumPaid} />
                <Row label="Total Premium Due" value={policy.totalPremiumDue} />
                <Row label="Payment Mode" value={policy.paymentMode} />
              </div>
              <div className="flex items-center gap-2 p-2 mt-2 bg-green-50 rounded-md border border-green-100">
                <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                <p className="text-[10px] text-green-700">
                  Your next premium of <strong>{policy.nextDueAmount}</strong> is due on <strong>{policy.nextDueDate}</strong>.
                </p>
              </div>
            </Card>

            {/* Policy Actions */}
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
                  onClick={() => toast('Claim process coming soon')}
                >
                  <AlertTriangle size={14} /> Raise a Claim
                </button>
              </div>
            </Card>
          </div>

          {/* Coverage Summary */}
          <Card padding="sm" className="rounded-lg p-3">
            <h3 className="text-[11px] font-semibold text-slate-800 mb-2">Coverage Summary</h3>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[760px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2 rounded-l-md">Coverage Type</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2">Description</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2">Sum Insured</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2 rounded-r-md">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {COVERAGE_ROWS.map(row => (
                    <tr key={row.type}>
                      <td className="px-3 py-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: row.iconBg }}>
                            <row.icon size={13} style={{ color: row.iconColor }} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 whitespace-nowrap">{row.type}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-600 border-b border-slate-100">{row.desc}</td>
                      <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">{policy.sumInsured}</td>
                      <td className="px-3 py-2.5 border-b border-slate-100">
                        <span className="inline-block px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[11px] font-semibold">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
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
                    <p className="text-sm font-bold text-slate-900">{policy.sumInsured}</p>
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold">Active</span>
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
              <Row label="Payment Frequency" value={policy.paymentFrequency} />
              <Row label="Annual Premium" value={policy.annualPremium} />
              <Row label="Next Due Date" value={policy.nextDueDate} />
              <Row label="Next Due Amount" value={policy.nextDueAmount} />
              <Row label="Total Premium Paid" value={policy.totalPremiumPaid} />
              <Row label="Total Premium Due" value={policy.totalPremiumDue} />
              <Row label="Payment Mode" value={policy.paymentMode} />
            </div>
            <div className="flex items-center gap-2 p-3 mt-3 bg-green-50 rounded-lg border border-green-100">
              <CheckCircle2 size={14} className="text-green-600 shrink-0" />
              <p className="text-[11px] text-green-700">
                AutoPay is enabled — premiums are debited automatically on the due date.
              </p>
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Payment History</h3>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
                onClick={() => toast.success('Statement download started')}>
                Download Statement <Download size={12} />
              </button>
            </div>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[560px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50">
                    {['Payment Date', 'Amount', 'Payment Mode', 'Status', 'Receipt'].map((h, i, arr) => (
                      <th key={h} className={`text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5 ${i === 0 ? 'rounded-l-lg' : ''} ${i === arr.length - 1 ? 'rounded-r-lg' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PAYMENT_HISTORY.map(p => (
                    <tr key={p.id}>
                      <td className="px-3 py-3 text-xs font-medium text-slate-700 border-b border-slate-100 whitespace-nowrap">{p.date}</td>
                      <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100">{p.amount}</td>
                      <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{p.mode}</td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${p.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>{p.status}</span>
                      </td>
                      <td className="px-3 py-3 border-b border-slate-100">
                        {p.receipt ? (
                          <button className="text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                            onClick={() => toast.success('Downloading receipt')}>
                            Download
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
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
                    {['Nominee Name', 'Relationship', 'Share (%)', 'Date of Birth', 'Contact', 'Appointed On', 'Action'].map((h, i, arr) => (
                      <th key={h} className={`text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-2.5 ${i === 0 ? 'rounded-l-lg' : ''} ${i === arr.length - 1 ? 'rounded-r-lg' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-[11px] font-bold text-green-700 shrink-0">A</div>
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">Anita Sharma</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100">Wife</td>
                    <td className="px-3 py-3 text-xs font-semibold text-slate-800 border-b border-slate-100">100%</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">12 Mar 1988</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 whitespace-nowrap"><Mail size={10} /> anita.sharma@email.com</p>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1 whitespace-nowrap"><Phone size={10} /> +91 98765 43210</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">18 May 2025</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" onClick={() => toast('Edit nominee coming soon')}>
                          <EditIcon size={12} className="text-slate-500" />
                        </button>
                        <button className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100" onClick={() => toast.error('Delete requires confirmation')}>
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
            <button className="text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 flex items-center gap-1.5"
              onClick={() => toast.success('Preparing download of all documents')}>
              <Download size={13} /> Download All
            </button>
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
                {POLICY_DOCS.map(d => (
                  <tr key={d.id}>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-bold shrink-0" style={{ backgroundColor: d.bg, color: d.text }}>{d.ext}</div>
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{d.name}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{d.type}</td>
                    <td className="px-3 py-3 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">{d.uploadedOn}</td>
                    <td className="px-3 py-3 border-b border-slate-100">
                      <button className="text-[11px] font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                        onClick={() => toast.success(`Downloading ${d.name}`)}>
                        Download
                      </button>
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
