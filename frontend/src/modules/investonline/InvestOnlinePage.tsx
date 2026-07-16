import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Gift, RefreshCw, UserRound, Briefcase, Globe, Home,
  HeartPulse, Users, Shield, Stethoscope, Leaf, Ribbon,
  Baby, IndianRupee, ReceiptText, HandCoins, PiggyBank, Umbrella,
  CircleDollarSign, Bike, Plane, BarChart3, Coins,
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { catalogService } from '@/services/catalogService'
import { queryKeys } from '@/services/queryKeys'

const ICONS: Record<string, React.ElementType> = {
  Gift, RefreshCw, UserRound, Briefcase, Globe, Home,
  HeartPulse, Users, Shield, Stethoscope, Leaf, Ribbon,
  Baby, IndianRupee, ReceiptText, HandCoins, PiggyBank, Umbrella,
  CircleDollarSign, Bike, Plane, BarChart3, Coins,
}

const SECTION_STYLE: Record<string, { titleColor: string; tint: string; chipBg: string; iconColor: string; cols: string }> = {
  'Term Life Insurance': { titleColor: 'text-[#0f2952]', tint: 'bg-blue-50/60', chipBg: 'bg-blue-100/70', iconColor: 'text-blue-700', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' },
  'Health Insurance': { titleColor: 'text-green-600', tint: 'bg-green-50/60', chipBg: 'bg-green-100/70', iconColor: 'text-green-600', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' },
  'Investment Plans': { titleColor: 'text-purple-600', tint: 'bg-purple-50/60', chipBg: 'bg-purple-100/70', iconColor: 'text-purple-600', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' },
  'Other Plans': { titleColor: 'text-orange-500', tint: 'bg-orange-50/60', chipBg: 'bg-orange-100/70', iconColor: 'text-orange-500', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' },
  'Buy Investments Online': { titleColor: 'text-blue-600', tint: 'bg-blue-50/60', chipBg: 'bg-blue-100/70', iconColor: 'text-blue-600', cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' },
}
const DEFAULT_STYLE = SECTION_STYLE['Term Life Insurance']

interface CatalogTile { id: string; title: string; iconKey: string }
interface CatalogSection { section: string; tiles: CatalogTile[] }

export function InvestOnlinePage() {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: queryKeys.catalog.list(),
    queryFn: async () => (await catalogService.getAll<CatalogSection[]>()) ?? [],
  })

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="p-4 sm:p-6 space-y-7 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Invest Online</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore and buy the best insurance plans and investment options online.
        </p>
      </motion.div>

      {sections.map((section) => {
        const style = SECTION_STYLE[section.section] ?? DEFAULT_STYLE
        return (
          <section key={section.section} className="space-y-3">
            <h2 className={`text-base font-bold ${style.titleColor}`}>{section.section}</h2>
            <div className={`grid ${style.cols} gap-4`}>
              {section.tiles.map((tile) => {
                const Icon = ICONS[tile.iconKey] ?? Shield
                return (
                  <button
                    key={tile.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border border-slate-100 ${style.tint} text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${style.chipBg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={style.iconColor} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 leading-tight">{tile.title}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
