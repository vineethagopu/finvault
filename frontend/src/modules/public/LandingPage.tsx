import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Bell, FileText, TrendingUp, Users, Lock,
  ChevronRight, Star, CheckCircle, ArrowRight, Play,
  Target, Eye, Award, Zap, Download, Headphones,
  ChevronDown, Menu, X, Search, Mail, Phone,
  MessageCircle, MapPin, Gift, Settings, UserPlus,
  FolderOpen, BookOpen, Clock, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/layout/Logo'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' })
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features',     id: 'features'    },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'About Us',     id: 'about'        },
  { label: 'Pricing',      id: 'pricing'      },
  { label: 'Blog',         id: 'blog'         },
  { label: 'Contact',      id: 'contact'      },
]

const STATS = [
  { value: '50,000+',    label: 'Active Users'     },
  { value: '₹2,500 Cr+', label: 'Policies Tracked' },
  { value: '99.9%',      label: 'Uptime SLA'       },
  { value: '4.8★',       label: 'User Rating'      },
]

const FEATURES_GRID = [
  { icon: FileText,   title: 'All Policies in\nOne Place',          desc: 'Store and manage all your insurance policies securely in one organised dashboard.',                        bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { icon: TrendingUp, title: 'Track Investments\n& Loans',          desc: 'Monitor your investments, loans, FDs, bonds, and other assets effortlessly.',                              bg: 'bg-blue-50',    color: 'text-blue-600'    },
  { icon: Users,      title: 'Family Access\nAfter You',            desc: 'Nominate trusted family members to access your information when needed.',                                   bg: 'bg-violet-50',  color: 'text-violet-600'  },
  { icon: FolderOpen, title: 'Important Documents\nVault',          desc: 'Upload and store important documents like PAN, Aadhaar, will, and bank details securely.',                  bg: 'bg-orange-50',  color: 'text-orange-600'  },
  { icon: Bell,       title: 'Smart Alerts\n& Reminders',           desc: 'Never miss a premium, EMI, or maturity date with timely reminders and alerts.',                            bg: 'bg-rose-50',    color: 'text-rose-600'    },
  { icon: Shield,     title: 'Bank Level\nSecurity',                desc: 'Your data is protected with 256-bit encryption and strict security standards.',                             bg: 'bg-teal-50',    color: 'text-teal-600'    },
  { icon: Download,   title: 'Easy Export\n& Sharing',              desc: 'Export your data or share specific information securely with your family.',                                 bg: 'bg-sky-50',     color: 'text-sky-600'     },
  { icon: Headphones, title: '24/7 Support\nYou Can Trust',         desc: 'Our support team is always here to help you, whenever you need us.',                                       bg: 'bg-amber-50',   color: 'text-amber-600'   },
]

const HOW_STEPS = [
  { n: '1', icon: UserPlus,   title: 'Create Your Account',         desc: 'Sign up with your mobile number or email and verify with OTP. It takes less than a minute.' },
  { n: '2', icon: FolderOpen, title: 'Add & Organize Everything',   desc: 'Add your policies, investments, loans, bank accounts and important documents in one secure place.' },
  { n: '3', icon: Users,      title: 'Nominate Your Family',        desc: 'Choose trusted family members who can access your information when they need it.' },
  { n: '4', icon: Bell,       title: 'Stay Notified & In Control',  desc: 'Get reminders for premiums, EMIs, maturity dates and important updates so you never miss a deadline.' },
  { n: '5', icon: Shield,     title: 'Give Access When Needed',     desc: 'In case something happens to you, your family can securely access everything you\'ve organised.' },
]

const INDIVIDUAL_FEATURES = [
  'Store Unlimited Policies', 'Track Investments & Loans',
  'Important Documents Vault', 'Smart Alerts & Reminders', 'Bank Level Security',
]
const FAMILY_FEATURES = [
  'Everything in Individual Plan', 'Up to 5 Family Logins',
  'Family Access & Permissions', 'Emergency Access',
  'Activity Logs & Audit Trail', 'Priority Support',
]

const BLOG_POSTS = [
  { cat: 'Family Security', title: 'Why Every Family Needs a Financial Safety Net',        desc: "Life is unpredictable. Here's how being prepared today can secure your family's tomorrow.", date: 'May 10, 2024', mins: '5 min read' },
  { cat: 'Insurance',       title: 'How to Keep All Your Insurance Policies Organised',    desc: 'A simple guide to storing and managing all your insurance documents in one place.',          date: 'May 6, 2024',  mins: '4 min read' },
  { cat: 'Investments',     title: "Beginner's Guide to Tracking Investments",             desc: 'Smart tracking today leads to better financial decisions tomorrow.',                          date: 'May 2, 2024',  mins: '6 min read' },
  { cat: 'Financial Planning', title: 'Documents You Should Save (And Why)',              desc: 'A checklist of important documents every individual and family should keep secure.',          date: 'Apr 28, 2024', mins: '5 min read' },
  { cat: 'Family Security', title: 'Nominate Smart: Choosing the Right Family Members',   desc: 'How to choose trusted family members and set the right access for them.',                    date: 'Apr 24, 2024', mins: '4 min read' },
  { cat: 'Product Updates', title: "What's New in PolicyNext",                            desc: 'Exciting new features to make managing your financial life even easier.',                     date: 'Apr 20, 2024', mins: '3 min read' },
]

const BLOG_TABS = ['All Posts', 'Insurance', 'Investments', 'Family Security', 'Financial Planning', 'Product Updates']

const FAQS = [
  { q: 'Is PolicyNext free to use?',                    a: 'Yes! Both Individual and Family plans are completely free during our launch period. No credit card required, no hidden charges.' },
  { q: 'How secure is my data?',                        a: 'We use 256-bit AES encryption, bank-level security, and HttpOnly cookies. Your data is never shared with third parties.' },
  { q: 'Can I import existing policies automatically?',  a: "We're working on auto-import via DigiLocker and insurance aggregators. Currently, you can add policies manually in under 2 minutes." },
  { q: 'Is the mobile app available?',                  a: 'Our progressive web app works seamlessly on mobile. Native iOS and Android apps are coming in Q3 2025.' },
]

// ─── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-bold text-emerald-700 uppercase tracking-widest mb-4">
      {children}
    </div>
  )
}

