import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, FileText, Calendar, TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'

const NET_WORTH_DATA = [
  { month: 'Jun 24', assets: 7200000, liabilities: 4250000, netWorth: 2950000 },
  { month: 'Aug 24', assets: 7500000, liabilities: 4180000, netWorth: 3320000 },
  { month: 'Oct 24', assets: 7800000, liabilities: 4100000, netWorth: 3700000 },
  { month: 'Dec 24', assets: 8100000, liabilities: 4020000, netWorth: 4080000 },
  { month: 'Feb 25', assets: 8400000, liabilities: 3950000, netWorth: 4450000 },
  { month: 'Apr 25', assets: 8750000, liabilities: 3870000, netWorth: 4880000 },
  { month: 'May 25', assets: 9025000, liabilities: 4255000, netWorth: 4770000 },
]

const INSURANCE_COVERAGE = [
  { name: 'Life', value: 10000000, color: '#2563eb' },
  { name: 'Health', value: 1500000, color: '#16a34a' },
  { name: 'Vehicle', value: 800000, color: '#7c3aed' },
  { name: 'Home', value: 500000, color: '#f59e0b' },
]

const PREMIUM_TREND = [
  { month: 'Jun 24', paid: 24200 }, { month: 'Jul 24', paid: 24200 }, { month: 'Aug 24', paid: 24200 },
  { month: 'Sep 24', paid: 24200 }, { month: 'Oct 24', paid: 24200 }, { month: 'Nov 24', paid: 24200 },
  { month: 'Dec 24', paid: 32700 }, { month: 'Jan 25', paid: 24200 }, { month: 'Feb 25', paid: 24200 },
  { month: 'Mar 25', paid: 24200 }, { month: 'Apr 25', paid: 24200 }, { month: 'May 25', paid: 24200 },
]

const REPORT_TEMPLATES = [
  { title: 'Annual Insurance Summary', desc: 'All policies, premiums, claims — FY 2024-25', icon: '🛡️', type: 'Insurance' },
  { title: 'Investment Portfolio Statement', desc: 'Full portfolio with returns analysis', icon: '📈', type: 'Investment' },
  { title: 'Loan Repayment Summary', desc: 'All loans, EMIs paid, outstanding — FY 2024-25', icon: '💳', type: 'Loan' },
  { title: 'Net Worth Statement', desc: 'Assets vs liabilities snapshot', icon: '💰', type: 'NetWorth' },
  { title: 'Tax Summary Report', desc: 'Section 80C, 80D deductions — FY 2024-25', icon: '🧾', type: 'Tax' },
  { title: 'Full Financial Report', desc: 'Comprehensive report — all categories', icon: '📊', type: 'Full' },
]

const SUMMARY_STATS = {
  totalAssets: 9025000,
  totalLiabilities: 4255000,
  netWorth: 4770000,
  totalInsuranceCoverage: 12800000,
  totalPremiumsPaid: 290400,
  totalInvestmentValue: 1575000,
  totalLoanOutstanding: 4255000,
}

export function ReportsPage() {
  const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2024-25')

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
            <p className="text-sm text-slate-500 mt-0.5">Your complete financial picture</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:border-green-500"
              value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
              {['FY 2024-25', 'FY 2023-24', 'FY 2022-23'].map(p => <option key={p}>{p}</option>)}
            </select>
            <Button size="sm" leftIcon={<Download size={13} />}>Export All</Button>
          </div>
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Net Worth', value: formatCurrency(SUMMARY_STATS.netWorth), sub: '+₹1.82L since last year', color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
          { label: 'Total Assets', value: formatCurrency(SUMMARY_STATS.totalAssets), sub: 'Investments + insurance', color: 'text-blue-600', bg: 'bg-blue-50', icon: '📈' },
          { label: 'Total Liabilities', value: formatCurrency(SUMMARY_STATS.totalLiabilities), sub: 'All outstanding loans', color: 'text-red-600', bg: 'bg-red-50', icon: '💳' },
          { label: 'Insurance Coverage', value: formatCurrency(SUMMARY_STATS.totalInsuranceCoverage), sub: 'Total sum assured', color: 'text-purple-600', bg: 'bg-purple-50', icon: '🛡️' },
        ].map(s => (
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
        {/* Net Worth trend */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Net Worth Trend</p>
              <p className="text-xs text-slate-500">Assets vs Liabilities over time</p>
            </div>
            <TrendingUp size={16} className="text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={NET_WORTH_DATA} barSize={18}>
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
        </Card>

        {/* Insurance coverage breakdown */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Insurance Coverage Breakdown</p>
              <p className="text-xs text-slate-500">Total sum assured by category</p>
            </div>
            <PieChartIcon size={16} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={INSURANCE_COVERAGE} cx={70} cy={70} innerRadius={45} outerRadius={70} dataKey="value">
                  {INSURANCE_COVERAGE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {INSURANCE_COVERAGE.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-600 flex-1">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Premium trend */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Monthly Premium Payments</p>
              <p className="text-xs text-slate-500">Premiums paid over the year</p>
            </div>
            <BarChart2 size={16} className="text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={PREMIUM_TREND} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Premium Paid']} />
              <Bar dataKey="paid" fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tax summary */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-800">Tax Deduction Summary — {selectedPeriod}</p>
            <span className="text-xs text-slate-400">Under Old Regime</span>
          </div>
          <div className="space-y-3">
            {[
              { section: 'Section 80C', desc: 'ELSS + PPF + Life Insurance Premium', amount: 150000, limit: 150000 },
              { section: 'Section 80D', desc: 'Health Insurance Premium (Self + Parents)', amount: 50000, limit: 75000 },
              { section: 'Section 24(b)', desc: 'Home Loan Interest Deduction', amount: 200000, limit: 200000 },
              { section: 'Section 80CCD(1B)', desc: 'NPS Additional Contribution', amount: 0, limit: 50000 },
            ].map(row => (
              <div key={row.section}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{row.section}</span>
                  <span className="text-slate-500">{formatCurrency(row.amount)} / {formatCurrency(row.limit)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(row.amount / row.limit) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{row.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Total Tax Deductions</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(400000)}</p>
            </div>
            <Button size="sm" leftIcon={<Download size={13} />} variant="outline">Download Report</Button>
          </div>
        </Card>
      </div>

      {/* Report templates */}
      <Card padding="none">
        <div className="p-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Download Reports</p>
          <p className="text-xs text-slate-500 mt-0.5">Generate detailed reports for {selectedPeriod}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {REPORT_TEMPLATES.map(report => (
            <div key={report.title} className="p-4 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{report.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{report.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{report.desc}</p>
                  <Button size="xs" variant="outline" className="mt-2" leftIcon={<Download size={11} />}>
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
