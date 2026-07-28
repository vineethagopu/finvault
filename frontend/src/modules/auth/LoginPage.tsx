import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Lock, User, Shield, ShieldCheck, TrendingUp, Users, FileCheck2,
  ArrowRight, Send, Smartphone, HelpCircle, Eye, EyeOff, AtSign,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/utils/cn'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  password: z.string().min(6, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

const otpSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  contactInfo: z.string().min(6, 'Mobile or email is required'),
})

type LoginForm = z.infer<typeof loginSchema>
type OtpForm = z.infer<typeof otpSchema>

const NAV = ['Features', 'How It Works', 'About Us', 'Pricing', 'Contact']

const FEATURES = [
  { icon: FileCheck2, l1: 'All Policies', l2: 'in One Place', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: TrendingUp, l1: 'Track Investments', l2: '& Loans', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Users, l1: 'Family Access', l2: 'After You', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Lock, l1: '100% Secure', l2: '& Private', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const TRUST = [
  { icon: ShieldCheck, label: 'Bank Level Security', desc: '256-bit SSL encryption', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Lock, label: 'Your Privacy Matters', desc: 'We never share your data', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Users, label: 'Trusted by Thousands', desc: 'Families across India', color: 'text-green-600', bg: 'bg-green-50' },
]

/* ── Field: label rendered *inside* the bordered box, icon centred on the left ── */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: React.ReactNode
  error?: string
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, icon, error, type, id, ...props }, ref) => {
    const [reveal, setReveal] = useState(false)
    const isPassword = type === 'password'
    const fieldId = id || props.name

    return (
      <div>
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2 transition-all duration-150 sm:gap-3.5 sm:px-4 sm:py-2.5',
            'focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100',
            error ? 'border-red-300' : 'border-slate-200',
          )}
        >
          <span className="shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <label htmlFor={fieldId} className="block cursor-text truncate text-xs font-medium text-slate-600 sm:text-[13px]">
              {label}
            </label>
            <input
              ref={ref}
              id={fieldId}
              type={isPassword ? (reveal ? 'text' : 'password') : type}
              // focus ring lives on the wrapper — suppress the global :focus-visible outline here
              className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-[15px]"
              {...props}
            />
          </div>
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              aria-label={reveal ? 'Hide password' : 'Show password'}
              onClick={() => setReveal(v => !v)}
              className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
            >
              {reveal ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      </div>
    )
  },
)
Field.displayName = 'Field'

function LandscapeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef6ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#e6f7ee" />
        </linearGradient>
      </defs>
      <rect width="600" height="200" fill="url(#sky)" />
      {/* distant mountains */}
      <path d="M0 120 L110 55 L200 120 Z" fill="#cfe0f5" />
      <path d="M150 120 L280 45 L410 120 Z" fill="#bcd6f0" />
      <path d="M330 120 L460 60 L600 120 L600 120 Z" fill="#cfe0f5" />
      {/* rolling hills */}
      <path d="M0 118 Q150 92 320 116 T600 108 L600 200 L0 200 Z" fill="#bfe6c9" />
      <path d="M0 140 Q180 118 360 138 T600 132 L600 200 L0 200 Z" fill="#9fd8ad" />
      <path d="M0 165 Q160 150 340 164 T600 158 L600 200 L0 200 Z" fill="#7cc88f" />
      {/* path */}
      <path d="M300 200 Q320 168 296 150 Q276 136 300 118" fill="none" stroke="#f1e6c9" strokeWidth="16" strokeLinecap="round" opacity="0.9" />
      {/* trees */}
      <g fill="#5bb377">
        <circle cx="90" cy="150" r="13" /><circle cx="108" cy="146" r="11" />
        <circle cx="500" cy="146" r="14" /><circle cx="518" cy="152" r="10" />
      </g>
      <rect x="86" y="158" width="4" height="10" fill="#8a6d4b" />
      <rect x="500" y="156" width="4" height="12" fill="#8a6d4b" />
      {/* little house */}
      <g>
        <rect x="392" y="142" width="30" height="22" rx="2" fill="#ffffff" stroke="#e2e8f0" />
        <path d="M389 143 L407 130 L425 143 Z" fill="#f0b46a" />
        <rect x="403" y="151" width="8" height="13" fill="#cfe0f5" />
      </g>
    </svg>
  )
}

