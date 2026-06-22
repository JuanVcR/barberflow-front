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

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function formatShortDay(day: string) {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatWeekDay(day: string) {
  const [year, month, date] = day.split('-').map(Number)
  const label = new Date(year, month - 1, date).toLocaleDateString('pt-BR', {
    weekday: 'short',
  })
  return label.replace('.', '').replace(/^./, (letter) => letter.toUpperCase())
}

function formatAppointmentStatus(status: string) {
  if (status === 'CANCELLED') return 'Cancelado'
  if (status === 'COMPLETED') return 'Concluído'
  return 'Agendado'
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
          <section className="ops-panel dashboard-list-panel">
            <div className="ops-panel-header compact">
              <div>
                <h2>Agenda da semana</h2>
                <span>Próximos agendamentos</span>
              </div>
            </div>
            <div className="dashboard-compact-list">
              {dashboard?.upcomingWeekAppointments.map((appointment, index) => {
                const service = appointment.services?.map((item) => item.service?.name).filter(Boolean).join(', ') || 'Serviço'
                const barber = appointment.barber?.name ?? 'Barbeiro'

                return (
                  <article
                    className="dashboard-appointment-row"
                    key={appointment.id}
                    onClick={() => navigate('/booking-detail/' + appointment.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <strong>{appointment.startTime}</strong>
                    <span className={`dashboard-avatar color-${index % 5}`}>{getInitials(barber)}</span>
                    <div>
                      <b>{barber}</b>
                      <span>{service}</span>
                      <small>
                        {appointment.client?.name ?? 'Cliente'} · {formatAppointmentStatus(appointment.status)}
                      </small>
                    </div>
                    <span className={`dashboard-day-pill color-${index % 5}`}>{formatWeekDay(appointment.day)}</span>
                  </article>
                )
              })}
              {!loading && dashboard?.upcomingWeekAppointments.length === 0 ? (
                <div className="ops-empty-row">Nenhum agendamento para o restante desta semana.</div>
              ) : null}
            </div>
          </section>

          <section className="ops-panel dashboard-list-panel">
            <div className="ops-panel-header compact">
              <div>
                <h2>Clientes ativos</h2>
                <span>Clientes da barbearia</span>
              </div>
            </div>
            <div className="dashboard-compact-list">
              {dashboard?.activeClients.map((client, index) => (
                <article className="dashboard-client-row" key={client.id}>
                  <span className={`dashboard-avatar color-${index % 5}`}>{getInitials(client.name)}</span>
                  <div>
                    <b>{client.name}</b>
                    <span>{client.lastVisit ? `Última ${formatShortDay(client.lastVisit)}` : 'Sem visita concluída'}</span>
                  </div>
                  <strong>{client.visits}<small>visitas</small></strong>
                </article>
              ))}
              {!loading && dashboard?.activeClients.length === 0 ? (
                <div className="ops-empty-row">Nenhum cliente vinculado à barbearia.</div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
