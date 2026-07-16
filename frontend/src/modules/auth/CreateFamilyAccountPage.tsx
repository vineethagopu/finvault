import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Shield, User, Lock, Check, Users, CheckCircle2, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Stepper, type Step } from '@/components/ui/Stepper'
import { Logo } from '@/components/layout/Logo'
import { InlineOtpVerify } from '@/components/auth/InlineOtpVerify'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import type { FamilyMemberData } from '@/types'
import toast from 'react-hot-toast'

const MAX_MEMBERS = 5

interface CommonMobile { value: string; verified: boolean }
interface MemberEntry extends FamilyMemberData {}

const memberSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  username: z.string().min(3, 'At least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z.string().min(8, 'At least 8 characters').regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Mix of letters, numbers & symbols'),
  confirmPassword: z.string(),
  relationship: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type MemberFormData = z.infer<typeof memberSchema>

const STEP_LABELS = ['Plan Selection', 'Common Details', 'Login 1', 'Login 2', 'Login 3', 'Login 4', 'Login 5', 'Review & Finish']
const STEPPER_STEPS: Step[] = STEP_LABELS.map((label, i) => ({ id: i + 1, label }))

// ── Login step sub-form (remounted per index via `key` so its local draft state resets cleanly) ──
function LoginStepForm({
  index, commonEmail, commonMobiles, onAdd, onSkip,
}: {
  index: number
  commonEmail: string
  commonMobiles: CommonMobile[]
  onAdd: (member: MemberEntry, newMobile: CommonMobile | null) => void
  onSkip: () => void
}) {
  const mandatory = index === 0
  const defaultMobile = commonMobiles[commonMobiles.length - 1]?.value || ''
  const [mobileOverride, setMobileOverride] = useState(false)
  const [draftMobile, setDraftMobile] = useState('')
  const [draftMobileVerified, setDraftMobileVerified] = useState(false)

  const form = useForm<MemberFormData>({ resolver: zodResolver(memberSchema) })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form

  const effectiveMobile = mobileOverride ? draftMobile : defaultMobile
  const effectiveMobileVerified = mobileOverride ? draftMobileVerified : true

  const submit = handleSubmit((data) => {
    if (!effectiveMobileVerified || !effectiveMobile) {
      toast.error('Please verify a mobile number for this login')
      return
    }
    const newMobile = mobileOverride && !commonMobiles.some((m) => m.value === effectiveMobile)
      ? { value: effectiveMobile, verified: true }
      : null
    const { confirmPassword: _confirmPassword, ...memberFields } = data
    onAdd({ ...memberFields, email: commonEmail, mobile: effectiveMobile }, newMobile)
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-1">Login {index + 1} of {MAX_MEMBERS}</h3>
      <p className="text-sm text-slate-500 mb-5">{mandatory ? 'This will be your primary login and family account owner.' : 'Add details for this family member, or skip and add them later.'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First Name" placeholder="First Name" leftIcon={<User size={14} />} {...register('firstName')} error={errors.firstName?.message} required />
        <Input label="Last Name" placeholder="Last Name" leftIcon={<User size={14} />} {...register('lastName')} error={errors.lastName?.message} required />
      </div>

      <div className="mt-4">
        <Input label="Username" placeholder="Username" leftIcon={<User size={14} />} hint="Used to log in for this member." {...register('username')} error={errors.username?.message} required />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
          <span className="flex-1">{commonEmail}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 size={11} /> Common Email
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
          {!mobileOverride ? (
            <button type="button" onClick={() => { setMobileOverride(true); setDraftMobile(''); setDraftMobileVerified(false) }} className="text-xs font-semibold text-green-600 hover:text-green-700">
              Change Mobile
            </button>
          ) : (
            <button type="button" onClick={() => setMobileOverride(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
              Use Common Mobile
            </button>
          )}
        </div>
        {!mobileOverride ? (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
            <span className="flex-1">{defaultMobile}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
              <CheckCircle2 size={11} /> Common Mobile
            </span>
          </div>
        ) : (
          <>
            <Input placeholder="Mobile Number" leftIcon={<span className="text-sm">📞</span>} value={draftMobile}
              onChange={(e) => { setDraftMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setDraftMobileVerified(false) }} />
            <InlineOtpVerify type="MOBILE" identifier={/^[6-9]\d{9}$/.test(draftMobile) ? draftMobile : ''} verified={draftMobileVerified} onVerified={() => setDraftMobileVerified(true)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Input label="Create Password" type="password" placeholder="Create Password" leftIcon={<Lock size={14} />} {...register('password')} error={errors.password?.message} required />
        <Input label="Confirm Password" type="password" placeholder="Confirm Password" leftIcon={<Lock size={14} />} {...register('confirmPassword')} error={errors.confirmPassword?.message} required />
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button className="flex-1" size="lg" onClick={submit} loading={isSubmitting} rightIcon={<ArrowRight size={15} />}>
          Add Login {index + 1}
        </Button>
        {!mandatory && (
          <Button variant="outline" size="lg" type="button" onClick={onSkip}>
            Skip for now
          </Button>
        )}
      </div>
    </div>
  )
}

export function CreateFamilyAccountPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const [phase, setPhase] = useState<'common' | 'login' | 'review' | 'success'>('common')
  const [activeLoginIndex, setActiveLoginIndex] = useState(0)
  const [members, setMembers] = useState<MemberEntry[]>([])

  const [confirmedCommonEmail, setConfirmedCommonEmail] = useState('')
  const [commonEmailVerified, setCommonEmailVerified] = useState(false)
  const [confirmedCommonMobile, setConfirmedCommonMobile] = useState('')
  const [commonMobileVerified, setCommonMobileVerified] = useState(false)
  const [commonEmailInput, setCommonEmailInput] = useState('')
  const [commonMobileInput, setCommonMobileInput] = useState('')
  const [commonMobiles, setCommonMobiles] = useState<CommonMobile[]>([])
  const [creating, setCreating] = useState(false)

  const currentStep = phase === 'common' ? 2
    : phase === 'login' ? 3 + activeLoginIndex
    : 8

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(commonEmailInput)
  const mobileValid = /^[6-9]\d{9}$/.test(commonMobileInput)

  const handleEmailBlur = () => {
    if (emailValid && commonEmailInput !== confirmedCommonEmail) {
      setConfirmedCommonEmail(commonEmailInput)
      setCommonEmailVerified(false)
    }
  }
  const handleMobileBlur = () => {
    if (mobileValid && commonMobileInput !== confirmedCommonMobile) {
      setConfirmedCommonMobile(commonMobileInput)
      setCommonMobileVerified(false)
    }
  }

  const continueFromCommon = () => {
    if (!commonEmailVerified || !commonMobileVerified) {
      toast.error('Please verify the common email and mobile number first')
      return
    }
    setCommonMobiles([{ value: confirmedCommonMobile, verified: true }])
    setPhase('login')
    setActiveLoginIndex(0)
  }

  const addLogin = (member: MemberEntry, newMobile: CommonMobile | null) => {
    setMembers((prev) => [...prev, member])
    if (newMobile) setCommonMobiles((prev) => [...prev, newMobile])
    if (activeLoginIndex + 1 >= MAX_MEMBERS) {
      setPhase('review')
    } else {
      setActiveLoginIndex((i) => i + 1)
    }
  }

  const skipRemaining = () => setPhase('review')

  const handleCreateFamilyAccount = async () => {
    if (members.length === 0) return
    setCreating(true)
    try {
      const res = await authService.registerFamily({ members })
      const user = (res.data as any).data?.user ?? (res.data as any).user
      if (!user) throw new Error('Malformed response')
      const loginRes = await authService.login({ username: members[0].username, password: members[0].password })
      const loggedInUser = (loginRes.data as any).data?.user ?? (loginRes.data as any).user
      setUser(loggedInUser ?? user)
      setPhase('success')
      toast.success('Family account created!')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Family registration failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Shield size={12} className="text-green-600" /> Bank Level Security
            </div>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto mb-8 overflow-x-auto">
          <Stepper steps={STEPPER_STEPS} currentStep={currentStep} size="sm" className="min-w-[720px]" />
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            <AnimatePresence mode="wait">
              {phase === 'common' && (
                <motion.div key="common" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={18} className="text-purple-600" />
                      <h2 className="text-lg font-bold text-slate-900">Common Contact Details</h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-5">This email and mobile will be shared as the default across your family logins. Each login can override the mobile number if needed.</p>

                    <Input label="Common Email Address" type="email" placeholder="Email Address" leftIcon={<span className="text-sm">✉️</span>}
                      value={commonEmailInput} onChange={(e) => setCommonEmailInput(e.target.value)} onBlur={handleEmailBlur} required />
                    <InlineOtpVerify type="EMAIL" identifier={confirmedCommonEmail} verified={commonEmailVerified} onVerified={() => setCommonEmailVerified(true)} />

                    <div className="mt-4">
                      <Input label="Common Mobile Number" placeholder="Mobile Number" leftIcon={<span className="text-sm">📞</span>}
                        value={commonMobileInput} onChange={(e) => setCommonMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))} onBlur={handleMobileBlur} required />
                      <InlineOtpVerify type="MOBILE" identifier={confirmedCommonMobile} verified={commonMobileVerified} onVerified={() => setCommonMobileVerified(true)} />
                    </div>

                    <Button className="w-full mt-6" size="lg" onClick={continueFromCommon} disabled={!commonEmailVerified || !commonMobileVerified} rightIcon={<ArrowRight size={15} />}>
                      Continue to Logins
                    </Button>
                  </div>
                </motion.div>
              )}

              {phase === 'login' && (
                <motion.div key={`login-${activeLoginIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <LoginStepForm
                    index={activeLoginIndex}
                    commonEmail={confirmedCommonEmail}
                    commonMobiles={commonMobiles}
                    onAdd={addLogin}
                    onSkip={skipRemaining}
                  />
                </motion.div>
              )}

              {phase === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Review & Finish</h2>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Common Contact Details</p>
                      <p className="text-sm text-slate-700"><span className="font-medium">Common Email Address:</span> {confirmedCommonEmail} <span className="text-green-600 text-xs">✓ Verified</span></p>
                      {commonMobiles.map((m, i) => (
                        <p key={m.value} className="text-sm text-slate-700 mt-1">
                          <span className="font-medium">Common Mobile Number {i + 1}:</span> {m.value} <span className="text-green-600 text-xs">✓ Verified</span>
                        </p>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Family Member Logins ({members.length} of {MAX_MEMBERS})</p>
                    <div className="overflow-x-auto mb-5">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                            <th className="py-2 pr-3">Name</th>
                            <th className="py-2 pr-3">Username</th>
                            <th className="py-2 pr-3">Email</th>
                            <th className="py-2 pr-3">Mobile</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((m, i) => (
                            <tr key={m.username} className="border-b border-slate-50">
                              <td className="py-2 pr-3 font-medium text-slate-800">{m.firstName} {m.lastName}{i === 0 && <span className="text-xs text-slate-400 ml-1">(You)</span>}</td>
                              <td className="py-2 pr-3 text-slate-600">{m.username}</td>
                              <td className="py-2 pr-3 text-slate-600">{m.email}</td>
                              <td className="py-2 pr-3 text-slate-600">{m.mobile}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 mb-5">
                      <p className="text-sm font-bold text-purple-700">Family Plan — ₹0/year</p>
                      <p className="text-xs text-purple-600 mt-0.5">Up to 5 family logins, shared access &amp; permissions.</p>
                    </div>

                    <Button className="w-full" size="lg" onClick={handleCreateFamilyAccount} loading={creating} rightIcon={<ArrowRight size={15} />}>
                      Create Family Account
                    </Button>
                  </div>
                </motion.div>
              )}

              {phase === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={36} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Family Account Created!</h2>
                  <p className="text-slate-600 mb-8">{members.length} login{members.length !== 1 ? 's' : ''} created successfully. Welcome to your financial dashboard!</p>
                  <Button size="lg" className="w-full max-w-xs mx-auto" onClick={() => navigate('/app/dashboard')} rightIcon={<ArrowRight size={15} />}>
                    Go to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {phase !== 'common' && phase !== 'success' && (
              <p className="text-center text-sm text-slate-600 mt-4">
                <Link to="/register" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700">
                  <ArrowLeft size={13} /> Back to Plans
                </Link>
              </p>
            )}
          </div>

          {/* Sidebar */}
          {(phase === 'login' || phase === 'review') && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit">
              <p className="text-sm font-bold text-slate-800 mb-1">Logins Added ({members.length} of {MAX_MEMBERS})</p>
              <p className="text-xs text-slate-500 mb-4">You can skip any remaining logins and add them later from your account.</p>
              <div className="space-y-2">
                {Array.from({ length: MAX_MEMBERS }).map((_, i) => {
                  const added = members[i]
                  const isCurrent = phase === 'login' && i === activeLoginIndex
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${added ? 'bg-green-50 text-green-700' : isCurrent ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
                      {added ? <CheckCircle2 size={14} /> : isCurrent ? <Clock size={14} /> : <Circle size={14} />}
                      <span className="font-medium">Login {i + 1}</span>
                      <span className="ml-auto text-xs">{added ? (added.firstName) : isCurrent ? 'In Progress' : 'Pending'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
