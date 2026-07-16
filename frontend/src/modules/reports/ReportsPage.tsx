import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Download, TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/utils/formatters'
import { reportService } from '@/services/reportService'
import toast from 'react-hot-toast'

interface Summary {
  netWorth: number; totalAssets: number; totalLiabilities: number
  totalInsuranceCoverage: number; totalInvestmentValue: number; totalLoanOutstanding: number
  totalPremiumsPaid: number
  insuranceCoverageByType: { insuranceType: string; value: number }[]
}
interface NetWorthTrend { series: { month: string; assets: number; liabilities: number; netWorth: number }[]; hasHistory: boolean }
interface PremiumTrend { series: { month: string; paid: number }[]; hasHistory: boolean }
interface TaxSummary { financialYear: string; sections: { section: string; desc: string; amount: number; limit: number }[]; totalDeductions: number }

const INSURANCE_COLOR: Record<string, string> = {
  LIFE: '#2563eb', HEALTH: '#16a34a', VEHICLE: '#7c3aed', HOME: '#f59e0b', TRAVEL: '#ec4899', FIRE: '#dc2626', MARINE: '#0891b2', CROP: '#65a30d', OTHER: '#64748b',
}
const INSURANCE_LABEL: Record<string, string> = {
  LIFE: 'Life', HEALTH: 'Health', VEHICLE: 'Vehicle', HOME: 'Home', TRAVEL: 'Travel', FIRE: 'Fire', MARINE: 'Marine', CROP: 'Crop', OTHER: 'Other',
}

const REPORT_TEMPLATES = [
  { title: 'Annual Insurance Summary', desc: 'All policies and premiums', icon: '🛡️' },
  { title: 'Investment Portfolio Statement', desc: 'Full portfolio with returns analysis', icon: '📈' },
  { title: 'Loan Repayment Summary', desc: 'All loans, EMIs paid, outstanding', icon: '💳' },
  { title: 'Net Worth Statement', desc: 'Assets vs liabilities snapshot', icon: '💰' },
  { title: 'Tax Summary Report', desc: 'Section 80C, 80D deductions', icon: '🧾' },
  { title: 'Full Financial Report', desc: 'Comprehensive report — all categories', icon: '📊' },
]

