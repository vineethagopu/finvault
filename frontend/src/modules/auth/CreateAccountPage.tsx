import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Shield, Bell, Lock, FileText, User, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OtpInput } from '@/components/ui/OtpInput'
import { Stepper } from '@/components/ui/Stepper'
import { Logo } from '@/components/layout/Logo'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z.string().min(8, 'At least 8 characters').regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Mix of letters, numbers & symbols'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine(v => v, 'You must agree to terms'),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormData = z.infer<typeof schema>

const STEPS = [
  { id: 1, label: 'Account Details', description: 'Your information', icon: <User size={14} /> },
  { id: 2, label: 'Verify Email', description: 'Email verification', icon: <span>✉️</span> },
  { id: 3, label: 'Verify Mobile', description: 'Mobile verification', icon: <span>📱</span> },
  { id: 4, label: 'Account Created', description: 'Done!', icon: <Check size={14} /> },
]

const BENEFITS = [
  { icon: Shield, label: 'Bank Level Security', desc: 'Your data is protected with 256-bit encryption.' },
  { icon: FileText, label: 'All-in-One Dashboard', desc: 'Manage policies, documents, investments & more.' },
  { icon: Bell, label: 'Smart Alerts', desc: 'Never miss a renewal or important update.' },
  { icon: Lock, label: 'Privacy First', desc: 'We never share your data with anyone.' },
]

export function CreateAccountPage() {
  const { planType } = useParams<{ planType: string }>()
  const isFamily = planType === 'family'
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [emailOtp, setEmailOtp] = useState('')
  const [mobileOtp, setMobileOtp] = useState('')

  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues, trigger } = form

  const handleStep1 = async () => {
    const valid = await trigger(['firstName', 'lastName', 'email', 'mobile', 'username', 'password', 'confirmPassword', 'agreedToTerms'])
    if (!valid) return
    // Send OTPs
    try {
      await authService.sendOtp({ username: getValues('username'), contactInfo: getValues('email') })
      setStep(2)
      toast.success('Verification code sent to your email!')
    } catch {
      toast.error('Failed to send verification code')
    }
  }

  const handleVerifyEmail = async () => {
    if (emailOtp.length < 6) { toast.error('Enter complete OTP'); return }
    try {
      await authService.verifyOtp({ type: 'EMAIL', otp: emailOtp, identifier: getValues('email') })
      await authService.sendOtp({ username: getValues('username'), contactInfo: getValues('mobile') })
      setStep(3)
      toast.success('Email verified! Sending mobile OTP...')
    } catch {
      toast.error('Invalid OTP')
    }
  }

  const handleVerifyMobile = async () => {
    if (mobileOtp.length < 6) { toast.error('Enter complete OTP'); return }
    try {
      await authService.verifyOtp({ type: 'MOBILE', otp: mobileOtp, identifier: getValues('mobile') })
      // Create account
      const data = getValues()
      const res = await authService.register({ ...data, planType: isFamily ? 'FAMILY' : 'INDIVIDUAL' })
      setUser(res.data.user)
      setStep(4)
      toast.success('Account created!')
    } catch {
      toast.error('Invalid OTP or registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
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
            <span className="text-slate-300">|</span>
            <button className="text-sm text-slate-600">? Need Help?</button>
          </div>
        </div>
      </header>

      <div className="pt-16 flex min-h-screen">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-80 xl:w-96 bg-white border-r border-slate-100 p-6 pt-8 shrink-0">
          <div>
            <Link to="/register" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
              <ArrowLeft size={15} /> Back to Plans
            </Link>
            <h2 className="text-2xl font-bold text-[#0f2952] mb-1">Create Your</h2>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Individual Account</h2>
            <p className="text-sm text-slate-500 mb-6">Join PolicyNext and take control of your financial security.</p>

            <div className="space-y-3">
              {BENEFITS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div className="mt-6 flex justify-center">
            <div className="w-40 h-40 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl flex items-center justify-center">
              <div className="text-5xl">🛡️</div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 py-8 px-4 sm:px-8">
          {/* Stepper */}
          <div className="max-w-2xl mx-auto mb-8">
            <Stepper steps={STEPS} currentStep={step} />
          </div>

          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Account Details */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="First Name" placeholder="First Name" leftIcon={<User size={14} />} {...register('firstName')} error={errors.firstName?.message} required />
                      <Input label="Last Name" placeholder="Last Name" leftIcon={<User size={14} />} {...register('lastName')} error={errors.lastName?.message} required />
                    </div>
                    <div className="mt-4">
                      <Input label="Email Address" type="email" placeholder="Email Address" leftIcon={<span className="text-sm">✉️</span>} {...register('email')} error={errors.email?.message} required />
                    </div>

                    {/* Email OTP section shown inline */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium text-slate-700 mb-1">Verify your email</p>
                      <p className="text-xs text-slate-500 mb-3">We've sent a 6-digit OTP to your email address.</p>
                      <OtpInput length={6} value={emailOtp} onChange={setEmailOtp} />
                      <p className="text-right text-xs text-green-600 mt-2 cursor-pointer hover:text-green-700">Resend OTP in 00:45</p>
                    </div>

                    <div className="mt-4">
                      <Input label="Mobile Number" placeholder="Mobile Number" leftIcon={<span className="text-sm">📞</span>} {...register('mobile')} error={errors.mobile?.message} required />
                    </div>

                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium text-slate-700 mb-1">Verify your mobile number</p>
                      <p className="text-xs text-slate-500 mb-3">We've sent a 6-digit OTP to your mobile number.</p>
                      <OtpInput length={6} value={mobileOtp} onChange={setMobileOtp} />
                      <p className="text-right text-xs text-green-600 mt-2 cursor-pointer hover:text-green-700">Resend OTP in 00:45</p>
                    </div>

                    <div className="mt-4">
                      <Input label="Username" placeholder="Username" leftIcon={<User size={14} />} hint="Choose a unique username. This will be used to log in." {...register('username')} error={errors.username?.message} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <Input label="Create Password" type="password" placeholder="Create Password" leftIcon={<Lock size={14} />} {...register('password')} error={errors.password?.message} required />
                      <Input label="Confirm Password" type="password" placeholder="Confirm Password" leftIcon={<Lock size={14} />} {...register('confirmPassword')} error={errors.confirmPassword?.message} required />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Password must be at least 8 characters with a mix of letters, numbers & symbols.</p>

                    <div className="flex items-start gap-2 mt-4">
                      <input type="checkbox" id="terms" className="mt-0.5 rounded border-slate-300 text-green-600" {...register('agreedToTerms')} />
                      <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                        I agree to the{' '}
                        <Link to="/terms" className="text-green-600 hover:underline">Terms of Service</Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
                      </label>
                    </div>
                    {errors.agreedToTerms && <p className="text-xs text-red-600 mt-1">{errors.agreedToTerms.message}</p>}

                    <Button className="w-full mt-6" size="lg" onClick={handleStep1} loading={isSubmitting} rightIcon={<ArrowRight size={15} />}>
                      Create Account
                    </Button>
                    <p className="text-center text-sm text-slate-600 mt-4">
                      Already have an account?{' '}
                      <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">Login</Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={36} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
                  <p className="text-slate-600 mb-8">Your PolicyNext account has been successfully created. Welcome to your financial dashboard!</p>
                  <Button size="lg" className="w-full max-w-xs" onClick={() => navigate('/app/dashboard')} rightIcon={<ArrowRight size={15} />}>
                    Go to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
