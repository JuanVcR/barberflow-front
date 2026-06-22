import type { PropsWithChildren } from 'react'
import { useAuth } from '../context/useAuth'
import type { AppRoute, ToastMessage } from '../types/models'
import { getDashboardPathForRole } from '../utils/navigation'
import {
  CalendarIcon,
  ClipboardIcon,
  ClockIcon,
  HomeIcon,
  LogoutIcon,
  MailIcon,
  ScissorsIcon,
  SettingsIcon,
  ShieldIcon,
  StoreIcon,
  UserIcon,
  UsersIcon,
} from './Icons'

interface LayoutProps extends PropsWithChildren {
  currentRoute: AppRoute['name']
  navigate: (path: string) => void
  toasts: ToastMessage[]
}

export function Layout({ children, currentRoute, navigate, toasts }: LayoutProps) {
  const { user, partnerUser, isAuthenticated, isPartnerAuthenticated, logout } = useAuth()
  const activeUser = user ?? partnerUser
  const accountRole = activeUser?.accountRole
  const isPublicRoute =
    currentRoute === 'landing' ||
    currentRoute === 'home' ||
    currentRoute === 'public-barbershops' ||
    currentRoute === 'public-barbershop-details' ||
    currentRoute === 'barbershops' ||
    currentRoute === 'barbershop-details' ||
    currentRoute === 'login' ||
    currentRoute === 'register' ||
    currentRoute.startsWith('auth-')
  const hasRoleShell =
    (isAuthenticated || isPartnerAuthenticated) && !isPublicRoute
      ? accountRole === 'SUPER_ADMIN' ||
        accountRole === 'BARBERSHOP_ADMIN' ||
        accountRole === 'BARBER' ||
        accountRole === 'CLIENT' ||
        activeUser?.role === 'professional' ||
        activeUser?.role === 'customer'
      : false
  const dashboardPath = getDashboardPathForRole(activeUser?.role, activeUser?.accountRole)
  const currentPath = window.location.hash.replace(/^#/, '') || '/'
  const dashboardLabel =
    accountRole === 'SUPER_ADMIN'
      ? 'Super ADM'
      : accountRole === 'BARBERSHOP_ADMIN'
        ? 'ADM barbearia'
        : accountRole === 'BARBER' || activeUser?.role === 'professional'
          ? 'Agenda'
          : 'Cliente'

  const sidebarItems =
    accountRole === 'SUPER_ADMIN'
      ? [
          { label: 'Dashboard', path: '/admin/super-admin', icon: HomeIcon, active: currentRoute === 'admin-super' || currentRoute === 'admin-dashboard' },
          { label: 'Barbearias', path: '/admin/super/barbershops', icon: StoreIcon, active: currentPath === '/admin/super/barbershops' },
          { label: 'Cadastros', path: '/admin/super/registrations', icon: UsersIcon, active: currentPath === '/admin/super/registrations' },
          { label: 'Planos', path: '/admin/super/plans', icon: ClipboardIcon, active: currentPath === '/admin/super/plans' },
          { label: 'Usuários', path: '/admin/super/users', icon: UsersIcon, active: currentPath === '/admin/super/users' },
        ]
      : accountRole === 'BARBERSHOP_ADMIN'
        ? [
            { label: 'Dashboard', path: '/admin/barbershop-dashboard', icon: HomeIcon, active: currentRoute === 'admin-barbershop-dashboard' || currentRoute === 'admin-dashboard' },
            { label: 'Agenda', path: '/admin/appointments', icon: CalendarIcon, active: currentRoute === 'admin-week-agenda' },
            { label: 'Cadastrar cliente', path: '/admin/quick-booking', icon: UserIcon, active: currentRoute === 'admin-quick-booking' },
            { label: 'Barbeiros', path: '/admin/barber-management', icon: UsersIcon, active: ['admin-barber-management', 'admin-barber-day', 'admin-barber-history'].includes(currentRoute) },
            { label: 'Convidar', path: '/admin/barber-invites', icon: MailIcon, active: currentRoute === 'admin-barber-invites' },
            { label: 'Serviços', path: '/admin/service-management', icon: ScissorsIcon, active: currentRoute === 'admin-service-management' },
            { label: 'Configurações', path: '/admin/settings', icon: SettingsIcon, active: currentRoute === 'admin-settings' },
          ]
        : accountRole === 'CLIENT' || activeUser?.role === 'customer'
          ? [
              { label: 'Agendamentos', path: '/customer/appointments', icon: CalendarIcon, active: currentRoute === 'customer-appointments' },
              { label: 'Barbearias', path: '/customer/explore', icon: StoreIcon, active: currentRoute === 'customer-explore' || currentRoute === 'customer-booking' },
              { label: 'Perfil', path: '/customer/profile', icon: UserIcon, active: currentRoute === 'customer-profile' },
            ]
          : [
            { label: 'Agenda', path: '/professional/agenda', icon: CalendarIcon, active: currentRoute === 'professional-agenda' || currentRoute === 'professional-dashboard' },
            { label: 'Cadastrar cliente', path: '/professional/quick-booking', icon: UserIcon, active: currentRoute === 'professional-quick-booking' },
            { label: 'Histórico', path: '/professional/history', icon: ClipboardIcon, active: currentRoute === 'professional-history' },
            { label: 'Disponibilidade', path: '/professional/availability-new', icon: ClockIcon, active: currentRoute === 'professional-availability-new' || currentRoute === 'professional-availability' },
            { label: 'Perfil', path: '/professional/profile', icon: UserIcon, active: currentRoute === 'professional-profile' },
          ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (currentRoute === 'auth-barber-invite') {
    return (
      <>
        <div className="page-transition" key={currentPath}>{children}</div>
        <div className="toast-stack" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className={'toast toast-' + toast.tone}>
              {toast.text}
            </div>
          ))}
        </div>
      </>
    )
  }

  if (hasRoleShell) {
    return (
      <div className="role-app-shell" style={{ background: '#ffffff', color: '#111111' }}>
        <aside
          className="role-sidebar"
          aria-label="Navegação do painel"
          style={{ background: '#ffffff', color: '#111111', borderColor: '#eeeeee' }}
        >
          <button className="role-brand" onClick={() => navigate(dashboardPath)}>
            {accountRole === 'SUPER_ADMIN' ? <ShieldIcon className="icon-sm" /> : <ScissorsIcon className="icon-sm" />}
            <span>{'BarberFlow'}</span>
          </button>

          <div className="role-access">
            <span>{'Modo de acesso'}</span>
            <strong>{dashboardLabel === 'Agenda' ? 'Barbeiro' : dashboardLabel}</strong>
          </div>

          <nav className="role-nav" aria-label="Menu principal">
            {sidebarItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  className={'role-nav-link ' + (item.active ? 'active' : '')}
                  key={item.label}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="icon-sm" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <button className="role-logout" onClick={handleLogout}>
            <LogoutIcon className="icon-sm" />
            <span>{'Sair'}</span>
          </button>
        </aside>

        <main className="role-main" style={{ background: '#ffffff', color: '#111111' }}>
          <div className="page-transition" key={currentPath}>{children}</div>
        </main>

        <div className="toast-stack" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className={'toast toast-' + toast.tone}>
              {toast.text}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="shell container header-row">
          <button className="brand" onClick={() => navigate('/')}>
            <ScissorsIcon className="icon-lg" />
            <span>{'BarberFlow'}</span>
          </button>

          <nav className="desktop-nav" aria-label="Primary">
            <button
              className={'nav-link ' + (currentRoute === 'home' ? 'active' : '')}
              onClick={() => navigate('/')}
            >
              <HomeIcon className="icon-sm" />
              {'In\u00edcio'}
            </button>
            <button
              className={'nav-link ' + (currentRoute === 'barbershops' ? 'active' : '')}
              onClick={() => navigate('/barbershops')}
            >
              {'Barbearias'}
            </button>
            {activeUser && (
              <button
                className={'nav-link ' + (currentRoute === 'account' ? 'active' : '')}
                onClick={() => navigate(dashboardPath)}
              >
                <CalendarIcon className="icon-sm" />
                {dashboardLabel}
              </button>
            )}
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <button className="ghost-button" onClick={() => navigate(dashboardPath)}>
                  <UserIcon className="icon-sm" />
                  <span className="header-user-name">{user?.name}</span>
                </button>
                <button className="ghost-button icon-only" onClick={handleLogout} aria-label="Sair">
                  <LogoutIcon className="icon-sm" />
                </button>
              </>
            ) : isPartnerAuthenticated ? (
              <>
                <button className="ghost-button" onClick={() => navigate(dashboardPath)}>
                  <StoreIcon className="icon-sm" />
                  <span className="header-user-name">{partnerUser?.name}</span>
                </button>
                <button className="ghost-button icon-only" onClick={handleLogout} aria-label="Sair">
                  <LogoutIcon className="icon-sm" />
                </button>
              </>
            ) : (
              <>
                <button className="ghost-button" onClick={() => navigate('/login')}>
                  {'Entrar'}
                </button>
                <button className="primary-button" onClick={() => navigate('/register')}>
                  {'Criar conta'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="shell mobile-nav" aria-label="Mobile navigation">
          <button
            className={'mobile-nav-link ' + (currentRoute === 'home' ? 'active' : '')}
            onClick={() => navigate('/')}
          >
            <HomeIcon className="icon-sm" />
            <span>{'In\u00edcio'}</span>
          </button>
          <button
            className={'mobile-nav-link ' + (currentRoute === 'barbershops' ? 'active' : '')}
            onClick={() => navigate('/barbershops')}
          >
            <ScissorsIcon className="icon-sm" />
            <span>{'Barbearias'}</span>
          </button>
          <button
            className={'mobile-nav-link ' + (currentRoute === 'account' ? 'active' : '')}
            onClick={() => navigate(activeUser ? dashboardPath : '/login')}
          >
            {activeUser ? <CalendarIcon className="icon-sm" /> : <UserIcon className="icon-sm" />}
            <span>{activeUser ? dashboardLabel : 'Entrar'}</span>
          </button>
        </div>
      </header>

      <main><div className="page-transition" key={currentPath}>{children}</div></main>

      <footer className="site-footer">
        <div className="shell container footer-grid">
          <div>
            <h3>{'Sobre'}</h3>
            <ul>
              <li>{'Quem somos'}</li>
              <li>{'Nossa hist\u00f3ria'}</li>
              <li>{'Trabalhe conosco'}</li>
            </ul>
          </div>
          <div>
            <h3>{'Links r\u00e1pidos'}</h3>
            <ul>
              <li>
                <button onClick={() => navigate('/barbershops')}>{'Barbearias'}</button>
              </li>
              <li>
                <button onClick={() => navigate('/partner/login')}>{'\u00c1rea do parceiro'}</button>
              </li>
              <li>{'FAQ'}</li>
            </ul>
          </div>
          <div>
            <h3>{'Contato'}</h3>
            <ul>
              <li>{'(11) 3030-3030'}</li>
              <li>{'contato@barberflow.com'}</li>
              <li>{'S\u00e3o Paulo, SP'}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">{'(c) 2026 BarberFlow. Todos os direitos reservados.'}</div>
      </footer>

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={'toast toast-' + toast.tone}>
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  )
}
