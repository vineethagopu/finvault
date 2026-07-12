import { cn } from '@/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon' | 'white'
  className?: string
}

export function Logo({ size = 'md', variant = 'full', className }: LogoProps) {
  const iconSizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12' }
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('rounded-xl flex items-center justify-center shrink-0', iconSizes[size])} style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #16a34a 100%)' }}>
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
          <path d="M16 3L4 8v8c0 6.6 4.8 12.8 12 14 7.2-1.2 12-7.4 12-14V8L16 3z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M11 16l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="12.5" y="18" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">P</text>
        </svg>
      </div>
      {(variant === 'full' || variant === 'white') && (
        <span className={cn('font-bold', textSizes[size])}>
          <span className={variant === 'white' ? 'text-white' : 'text-[#1a3a6b]'}>Policy</span>
          <span className={variant === 'white' ? 'text-green-400' : 'text-green-600'}>Next</span>
        </span>
      )}
    </div>
  )
}
