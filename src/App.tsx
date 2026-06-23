import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { Layout } from './components/Layout'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import type { AppRoute, ToastMessage } from './types/models'
import { getDashboardPathForRole, getPathSegments, getQueryParams, navigateTo } from './utils/navigation'

// Public Pages
import { LandingPage } from './pages/public/LandingPage'
import { BarbershopListPublicPage } from './pages/public/BarbershopListPublicPage'
import { BarbershopDetailsPublicPage } from './pages/public/BarbershopDetailsPublicPage'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { ProfessionalLoginPage } from './pages/auth/ProfessionalLoginPage'
import { ProfessionalRegisterPage } from './pages/auth/ProfessionalRegisterPage'
import { BarberInvitePage } from './pages/auth/BarberInvitePage'

// Customer Pages
import { ExplorePage } from './pages/customer/explore/ExplorePage'
import { AppointmentsPage } from './pages/customer/appointments/AppointmentsPage'
import { BookingPage } from './pages/customer/booking/BookingPage'
import { CustomerProfilePage } from './pages/customer/appointments/CustomerProfilePage'

// Professional Pages
import { ServicesPage } from './pages/professional/services/ServicesPage'
import { AvailabilityPage } from './pages/professional/availability/AvailabilityPage'
import { BlockingPage } from './pages/professional/blocking/BlockingPage'

// Admin Pages
import { ServicesManagePage } from './pages/admin/services/ServicesManagePage'
import { TeamPage } from './pages/admin/team/TeamPage'
import { SettingsPage } from './pages/admin/settings/SettingsPage'
import { SuperADMDashboardPage } from './pages/admin/SuperADMDashboardPage'
import { ADMBarbershopDashboardPage } from './pages/admin/ADMBarbershopDashboardPage'
import { SuperAdminPlansPage } from './pages/admin/SuperAdminPlansPage'
import { SuperAdminUsersPage } from './pages/admin/SuperAdminUsersPage'
import { RegistrationManagementPage } from './pages/admin/RegistrationManagementPage'
import { BarberManagementPage } from './pages/admin/barbershop/BarberManagementPage'
import { AdminBarberDayPage } from './pages/admin/barbershop/AdminBarberDayPage'
import { AdminBarberHistoryPage } from './pages/admin/barbershop/AdminBarberHistoryPage'
import { ReportsPage } from './pages/admin/reports/ReportsPage'
import { SuperAdminBarbershopsPage } from './pages/admin/SuperAdminBarbershopsPage'

// Professional Pages (Additional)
import { BarberAgendaPage } from './pages/professional/schedule/BarberAgendaPage'
import { BarberReportsPage } from './pages/professional/reports/BarberReportsPage'
import { BarberHistoryPage } from './pages/professional/history/BarberHistoryPage'
import { BarberProfilePage } from './pages/professional/profile/BarberProfilePage'

import { BookingDetailsPage } from './pages/BookingDetailsPage'
import { StaffWeekAgendaPage } from './pages/shared/StaffWeekAgendaPage'
import { QuickBookingPage } from './pages/shared/QuickBookingPage'

