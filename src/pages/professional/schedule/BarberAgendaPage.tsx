import { useEffect, useState } from 'react'
import { getProfessionalAppointments, getProfessionalStats } from '../../../services/backend'
import type { Booking, ToastMessage } from '../../../types/models'

interface BarberAgendaPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

type Stats = {
  appointments: number
  revenue: number
  avgRating: number
}

const todayIso = () => new Date().toISOString().split('T')[0]

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function BarberAgendaPage({ navigate, notify }: BarberAgendaPageProps) {
  const [selectedDate] = useState(new Date().toLocaleDateString('pt-BR'))
  const [appointments, setAppointments] = useState<Booking[]>([])
  const [stats, setStats] = useState<Stats>({ appointments: 0, revenue: 0, avgRating: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.all([
      getProfessionalStats('me').catch(() => ({ appointments: 0, revenue: 0, avgRating: 0 })),
      getProfessionalAppointments('me', todayIso()).catch(() => []),
    ])
      .then(([statsData, appointmentsData]) => {
        if (!mounted) return
        setStats(statsData)
        setAppointments(appointmentsData)
      })
      .catch((error) => {
        if (mounted) notify('error', error instanceof Error ? error.message : 'Erro ao carregar agenda')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [notify])

  return (
    <section className="ops-page ops-page-gold">
      <div className="ops-workspace">
        <header className="ops-hero ops-hero-gold">
          <div>
            <span className="ops-kicker">Barbeiro</span>
            <h1>Agenda</h1>
            <p>Data: {selectedDate}</p>
          </div>
          <div className="ops-hero-actions">
            <button className="ops-action" onClick={() => navigate('/professional/availability-new')}>
              Disponibilidade
            </button>
            <button className="ops-action dark" onClick={() => navigate('/professional/history')}>
              Histórico
            </button>
          </div>
        </header>

        <div className="ops-stat-grid">
          <article className="ops-stat-card accent-gold">
            <span>Agendamentos</span>
            <strong>{loading ? '-' : stats.appointments}</strong>
            <small>Total do backend</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Receita</span>
            <strong>{loading ? '-' : formatCurrency(stats.revenue)}</strong>
            <small>Pagamentos registrados</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Hoje</span>
            <strong>{loading ? '-' : appointments.length}</strong>
            <small>Na agenda do dia</small>
          </article>
        </div>

        <section className="ops-panel">
          <div className="ops-panel-header">
            <div>
              <span className="ops-kicker">Banco de dados</span>
              <h2>Horários</h2>
            </div>
          </div>

          <div className="ops-timeline">
            {loading ? (
              <article className="ops-timeline-item">
                <strong>--:--</strong>
                <div>
                  <b>Carregando...</b>
                  <span>-</span>
                </div>
                <span className="ops-badge info">-</span>
              </article>
            ) : appointments.length ? (
              appointments.map((appointment) => (
                <article
                  className="ops-timeline-item"
                  key={appointment.id}
                  onClick={() => navigate('/booking-detail/' + appointment.id)}
                  role="button"
                  tabIndex={0}
                >
                  <strong>{appointment.time}</strong>
                  <div>
                    <b>{appointment.clientName ?? 'Cliente'}</b>
                    <span>{appointment.serviceName} · {appointment.barbershopName}</span>
                  </div>
                  <span className={'ops-badge ' + (appointment.status === 'SCHEDULED' ? 'ok' : appointment.status === 'CANCELLED' ? 'warn' : 'info')}>
                    {appointment.status}
                  </span>
                </article>
              ))
            ) : (
              <article className="ops-timeline-item">
                <strong>--:--</strong>
                <div>
                  <b>Nenhum agendamento hoje</b>
                  <span>Sem horários vinculados ao seu usuário.</span>
                </div>
                <span className="ops-badge info">Vazio</span>
              </article>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
