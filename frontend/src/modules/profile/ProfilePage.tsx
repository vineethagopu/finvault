import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, Lock, Shield, ChevronRight, Edit2, Camera, Check, LogOut, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { API_BASE_URL } from '@/constants'
import toast from 'react-hot-toast'

const PROFILE_TABS = ['Profile', 'Security', 'Notifications', 'Preferences']

interface ProfileData {
  id: string; username: string; email: string; mobile: string
  firstName: string; lastName: string; dateOfBirth?: string
  address?: string; occupation?: string; annualIncome?: number
  planType: string; twoFAEnabled: boolean; emailVerified: boolean; mobileVerified: boolean
  avatarUrl?: string; lastLoginAt?: string; createdAt: string
}

function ProfileTab({ profile, editing, setEditing, onSave }: {
  profile: ProfileData; editing: boolean; setEditing: (v: boolean) => void; onSave: (data: Partial<ProfileData>) => Promise<void>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    firstName: profile.firstName, lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth?.slice(0, 10) ?? '', occupation: profile.occupation ?? '',
    address: profile.address ?? '', annualIncome: profile.annualIncome ? String(profile.annualIncome) : '',
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await authService.uploadAvatar(file)
      toast.success('Avatar updated')
      window.location.reload()
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSaveClick = async () => {
    if (editing) {
      await onSave({
        firstName: form.firstName, lastName: form.lastName,
        dateOfBirth: form.dateOfBirth || undefined, occupation: form.occupation || undefined,
        address: form.address || undefined, annualIncome: form.annualIncome ? Number(form.annualIncome) : undefined,
      })
    }
    setEditing(!editing)
  }

  return (
    <div className="space-y-5">
      <Card padding="md">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar
              name={`${profile.firstName} ${profile.lastName}`}
              src={profile.avatarUrl ? `${API_BASE_URL}/auth/avatar/${profile.avatarUrl}` : undefined}
              size="xl"
            />
            <button
              className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera size={13} className="text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-slate-500">@{profile.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">{profile.planType} Plan</span>
              <span className="text-xs text-slate-400">Member since {formatDate(profile.createdAt)}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" leftIcon={editing ? <Check size={13} /> : <Edit2 size={13} />} className="ml-auto" onClick={handleSaveClick}>
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Personal Information</p>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              <Input label="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
              <Input label="Occupation" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
            </div>
            <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <Input label="Annual Income (₹)" type="number" value={form.annualIncome} onChange={e => setForm({ ...form, annualIncome: e.target.value })} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'First Name', value: profile.firstName },
              { label: 'Last Name', value: profile.lastName },
              { label: 'Username', value: '@' + profile.username },
              { label: 'Date of Birth', value: profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '—' },
              { label: 'Occupation', value: profile.occupation ?? '—' },
              { label: 'Annual Income', value: profile.annualIncome ? `₹${profile.annualIncome.toLocaleString('en-IN')}` : '—' },
            ].map(row => (
              <div key={row.label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">{row.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{row.value}</p>
              </div>
            ))}
            <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400">Address</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile.address ?? '—'}</p>
            </div>
          </div>
        )}
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Contact Information</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email Address</p>
                <p className="text-sm font-semibold text-slate-800">{profile.email}</p>
              </div>
            </div>
            {profile.emailVerified && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={10} />Verified</span>
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Phone size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Mobile Number</p>
                <p className="text-sm font-semibold text-slate-800">+91 {profile.mobile}</p>
              </div>
            </div>
            {profile.mobileVerified && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={10} />Verified</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function SecurityTab({ profile }: { profile: ProfileData }) {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await authService.getSessions()
      return ((res.data as any).data ?? []) as { id: string; deviceInfo?: string; ipAddress?: string; userAgent?: string; createdAt: string; isCurrent: boolean }[]
    },
  })

  const handleLogout = async () => {
    try { await authService.logout() } catch {}
    logout()
    navigate('/login')
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      toast.success('Password changed. Please log in again.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      handleLogout()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const revokeSession = async (id: string) => {
    try {
      await authService.revokeSession(id)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  const deviceLabel = (s: { userAgent?: string }) => {
    const ua = s.userAgent ?? ''
    if (/mobile/i.test(ua)) return '📱'
    return '💻'
  }

  return (
    <div className="space-y-4">
      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Password</p>
        <div className="space-y-3">
          <Input label="Current Password" type="password" placeholder="Enter current password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="New Password" type="password" placeholder="New password" hint="Min 8 chars with letters, numbers & symbols" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            <Input label="Confirm New Password" type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
          </div>
          <Button size="sm" leftIcon={<Lock size={13} />} loading={changingPassword} onClick={handleChangePassword}>Update Password</Button>
        </div>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Two-Factor Authentication</p>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Authenticator App (TOTP)</p>
              <p className="text-xs text-slate-400">Currently {profile.twoFAEnabled ? 'enabled' : 'disabled'}</p>
            </div>
          </div>
          <Button size="sm" variant={profile.twoFAEnabled ? 'outline' : 'primary'} onClick={() => toast('2FA setup coming soon')}>
            {profile.twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
        <p className="text-xs text-slate-400">Two-factor authentication adds an extra layer of security to your account.</p>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Active Sessions</p>
        <div className="space-y-2">
          {sessions.length === 0 && <p className="text-xs text-slate-400">No active sessions found.</p>}
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">{deviceLabel(session)}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{session.userAgent?.slice(0, 40) ?? 'Unknown device'}</p>
                  <p className="text-xs text-slate-400">{session.ipAddress ?? 'Unknown IP'} · {formatDateTime(session.createdAt)}</p>
                </div>
              </div>
              {session.isCurrent ? (
                <span className="text-xs text-green-600 font-medium">Current</span>
              ) : (
                <Button size="xs" variant="outline" className="text-red-600 border-red-200" onClick={() => revokeSession(session.id)}>Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" leftIcon={<LogOut size={14} />} onClick={handleLogout}>
          Sign Out
        </Button>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" leftIcon={<Trash2 size={14} />} onClick={() => toast('Account deletion requires contacting support')}>
          Delete Account
        </Button>
      </div>
    </div>
  )
}

const PREFERENCE_GROUPS = [
  { title: 'Financial Alerts', items: [
    { key: 'premiumDue', label: 'Premium Due Reminders', desc: '7 days, 3 days, and 1 day before due' },
    { key: 'emiDue', label: 'EMI Due Reminders', desc: '5 days before each EMI date' },
    { key: 'policyExpiry', label: 'Policy Expiry Alerts', desc: '30 and 15 days before expiry' },
    { key: 'investmentAlerts', label: 'Investment Updates', desc: 'SIP processed, portfolio milestones' },
  ]},
  { title: 'Reports & Digest', items: [
    { key: 'weeklyDigest', label: 'Weekly Summary', desc: 'Weekly portfolio & premium summary' },
    { key: 'monthlyReport', label: 'Monthly Report', desc: 'Monthly financial health report' },
  ]},
  { title: 'Other', items: [
    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts, password changes' },
    { key: 'promotions', label: 'Promotions & Offers', desc: 'New features and product announcements' },
  ]},
]

function NotificationsSettingsTab() {
  const queryClient = useQueryClient()
  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await authService.getNotificationPreferences()
      return (res.data as any).data as Record<string, boolean>
    },
  })

  const toggle = async (key: string) => {
    if (!prefs) return
    const next = { [key]: !prefs[key] }
    queryClient.setQueryData(['notification-preferences'], { ...prefs, ...next })
    try {
      await authService.updateNotificationPreferences(next)
    } catch {
      toast.error('Failed to update preference')
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    }
  }

  if (isLoading || !prefs) return <DashboardSkeleton />

  return (
    <div className="space-y-4">
      {PREFERENCE_GROUPS.map(group => (
        <Card key={group.title} padding="md">
          <p className="text-sm font-semibold text-slate-800 mb-3">{group.title}</p>
          <div className="space-y-3">
            {group.items.map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${prefs[item.key] ? 'bg-green-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('Profile')
  const [editing, setEditing] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await authService.me()
      return (res.data as any).data as ProfileData
    },
  })

  const handleSaveProfile = async (data: Partial<ProfileData>) => {
    try {
      await authService.updateProfile(data)
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  if (isLoading || !profile) return <DashboardSkeleton />

  const TAB_COMPONENTS: Record<string, React.ReactNode> = {
    'Profile': <ProfileTab profile={profile} editing={editing} setEditing={setEditing} onSave={handleSaveProfile} />,
    'Security': <SecurityTab profile={profile} />,
    'Notifications': <NotificationsSettingsTab />,
    'Preferences': (
      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">App Preferences</p>
        <p className="text-xs text-slate-500 mb-4">These are informational for now — PolicyNext currently supports English, INR and a light theme only.</p>
        <div className="space-y-3">
          {[
            { label: 'Language', value: 'English' },
            { label: 'Currency', value: 'INR (₹)' },
            { label: 'Date Format', value: 'DD MMM YYYY' },
            { label: 'Theme', value: 'Light' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-700">{row.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{row.value}</span>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    ),
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <button className="hover:text-green-600" onClick={() => navigate('/app/dashboard')}>Home</button>
          <span>›</span><span className="text-slate-700">Profile & Settings</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-900">Profile & Settings</h1>
      </motion.div>

      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {TAB_COMPONENTS[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