function parseRoute(): AppRoute {
  const segments = getPathSegments()
  const params = getQueryParams()

  if (segments.length === 0) return { name: 'landing' }

  // Auth routes
  if (segments[0] === 'auth') {
    if (segments[1] === 'login') return { name: 'auth-login' }
    if (segments[1] === 'register') return { name: 'auth-register' }
    if (segments[1] === 'forgot-password') return { name: 'auth-forgot-password' }
    if (segments[1] === 'reset-password') return { name: 'auth-reset-password', token: params.get('token') ?? undefined }
    if (segments[1] === 'professional-login') return { name: 'auth-professional-login' }
    if (segments[1] === 'professional-register') return { name: 'auth-professional-register' }
    if (segments[1] === 'barber-invite') return { name: 'auth-barber-invite', token: params.get('token') ?? undefined }
  }

  // Public routes
  if (segments[0] === 'public') {
    if (segments[1] === 'barbershops') return { name: 'public-barbershops', search: params.get('search') ?? undefined }
    if (segments[1] === 'barbershop' && segments[2]) return { name: 'public-barbershop-details', slug: segments[2] }
  }

  // Customer routes
  if (segments[0] === 'customer') {
    if (segments[1] === 'explore') return { name: 'customer-explore' }
    if (segments[1] === 'appointments' && segments[2]) {
      return { name: 'booking-detail', bookingId: segments[2] }
    }
    if (segments[1] === 'appointments') return { name: 'customer-appointments' }
    if (segments[1] === 'booking' && segments[2]) {
      return {
        name: 'customer-booking',
        barbershopId: segments[2],
        serviceId: params.get('service') ?? undefined,
      }
    }
    if (segments[1] === 'profile') return { name: 'customer-profile' }
  }

  // Professional routes
  if (segments[0] === 'professional') {
    if (segments[1] === 'dashboard') return { name: 'professional-dashboard' }
    if (segments[1] === 'schedule') return { name: 'professional-schedule' }
    if (segments[1] === 'services') return { name: 'professional-services' }
    if (segments[1] === 'availability') return { name: 'professional-availability' }
    if (segments[1] === 'blocking') return { name: 'professional-blocking' }
    if (segments[1] === 'agenda') return { name: 'professional-agenda' }
    if (segments[1] === 'quick-booking') return { name: 'professional-quick-booking' }
    if (segments[1] === 'reports') return { name: 'professional-reports' }
    if (segments[1] === 'history') return { name: 'professional-history' }
    if (segments[1] === 'current') return { name: 'professional-current' }
    if (segments[1] === 'availability-new') return { name: 'professional-availability-new' }
    if (segments[1] === 'profile') return { name: 'professional-profile' }
  }

  // Admin routes
  if (segments[0] === 'admin') {
    if (segments[1] === 'dashboard' || !segments[1]) return { name: 'admin-dashboard' }
    if (segments[1] === 'barbershops') return { name: 'admin-barbershops' }
    if (segments[1] === 'services') return { name: 'admin-services', barbershopId: params.get('barbershopId') ?? undefined }
    if (segments[1] === 'working-hours') return { name: 'admin-working-hours', barbershopId: params.get('barbershopId') ?? undefined }
    if (segments[1] === 'team') return { name: 'admin-team' }
    if (segments[1] === 'reports') return { name: 'admin-reports' }
    if (segments[1] === 'settings') return { name: 'admin-settings' }
    if (segments[1] === 'super-admin') return { name: 'admin-super' }
    if (segments[1] === 'super' && ['barbershops', 'registrations', 'plans', 'financial-reports', 'users', 'settings'].includes(segments[2])) {
      return { name: 'admin-super-section', section: segments[2] as 'barbershops' | 'registrations' | 'plans' | 'financial-reports' | 'users' | 'settings' }
    }
    if (segments[1] === 'barbershop-dashboard') return { name: 'admin-barbershop-dashboard' }
    if (segments[1] === 'appointments') return { name: 'admin-week-agenda' }
    if (segments[1] === 'quick-booking') return { name: 'admin-quick-booking' }
    if (segments[1] === 'barbers' && segments[2] && segments[3] === 'day') {
      return {
        name: 'admin-barber-day',
        barberId: segments[2],
        barbershopId: params.get('barbershopId') ?? '',
        barberName: params.get('name') ?? undefined,
      }
    }
    if (segments[1] === 'barbers' && segments[2] && segments[3] === 'history') {
      return {
        name: 'admin-barber-history',
        barberId: segments[2],
        barbershopId: params.get('barbershopId') ?? '',
        barberName: params.get('name') ?? undefined,
      }
    }
    if (segments[1] === 'barber-management') return { name: 'admin-barber-management' }
    if (segments[1] === 'barber-invites') return { name: 'admin-barber-invites' }
    if (segments[1] === 'service-management') return { name: 'admin-service-management' }
    if (['working-hours', 'customers'].includes(segments[1])) {
      return { name: 'admin-barbershop-section', section: segments[1] as 'working-hours' | 'customers' }
    }
  }

  // Redirect-compatible aliases
  if (segments[0] === 'login') return { name: 'auth-login' }
  if (segments[0] === 'register') return { name: 'auth-register' }
  if (segments[0] === 'barbershops') return { name: 'public-barbershops' }
  if (segments[0] === 'barbershop' && segments[1]) {
    return { name: 'public-barbershop-details', slug: segments[1] }
  }
  if (segments[0] === 'book' && segments[1]) {
    return {
      name: 'customer-booking',
      barbershopId: segments[1],
      serviceId: params.get('service') ?? undefined,
    }
  }
  if (segments[0] === 'booking-detail' && segments[1]) return { name: 'booking-detail', bookingId: segments[1] }
  if (segments[0] === 'account') return { name: 'customer-profile' }
  if (segments[0] === 'partner' && segments[1] === 'login') return { name: 'auth-professional-login' }
  if (segments[0] === 'partner' && segments[1] === 'create') return { name: 'landing' }
  if (segments[0] === 'home') return { name: 'landing' }

  return { name: 'landing' }
}

