import { useEffect, useMemo, useState } from 'react'
import { fetchAdminBarberHistory, type ApiBooking } from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface AdminBarberHistoryPageProps {
  barbershopId: string
  barberId: string
  barberName?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

type StatusFilter = 'ALL' | ApiBooking['status']

function getBookingValue(booking: ApiBooking) {
  if (booking.amountPaid != null) return booking.amountPaid
  return booking.services.reduce((total, item) => total + (item.service.price ?? 0), 0)
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(day: string) {
  const [year, month, date] = day.split('-')
  return `${date}/${month}/${year}`
}

function getStatus(status: ApiBooking['status']) {
  if (status === 'COMPLETED') return { label: 'Concluído', className: 'completed' }
  if (status === 'CANCELLED') return { label: 'Cancelado', className: 'cancelled' }
  return { label: 'Agendado', className: 'scheduled' }
}

export function AdminBarberHistoryPage({
  barbershopId,
  barberId,
  barberName,
  navigate,
  notify,
}: AdminBarberHistoryPageProps) {
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminBarberHistory(barbershopId, barberId)
      .then(setBookings)
      .catch((error) => {
        setBookings([])
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar histórico')
      })
      .finally(() => setLoading(false))
  }, [barberId, barbershopId, notify])

  const completed = bookings.filter((booking) => booking.status === 'COMPLETED')
  const cancelled = bookings.filter((booking) => booking.status === 'CANCELLED')
  const revenue = completed.reduce((sum, booking) => sum + getBookingValue(booking), 0)

  const mostUsedService = useMemo(() => {
    const counts = new Map<string, number>()
    bookings.forEach((booking) => {
      booking.services.forEach(({ service }) => {
        counts.set(service.name, (counts.get(service.name) ?? 0) + 1)
      })
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]
  }, [bookings])

  const visibleBookings = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
      const matchesSearch = !term ||
        (booking.client?.name ?? '').toLowerCase().includes(term) ||
        booking.services.some(({ service }) => service.name.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [bookings, search, statusFilter])

  const filteredRevenue = visibleBookings
    .filter((booking) => booking.status === 'COMPLETED')
    .reduce((sum, booking) => sum + getBookingValue(booking), 0)

  return (
    <section className="admin-barber-detail-page history">
      <header className="admin-barber-detail-header">
        <button className="admin-barber-back" onClick={() => navigate('/admin/barber-management')}>←</button>
        <div>
          <h1>Histórico de {barberName || 'Barbeiro'}</h1>
          <p>Todos os atendimentos realizados</p>
        </div>
      </header>

      <div className="admin-barber-stat-grid">
        <article><span>Total de atendimentos</span><strong>{bookings.length}</strong><small>{completed.length} concluídos</small></article>
        <article><span>Receita gerada</span><strong>{formatCurrency(revenue)}</strong><small>serviços concluídos</small></article>
        <article><span>Cancelamentos</span><strong>{cancelled.length}</strong><small>{bookings.length ? Math.round((cancelled.length / bookings.length) * 100) : 0}% do total</small></article>
        <article><span>Serviço mais feito</span><strong>{mostUsedService?.[0] || '—'}</strong><small>{mostUsedService ? `${mostUsedService[1]}x no histórico` : 'sem registros'}</small></article>
      </div>

      <div className="admin-barber-history-toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar cliente ou serviço..."
        />
        <div>
          {([
            ['ALL', 'Todos'],
            ['COMPLETED', 'Concluído'],
            ['CANCELLED', 'Cancelado'],
            ['SCHEDULED', 'Agendado'],
          ] as Array<[StatusFilter, string]>).map(([value, label]) => (
            <button
              className={statusFilter === value ? 'active' : ''}
              key={value}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="admin-barber-data-card">
        <div className="admin-barber-table admin-barber-history-table">
          <div className="admin-barber-table-row header">
            <span>Data</span><span>Cliente</span><span>Serviço</span><span>Valor</span><span>Status</span><span>Avaliação</span>
          </div>

          {visibleBookings.map((booking) => {
            const status = getStatus(booking.status)
            return (
              <div className="admin-barber-table-row" key={booking.id}>
                <span>{formatDate(booking.day)}</span>
                <strong>{booking.client?.name || 'Cliente'}</strong>
                <span>{booking.services.map((item) => item.service.name).join(', ') || 'Serviço'}</span>
                <strong>{formatCurrency(getBookingValue(booking))}</strong>
                <span className={`admin-barber-status ${status.className}`}>{status.label}</span>
                <span>—</span>
              </div>
            )
          })}

          {!loading && visibleBookings.length === 0 ? (
            <div className="admin-barber-empty">Nenhum atendimento encontrado.</div>
          ) : null}
        </div>

        <footer className="admin-barber-table-footer">
          <span>{loading ? 'Carregando...' : `${visibleBookings.length} registros`}</span>
          <strong>Receita filtrada: {formatCurrency(filteredRevenue)}</strong>
        </footer>
      </section>
    </section>
  )
}
