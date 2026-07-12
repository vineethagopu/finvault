import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Shield, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const NAV = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/#about' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="shrink-0">
          <Logo size="sm" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                location.hash === item.href.split('#')[1] ? 'text-green-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Shield size={13} className="text-green-600" />
            Bank Level Security
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium">
            <HelpCircle size={15} /> Help
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Login</Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="bg-[#0a1f3d] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo size="sm" />
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Secure Today. Better Tomorrow. Building a safer and smarter tomorrow for you and your loved ones.
            </p>
            <div className="flex gap-3 mt-4">
              {['Insurance', 'Investments', 'Loans', 'Beneficiaries'].map((item) => (
                <div key={item} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors" title={item}>
                  <Shield size={14} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            {['Features', 'How It Works', 'Pricing', 'Security'].map((item) => (
              <Link key={item} to="/" className="block text-sm text-slate-400 hover:text-white mb-2 transition-colors">{item}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            {['About Us', 'Blog', 'Careers', 'Contact'].map((item) => (
              <Link key={item} to="/" className="block text-sm text-slate-400 hover:text-white mb-2 transition-colors">{item}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item) => (
              <Link key={item} to="/" className="block text-sm text-slate-400 hover:text-white mb-2 transition-colors">{item}</Link>
            ))}
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2025 PolicyNext Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Shield size={11} className="text-green-500" /> Bank Level Security</span>
            <span>256-bit Encryption</span>
            <span>Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
    </div>
  )
}
