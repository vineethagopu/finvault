import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, User, Shield, TrendingUp, Users, FileKey, ArrowRight, Send } from 'lucide-react'
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

const FEATURES = [
  { icon: FileKey, label: 'All Policies in One Place', desc: 'Store and manage all your insurance policies securely.' },
  { icon: TrendingUp, label: 'Track Investments & Loans', desc: 'Monitor your investments, loans, FDs and other assets.' },
  { icon: Users, label: 'Family Access After You', desc: 'Nominate trusted family members to access your information.' },
  { icon: Shield, label: '100% Secure & Private', desc: 'Bank-level security. We never share your data.' },
]

const TRUST = [
  { icon: Shield, label: 'Bank Level Security', desc: '256-bit SSL encryption' },
  { icon: Lock, label: 'Your Privacy Matters', desc: 'We never share your data' },
  { icon: Users, label: 'Trusted by Thousands', desc: 'Families across India' },
]

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
    <div className="min-h-screen flex flex-col">
      {/* Public Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'How It Works', 'About Us', 'Pricing', 'Contact'].map(item => (
              <Link key={item} to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">{item}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Shield size={13} className="text-green-600" /> Bank Level Security
            </div>
            <span className="text-xs text-slate-400">|</span>
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
              Help
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex pt-16">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-center w-[45%] px-12 xl:px-20 bg-gradient-to-br from-slate-50 to-green-50/30">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 rounded-full text-xs font-medium text-green-700 mb-8 self-start shadow-sm">
            <Shield size={12} /> Secure. Private. Trusted.
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold text-[#0f2952] leading-tight mb-4">
            If something happens<br />to you,{' '}
            <span className="text-green-600 underline decoration-green-400 decoration-2">
              your family should<br />still know everything.
            </span>
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-sm">
            PolicyNext helps you securely track all your policies, investments, loans and important documents and gives your family access when they need it most.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-green-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Landscape illustration */}
          <div className="mt-8 h-24 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-center">
              <div className="w-full h-12 bg-gradient-to-r from-green-200 to-teal-200 rounded-b-xl opacity-60" />
            </div>
          </div>
        </div>

        {/* Right panel - login form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-white">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
                <p className="mt-1 text-sm text-slate-500">Login to access your secure account</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => setTab('password')}
                  className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 ${tab === 'password' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Lock size={14} /> Login with Password
                </button>
                <button
                  onClick={() => { setTab('otp'); setOtpSent(false); setOtp('') }}
                  className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 ${tab === 'otp' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="text-base">📱</span> Login with Mobile or Email OTP
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-green-600" {...passwordForm.register('rememberMe')} />
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">Forgot Password?</Link>
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
                  <p className="text-center text-sm text-slate-500">
                    or
                  </p>
                  <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-600 font-semibold hover:text-green-700">Create an account</Link>
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
                        leftIcon={<span className="text-base">📱</span>}
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
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                        <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <Lock size={13} className="text-green-600" />
                        </div>
                        <p className="text-xs text-green-700">Your data is protected with bank-level security and 256-bit encryption</p>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl">📱</span>
                        </div>
                        <p className="text-sm text-slate-600">Enter the 6-digit OTP sent to</p>
                        <p className="font-semibold text-slate-800">{otpForm.getValues('contactInfo')}</p>
                      </div>
                      <OtpInput value={otp} onChange={setOtp} autoFocus />
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Resend OTP in 00:45</span>
                        <button className="text-green-600 font-medium" onClick={() => setOtpSent(false)}>Change Contact</button>
                      </div>
                      <Button className="w-full" size="lg" onClick={handleOtpLogin} rightIcon={<ArrowRight size={15} />}>
                        Verify & Login
                      </Button>
                    </div>
                  )}
                  <p className="text-center text-sm text-slate-600">
                    New to PolicyNext?{' '}
                    <Link to="/register" className="text-green-600 font-semibold hover:text-green-700">Create an account</Link>
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

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {TRUST.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Icon size={15} className="text-green-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <p className="text-[10px] text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
