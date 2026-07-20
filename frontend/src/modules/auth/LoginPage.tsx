import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Lock, User, Shield, ShieldCheck, TrendingUp, Users, FileCheck2,
  ArrowRight, Send, Smartphone, HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OtpInput } from '@/components/ui/OtpInput'
import { Logo } from '@/components/layout/Logo'
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
  { icon: FileCheck2, label: 'All Policies in One Place', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: TrendingUp, label: 'Track Investments & Loans', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Users, label: 'Family Access After You', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Lock, label: '100% Secure & Private', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const TRUST = [
  { icon: ShieldCheck, label: 'Bank Level Security', desc: '256-bit SSL encryption', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Lock, label: 'Your Privacy Matters', desc: 'We never share your data', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Users, label: 'Trusted by Thousands', desc: 'Families across India', color: 'text-green-600', bg: 'bg-green-50' },
]

function LandscapeArt() {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eef6ff" />
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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <header className="z-20 shrink-0 border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
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
      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Left marketing panel */}
        <section className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50/50 lg:flex lg:w-[52%]">
          <div className="flex flex-1 flex-col px-10 pt-6 xl:px-16 xl:pt-9 2xl:pt-12">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm 2xl:mb-7">
              <Shield size={13} /> Secure. Private. Trusted.
            </span>
            <h1 className="text-3xl font-extrabold leading-tight text-[#0f2952] xl:text-[2.6rem] xl:leading-[1.15]">
              If something happens<br />to you,<br />
              <span className="text-green-600">
                your family should<br />still know{' '}
                <span className="underline decoration-green-400 decoration-2 underline-offset-4">everything.</span>
              </span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 2xl:mt-6">
              PolicyNext helps you securely track all your policies, investments, loans and important documents and gives your family access when they need it most.
            </p>
            <div className="mt-6 grid grid-cols-4 gap-3 2xl:mt-9">
              {FEATURES.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-xs font-bold leading-snug text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto h-32 w-full shrink-0 xl:h-40 2xl:h-48">
            <LandscapeArt />
          </div>
        </section>

        {/* Right login panel */}
        <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
              <div className="mb-5 text-center">
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
                <p className="mt-1 text-sm text-slate-500">Login to access your secure account</p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex border-b border-slate-200">
                <button
                  onClick={() => setTab('password')}
                  className={`flex flex-1 items-center justify-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === 'password' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Lock size={14} /> Login with Password
                </button>
                <button
                  onClick={() => { setTab('otp'); setOtpSent(false); setOtp('') }}
                  className={`flex flex-1 items-center justify-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === 'otp' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Smartphone size={14} /> Login with Mobile or Email OTP
                </button>
              </div>

              {/* Password Login */}
              {tab === 'password' && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
                  <Input
                    label="User Name (User ID)"
                    placeholder="Enter your user name (User ID)"
                    leftIcon={<User size={15} />}
                    {...passwordForm.register('username')}
                    error={passwordForm.formState.errors.username?.message}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    leftIcon={<Lock size={15} />}
                    {...passwordForm.register('password')}
                    error={passwordForm.formState.errors.password?.message}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="rounded border-slate-300 text-green-600" {...passwordForm.register('rememberMe')} />
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot Password?</Link>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={passwordForm.formState.isSubmitting}
                    leftIcon={<Lock size={15} />}
                  >
                    Login
                  </Button>
                  <p className="text-center text-sm text-slate-400">or</p>
                  <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link>
                  </p>
                </form>
              )}

              {/* OTP Login */}
              {tab === 'otp' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={otpForm.handleSubmit(handleSendOtp)} className="space-y-4">
                      <Input
                        label="User Name (User ID)"
                        placeholder="Enter your user name (User ID)"
                        leftIcon={<User size={15} />}
                        {...otpForm.register('username')}
                        error={otpForm.formState.errors.username?.message}
                      />
                      <Input
                        label="Mobile Number / Email Address"
                        placeholder="Enter mobile number or email address"
                        leftIcon={<Smartphone size={15} />}
                        {...otpForm.register('contactInfo')}
                        error={otpForm.formState.errors.contactInfo?.message}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        loading={sendingOtp}
                        leftIcon={<Send size={15} />}
                      >
                        Send OTP
                      </Button>
                      <p className="text-center text-xs text-slate-500">
                        We will send a 6-digit OTP to your mobile number or email
                      </p>
                      <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100">
                          <Lock size={13} className="text-green-600" />
                        </div>
                        <p className="text-xs text-green-700">Your data is protected with bank-level security and 256-bit encryption</p>
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
                        <button className="font-medium text-green-600" onClick={() => setOtpSent(false)}>Change Contact</button>
                      </div>
                      <Button className="w-full" size="lg" onClick={handleOtpLogin} rightIcon={<ArrowRight size={15} />}>
                        Verify & Login
                      </Button>
                    </div>
                  )}
                  <p className="text-center text-sm text-slate-600">
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
      <footer className="z-10 shrink-0 px-3 pb-3 sm:px-6 sm:pb-4 lg:bg-transparent">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-slate-100">
          {TRUST.map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className="flex items-center justify-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon size={17} className={color} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}
