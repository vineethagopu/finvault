import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuthStore } from '@/store/authStore'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/modules/public/LandingPage').then(m => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import('@/modules/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/modules/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const CreateAccountPage = lazy(() => import('@/modules/auth/CreateAccountPage').then(m => ({ default: m.CreateAccountPage })))

const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const MyPlanPage = lazy(() => import('@/modules/myplan/MyPlanPage').then(m => ({ default: m.MyPlanPage })))

const InsurancePage = lazy(() => import('@/modules/insurance/InsurancePage').then(m => ({ default: m.InsurancePage })))
const AddPolicyPage = lazy(() => import('@/modules/insurance/AddPolicyPage').then(m => ({ default: m.AddPolicyPage })))
const PolicyDetailsPage = lazy(() => import('@/modules/insurance/PolicyDetailsPage').then(m => ({ default: m.PolicyDetailsPage })))

const InvestmentsPage = lazy(() => import('@/modules/investments/InvestmentsPage').then(m => ({ default: m.InvestmentsPage })))
const AddInvestmentPage = lazy(() => import('@/modules/investments/AddInvestmentPage').then(m => ({ default: m.AddInvestmentPage })))

const LoansPage = lazy(() => import('@/modules/loans/LoansPage').then(m => ({ default: m.LoansPage })))
const AddLoanPage = lazy(() => import('@/modules/loans/AddLoanPage').then(m => ({ default: m.AddLoanPage })))
const LoanDetailsPage = lazy(() => import('@/modules/loans/LoanDetailsPage').then(m => ({ default: m.LoanDetailsPage })))

const DocumentsPage = lazy(() => import('@/modules/documents/DocumentsPage').then(m => ({ default: m.DocumentsPage })))

const BeneficiariesPage = lazy(() => import('@/modules/beneficiaries/BeneficiariesPage').then(m => ({ default: m.BeneficiariesPage })))
const AddBeneficiaryPage = lazy(() => import('@/modules/beneficiaries/AddBeneficiaryPage').then(m => ({ default: m.AddBeneficiaryPage })))

const InvestOnlinePage = lazy(() => import('@/modules/investonline/InvestOnlinePage').then(m => ({ default: m.InvestOnlinePage })))

const ReportsPage = lazy(() => import('@/modules/reports/ReportsPage').then(m => ({ default: m.ReportsPage })))
const NotificationsPage = lazy(() => import('@/modules/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const ProfilePage = lazy(() => import('@/modules/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))

// Route guards
function RequireAuth() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function RequireGuest() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />
  return <Outlet />
}

function PageLoader() {
  return (
    <div className="p-6">
      <DashboardSkeleton />
    </div>
  )
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  // Public routes (guest only)
  {
    element: <RequireGuest />,
    children: [
      { path: '/', element: <SuspenseWrapper><LandingPage /></SuspenseWrapper> },
      { path: '/login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: '/register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
      { path: '/register/:planType', element: <SuspenseWrapper><CreateAccountPage /></SuspenseWrapper> },
    ],
  },

  // Protected app routes
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: 'dashboard', element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper> },
          { path: 'my-plan', element: <SuspenseWrapper><MyPlanPage /></SuspenseWrapper> },
          { path: 'my-plan/premium-calendar', element: <SuspenseWrapper><MyPlanPage /></SuspenseWrapper> },
          { path: 'my-plan/policy-details', element: <Navigate to="/app/my-plan/plan-details/pol-life" replace /> },
          { path: 'my-plan/policy details', element: <Navigate to="/app/my-plan/plan-details/pol-life" replace /> },
          { path: 'my-plan/plan-details/:id', element: <SuspenseWrapper><PolicyDetailsPage /></SuspenseWrapper> },

          // Insurance
          { path: 'insurance', element: <SuspenseWrapper><AddPolicyPage /></SuspenseWrapper> },
          { path: 'insurance/add', element: <SuspenseWrapper><AddPolicyPage /></SuspenseWrapper> },
          { path: 'insurance/:id', element: <SuspenseWrapper><PolicyDetailsPage /></SuspenseWrapper> },

          // Investments
          { path: 'investments', element: <SuspenseWrapper><InvestmentsPage /></SuspenseWrapper> },
          { path: 'investments/add', element: <SuspenseWrapper><AddInvestmentPage /></SuspenseWrapper> },

          // Loans
          { path: 'loans', element: <SuspenseWrapper><LoansPage /></SuspenseWrapper> },
          { path: 'loans/add', element: <SuspenseWrapper><AddLoanPage /></SuspenseWrapper> },
          { path: 'loans/:id', element: <SuspenseWrapper><LoanDetailsPage /></SuspenseWrapper> },

          // Documents
          { path: 'documents', element: <SuspenseWrapper><DocumentsPage /></SuspenseWrapper> },

          // Invest Online
          { path: 'invest-online', element: <SuspenseWrapper><InvestOnlinePage /></SuspenseWrapper> },
          { path: 'buy-investments', element: <SuspenseWrapper><InvestOnlinePage /></SuspenseWrapper> },

          // Beneficiaries
          { path: 'beneficiaries', element: <SuspenseWrapper><BeneficiariesPage /></SuspenseWrapper> },
          { path: 'beneficiaries/add', element: <SuspenseWrapper><AddBeneficiaryPage /></SuspenseWrapper> },

          // Reports, notifications, profile
          { path: 'reports', element: <SuspenseWrapper><ReportsPage /></SuspenseWrapper> },
          { path: 'notifications', element: <SuspenseWrapper><NotificationsPage /></SuspenseWrapper> },
          { path: 'alerts', element: <SuspenseWrapper><NotificationsPage /></SuspenseWrapper> },
          { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
        ],
      },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])