export function LoginPage() {
  const [tab, setTab] = useState<'password' | 'otp'>('password')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const passwordForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  const handlePasswordLogin = async (data: LoginForm) => {
    try {
      // Backend LoginDto rejects extra fields (forbidNonWhitelisted) — send only credentials
      const res = await authService.login({ username: data.username, password: data.password })
      // Backend envelope: { success, data: { user } }
      const user = (res.data as any).data?.user ?? (res.data as any).user
      if (!user) throw new Error('Malformed login response')
      setUser(user)
      toast.success('Welcome back!')
      navigate('/app/dashboard')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Invalid credentials')
    }
  }

  const handleSendOtp = async (data: OtpForm) => {
    setSendingOtp(true)
    try {
      await authService.sendOtp({ username: data.username, contactInfo: data.contactInfo })
      setOtpSent(true)
      toast.success('OTP sent successfully!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleDevSkip = async () => {
    // Real login with the seeded demo user so the session has actual cookies —
    // a fake client-side user causes endless 401/refresh redirect loops.
    try {
      const res = await authService.login({ username: 'rajat.sharma', password: 'Rajat@123' })
      const user = (res.data as any).data?.user ?? (res.data as any).user
      if (!user) throw new Error('Malformed login response')
      setUser(user)
      toast.success('Logged in as demo user')
      navigate('/app/dashboard')
    } catch {
      toast.error('Demo login failed — is the backend running? (npm run start:dev, then npm run db:seed)')
    }
  }

  const handleOtpLogin = async () => {
    if (otp.length < 6) { toast.error('Enter complete OTP'); return }
    const data = otpForm.getValues()
    try {
      const res = await authService.loginWithOtp({ ...data, otp })
      setUser(res.data.user)
      toast.success('Login successful!')
      navigate('/app/dashboard')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Invalid OTP')
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-1 pb-3 text-xs font-semibold transition-colors sm:gap-2 sm:text-sm',
      active ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600',
    )

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-[#f7fafd] to-[#eff7f3]">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <header className="z-20 shrink-0 border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV.map(item => (
              <Link key={item} to="/" className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 sm:flex">
              <ShieldCheck size={15} className="text-green-600" /> Bank Level Security
            </span>
            <span className="hidden text-slate-200 sm:inline">|</span>
            <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
              <HelpCircle size={15} /> Help
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Body split ─────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row lg:items-stretch">
        {/* Left marketing panel */}
        <section className="relative flex flex-col overflow-hidden px-5 pb-8 pt-8 sm:px-8 lg:w-[46%] lg:shrink-0 lg:pb-0 lg:pl-10 lg:pr-8 lg:pt-10 xl:pl-14 xl:pr-10">
          <div className="relative z-10 flex flex-1 flex-col">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-green-700 shadow-sm sm:text-[13px] xl:mb-7">
              <Shield size={14} /> Secure. Private. Trusted.
            </span>

            <h1 className="text-[26px] font-extrabold leading-[1.2] tracking-tight text-[#0f2952] sm:text-4xl lg:text-[32px] xl:text-[40px] xl:leading-[1.18]">
              If something happens<br className="hidden sm:inline" /> to you,<br />
              <span className="text-green-600">
                your family should<br className="hidden sm:inline" /> still know{' '}
                <span className="underline decoration-green-400 decoration-[3px] underline-offset-[6px]">everything.</span>
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-[15px] xl:mt-6">
              PolicyNext helps you securely track all your policies, investments, loans and important
              documents and gives your family access when they need it most.
            </p>

            {/* Feature strip — divided cells, exactly 4 across */}
            <div className="mt-7 grid max-w-lg grid-cols-4 divide-x divide-slate-200/80 xl:mt-9">
              {FEATURES.map(({ icon: Icon, l1, l2, color, bg }) => (
                <div key={l1} className="flex flex-col items-center gap-2.5 px-1.5 text-center sm:px-3">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14', bg)}>
                    <Icon size={22} className={color} />
                  </div>
                  <p className="text-[11px] font-bold leading-snug text-slate-700 sm:text-[13px]">
                    {l1}<br />{l2}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Landscape sits flush to the bottom of the panel on large screens */}
          <div className="pointer-events-none mt-8 -mx-5 h-28 shrink-0 sm:-mx-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mx-0 lg:mt-0 lg:h-40 xl:h-48">
            <LandscapeArt className="h-full w-full" />
          </div>
        </section>

        {/* Right login panel */}
        <section className="flex flex-1 items-center justify-center px-4 pb-8 pt-2 sm:px-8 lg:py-10 xl:px-12">
          <motion.div
            className="w-full max-w-[600px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_40px_-12px_rgba(15,42,82,0.18)] sm:p-8 lg:p-10">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#0f2952] sm:text-[28px]">Welcome Back!</h2>
                <p className="mt-1.5 text-sm text-slate-500 sm:text-[15px]">Login to access your secure account</p>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex border-b border-slate-200 sm:mt-7">
                <button type="button" onClick={() => setTab('password')} className={tabClass(tab === 'password')}>
                  <Lock size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Login with Password</span>
                  <span className="sm:hidden">Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('otp'); setOtpSent(false); setOtp('') }}
                  className={tabClass(tab === 'otp')}
                >
                  <Smartphone size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Login with Mobile or Email OTP</span>
                  <span className="sm:hidden">Mobile / Email OTP</span>
                </button>
              </div>

              {/* Password Login */}
              {tab === 'password' && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="mt-6">
                  <div className="space-y-3.5 sm:space-y-4">
                    <Field
                      label="User Name (User ID)"
                      placeholder="Enter your user name (User ID)"
                      autoComplete="username"
                      icon={<User size={20} className="text-slate-400" />}
                      {...passwordForm.register('username')}
                      error={passwordForm.formState.errors.username?.message}
                    />
                    <Field
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      icon={<Lock size={20} className="text-green-600" />}
                      {...passwordForm.register('password')}
                      error={passwordForm.formState.errors.password?.message}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                        {...passwordForm.register('rememberMe')}
                      />
                      <span className="text-sm text-slate-600 sm:text-[15px]">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 sm:text-[15px]">
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="mt-5 h-12 w-full rounded-xl bg-green-700 text-base hover:bg-green-800 sm:h-[52px]"
                    loading={passwordForm.formState.isSubmitting}
                    leftIcon={<Lock size={18} />}
                  >
                    Login
                  </Button>

                  <div className="mt-5 flex items-center gap-4">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm text-slate-400">or</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <p className="mt-4 text-center text-sm text-slate-600 sm:text-[15px]">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link>
                  </p>
                </form>
              )}

              {/* OTP Login */}
              {tab === 'otp' && (
                <div className="mt-6">
                  {!otpSent ? (
                    <form onSubmit={otpForm.handleSubmit(handleSendOtp)}>
                      <div className="space-y-3.5 sm:space-y-4">
                        <Field
                          label="User Name (User ID)"
                          placeholder="Enter your user name (User ID)"
                          autoComplete="username"
                          icon={<User size={20} className="text-slate-400" />}
                          {...otpForm.register('username')}
                          error={otpForm.formState.errors.username?.message}
                        />
                        <Field
                          label="Mobile Number / Email Address"
                          placeholder="Enter mobile number or email address"
                          icon={<AtSign size={20} className="text-green-600" />}
                          {...otpForm.register('contactInfo')}
                          error={otpForm.formState.errors.contactInfo?.message}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="mt-5 h-12 w-full rounded-xl bg-green-700 text-base hover:bg-green-800 sm:h-[52px]"
                        loading={sendingOtp}
                        leftIcon={<Send size={18} />}
                      >
                        Send OTP
                      </Button>

                      <p className="mt-3 text-center text-xs text-slate-500 sm:text-[13px]">
                        We will send a 6-digit OTP to your mobile number or email
                      </p>

                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-3.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                          <Lock size={14} className="text-green-600" />
                        </div>
                        <p className="text-xs leading-relaxed text-green-700 sm:text-[13px]">
                          Your data is protected with bank-level security and 256-bit encryption
                        </p>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <div className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <Smartphone size={20} className="text-green-600" />
                        </div>
                        <p className="text-sm text-slate-600">Enter the 6-digit OTP sent to</p>
                        <p className="font-semibold text-slate-800">{otpForm.getValues('contactInfo')}</p>
                      </div>
                      <OtpInput value={otp} onChange={setOtp} autoFocus />
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Resend OTP in 00:45</span>
                        <button type="button" className="font-medium text-green-600" onClick={() => setOtpSent(false)}>
                          Change Contact
                        </button>
                      </div>
                      <Button
                        className="h-12 w-full rounded-xl bg-green-700 text-base hover:bg-green-800 sm:h-[52px]"
                        onClick={handleOtpLogin}
                        rightIcon={<ArrowRight size={18} />}
                      >
                        Verify & Login
                      </Button>
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-4">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-sm text-slate-400">or</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <p className="mt-4 text-center text-sm text-slate-600 sm:text-[15px]">
                    New to PolicyNext?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link>
                  </p>
                </div>
              )}

              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={handleDevSkip}
                  className="mt-5 w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                >
                  ⚡ Skip login (dev only)
                </button>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      {/* ─── Trust bar ──────────────────────────────────────────── */}
      <footer className="z-10 shrink-0 px-4 pb-4 sm:px-6 sm:pb-5">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-slate-100 sm:py-5">
          {TRUST.map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className="flex items-center justify-center gap-3 px-2">
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', bg)}>
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 sm:text-[15px]">{label}</p>
                <p className="text-xs text-slate-500 sm:text-[13px]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
