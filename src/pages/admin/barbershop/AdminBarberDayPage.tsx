import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from '../../../components/Icons'
import { fetchAdminBarberDay, type ApiBooking } from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface AdminBarberDayPageProps {
  barbershopId: string
  barberId: string
  barberName?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

function getLocalDate() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function getBookingValue(booking: ApiBooking) {
  if (booking.amountPaid != null) return booking.amountPaid
  return booking.services.reduce((total, item) => total + (item.service.price ?? 0), 0)
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getStatus(status: ApiBooking['status']) {
  if (status === 'COMPLETED') return { label: 'Concluído', className: 'completed' }
  if (status === 'CANCELLED') return { label: 'Cancelado', className: 'cancelled' }
  return { label: 'Agendado', className: 'scheduled' }
}

export function AdminBarberDayPage({
  barbershopId,
  barberId,
  barberName,
  navigate,
  notify,
}: AdminBarberDayPageProps) {
  const [day, setDay] = useState(getLocalDate)
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminBarberDay(barbershopId, barberId, day)
      .then(setBookings)
      .catch((error) => {
        setBookings([])
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar agenda')
      })
      .finally(() => setLoading(false))
  }, [barberId, barbershopId, day, notify])

  const completed = bookings.filter((booking) => booking.status === 'COMPLETED').length
  const total = useMemo(
    () => bookings
      .filter((booking) => booking.status !== 'CANCELLED')
      .reduce((sum, booking) => sum + getBookingValue(booking), 0),
    [bookings],
  )

  return (
    <section className="admin-barber-detail-page">
      <header className="admin-barber-detail-header">
        <button className="admin-barber-back" onClick={() => navigate('/admin/barber-management')}>←</button>
        <div>
          <h1>Agenda de {barberName || 'Barbeiro'}</h1>
          <p>Atendimentos do dia</p>
        </div>
      </header>

      <div className="admin-barber-day-toolbar">
        <label>
          <CalendarIcon />
          <input
            type="date"
            value={day}
            onChange={(event) => {
              setLoading(true)
              setDay(event.target.value)
            }}
          />
        </label>
        <span className="admin-barber-summary-badge scheduled">{bookings.length} agendamentos</span>
        <span className="admin-barber-summary-badge completed">{completed} concluídos</span>
      </div>

      <section className="admin-barber-data-card">
        <div className="admin-barber-table admin-barber-day-table">
          <div className="admin-barber-table-row header">
            <span>Horário</span><span>Cliente</span><span>Serviço</span><span>Valor</span><span>Status</span><span />
          </div>

          {bookings.map((booking) => {
            const status = getStatus(booking.status)
            return (
              <div className="admin-barber-table-row" key={booking.id}>
                <strong>{booking.startTime}</strong>
                <span>{booking.client?.name || 'Cliente'}</span>
                <span>{booking.services.map((item) => item.service.name).join(', ') || 'Serviço'}</span>
                <strong>{formatCurrency(getBookingValue(booking))}</strong>
                <span className={`admin-barber-status ${status.className}`}>{status.label}</span>
                <button
                  className="admin-barber-view"
                  onClick={() => navigate(`/booking-detail/${booking.id}`)}
                  aria-label="Ver agendamento"
                >
                  Ver
                </button>
              </div>
            )
          })}

          {!loading && bookings.length === 0 ? (
            <div className="admin-barber-empty">Nenhum atendimento para este dia.</div>
          ) : null}
        </div>

        <footer className="admin-barber-table-footer">
          <span>{loading ? 'Carregando...' : `${bookings.length} atendimentos no dia`}</span>
          <strong>Total: {formatCurrency(total)}</strong>
        </footer>
      </section>
    </section>
  )
}
