import { useEffect, useState } from 'react'
import { fetchAdminDashboard, type AdminDashboardSummary } from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface SuperADMDashboardPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '-'

const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function SuperADMDashboardPage({ navigate, notify }: SuperADMDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    fetchAdminDashboard()
      .then((data) => {
        if (mounted) setDashboard(data)
      })
      .catch((error) => {
        if (mounted) notify('error', error instanceof Error ? error.message : 'Erro ao carregar dashboard')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [notify])

  const totalRevenue = dashboard?.totalRevenue ?? 0
  const activeBarbershops = dashboard?.activeBarbershops ?? 0
  const totalUsers = dashboard?.totalUsers ?? 0
  const totalBookings = dashboard?.totalBookings ?? 0
  const recentBarbershops = dashboard?.recentBarbershops ?? []
  const monthlyRevenue = dashboard?.monthlyRevenue ?? []
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1)
  const currentPeriod = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const currentYear = new Date().getFullYear()

  return (
    <section
      className="ops-page ops-page-gold super-admin-dashboard-light"
      style={{ background: '#ffffff', color: '#111111' }}
    >
      <div className="ops-workspace" style={{ background: '#ffffff' }}>
        <header className="ops-hero ops-hero-gold" style={{ background: '#ffffff' }}>
          <div>
            <h1>Dashboard</h1>
            <p>Visão geral da plataforma — {currentPeriod}</p>
          </div>
        </header>

        <div className="ops-stat-grid">
          <article className="ops-stat-card accent-gold" style={{ background: '#ffffff' }}>
            <span>Receita total</span>
            <strong>{loading ? '-' : formatCurrency(totalRevenue)}</strong>
            <small>Pagamentos registrados</small>
          </article>
          <article className="ops-stat-card accent-gold" style={{ background: '#ffffff' }}>
            <span>Barbearias ativas</span>
            <strong>{loading ? '-' : activeBarbershops}</strong>
            <small>{dashboard?.totalBarbershops ?? 0} cadastradas</small>
          </article>
          <article className="ops-stat-card accent-gold" style={{ background: '#ffffff' }}>
            <span>Usuários</span>
            <strong>{loading ? '-' : totalUsers.toLocaleString('pt-BR')}</strong>
            <small>Contas cadastradas</small>
          </article>
          <article className="ops-stat-card accent-gold" style={{ background: '#ffffff' }}>
            <span>Agendamentos</span>
            <strong>{loading ? '-' : totalBookings.toLocaleString('pt-BR')}</strong>
            <small>Total registrado</small>
          </article>
        </div>

        <section className="ops-panel chart-panel" style={{ background: '#ffffff' }}>
          <div className="ops-panel-header compact">
            <div>
              <h2>Receita mensal</h2>
              <span>{currentYear}</span>
            </div>
          </div>
          <div className="dashboard-month-bars" aria-label="Receita mensal">
            {monthLabels.map((label, index) => {
              const revenue = monthlyRevenue.find((item) => item.month === index + 1)?.revenue ?? 0
              const height = revenue > 0 ? Math.max((revenue / maxMonthlyRevenue) * 100, 6) : 0

              return (
                <div className="dashboard-month-bar" key={label} title={`${label}: ${formatCurrency(revenue)}`}>
                  <span style={{ height: `${height}%` }} />
                  <small>{label}</small>
                </div>
              )
            })}
          </div>
        </section>

        <section className="ops-panel" style={{ background: '#ffffff' }}>
          <div className="ops-panel-header">
            <div>
              <h2>Barbearias recentes</h2>
            </div>
            <button className="ops-action" onClick={() => navigate('/admin/super/barbershops')}>
              Ver todas
            </button>
          </div>
          <div className="ops-table ops-table-five">
            <div className="ops-table-row">
              <strong>Nome</strong>
              <span>Plano</span>
              <span>Status</span>
              <span>Slug</span>
              <span>Cadastro</span>
            </div>
            {loading ? (
              <div className="ops-table-row">
                <strong>Carregando...</strong>
                <span>-</span>
                <span className="ops-badge info">-</span>
                <span>-</span>
                <span>-</span>
              </div>
            ) : recentBarbershops.length ? (
              recentBarbershops.map((barbershop) => (
                <div className="ops-table-row" key={barbershop.id}>
                  <strong>{barbershop.name}</strong>
                  <span>{barbershop.plan ?? '-'}</span>
                  <span className={'ops-badge ' + (barbershop.setupCompleted ? 'ok' : 'warn')}>
                    {barbershop.setupCompleted ? 'Ativa' : 'Pendente'}
                  </span>
                  <span>{barbershop.slug}</span>
                  <span>{formatDate(barbershop.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="ops-table-row">
                <strong>Nenhuma barbearia cadastrada</strong>
                <span>-</span>
                <span className="ops-badge info">-</span>
                <span>-</span>
                <span>-</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
