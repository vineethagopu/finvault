import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { OtpInput } from '@/components/ui/OtpInput'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const RESEND_COOLDOWN_SECONDS = 45

interface InlineOtpVerifyProps {
  type: 'EMAIL' | 'MOBILE'
  identifier: string
  verified: boolean
  onVerified: () => void
  label?: string
}

export function InlineOtpVerify({ type, identifier, verified, onVerified, label }: InlineOtpVerifyProps) {
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(false)
  const [sentOnce, setSentOnce] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const sentFor = useRef<string | null>(null)

  useEffect(() => {
    if (identifier && identifier !== sentFor.current && !verified) {
      void sendOtp()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const sendOtp = async () => {
    if (!identifier || sending) return
    setSending(true)
    setError(false)
    setOtp('')
    try {
      const res = await authService.sendOtp({ contactInfo: identifier })
      sentFor.current = identifier
      setSentOnce(true)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      const devCode = (res.data as any)?.data?.devCode ?? (res.data as any)?.devCode
      if (devCode) {
        toast(`Dev mode — your mobile OTP is ${devCode} (no SMS gateway configured yet)`, {
          icon: '📱',
          duration: 8000,
        })
      } else {
        toast.success(`OTP sent to ${identifier}`)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const verifyOtp = async (code: string) => {
    setVerifying(true)
    setError(false)
    try {
      await authService.verifyOtp({ type, otp: code, identifier })
      onVerified()
      toast.success(`${type === 'EMAIL' ? 'Email' : 'Mobile number'} verified`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(true)
      toast.error(e.response?.data?.message || 'Invalid OTP')
    } finally {
      setVerifying(false)
    }
  }

  const handleOtpChange = (val: string) => {
    setOtp(val)
    setError(false)
    if (val.length === 6) void verifyOtp(val)
  }

  if (!identifier) return null

  if (verified) {
    return (
      <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
        <CheckCircle2 size={16} /> {type === 'EMAIL' ? 'Email' : 'Mobile number'} verified
      </div>
    )
  }

  return (
    <AnimatePresence>
      {sentOnce && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
        >
          <p className="text-sm font-medium text-slate-700 mb-3">
            {label || `Verify your ${type === 'EMAIL' ? 'email' : 'mobile'}`} — enter the 6-digit code sent to{' '}
            <span className="font-semibold">{identifier}</span>
          </p>
          <OtpInput value={otp} onChange={handleOtpChange} error={error} disabled={verifying} autoFocus />
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            {cooldown > 0 ? (
              <span>Resend OTP in {String(Math.floor(cooldown / 60)).padStart(2, '0')}:{String(cooldown % 60).padStart(2, '0')}</span>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={sending}
                className="flex items-center gap-1 text-green-600 font-semibold hover:text-green-700 disabled:opacity-50"
              >
                <RefreshCw size={12} className={sending ? 'animate-spin' : ''} /> Resend OTP
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
