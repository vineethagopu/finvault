import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Mail, Lock, Bell, Shield, ChevronRight, Edit2, Camera, Check, LogOut, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/utils/formatters'

const PROFILE_TABS = ['Profile', 'Security', 'Notifications', 'Preferences']

const MOCK_USER = {
  firstName: 'Ravi',
  lastName: 'Sharma',
  email: 'ravi.sharma@email.com',
  mobile: '9876543210',
  username: 'ravi.sharma',
  dateOfBirth: '1988-07-15',
  address: 'Flat 401, Green Valley Apts, Kondapur, Hyderabad - 500084',
  occupation: 'Software Engineer',
  annualIncome: '₹18 LPA',
  memberSince: '2024-06-01',
  planType: 'Individual',
  twoFAEnabled: false,
  emailVerified: true,
  mobileVerified: true,
}

function ProfileTab({ editing, setEditing }: { editing: boolean; setEditing: (v: boolean) => void }) {
  return (
    <div className="space-y-5">
      {/* Avatar section */}
      <Card padding="md">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={`${MOCK_USER.firstName} ${MOCK_USER.lastName}`} size="xl" />
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{MOCK_USER.firstName} {MOCK_USER.lastName}</h2>
            <p className="text-sm text-slate-500">@{MOCK_USER.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">{MOCK_USER.planType} Plan</span>
              <span className="text-xs text-slate-400">Member since {formatDate(MOCK_USER.memberSince)}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" leftIcon={editing ? <Check size={13} /> : <Edit2 size={13} />} className="ml-auto" onClick={() => setEditing(!editing)}>
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      {/* Personal info */}
      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Personal Information</p>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="First Name" defaultValue={MOCK_USER.firstName} />
              <Input label="Last Name" defaultValue={MOCK_USER.lastName} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Date of Birth" type="date" defaultValue={MOCK_USER.dateOfBirth} />
              <Input label="Occupation" defaultValue={MOCK_USER.occupation} />
            </div>
            <Input label="Address" defaultValue={MOCK_USER.address} />
            <Input label="Annual Income" defaultValue={MOCK_USER.annualIncome} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'First Name', value: MOCK_USER.firstName },
              { label: 'Last Name', value: MOCK_USER.lastName },
              { label: 'Username', value: '@' + MOCK_USER.username },
              { label: 'Date of Birth', value: formatDate(MOCK_USER.dateOfBirth) },
              { label: 'Occupation', value: MOCK_USER.occupation },
              { label: 'Annual Income', value: MOCK_USER.annualIncome },
            ].map(row => (
              <div key={row.label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400">{row.label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{row.value}</p>
              </div>
            ))}
            <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400">Address</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{MOCK_USER.address}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Contact */}
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
                <p className="text-sm font-semibold text-slate-800">{MOCK_USER.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {MOCK_USER.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={10} />Verified</span>
              )}
              <Button size="xs" variant="ghost">Change</Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Phone size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Mobile Number</p>
                <p className="text-sm font-semibold text-slate-800">+91 {MOCK_USER.mobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {MOCK_USER.mobileVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={10} />Verified</span>
              )}
              <Button size="xs" variant="ghost">Change</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SecurityTab() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-4">
      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Password</p>
        <div className="space-y-3">
          <Input label="Current Password" type="password" placeholder="Enter current password" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="New Password" type="password" placeholder="New password" hint="Min 8 chars with letters, numbers & symbols" />
            <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
          </div>
          <Button size="sm" leftIcon={<Lock size={13} />}>Update Password</Button>
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
              <p className="text-xs text-slate-400">Currently {MOCK_USER.twoFAEnabled ? 'enabled' : 'disabled'}</p>
            </div>
          </div>
          <Button size="sm" variant={MOCK_USER.twoFAEnabled ? 'outline' : 'primary'}>
            {MOCK_USER.twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
        <p className="text-xs text-slate-400">Two-factor authentication adds an extra layer of security to your account.</p>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">Active Sessions</p>
        <div className="space-y-2">
          {[
            { device: 'Chrome on Windows 11', location: 'Hyderabad, IN', time: 'Current session', current: true },
            { device: 'Safari on iPhone 15', location: 'Hyderabad, IN', time: '2 hours ago', current: false },
            { device: 'Chrome on MacBook', location: 'Hyderabad, IN', time: '1 day ago', current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">{i === 1 ? '📱' : '💻'}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{session.device}</p>
                  <p className="text-xs text-slate-400">{session.location} · {session.time}</p>
                </div>
              </div>
              {session.current ? (
                <span className="text-xs text-green-600 font-medium">Current</span>
              ) : (
                <Button size="xs" variant="outline" className="text-red-600 border-red-200">Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" leftIcon={<LogOut size={14} />} onClick={handleLogout}>
          Sign Out
        </Button>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" leftIcon={<Trash2 size={14} />}>
          Delete Account
        </Button>
      </div>
    </div>
  )
}

function NotificationsSettingsTab() {
  const [settings, setSettings] = useState({
    premiumDue: true, emiDue: true, policyExpiry: true, investmentAlerts: true,
    weeklyDigest: false, monthlyReport: true, promotions: false, securityAlerts: true,
  })

  const toggle = (key: keyof typeof settings) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

  const groups = [
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

  return (
    <div className="space-y-4">
      {groups.map(group => (
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
                  onClick={() => toggle(item.key as keyof typeof settings)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-green-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'}`} />
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
  const [activeTab, setActiveTab] = useState('Profile')
  const [editing, setEditing] = useState(false)

  const TAB_COMPONENTS: Record<string, React.ReactNode> = {
    'Profile': <ProfileTab editing={editing} setEditing={setEditing} />,
    'Security': <SecurityTab />,
    'Notifications': <NotificationsSettingsTab />,
    'Preferences': (
      <Card padding="md">
        <p className="text-sm font-semibold text-slate-800 mb-4">App Preferences</p>
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
