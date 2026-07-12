import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, User, Users, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/layout/Logo'

const PLANS = [
  {
    type: 'INDIVIDUAL' as const,
    name: 'Individual Plan',
    icon: User,
    desc: 'Perfect for individuals who want to organize their financial life.',
    logins: '1 Login',
    loginsDesc: 'For one user only',
    price: '₹0',
    pricePeriod: 'year',
    badge: 'FREE',
    features: [
      'Store Unlimited Policies',
      'Track Investments & Loans',
      'Important Documents Vault',
      'Smart Alerts & Reminders',
      'Bank Level Security',
    ],
    cta: 'Create Individual Account',
    ctaDesc: 'Perfect for personal use',
    color: '#16a34a',
    iconBg: '#f0fdf4',
  },
  {
    type: 'FAMILY' as const,
    name: 'Family Plan',
    icon: Users,
    desc: 'Secure and share access with your family members.',
    logins: '5 Logins',
    loginsDesc: 'For up to 5 family members',
    price: '₹0',
    pricePeriod: 'year',
    badge: 'FREE',
    features: [
      'Everything in Individual Plan',
      'Up to 5 Family Logins',
      'Family Access & Permissions',
      'Emergency Access',
      'Activity Logs & Audit Trail',
      'Priority Support',
    ],
    cta: 'Create Family Account',
    ctaDesc: 'Ideal for families',
    color: '#7c3aed',
    iconBg: '#f5f3ff',
  },
]

const TRUST = [
  { icon: '🔒', label: '100% Secure', desc: '256-bit encryption & bank-level security' },
  { icon: '👥', label: 'Trusted by Thousands', desc: 'Families across India trust PolicyNext' },
  { icon: '🛡️', label: 'Your Privacy Matters', desc: 'We never share your data with anyone' },
  { icon: '💬', label: "We're Here to Help", desc: 'Get support whenever you need it' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planFromQuery = searchParams.get('plan') as 'INDIVIDUAL' | 'FAMILY' | null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/20">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How It Works', 'About Us', 'Pricing', 'Blog', 'Contact'].map(item => (
              <Link key={item} to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">{item}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Shield size={12} className="text-green-600" /> Bank Level Security
            </div>
            <div className="w-px h-4 bg-slate-200 hidden sm:block" />
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-16 px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700 mb-4">
            🎁 LAUNCHING OFFER
          </div>
          <h1 className="text-3xl font-bold text-[#0f2952]">
            Choose Your Plan. <span className="text-green-600">Create Your Account.</span>
          </h1>
          <p className="mt-2 text-slate-600">Select the plan that fits your needs and get started with PolicyNext.</p>
          <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700 max-w-sm mx-auto">
            🎁 <span><span className="font-bold">Launching Offer: 100% Free for Everyone</span><br />
            <span className="text-xs font-normal text-green-600">All features. No hidden charges. Cancel anytime.</span></span>
          </div>
        </motion.div>

        {/* Plan cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.type}
                className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: plan.iconBg }}>
                    <Icon size={22} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                  <Icon size={18} style={{ color: plan.color }} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{plan.logins}</p>
                    <p className="text-xs text-slate-500">{plan.loginsDesc}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                  <span className="text-sm text-slate-400 line-through">₹0</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: plan.iconBg, color: plan.color }}>
                    {plan.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold mb-4" style={{ color: plan.color }}>Currently Free</p>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  style={{ backgroundColor: plan.color, borderColor: plan.color }}
                  onClick={() => navigate(`/register/${plan.type.toLowerCase()}?plan=${plan.type}`)}
                  rightIcon={<ArrowRight size={16} />}
                >
                  {plan.cta}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-2">{plan.ctaDesc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Trust row */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {TRUST.map(({ icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">Login</Link>
        </p>
      </div>
    </div>
  )
}
