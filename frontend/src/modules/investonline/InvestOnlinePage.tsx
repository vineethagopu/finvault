import React from 'react'
import { motion } from 'framer-motion'
import {
  Gift, RefreshCw, UserRound, Briefcase, Globe, Home,
  HeartPulse, Users, Shield, Stethoscope, Leaf, Ribbon,
  Baby, IndianRupee, ReceiptText, HandCoins, PiggyBank, Umbrella,
  CircleDollarSign, Bike, Plane, BarChart3, Coins,
} from 'lucide-react'

type Tile = { label: string; icon: React.ElementType }

type Section = {
  title: string
  titleColor: string
  tint: string
  chipBg: string
  iconColor: string
  cols: string
  tiles: Tile[]
}

const SECTIONS: Section[] = [
  {
    title: 'Term Life Insurance',
    titleColor: 'text-[#0f2952]',
    tint: 'bg-blue-50/60',
    chipBg: 'bg-blue-100/70',
    iconColor: 'text-blue-700',
    cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    tiles: [
      { label: 'Free of Cost Term Life Insurance', icon: Gift },
      { label: 'Term Plans with Return of Premium', icon: RefreshCw },
      { label: 'Term Insurance (Women)', icon: UserRound },
      { label: 'Term Life Insurance (Self Employed)', icon: Briefcase },
      { label: 'Term Life Insurance (NRIs)', icon: Globe },
      { label: 'Home Loan Insurance', icon: Home },
    ],
  },
  {
    title: 'Health Insurance',
    titleColor: 'text-green-600',
    tint: 'bg-green-50/60',
    chipBg: 'bg-green-100/70',
    iconColor: 'text-green-600',
    cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    tiles: [
      { label: 'Health', icon: HeartPulse },
      { label: 'Family Health Insurance', icon: Users },
      { label: '1 Cr health Cover', icon: Shield },
      { label: 'OPD', icon: Stethoscope },
      { label: 'Arogya Sanjeevani...', icon: Leaf },
      { label: 'Cancer Insurance', icon: Ribbon },
    ],
  },
  {
    title: 'Investment Plans',
    titleColor: 'text-purple-600',
    tint: 'bg-purple-50/60',
    chipBg: 'bg-purple-100/70',
    iconColor: 'text-purple-600',
    cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    tiles: [
      { label: 'Child Savings P...', icon: Baby },
      { label: 'Guaranteed Return Pla...', icon: IndianRupee },
      { label: 'Retirement Plan', icon: Users },
      { label: 'Tax Saving Investment', icon: ReceiptText },
      { label: 'Pension For Life', icon: HandCoins },
      { label: 'Smart Deposit', icon: PiggyBank },
      { label: 'ULIPs', icon: Umbrella },
      { label: 'Dollar Based Product', icon: CircleDollarSign },
    ],
  },
  {
    title: 'Other Plans',
    titleColor: 'text-orange-500',
    tint: 'bg-orange-50/60',
    chipBg: 'bg-orange-100/70',
    iconColor: 'text-orange-500',
    cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    tiles: [
      { label: '2 Wheeler Insurance', icon: Bike },
      { label: 'Travel Insurance', icon: Plane },
    ],
  },
  {
    title: 'Buy Investments Online',
    titleColor: 'text-blue-600',
    tint: 'bg-blue-50/60',
    chipBg: 'bg-blue-100/70',
    iconColor: 'text-blue-600',
    cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    tiles: [
      { label: 'Stocks', icon: BarChart3 },
      { label: 'Mutual Funds', icon: Users },
      { label: 'Gold Bonds', icon: Coins },
    ],
  },
]

export function InvestOnlinePage() {
  return (
    <div className="p-4 sm:p-6 space-y-7 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Invest Online</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore and buy the best insurance plans and investment options online.
        </p>
      </motion.div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className={`text-base font-bold ${section.titleColor}`}>{section.title}</h2>
          <div className={`grid ${section.cols} gap-4`}>
            {section.tiles.map((tile) => {
              const Icon = tile.icon
              return (
                <button
                  key={tile.label}
                  className={`flex items-center gap-3 p-4 rounded-xl border border-slate-100 ${section.tint} text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-xl ${section.chipBg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={section.iconColor} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 leading-tight">{tile.label}</span>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