export function ReportsPage() {
  const navigate = useNavigate()

  const { data: summary, isLoading: l1 } = useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => { const res = await reportService.getSummary(); return (res.data as any).data as Summary },
  })
  const { data: netWorthTrend, isLoading: l2 } = useQuery({
    queryKey: ['reports-net-worth-trend'],
    queryFn: async () => { const res = await reportService.getNetWorthTrend(); return (res.data as any).data as NetWorthTrend },
  })
  const { data: premiumTrend, isLoading: l3 } = useQuery({
    queryKey: ['reports-premium-trend'],
    queryFn: async () => { const res = await reportService.getPremiumTrend(); return (res.data as any).data as PremiumTrend },
  })
  const { data: taxSummary, isLoading: l4 } = useQuery({
    queryKey: ['reports-tax-summary'],
    queryFn: async () => { const res = await reportService.getTaxSummary(); return (res.data as any).data as TaxSummary },
  })

  if (l1 || l2 || l3 || l4 || !summary || !netWorthTrend || !premiumTrend || !taxSummary) return <DashboardSkeleton />

  const statCards = [
    { label: 'Net Worth', value: formatCurrency(summary.netWorth), sub: 'Assets minus liabilities', color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
    { label: 'Total Assets', value: formatCurrency(summary.totalAssets), sub: 'Investments + insurance', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📈' },
    { label: 'Total Liabilities', value: formatCurrency(summary.totalLiabilities), sub: 'All outstanding loans', color: 'text-red-600', bg: 'bg-red-50', icon: '💳' },
    { label: 'Insurance Coverage', value: formatCurrency(summary.totalInsuranceCoverage), sub: 'Total sum assured', color: 'text-purple-600', bg: 'bg-purple-50', icon: '🛡️' },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <button className="hover:text-green-600" onClick={() => navigate('/app/dashboard')}>Home</button>
          <span>›</span><span className="text-slate-700">Reports</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your complete financial picture — {taxSummary.financialYear}</p>
          </div>
          <Button size="sm" leftIcon={<Download size={13} />} onClick={() => toast('Export coming soon')}>Export All</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} padding="sm" className="hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <span className="text-base">{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-base font-bold text-slate-900">{s.value}</p>
                <p className={`text-xs font-medium ${s.color}`}>{s.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Net Worth Trend</p>
              <p className="text-xs text-slate-500">Assets vs Liabilities over time</p>
            </div>
            <TrendingUp size={16} className="text-green-600" />
          </div>
          {netWorthTrend.hasHistory ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={netWorthTrend.series} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v))]} />
                <Legend />
                <Bar dataKey="assets" fill="#2563eb" radius={[3, 3, 0, 0]} name="Assets" />
                <Bar dataKey="liabilities" fill="#ef4444" radius={[3, 3, 0, 0]} name="Liabilities" />
                <Bar dataKey="netWorth" fill="#16a34a" radius={[3, 3, 0, 0]} name="Net Worth" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-center px-4">
              <p className="text-xs text-slate-400">Not enough history yet — trends will appear as you keep using PolicyNext.</p>
            </div>
          )}
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Insurance Coverage Breakdown</p>
              <p className="text-xs text-slate-500">Total sum assured by category</p>
            </div>
            <PieChartIcon size={16} className="text-blue-600" />
          </div>
          {summary.insuranceCoverageByType.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No active policies yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={summary.insuranceCoverageByType} cx={70} cy={70} innerRadius={45} outerRadius={70} dataKey="value">
                    {summary.insuranceCoverageByType.map((entry, i) => <Cell key={i} fill={INSURANCE_COLOR[entry.insuranceType] ?? '#64748b'} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {summary.insuranceCoverageByType.map(item => (
                  <div key={item.insuranceType} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: INSURANCE_COLOR[item.insuranceType] ?? '#64748b' }} />
                    <span className="text-xs text-slate-600 flex-1">{INSURANCE_LABEL[item.insuranceType] ?? item.insuranceType}</span>
                    <span className="text-xs font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Monthly Premium Payments</p>
              <p className="text-xs text-slate-500">Premiums paid over the last 12 months</p>
            </div>
            <BarChart2 size={16} className="text-purple-600" />
          </div>
          {premiumTrend.hasHistory ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={premiumTrend.series} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Premium Paid']} />
                <Bar dataKey="paid" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-center px-4">
              <p className="text-xs text-slate-400">No paid premium records yet.</p>
            </div>
          )}
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800">Tax Deduction Summary — {taxSummary.financialYear}</p>
            <span className="text-xs text-slate-400">Simplified estimate</span>
          </div>
          <div className="space-y-3">
            {taxSummary.sections.map(row => (
              <div key={row.section}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{row.section}</span>
                  <span className="text-slate-500">{formatCurrency(row.amount)} / {formatCurrency(row.limit)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.limit > 0 ? (row.amount / row.limit) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{row.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total Tax Deductions</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(taxSummary.totalDeductions)}</p>
            </div>
            <Button size="sm" leftIcon={<Download size={13} />} variant="outline" onClick={() => toast('Download coming soon')}>Download Report</Button>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Download Reports</p>
          <p className="text-xs text-slate-500 mt-0.5">Generate detailed reports for {taxSummary.financialYear}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {REPORT_TEMPLATES.map(report => (
            <div key={report.title} className="p-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{report.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{report.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{report.desc}</p>
                  <Button size="xs" variant="outline" className="mt-2" leftIcon={<Download size={11} />} onClick={() => toast('Download coming soon')}>
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
