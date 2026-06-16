import { useEffect, useMemo, useState } from 'react'
import { fetchBarberHistory, getProfessionalStats } from '../../../services/backend'
import type { Booking, ToastMessage } from '../../../types/models'

interface BarberReportsPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BarberReportsPage({ navigate, notify }: BarberReportsPageProps) {
  const [stats, setStats] = useState({ appointments: 0, revenue: 0, avgRating: 0 })
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    Promise.all([getProfessionalStats('me'), fetchBarberHistory()])
      .then(([statsData, history]) => { setStats(statsData); setBookings(history) })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar relatório'))
  }, [notify])

  const services = useMemo(() => {
    const grouped = new Map<string, { count: number; revenue: number }>()
    bookings.forEach((booking) => {
      const current = grouped.get(booking.serviceName) ?? { count: 0, revenue: 0 }
      current.count += 1
      current.revenue += booking.amountPaid ?? 0
      grouped.set(booking.serviceName, current)
    })
    return [...grouped.entries()].sort((a, b) => b[1].count - a[1].count)
  }, [bookings])

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={() => navigate('/professional/agenda')}>Voltar</button>
      <h1>Relatórios</h1>
      <div className="ops-stat-grid">
        <article className="ops-stat-card"><span>Agendamentos</span><strong>{stats.appointments}</strong><small>Total registrado</small></article>
        <article className="ops-stat-card"><span>Receita</span><strong>{stats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><small>Pagamentos registrados</small></article>
        <article className="ops-stat-card"><span>Clientes</span><strong>{new Set(bookings.map((booking) => booking.clientName)).size}</strong><small>Clientes atendidos</small></article>
      </div>
      <h2>Serviços realizados</h2>
      {services.map(([name, data]) => (
        <div key={name} style={{ padding: 15, borderBottom: '1px solid #ddd' }}>
          <strong>{name}</strong>
          <span style={{ float: 'right' }}>{data.count} agendamentos · {data.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      ))}
      {!services.length ? <p>Nenhum serviço registrado.</p> : null}
    </div>
  )
}
