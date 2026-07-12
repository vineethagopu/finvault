import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/formatters'

const AVATAR_COLORS = [
  'bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-600',
  'bg-red-600', 'bg-teal-600', 'bg-indigo-600', 'bg-pink-600',
]

function getColor(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover ring-2 ring-white', sizes[size], className)}
      />
    )
  }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', getColor(name), sizes[size], className)}>
      {getInitials(name)}
    </div>
  )
}
