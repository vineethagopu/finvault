import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Shield, Search, Filter, MoreVertical, ChevronRight, Bell, ShoppingBag, Download, Eye, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { ConfirmModal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, formatDateTime, daysFromNow } from '@/utils/formatters'
import { INSURANCE_TYPES, API_BASE_URL } from '@/constants'
import { policyService } from '@/services/policyService'
import { queryKeys } from '@/services/queryKeys'
import { useAuthStore } from '@/store/authStore'
import type { Policy } from '@/types'
import toast from 'react-hot-toast'

const TABS = ['My Policies', 'Policy Applications', 'Riders', 'Claims']

export function InsurancePage() {
  const [activeTab, setActiveTab] = useState('My Policies')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: policies = [], isLoading } = useQuery({
    queryKey: queryKeys.policies.list(),
    queryFn: async () => (await policyService.getAll()) ?? [],
  })

  const downloadPolicyDocument = async (policy: Policy) => {
    if (!policy._count?.policyDocuments) {
      toast.error('No document uploaded for this policy yet')
      return
    }
    try {
      const links = await policyService.getDocuments<{ document: { id: string } }[]>(policy.id)
      const docId = links[0]?.document?.id
      if (!docId) { toast.error('No document uploaded for this policy yet'); return }
      window.open(`${API_BASE_URL}/documents/${docId}/download`, '_blank')
    } catch {
      toast.error('Failed to load policy document')
    }
  }

  const confirmDeletePolicy = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await policyService.delete(deleteTarget.id)
      // Same-tab list refetches immediately; the backend's `policy.changed` SSE
      // event keeps any other open tab/device in sync without a reload.
      await queryClient.invalidateQueries({ queryKey: queryKeys.policies.list() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() })
      toast.success('Policy deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete policy')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = policies.filter(p => {
    const matchSearch = !search || p.policyName.toLowerCase().includes(search.toLowerCase()) || p.provider.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || p.insuranceType === typeFilter
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const totalSumAssured = filtered.reduce((s, p) => s + Number(p.sumAssured), 0)
  const totalPremium = filtered.reduce((s, p) => s + Number(p.premiumAmount), 0)
  const expiringCount = filtered.filter(p => p.nextPremiumDate && daysFromNow(p.nextPremiumDate) <= 30).length
  const nextDueDate = filtered
    .map(p => p.nextPremiumDate)
    .filter((d): d is string => !!d)
    .sort()[0]

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Insurance</h1>
            <p className="text-sm text-slate-500 mt-0.5">View and manage all your insurance policies in one place.</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-slate-500">
            <span>Last login: {user?.lastLogin ? formatDateTime(user.lastLogin) : '—'}</span>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
              <Shield size={10} /> Secure Session
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Policies</p>
              <p className="text-xl font-bold text-slate-900">{filtered.length}</p>
              <p className="text-[11px] text-green-600 font-medium">Active Policies</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Sum Assured</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSumAssured)}</p>
              <p className="text-[11px] text-slate-400">Across all policies</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Annual Premium</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalPremium)}</p>
              <p className="text-[11px] text-orange-600 font-medium">Next Due: {nextDueDate ? formatDate(nextDueDate) : '—'}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Policies Expiring Soon</p>
              <p className="text-xl font-bold text-slate-900">{expiringCount}</p>
              <p className="text-[11px] text-yellow-600 font-medium">In next 30 days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main card */}
      <Card padding="none">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4 pt-1 gap-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-slate-50">
          <div className="flex-1 min-w-0 max-w-xs">
            <Input
              placeholder="Search by policy name or provider"
              leftIcon={<Search size={14} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <select
            className="h-9 text-xs border border-slate-200 rounded-lg px-3 bg-white text-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-100"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">All Policy Types</option>
            {INSURANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            className="h-9 text-xs border border-slate-200 rounded-lg px-3 bg-white text-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-100"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {['ACTIVE', 'LAPSED', 'EXPIRED', 'PENDING'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => navigate('/app/insurance/add')}>
              Add My Policy Manually
            </Button>
            <Button size="sm" leftIcon={<ShoppingBag size={14} />} onClick={() => navigate('/app/invest-online')}>
              Buy New Policy
            </Button>
          </div>
        </div>

        {/* Quick Actions sidebar shown inline */}
        <div className="flex gap-0">
          <div className="flex-1 overflow-x-auto">
            {/* Policy list */}
            <div className="p-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">My Policies ({filtered.length})</p>
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Shield size={28} />}
                  title="No policies found"
                  description="Add your first insurance policy to get started"
                  action={{ label: 'Add Policy', onClick: () => navigate('/app/insurance/add'), icon: <Plus size={14} /> }}
                />
              ) : (
                <div className="space-y-3">
                  {filtered.map((policy) => {
                    const typeInfo = INSURANCE_TYPES.find(t => t.value === policy.insuranceType)
                    const days = policy.nextPremiumDate ? daysFromNow(policy.nextPremiumDate) : Infinity
                    const isDueSoon = days <= 30
                    return (
                      <div
                        key={policy.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/30 transition-all cursor-pointer group"
                        onClick={() => navigate(`/app/insurance/${policy.id}`)}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                          style={{ backgroundColor: typeInfo?.color + '20' }}>
                          {typeInfo?.icon || '📋'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{policy.policyName}</p>
                              <p className="text-xs text-slate-500">{policy.provider}</p>
                              <p className="text-xs text-slate-400">Policy No: {policy.policyNumber ?? '—'}</p>
                            </div>
                            <StatusBadge status={policy.status} />
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1 min-w-[120px]">
                          <p className="text-[10px] text-slate-400 uppercase">Sum Insured</p>
                          <p className="text-sm font-bold text-slate-800">{formatCurrency(Number(policy.sumAssured))}</p>
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-1 min-w-[100px]">
                          <p className="text-[10px] text-slate-400 uppercase">Annual Premium</p>
                          <p className="text-sm font-bold text-slate-800">{formatCurrency(Number(policy.premiumAmount))}</p>
                        </div>
                        <div className="hidden lg:flex flex-col items-end gap-1 min-w-[120px]">
                          <p className="text-[10px] text-slate-400 uppercase">Next Due</p>
                          <p className={`text-sm font-semibold ${isDueSoon ? 'text-orange-600' : 'text-slate-700'}`}>
                            {policy.nextPremiumDate ? formatDate(policy.nextPremiumDate) : '—'}
                          </p>
                          {isDueSoon && <p className="text-[10px] text-orange-500">(In {days} days)</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-green-600 transition-colors" />
                          <div className="relative">
                            <button
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                              onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === policy.id ? null : policy.id) }}
                            >
                              <MoreVertical size={15} className="text-slate-400" />
                            </button>
                            {menuOpen === policy.id && (
                              <div className="absolute right-0 top-8 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-10 w-44" onClick={e => e.stopPropagation()}>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                                  onClick={() => { setMenuOpen(null); navigate(`/app/insurance/${policy.id}`) }}
                                >
                                  <Eye size={13} /> View Details
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                                  onClick={() => { setMenuOpen(null); downloadPolicyDocument(policy) }}
                                >
                                  <Download size={13} /> Download Policy
                                </button>
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                                  onClick={() => { setMenuOpen(null); toast('Reminders are coming soon') }}
                                >
                                  <Bell size={13} /> Set Reminder
                                </button>
                                <div className="border-t border-slate-100 mt-1">
                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                                    onClick={() => { setMenuOpen(null); setDeleteTarget(policy) }}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions panel */}
          <div className="hidden xl:block w-64 border-l border-slate-100 p-4 space-y-4 shrink-0">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Quick Actions</h4>
              {[
                { icon: ShoppingBag, label: 'Buy New Policy', desc: 'Explore and buy new insurance', onClick: () => navigate('/app/invest-online') },
                { icon: Plus, label: 'Add My Policy Manually', desc: 'Add a policy you already have', onClick: () => navigate('/app/insurance/add') },
                { icon: Shield, label: 'Renew Policy', desc: 'Renew your existing policy', onClick: () => toast('Policy renewal is coming soon') },
                { icon: Download, label: 'Download Policy Schedule', desc: 'Get your policy document', onClick: () => toast('Select a policy from the list to download its schedule') },
              ].map(({ icon: Icon, label, desc, onClick }) => (
                <button key={label} onClick={onClick} className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl text-left transition-colors mb-1">
                  <Icon size={15} className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{label}</p>
                    <p className="text-[10px] text-slate-400">{desc}</p>
                  </div>
                  <ChevronRight size={12} className="text-slate-300 ml-auto mt-0.5 shrink-0" />
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Need Help?</h4>
              <p className="text-xs text-slate-500 mb-2">Our support team is here to help you with your insurance needs.</p>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => toast.success('Connecting you to support')}>Contact Support</Button>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Useful Information</h4>
              {['How to File a Claim', 'Understand Your Policy', 'Tax Benefits on Insurance', 'Insurance Glossary'].map(item => (
                <button key={item} onClick={() => toast(`"${item}" article is coming soon`)} className="w-full flex items-center justify-between py-2 text-xs text-slate-600 hover:text-green-600 transition-colors">
                  {item} <ChevronRight size={12} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-green-700">
            <Shield size={12} /> Stay protected! Ensure timely premium payments to keep your policies active.
          </div>
          <Button
            variant="ghost" size="sm" className="text-xs" leftIcon={<Bell size={12} />}
            onClick={() => toast('Reminders are coming soon')}
          >
            Set Payment Reminder
          </Button>
        </div>
      </Card>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePolicy}
        loading={deleting}
        title="Delete this policy?"
        description={deleteTarget ? `"${deleteTarget.policyName}" and its linked nominees will be permanently removed. This can't be undone.` : undefined}
        confirmText="Delete"
      />
    </div>
  )
}