// ─── Illustration placeholders ───────────────────────────────────────────────

function FamilyIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="relative flex items-end justify-center gap-2 pb-4">
          {/* Father */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center"><Users size={20} className="text-blue-600" /></div>
            <div className="w-8 h-16 bg-blue-100 rounded-t-xl" />
          </div>
          {/* Mother */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center"><Users size={20} className="text-pink-600" /></div>
            <div className="w-8 h-16 bg-pink-100 rounded-t-xl" />
          </div>
          {/* Child */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center"><Users size={14} className="text-amber-600" /></div>
            <div className="w-6 h-10 bg-amber-100 rounded-t-xl" />
          </div>
          {/* Shield badge */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-100">
            <Shield size={20} className="text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Laptop */}
      <div className="bg-slate-800 rounded-xl p-2 shadow-2xl">
        <div className="bg-white rounded-lg p-3 min-h-[160px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="flex-1 h-2 bg-slate-100 rounded ml-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Policies', val: '12', icon: Shield, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Investments', val: '8', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
              { label: 'Family Members', val: '3', icon: Users, color: 'bg-violet-100 text-violet-700' },
              { label: 'Documents', val: '24', icon: FileText, color: 'bg-orange-100 text-orange-700' },
            ].map(c => (
              <div key={c.label} className={`rounded-lg p-2 ${c.color.split(' ')[0]}`}>
                <c.icon size={12} className={c.color.split(' ')[1]} />
                <p className="text-[10px] font-bold mt-1">{c.val}</p>
                <p className="text-[8px] text-slate-500">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-b-xl mt-1" />
      </div>
      {/* Floating security badge */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-2.5 border border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Lock size={13} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-800 whitespace-nowrap">Your data is</p>
          <p className="text-[9px] text-emerald-600 font-semibold">secure with us</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LandingPage() {
  const [scrolled, setScrolled]           = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [openFaq, setOpenFaq]             = useState<number | null>(null)
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [blogTab, setBlogTab]             = useState('All Posts')
  const [email, setEmail]                 = useState('')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const els = NAV_LINKS.map(n => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }) },
      { threshold: 0.25 },
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const filteredPosts = blogTab === 'All Posts' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.cat === blogTab)

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ╔══════════════════════════════════════════════════╗
          ║  NAVBAR — always white                          ║
          ╚══════════════════════════════════════════════════╝ */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 transition-shadow duration-300 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.07)]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
          <div className="shrink-0"><Logo size="sm" /></div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(({ label, id }) => {
              const active = activeSection === id
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${active ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {label}
                  {active && (
                    <motion.span layoutId="underline" className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-emerald-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right: badge + Login */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-500">
              <Shield size={12} className="text-emerald-600" />Bank Level Security
            </div>
            <Link to="/login">
              <button className="px-5 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all">Login</button>
            </Link>
          </div>

          {/* Tablet */}
          <div className="hidden md:flex lg:hidden items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 text-[11px] font-medium text-slate-400">
              <Shield size={11} className="text-emerald-600" />Bank Level Security
            </div>
            <Link to="/login"><button className="px-4 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">Login</button></Link>
            <button onClick={() => setMobileOpen(v => !v)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/login"><button className="px-3 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg">Login</button></Link>
            <button onClick={() => setMobileOpen(v => !v)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" aria-label="Menu">
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden overflow-hidden bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-4 py-2.5 space-y-0.5">
                {NAV_LINKS.map(({ label, id }) => (
                  <button key={id} onClick={() => { scrollTo(id); setMobileOpen(false) }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg">
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ╔══════════════════════════════════════════════════╗
          ║  HERO — white banner                            ║
          ╚══════════════════════════════════════════════════╝ */}
      <section className="relative bg-white overflow-hidden" style={{ paddingTop: 68 }}>

        {/* ── Main content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0 items-center min-h-[calc(82vh-68px)]">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65 }}
              className="py-10 sm:py-14 lg:py-0 pr-0 lg:pr-8 xl:pr-14 flex flex-col gap-0"
            >
              {/* Logo — hero-sized */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #16a34a 100%)' }}>
                  <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 sm:w-8 sm:h-8">
                    <path d="M16 3L4 8v8c0 6.6 4.8 12.8 12 14 7.2-1.2 12-7.4 12-14V8L16 3z"
                      fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M11 16l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  <span className="text-[#1a3a6b]">Policy</span><span className="text-emerald-500">Next</span>
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-[3.2rem] sm:text-[4.5rem] lg:text-[5.2rem] xl:text-[6rem] font-extrabold text-[#0c2340] leading-none mb-1 tracking-tight">
                Welcome
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-5">
                <span className="text-[#0c2340]">to </span>
                <span className="text-emerald-500">PolicyNext</span>
              </h2>

              {/* Green divider line */}
              <div className="w-16 h-1 bg-emerald-500 rounded-full mb-5 sm:mb-6" />

              {/* Subtext */}
              <p className="text-slate-500 text-base sm:text-lg mb-1 leading-relaxed">Your All-in-One Platform for</p>
              <p className="text-[#0c2340] font-bold text-lg sm:text-xl mb-7 sm:mb-9">Insurance, Investments &amp; Loans</p>

              {/* 4 feature badges */}
              <div className="flex items-stretch divide-x divide-slate-200 border border-slate-200 rounded-2xl bg-slate-50/80 overflow-hidden w-fit max-w-full">
                {[
                  { icon: Shield,      label: 'Secure'          },
                  { icon: TrendingUp,  label: 'Smart'           },
                  { icon: Users,       label: 'Customer First'  },
                  { icon: Zap,         label: 'Fast & Simple'   },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 px-4 sm:px-6 py-3 sm:py-4 min-w-0">
                    <Icon size={22} className="text-[#0c2340] shrink-0" strokeWidth={1.5} />
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-600 whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Shield illustration */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
              className="relative flex items-center justify-center pb-0 lg:pb-0 pt-4 lg:pt-0"
            >
              {/* Blue dots decoration */}
              <div className="absolute bottom-8 right-0 w-28 h-28 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #1e40af 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />

              {/* Shield SVG */}
              <svg
                viewBox="0 0 420 480"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-none lg:w-[90%] xl:w-[85%]"
                style={{ filter: 'drop-shadow(0 24px 64px rgba(22,163,74,0.18))' }}
              >
                <defs>
                  <linearGradient id="shBorder" x1="1" y1="0" x2="0.1" y2="1">
                    <stop offset="0%"   stopColor="#bbf7d0" />
                    <stop offset="25%"  stopColor="#4ade80" />
                    <stop offset="60%"  stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                  <linearGradient id="shBorder2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                  <clipPath id="shClip">
                    <path d="M210 28 C210 28 388 88 390 90 L390 255 Q386 398 210 450 Q34 398 30 255 L30 90 C32 88 210 28 210 28 Z" />
                  </clipPath>
                  <linearGradient id="shSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#dbeafe" />
                    <stop offset="45%"  stopColor="#bfdbfe" />
                    <stop offset="75%"  stopColor="#a5f3fc" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#bbf7d0" />
                  </linearGradient>
                  <linearGradient id="shGround" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#86efac" />
                    <stop offset="100%" stopColor="#4ade80" />
                  </linearGradient>
                </defs>

                {/* White fill + thick gradient border */}
                <path
                  d="M210 28 C210 28 388 88 390 90 L390 255 Q386 398 210 450 Q34 398 30 255 L30 90 C32 88 210 28 210 28 Z"
                  fill="white"
                  stroke="url(#shBorder)"
                  strokeWidth="18"
                  strokeLinejoin="round"
                />

                {/* Interior scene */}
                <g clipPath="url(#shClip)">
                  {/* Sky */}
                  <rect x="30" y="28" width="370" height="435" fill="url(#shSky)" />

                  {/* Distant city skyline */}
                  <rect x="55"  y="248" width="16" height="68" fill="rgba(148,163,184,0.35)" rx="2" />
                  <rect x="76"  y="230" width="22" height="86" fill="rgba(148,163,184,0.3)"  rx="2" />
                  <rect x="104" y="242" width="14" height="74" fill="rgba(148,163,184,0.25)" rx="2" />
                  <rect x="124" y="252" width="18" height="64" fill="rgba(148,163,184,0.2)"  rx="2" />
                  <rect x="266" y="238" width="20" height="78" fill="rgba(148,163,184,0.25)" rx="2" />
                  <rect x="292" y="225" width="25" height="91" fill="rgba(148,163,184,0.3)"  rx="2" />
                  <rect x="323" y="244" width="16" height="72" fill="rgba(148,163,184,0.2)"  rx="2" />
                  <rect x="344" y="232" width="20" height="84" fill="rgba(148,163,184,0.25)" rx="2" />

                  {/* Ground hills */}
                  <path d="M30 340 Q150 300 210 320 Q290 295 390 335 L390 470 L30 470 Z" fill="url(#shGround)" opacity="0.75" />
                  <path d="M30 358 Q160 322 220 342 Q300 318 390 352 L390 470 L30 470 Z" fill="#4ade80" opacity="0.55" />
                  <path d="M30 375 Q180 350 210 360 Q260 348 390 370 L390 470 L30 470 Z" fill="#22c55e" opacity="0.4" />

                  {/* Father silhouette (left, tallest) */}
                  <g opacity="0.88">
                    <circle cx="148" cy="266" r="18" fill="#1e3a8a" />
                    <path d="M127 286 Q148 280 169 286 L175 370 Q148 365 121 370 Z" fill="#1e40af" />
                    <line x1="121" y1="318" x2="110" y2="372" stroke="#1e40af" strokeWidth="14" strokeLinecap="round" />
                    <line x1="175" y1="318" x2="186" y2="372" stroke="#1e40af" strokeWidth="14" strokeLinecap="round" />
                  </g>

                  {/* Child silhouette (center, shortest) */}
                  <g opacity="0.82">
                    <circle cx="210" cy="290" r="13" fill="#1e3a8a" />
                    <path d="M195 303 Q210 298 225 303 L229 362 Q210 358 191 362 Z" fill="#2563eb" />
                    <line x1="191" y1="330" x2="183" y2="363" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
                    <line x1="229" y1="330" x2="237" y2="363" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
                  </g>

                  {/* Mother silhouette (right) */}
                  <g opacity="0.84">
                    <circle cx="270" cy="272" r="16" fill="#312e81" />
                    <path d="M251 289 Q270 284 289 289 L294 368 Q270 363 246 368 Z" fill="#3730a3" />
                    <line x1="246" y1="320" x2="236" y2="370" stroke="#3730a3" strokeWidth="12" strokeLinecap="round" />
                    <line x1="294" y1="320" x2="304" y2="370" stroke="#3730a3" strokeWidth="12" strokeLinecap="round" />
                  </g>

                  {/* Holding hands */}
                  <path d="M169 342 Q190 350 195 356" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.7" />
                  <path d="M225 356 Q232 350 251 344" stroke="#3730a3" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.7" />
                </g>
              </svg>
            </motion.div>
          </div>
        </div>

        {/* ── Wave + Dark footer bar ── */}
        <div className="relative -mt-1">
          {/* SVG wave */}
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full block" style={{ height: '50px' }}>
            <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" fill="#0c2340" />
          </svg>

          {/* Dark bar */}
          <div className="bg-[#0c2340] py-4 sm:py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">

              {/* Left tagline */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 border-2 border-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-emerald-400" />
                </div>
                <div className="w-px h-10 bg-emerald-600 hidden sm:block" />
                <div>
                  <p className="text-white font-bold text-sm sm:text-base leading-tight">Secure Today. Better Tomorrow.</p>
                  <p className="text-white/45 text-xs mt-0.5">Building a safer and smarter tomorrow for you and your loved ones.</p>
                </div>
              </div>

              {/* Right: 4 category icons */}
              <div className="flex items-stretch divide-x divide-white/10 shrink-0">
                {[
                  { icon: Shield,     label: 'Insurance'     },
                  { icon: TrendingUp, label: 'Investments'   },
                  { icon: FileText,   label: 'Loans'         },
                  { icon: Users,      label: 'Beneficiaries' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} onClick={() => scrollTo('features')}
                    className="flex flex-col items-center gap-1.5 px-4 sm:px-6 py-1.5 hover:bg-white/5 transition-colors">
                    <Icon size={20} className="text-white/70" strokeWidth={1.5} />
                    <span className="text-[10px] sm:text-xs text-white/50 whitespace-nowrap">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-5 sm:gap-12 flex-wrap">
          {[{ icon: Lock, label: '256-bit AES Encryption' }, { icon: Shield, label: 'Bank-Level Security' }, { icon: CheckCircle, label: 'CERT-In Compliant' }, { icon: Users, label: '50,000+ Users Trust Us' }].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-slate-400">
              <Icon size={13} className="text-emerald-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════╗
          ║  FEATURES                                       ║
          ╚══════════════════════════════════════════════════╝ */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f5fdf9]">
        {/* Decorative sparkles */}
        <div className="absolute pointer-events-none select-none text-emerald-200 hidden lg:block" style={{ left: '8%', top: '35%' }}>✦</div>
        <div className="absolute pointer-events-none select-none text-emerald-200 hidden lg:block" style={{ right: '10%', top: '50%' }}>✦</div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <SectionLabel><Star size={11} />Powerful Features for Complete Peace of Mind</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c2340] mb-4 leading-tight">
              Everything You Need.<br />
              <span className="text-[#0c2340]">Protection That Lasts </span>
              <span className="text-emerald-600">Beyond You.</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              PolicyNext helps you organise your financial life in one place and ensures your family has access when they need it the most.
            </p>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
            {FEATURES_GRID.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white p-6 sm:p-7 hover:bg-emerald-50/40 transition-colors group"
              >
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="text-sm sm:text-[15px] font-bold text-[#0c2340] mb-2 leading-snug whitespace-pre-line">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-10 rounded-2xl bg-[#0c2340] overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 py-7 sm:py-8 gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Shield size={26} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white">Secure Today. Secure Tomorrow.</h4>
                  <p className="text-white/50 text-sm mt-0.5">Take control of your financial life and give your family the security they deserve.</p>
                </div>
              </div>
              <Link to="/register" className="shrink-0">
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/30 whitespace-nowrap">
                  Get Started Now <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  HOW IT WORKS                                   ║
          ╚══════════════════════════════════════════════════╝ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Top split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 sm:mb-20">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionLabel><Settings size={11} />Simple. Secure. Built for Families.</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-[#0c2340] mb-4 leading-tight">
                How <span className="text-[#0c2340]">PolicyNext</span> Works
              </h2>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
                We make it simple to organise your financial life and ensure your family has access when they need it the most.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <DashboardMockup className="max-w-sm mx-auto" />
            </motion.div>
          </div>

          {/* 5 steps */}
          <div className="mb-10 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-[#0c2340]">Get started in 5 simple steps</h3>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-9 left-[10%] right-[10%] h-px bg-emerald-100" />
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
              {HOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <div className="w-[72px] h-[72px] bg-emerald-50 rounded-full flex items-center justify-center border-2 border-emerald-100">
                      <step.icon size={26} className="text-emerald-600" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                      {step.n}
                    </span>
                  </div>
                  {/* Arrow */}
                  {i < HOW_STEPS.length - 1 && (
                    <div className="hidden sm:flex lg:hidden absolute" style={{ right: '-12px', top: '28px' }}>
                      <ArrowRight size={14} className="text-emerald-300" />
                    </div>
                  )}
                  <h4 className="text-sm font-bold text-[#0c2340] mb-1.5 leading-snug">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Peace of mind CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl bg-[#f5fdf9] border border-emerald-100 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                <Shield size={36} className="text-emerald-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg sm:text-xl font-bold text-[#0c2340] mb-1">Peace of mind today. Security for their tomorrow.</h4>
                <p className="text-slate-500 text-sm mb-3">Take control of your financial life and protect what matters most.</p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {['Bank level security', '256-bit encryption', 'Your privacy matters', 'Trusted by thousands'].map(t => (
                    <span key={t} className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <CheckCircle size={12} className="text-emerald-500" />{t}
                    </span>
                  ))}
                </div>
              </div>
              <Link to="/register" className="shrink-0">
                <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all whitespace-nowrap">
                  Get Started Now <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  ABOUT US                                       ║
          ╚══════════════════════════════════════════════════╝ */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f5fdf9]">
        <div className="max-w-6xl mx-auto">

          {/* Hero split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 sm:mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <SectionLabel>About PolicyNext</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold leading-tight mb-5">
                <span className="text-[#0c2340]">Built with a simple belief:</span><br />
                <span className="text-emerald-600">Your family's tomorrow</span><br />
                <span className="text-emerald-600">matters today.</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base lg:text-lg leading-relaxed">
                PolicyNext was created to help families organise their financial life in one secure place and ensure their loved ones are never left searching when it matters most.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <FamilyIllustration className="h-56 sm:h-72 w-full" />
            </motion.div>
          </div>

          {/* Mission + Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-14">
            {[
              { icon: Target, title: 'Our Mission', color: 'bg-emerald-100 text-emerald-700', desc: 'To empower individuals and families to take control of their financial life by providing a simple, secure and intelligent platform to manage, protect and share what matters most.' },
              { icon: Eye,    title: 'Our Vision',  color: 'bg-blue-100 text-blue-700',     desc: 'To be the most trusted financial organisation platform that brings peace of mind to every family, today and for generations to come.' },
            ].map(card => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${card.color.split(' ')[0]} rounded-xl flex items-center justify-center shrink-0`}>
                  <card.icon size={22} className={card.color.split(' ')[1]} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0c2340] mb-2">{card.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Our Values */}
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0c2340]">Our Values</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
            {[
              { icon: Shield,  title: 'Security First',        desc: 'Your data is protected with bank-level security and 256-bit encryption.',                    bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { icon: Users,   title: 'Family Focused',        desc: 'Everything we build is designed to protect and empower families.',                           bg: 'bg-blue-50',    color: 'text-blue-600'    },
              { icon: Zap,     title: 'Simplicity',            desc: 'We believe powerful protection should be simple and easy to use.',                           bg: 'bg-violet-50',  color: 'text-violet-600'  },
              { icon: Award,   title: 'Trust & Transparency',  desc: 'We are committed to being transparent, reliable and always accessible.',                    bg: 'bg-orange-50',  color: 'text-orange-600'  },
            ].map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center sm:text-left">
                <div className={`w-11 h-11 ${v.bg} rounded-xl flex items-center justify-center mb-3 mx-auto sm:mx-0`}>
                  <v.icon size={20} className={v.color} />
                </div>
                <h4 className="text-sm font-bold text-[#0c2340] mb-1.5">{v.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden">
            {[
              { icon: Shield,   val: '10K+',   label: 'Families Trust Us'    },
              { icon: Users,    val: '50K+',   label: 'Lives Protected'      },
              { icon: FileText, val: '1M+',    label: 'Documents Secured'    },
              { icon: Lock,     val: '99.99%', label: 'Uptime & Reliability' },
            ].map(s => (
              <div key={s.label} className="bg-[#0c2340] py-6 sm:py-7 px-4 flex flex-col sm:flex-row items-center sm:gap-4 gap-2 justify-center">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon size={18} className="text-emerald-400" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl font-extrabold text-white leading-none">{s.val}</p>
                  <p className="text-xs text-white/50 mt-0.5 whitespace-nowrap">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-8 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 sm:px-10 py-7 sm:py-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0"><Users size={26} className="text-emerald-600" /></div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#0c2340]">We're here to help you secure what matters most.</h4>
                  <p className="text-slate-500 text-sm mt-0.5">Have questions or want to learn more? We're just a message away.</p>
                </div>
              </div>
              <button onClick={() => scrollTo('contact')} className="flex items-center gap-2 px-6 py-3 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-xl text-sm hover:bg-emerald-50 transition-all whitespace-nowrap shrink-0">
                Contact Us <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  PRICING                                        ║
          ╚══════════════════════════════════════════════════╝ */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(16,185,129,0.06), transparent)' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-10">
            <div className="flex-1 text-center lg:text-left">
              <SectionLabel><Gift size={11} />Launching Offer</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-[#0c2340] leading-tight mb-4">
                Choose Your Plan.<br />
                <span className="text-[#0c2340]">Create Your Account.</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base">Select the plan that fits your needs and get started with PolicyNext.</p>
            </div>
            <div className="hidden lg:flex items-center justify-center w-64">
              <FamilyIllustration className="h-48 w-full" />
            </div>
          </div>

          {/* Launch offer banner */}
          <div className="flex items-center gap-3 p-4 bg-[#f5fdf9] border border-emerald-100 rounded-xl mb-8">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0"><Gift size={18} className="text-emerald-600" /></div>
            <div>
              <p className="text-sm font-bold text-emerald-700">Launching Offer: 100% Free for Everyone</p>
              <p className="text-xs text-slate-500">All features. No hidden charges. Cancel anytime.</p>
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Individual */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0c2340]">Individual Plan</h3>
                    <p className="text-sm text-slate-500">Perfect for individuals who want to organise their financial life.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-1 pb-5 border-b border-slate-100">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center"><Users size={16} className="text-emerald-600" /></div>
                  <div>
                    <p className="text-base font-bold text-[#0c2340]">1 Login</p>
                    <p className="text-xs text-slate-400">Access for one user only</p>
                  </div>
                </div>
                <div className="py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-[#0c2340]">₹0</span>
                    <span className="line-through text-slate-300 text-sm">₹0</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">FREE</span>
                  </div>
                  <p className="text-emerald-600 text-sm font-semibold mt-1">Currently Free</p>
                </div>
                <ul className="space-y-2.5 py-5">
                  {INDIVIDUAL_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                <Link to="/register">
                  <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                    Get Started Free <ArrowRight size={15} />
                  </button>
                </Link>
                <p className="text-center text-xs text-slate-400 mt-2.5">No credit card required</p>
              </div>
            </motion.div>

            {/* Family */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Users size={24} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0c2340]">Family Plan</h3>
                    <p className="text-sm text-slate-500">Secure and share access with your family members.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-1 pb-5 border-b border-slate-100">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center"><Users size={16} className="text-violet-600" /></div>
                  <div>
                    <p className="text-base font-bold text-[#0c2340]">5 Logins</p>
                    <p className="text-xs text-slate-400">Access for up to 5 family members</p>
                  </div>
                </div>
                <div className="py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-extrabold text-[#0c2340]">₹0</span>
                    <span className="line-through text-slate-300 text-sm">₹0</span>
                    <span className="px-2.5 py-0.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">FREE</span>
                  </div>
                  <p className="text-violet-600 text-sm font-semibold mt-1">Currently Free</p>
                </div>
                <ul className="space-y-2.5 py-5">
                  {FAMILY_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle size={15} className="text-violet-500 shrink-0" />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                <Link to="/register/family">
                  <button className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20">
                    Get Started Free <ArrowRight size={15} />
                  </button>
                </Link>
                <p className="text-center text-xs text-slate-400 mt-2.5">No credit card required</p>
              </div>
            </motion.div>
          </div>

          {/* Trust badges row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[{ icon: Lock, title: '100% Secure', sub: '256-bit encryption & bank-level security' }, { icon: Users, title: 'Trusted by Thousands', sub: 'Families across India trust PolicyNext' }, { icon: Shield, title: 'Your Privacy Matters', sub: 'We never share your data with anyone' }, { icon: MessageCircle, title: "We're Here to Help", sub: 'Get support whenever you need it' }].map(b => (
              <div key={b.title} className="flex items-start gap-3 p-4 bg-[#f5fdf9] rounded-xl border border-emerald-50">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0"><b.icon size={16} className="text-emerald-600" /></div>
                <div>
                  <p className="text-xs font-bold text-[#0c2340]">{b.title}</p>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom launch offer bar */}
          <div className="mt-6 p-4 sm:p-5 bg-[#f5fdf9] border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0"><Gift size={18} className="text-emerald-600" /></div>
              <div>
                <p className="text-sm font-bold text-[#0c2340]">Limited Time Launch Offer</p>
                <p className="text-xs text-slate-500">PolicyNext is 100% free during our launch period. Paid plans coming soon with advanced features.</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200 text-emerald-700 font-semibold text-sm rounded-xl hover:bg-emerald-50 transition-all whitespace-nowrap shrink-0">
              Learn More <ArrowRight size={14} />
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  BLOG                                           ║
          ╚══════════════════════════════════════════════════╝ */}
      <section id="blog" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f5fdf9]">
        <div className="max-w-6xl mx-auto">
          {/* Header split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <SectionLabel>Our Blog</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c2340] leading-tight mb-3">
                Insights for a{' '}<span className="text-emerald-600">Secure Tomorrow</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Tips, guides and expert advice to help you organise your financial life and protect what matters most.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-48 h-40 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                <BookOpen size={48} className="text-emerald-200" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Filter tabs + search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <div className="flex flex-wrap gap-2 flex-1">
                  {BLOG_TABS.map(tab => (
                    <button key={tab} onClick={() => setBlogTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${blogTab === tab ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-200 hover:text-emerald-700'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filteredPosts.map((post, i) => (
                  <motion.div key={post.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <div className="h-36 bg-gradient-to-br from-slate-100 to-emerald-50 flex items-center justify-center relative overflow-hidden">
                      <BookOpen size={32} className="text-emerald-200 group-hover:scale-110 transition-transform" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{post.cat}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-[#0c2340] mb-1.5 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">{post.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{post.desc}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={10} />{post.date}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{post.mins}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Explore more */}
              <div className="mt-8 p-5 bg-[#0c2340] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-base">Stay Informed. Stay Secure.</p>
                  <p className="text-white/50 text-sm">Knowledge today brings peace of mind tomorrow.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/80 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0">
                  Explore More Articles <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-64 xl:w-72 space-y-5 shrink-0">
              {/* Popular Topics */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="text-sm font-bold text-[#0c2340] mb-4">Popular Topics</h4>
                <ul className="space-y-2">
                  {[{ icon: Shield, label: 'Life Insurance' }, { icon: Bell, label: 'Health Insurance' }, { icon: TrendingUp, label: 'Investments' }, { icon: FileText, label: 'Loans' }, { icon: Users, label: 'Family Security' }].map(t => (
                    <li key={t.label}>
                      <button className="w-full flex items-center justify-between py-2 text-sm text-slate-600 hover:text-emerald-700 group">
                        <span className="flex items-center gap-2">
                          <t.icon size={14} className="text-slate-400 group-hover:text-emerald-600" />{t.label}
                        </span>
                        <ChevronRight size={13} className="text-slate-300 group-hover:text-emerald-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="text-sm font-bold text-[#0c2340] mb-1">Subscribe to Our Newsletter</h4>
                <p className="text-xs text-slate-500 mb-4">Get expert tips and updates delivered to your inbox.</p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg mb-2.5 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition"
                />
                <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-all">Subscribe</button>
              </div>

              {/* Have questions */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                  <MessageCircle size={18} className="text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-[#0c2340] mb-1">Have questions?</h4>
                <p className="text-xs text-slate-500 mb-3">We're here to help you secure what matters most.</p>
                <button onClick={() => scrollTo('contact')} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  Contact Us <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-[#0c2340] pr-4">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════╗
          ║  CONTACT                                        ║
          ╚══════════════════════════════════════════════════╝ */}
      <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#f5fdf9]">
        <div className="max-w-6xl mx-auto">
          {/* Header split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <SectionLabel>Contact Us</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
                <span className="text-[#0c2340]">We're Here </span>
                <span className="text-emerald-600">to Help</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Have a question or need assistance? Our team is here to help you and your family stay secure and organised.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-48 h-40 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                <Headphones size={48} className="text-emerald-200" />
              </div>
            </div>
          </div>

          {/* Form + Contact methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><MessageCircle size={18} className="text-emerald-600" /></div>
                <div>
                  <h4 className="text-base font-bold text-[#0c2340]">Send Us a Message</h4>
                  <p className="text-xs text-slate-400">Fill out the form and we'll get back to you as soon as possible.</p>
                </div>
              </div>
              <form className="space-y-3" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name" className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition" />
                  <input type="email" placeholder="Email Address" className="px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition" />
                </div>
                <input type="text" placeholder="Subject" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition" />
                <textarea rows={4} placeholder="Your Message" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition resize-none" />
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/15">
                  Send Message <ArrowRight size={15} />
                </button>
              </form>
            </div>

            {/* Other ways to reach */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Phone size={18} className="text-blue-600" /></div>
                <div>
                  <h4 className="text-base font-bold text-[#0c2340]">Other Ways to Reach Us</h4>
                  <p className="text-xs text-slate-400">Choose the best way to connect with our team.</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Mail,           title: 'Email Us',      sub: 'support@policynext.com',                     detail: ''                         },
                  { icon: Phone,          title: 'Call Us',       sub: '+91 98765 43210',                            detail: 'Mon - Sat, 9:00 AM to 6:00 PM' },
                  { icon: MessageCircle,  title: 'Live Chat',     sub: 'Chat with our support team',                 detail: 'Available on weekdays'     },
                  { icon: MapPin,         title: 'Write to Us',   sub: 'PolicyNext Technologies Pvt. Ltd.',          detail: 'Bangalore, Karnataka, India - 560001' },
                ].map(method => (
                  <div key={method.title} className="flex items-center gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <method.icon size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0c2340]">{method.title}</p>
                      <p className="text-xs text-slate-500 truncate">{method.sub}</p>
                      {method.detail && <p className="text-[11px] text-slate-400">{method.detail}</p>}
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Family peace of mind CTA */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Users size={32} className="text-emerald-500" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg font-bold text-[#0c2340] mb-1">Your family's peace of mind is our priority.</h4>
                <p className="text-slate-500 text-sm mb-3">We are committed to helping you secure what matters most.</p>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  {[{ icon: Shield, label: 'Secure' }, { icon: Users, label: 'Reliable' }, { icon: CheckCircle, label: 'Trusted' }].map(b => (
                    <span key={b.label} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <b.icon size={14} className="text-emerald-500" />{b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom trust bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden mt-6">
            {[
              { icon: Shield,      title: 'Bank Level Security',      sub: '256-bit Encryption'                },
              { icon: Lock,        title: 'Your Privacy Matters',     sub: 'We never share your data'          },
              { icon: Users,       title: 'Trusted by Thousands',     sub: 'Families across India'             },
              { icon: Target,      title: 'Made with ♥ in India',     sub: 'for Indian Families'               },
            ].map(b => (
              <div key={b.title} className="bg-white py-4 sm:py-5 px-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0"><b.icon size={15} className="text-emerald-600" /></div>
                <div>
                  <p className="text-xs font-bold text-[#0c2340]">{b.title}</p>
                  <p className="text-[11px] text-slate-400">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#060d19] text-white pt-12 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="col-span-2 sm:col-span-1">
              <Logo variant="white" size="sm" />
              <p className="text-white/30 text-xs mt-3 leading-relaxed max-w-[170px]">Your complete financial life, secured and simplified.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'How It Works', 'Pricing', 'Security', 'API'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal',   links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}>
                      <button onClick={() => scrollTo(link.toLowerCase().replace(/\s+/g, '-'))} className="text-xs text-white/30 hover:text-white/65 transition-colors text-left">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-white/20">© 2025 PolicyNext Technologies Pvt. Ltd. All rights reserved.</p>
            <p className="text-[11px] text-white/20">Made with ♥ in India · 256-bit encrypted</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