function AppShell() {
  const { user, partnerUser, isAuthReady, isAuthenticated, isPartnerAuthenticated } = useAuth()
  const [route, setRoute] = useState<AppRoute>(() => parseRoute())
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const syncRoute = () => setRoute(parseRoute())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    const activeUser = user ?? partnerUser
    const isLogged = isAuthenticated || isPartnerAuthenticated

    if (isAuthReady && isLogged && route.name === 'landing') {
      navigateTo(getDashboardPathForRole(activeUser?.role, activeUser?.accountRole))
    }
  }, [isAuthReady, isAuthenticated, isPartnerAuthenticated, partnerUser, route.name, user])

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const notify = (tone: ToastMessage['tone'], text: string) => {
    const id = window.crypto?.randomUUID?.() ?? String(Date.now())
    setToasts((current) => [...current, { id, tone, text }])
    if (tone !== 'loading') {
      window.setTimeout(() => dismissToast(id), 4200)
    }
  }

  const page = useMemo(() => {
    const activeUser = user ?? partnerUser
    const isLogged = isAuthenticated || isPartnerAuthenticated
    const accountRole = activeUser?.accountRole
    const isCustomer = isAuthenticated && (accountRole === 'CLIENT' || activeUser?.role === 'customer')
    const isBarber = isLogged && (accountRole === 'BARBER' || activeUser?.role === 'professional')
    const isSuperAdmin = isLogged && accountRole === 'SUPER_ADMIN'
    const isBarbershopAdmin =
      isLogged && (accountRole === 'BARBERSHOP_ADMIN' || (activeUser?.role === 'admin' && accountRole !== 'SUPER_ADMIN'))
    const isAnyAdmin = isSuperAdmin || isBarbershopAdmin

    if (!isAuthReady && route.name === 'landing') {
      return <LandingPage navigate={navigateTo} />
    }

    // Auth Routes
    if (route.name === 'auth-login') return <LoginPage navigate={navigateTo} notify={notify} />
    if (route.name === 'auth-register') return <RegisterPage navigate={navigateTo} notify={notify} />
    if (route.name === 'auth-forgot-password') return <ForgotPasswordPage navigate={navigateTo} notify={notify} />
    if (route.name === 'auth-reset-password') return <ResetPasswordPage token={route.token} navigate={navigateTo} notify={notify} />
    if (route.name === 'auth-professional-login') return <ProfessionalLoginPage navigate={navigateTo} notify={notify} />
    if (route.name === 'auth-professional-register') return <ProfessionalRegisterPage navigate={navigateTo} notify={notify} />
    if (route.name === 'auth-barber-invite') return <BarberInvitePage token={route.token} navigate={navigateTo} notify={notify} />

    if (isLogged && route.name === 'landing') {
      return null
    }

    if ((isAnyAdmin || isBarber) && (
      route.name === 'public-barbershops' ||
      route.name === 'public-barbershop-details' ||
      route.name === 'barbershops' ||
      route.name === 'barbershop-details'
    )) {
      navigateTo(getDashboardPathForRole(activeUser?.role, activeUser?.accountRole))
      return <LandingPage navigate={navigateTo} />
    }

    // Public Routes
    if (route.name === 'landing') return <LandingPage navigate={navigateTo} />
    if (route.name === 'public-barbershops') {
      return <BarbershopListPublicPage navigate={navigateTo} searchTerm={route.search} />
    }
    if (route.name === 'public-barbershop-details') {
      return (
        <BarbershopDetailsPublicPage
          slug={route.slug}
          navigate={navigateTo}
          notify={notify}
          isAuthenticated={isAuthenticated}
        />
      )
    }

    // Customer Routes (Protected)
    if (isCustomer) {
      if (route.name === 'customer-explore') return <ExplorePage navigate={navigateTo} />
      if (route.name === 'customer-appointments') return <AppointmentsPage navigate={navigateTo} notify={notify} />
      if (route.name === 'customer-booking') {
        return (
          <BookingPage
            barbershopId={route.barbershopId!}
            navigate={navigateTo}
            notify={notify}
          />
        )
      }
      if (route.name === 'customer-profile') return <CustomerProfilePage user={user} navigate={navigateTo} notify={notify} />
    }

    // Professional Routes (Protected)
    if (isBarber) {
      if (route.name === 'professional-dashboard') {
        navigateTo('/professional/agenda')
        return <BarberAgendaPage navigate={navigateTo} notify={notify} />
      }
      if (route.name === 'professional-schedule') return <BarberAgendaPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-services') return <ServicesPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-availability') return <AvailabilityPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-blocking') return <BlockingPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-agenda') return <BarberAgendaPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-quick-booking') return <QuickBookingPage mode="barber" navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-reports') return <BarberReportsPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-history') return <BarberHistoryPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-current') return <BarberAgendaPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-availability-new') return <AvailabilityPage navigate={navigateTo} notify={notify} />
      if (route.name === 'professional-profile') return <BarberProfilePage navigate={navigateTo} notify={notify} />
    }

    // Admin Routes (Protected)
    if (isAnyAdmin) {
      if (route.name === 'admin-dashboard') {
        if (isSuperAdmin) return <SuperADMDashboardPage navigate={navigateTo} notify={notify} />
        return <ADMBarbershopDashboardPage navigate={navigateTo} notify={notify} />
      }
      if (route.name === 'admin-services') return <ServicesManagePage barbershopId={route.barbershopId} navigate={navigateTo} notify={notify} />
      if (route.name === 'admin-team') return <TeamPage notify={notify} />
      if (route.name === 'admin-reports') return <ReportsPage />
      if (route.name === 'admin-settings') return <SettingsPage navigate={navigateTo} notify={notify} />
      if (route.name === 'admin-super') {
        if (!isSuperAdmin) return <ADMBarbershopDashboardPage navigate={navigateTo} notify={notify} />
        return <SuperADMDashboardPage navigate={navigateTo} notify={notify} />
      }
      if (route.name === 'admin-super-section') {
        if (!isSuperAdmin) return <ADMBarbershopDashboardPage navigate={navigateTo} notify={notify} />
        if (route.section === 'registrations') return <RegistrationManagementPage isSuperAdmin notify={notify} />
        if (route.section === 'barbershops') {
          return <SuperAdminBarbershopsPage navigate={navigateTo} notify={notify} />
        }
        if (route.section === 'plans') return <SuperAdminPlansPage notify={notify} />
        if (route.section === 'financial-reports') return <ReportsPage />
        if (route.section === 'users') return <SuperAdminUsersPage />
        return <SuperADMDashboardPage navigate={navigateTo} notify={notify} />
      }
      if (route.name === 'admin-barbershop-dashboard') {
        if (isSuperAdmin) return <SuperADMDashboardPage navigate={navigateTo} notify={notify} />
        return <ADMBarbershopDashboardPage navigate={navigateTo} notify={notify} />
      }
      if (route.name === 'admin-week-agenda') return <StaffWeekAgendaPage mode="admin" navigate={navigateTo} notify={notify} />
      if (route.name === 'admin-quick-booking') return <QuickBookingPage mode="admin" navigate={navigateTo} notify={notify} />
      if (route.name === 'admin-barber-management') {
        return <BarberManagementPage navigate={navigateTo} notify={notify} />
      }
      if (route.name === 'admin-barber-day') {
        return (
          <AdminBarberDayPage
            barberId={route.barberId}
            barbershopId={route.barbershopId}
            barberName={route.barberName}
            navigate={navigateTo}
            notify={notify}
          />
        )
      }
      if (route.name === 'admin-barber-history') {
        return (
          <AdminBarberHistoryPage
            barberId={route.barberId}
            barbershopId={route.barbershopId}
            barberName={route.barberName}
            navigate={navigateTo}
            notify={notify}
          />
        )
      }
      if (route.name === 'admin-barber-invites') {
        if (isSuperAdmin) return <RegistrationManagementPage isSuperAdmin notify={notify} />
        return <RegistrationManagementPage isSuperAdmin={false} notify={notify} />
      }
      if (route.name === 'admin-service-management') return <ServicesManagePage navigate={navigateTo} notify={notify} />
      if (route.name === 'admin-barbershop-section') {
        return <ADMBarbershopDashboardPage navigate={navigateTo} notify={notify} />
      }
    }

    if (route.name === 'booking-detail') return <BookingDetailsPage bookingId={route.bookingId} navigate={navigateTo} notify={notify} />

    if (isLogged) {
      navigateTo(getDashboardPathForRole(activeUser?.role, activeUser?.accountRole))
      return <LandingPage navigate={navigateTo} />
    }

    // Default
    return <LandingPage navigate={navigateTo} />
  }, [isAuthReady, isAuthenticated, isPartnerAuthenticated, partnerUser, user, route])

  return (
    <Layout currentRoute={route.name} navigate={navigateTo} toasts={toasts} dismissToast={dismissToast}>
      {page}
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
