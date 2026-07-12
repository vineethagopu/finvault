import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface Step {
  id: number
  label: string
  description?: string
  icon?: React.ReactNode
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
  variant?: 'horizontal' | 'vertical'
}

export function Stepper({ steps, currentStep, className, variant = 'horizontal' }: StepperProps) {
  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all shrink-0',
                  isCompleted && 'bg-green-600 text-white',
                  isCurrent && 'bg-green-600 text-white ring-4 ring-green-100',
                  !isCompleted && !isCurrent && 'bg-slate-100 text-slate-500'
                )}>
                  {isCompleted ? <Check size={14} /> : step.icon || step.id}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn('w-0.5 flex-1 my-1 min-h-8', isCompleted ? 'bg-green-600' : 'bg-slate-200')} />
                )}
              </div>
              <div className="pb-6">
                <p className={cn('text-sm font-semibold', isCurrent ? 'text-green-700' : isCompleted ? 'text-slate-700' : 'text-slate-400')}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                isCompleted && 'bg-green-600 text-white',
                isCurrent && 'bg-green-600 text-white ring-4 ring-green-100',
                !isCompleted && !isCurrent && 'bg-slate-100 text-slate-400 border-2 border-slate-200'
              )}>
                {isCompleted ? <Check size={14} /> : step.icon || step.id}
              </div>
              <div className="text-center">
                <p className={cn('text-xs font-semibold hidden sm:block',
                  isCurrent ? 'text-green-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                )}>{step.label}</p>
                {step.description && (
                  <p className="text-[10px] text-slate-400 hidden sm:block">{step.description}</p>
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 -mt-5', isCompleted ? 'bg-green-600' : 'bg-slate-200')} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
