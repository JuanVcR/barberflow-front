import { useEffect, useState } from 'react'
import { CalendarIcon, ScissorsIcon } from '../../components/Icons'
import {
  fetchAdminBarbershopDashboard,
  fetchAdminBarbershops,
  type AdminBarbershopDashboard,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface ADMBarbershopDashboardPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function getStatusLabel(status: string) {
  if (status === 'SCHEDULED') return 'Confirmado'
  if (status === 'COMPLETED') return 'Concluído'
  if (status === 'CANCELLED') return 'Cancelado'
  if (status === 'IN_PROGRESS') return 'Em atendimento'
  return 'Pendente'
}

export function ADMBarbershopDashboardPage({ navigate, notify }: ADMBarbershopDashboardPageProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const [dashboard, setDashboard] = useState<AdminBarbershopDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const barbershops = await fetchAdminBarbershops()
        const firstBarbershop = barbershops[0]

        if (!firstBarbershop) {
          setDashboard(null)
          return
        }

        const data = await fetchAdminBarbershopDashboard(firstBarbershop.id)

        if (!mounted) return

        setDashboard(data)
      } catch (error) {
        if (mounted) {
          setDashboard(null)
          notify('error', error instanceof Error ? error.message : 'Erro ao carregar dashboard')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [notify])

  const weekCounts = dashboard?.weeklyBookings.map((item) => item.count) ?? []
  const maxWeekCount = Math.max(...weekCounts, 1)
  const weekTotal = weekCounts.reduce((total, count) => total + count, 0)

  if (!loading && !dashboard) {
    return (
      <section className="ops-page ops-page-gold">
        <div className="ops-workspace">
          <div className="ops-empty-state">
            <h1>Dashboard</h1>
            <p>Nenhuma barbearia vinculada a esta conta.</p>
          </div>
        </div>
      </section>
    )
  }

  const barbershopName = dashboard?.barbershop.name ?? 'Dashboard'

  return (
    <section className="ops-page ops-page-gold">
      <div className="ops-workspace">
        <header className="ops-hero ops-hero-gold">
          <div>
            <h1>{barbershopName}</h1>
            <p>{today.charAt(0).toUpperCase() + today.slice(1)}</p>
          </div>
        </header>

        <div className="ops-stat-grid">
          <article className="ops-stat-card accent-gold">
            <span>Agendamentos hoje</span>
            <CalendarIcon className="ops-card-icon" />
            <strong>{loading ? '-' : dashboard?.todayBookings ?? 0}</strong>
            <small>Registrados para hoje</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Receita hoje</span>
            <strong>{loading ? '-' : formatCurrency(dashboard?.todayRevenue ?? 0)}</strong>
            <small>Pagamentos de hoje</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Barbeiros ativos</span>
            <ScissorsIcon className="ops-card-icon" />
            <strong>{loading ? '-' : dashboard?.barbers.length ?? 0}</strong>
            <small>Cadastrados</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Serviços cadastrados</span>
            <ScissorsIcon className="ops-card-icon" />
            <strong>{loading ? '-' : dashboard?.services.length ?? 0}</strong>
            <small>{dashboard?.totalBookings ?? 0} agendamentos no total</small>
          </article>
        </div>

        <div className="ops-two-columns wide-left">
          <section className="ops-panel agenda-panel">
            <div className="ops-panel-header compact">
              <h2>Agenda de hoje</h2>
            </div>
            <div className="ops-timeline">
              {dashboard?.appointmentsToday.slice(0, 5).map((appointment) => {
                const service = appointment.services?.map((item) => item.service?.name).filter(Boolean).join(', ') || 'Serviço'
                const barber = appointment.barber?.name ?? 'Barbeiro'
                const label = getStatusLabel(appointment.status)

                return (
                  <article
                    className="ops-timeline-item"
                    key={appointment.id}
                    onClick={() => navigate('/booking-detail/' + appointment.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <strong>{appointment.startTime}</strong>
                    <div>
                      <b>{appointment.client?.name ?? 'Cliente'}</b>
                      <span>{service} · {barber}</span>
                    </div>
                    <span className={'ops-badge ' + (label === 'Confirmado' ? 'ok' : label === 'Em atendimento' ? 'warn' : 'info')}>
                      {label}
                    </span>
                  </article>
                )
              })}
              {!loading && dashboard?.appointmentsToday.length === 0 ? (
                <div className="ops-empty-row">Nenhum agendamento para hoje.</div>
              ) : null}
            </div>
          </section>

          <section className="ops-panel week-panel">
            <div className="ops-panel-header compact">
              <div>
                <h2>Esta semana</h2>
                <span>Agendamentos por dia</span>
              </div>
            </div>
            <div className="week-bars" aria-label="Agendamentos por dia">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
                const count = weekCounts[index] ?? 0

                return (
                  <div className="week-bar" key={day}>
                    <strong>{count}</strong>
                    <div className="week-bar-track" title={`${count} agendamento(s)`}>
                      <span
                        className={count ? 'has-bookings' : ''}
                        style={{ height: count ? `${Math.max((count / maxWeekCount) * 100, 14)}%` : '4%' }}
                      />
                    </div>
                    <small>{day}</small>
                  </div>
                )
              })}
            </div>
            <p className="week-total">
              {weekTotal ? `${weekTotal} agendamento(s) nesta semana` : 'Nenhum agendamento nesta semana'}
            </p>
          </section>
        </div>
      </div>
    </section>
  )
}
