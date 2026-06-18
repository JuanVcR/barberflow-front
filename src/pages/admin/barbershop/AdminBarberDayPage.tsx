import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from '../../../components/Icons'
import {
  fetchAdminBarberDay,
  fetchAdminBarberHistory,
  type ApiBooking,
} from '../../../services/backend'
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

function dateToDay(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dayToDate(day: string) {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

function formatDay(day: string) {
  return dayToDate(day).toLocaleDateString('pt-BR')
}

function getCalendarDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
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
  const [monthDate, setMonthDate] = useState(() => {
    const today = dayToDate(getLocalDate())
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [history, setHistory] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!day) return

    fetchAdminBarberDay(barbershopId, barberId, day)
      .then(setBookings)
      .catch((error) => {
        setBookings([])
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar agenda')
      })
      .finally(() => setLoading(false))
  }, [barberId, barbershopId, day, notify])

  useEffect(() => {
    fetchAdminBarberHistory(barbershopId, barberId)
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [barberId, barbershopId])

  const completed = bookings.filter((booking) => booking.status === 'COMPLETED').length
  const eventDays = useMemo(() => new Set(history.map((booking) => booking.day)), [history])
  const calendarDays = useMemo(() => getCalendarDays(monthDate), [monthDate])
  const total = useMemo(
    () => bookings
      .filter((booking) => booking.status !== 'CANCELLED')
      .reduce((sum, booking) => sum + getBookingValue(booking), 0),
    [bookings],
  )

  const selectDay = (date: Date) => {
    setLoading(true)
    setDay(dateToDay(date))
    setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  const selectToday = () => {
    selectDay(dayToDate(getLocalDate()))
  }

  const clearDay = () => {
    setDay('')
    setBookings([])
    setLoading(false)
  }

  return (
    <section className="admin-barber-detail-page day">
      <header className="admin-barber-detail-header">
        <button className="admin-barber-back" onClick={() => navigate('/admin/barber-management')}>←</button>
        <div>
          <h1>Agenda de {barberName || 'Barbeiro'}</h1>
          <p>Atendimentos do dia</p>
        </div>
      </header>

      <div className="admin-barber-day-layout">
        <aside className="admin-calendar-card">
          <header>
            <button
              onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
              aria-label="Mês anterior"
            >
              ‹
            </button>
            <strong>{monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
            <button
              onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
              aria-label="Próximo mês"
            >
              ›
            </button>
          </header>

          <div className="admin-calendar-weekdays">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
          </div>

          <div className="admin-calendar-grid">
            {calendarDays.map((date) => {
              const dateString = dateToDay(date)
              const isCurrentMonth = date.getMonth() === monthDate.getMonth()
              const isSelected = dateString === day
              const hasEvent = eventDays.has(dateString)

              return (
                <button
                  className={`${isCurrentMonth ? '' : 'muted'} ${isSelected ? 'selected' : ''}`}
                  key={dateString}
                  onClick={() => selectDay(date)}
                >
                  {date.getDate()}
                  {hasEvent ? <span className="admin-calendar-event" /> : null}
                </button>
              )
            })}
          </div>

          <footer>
            <button onClick={clearDay}>Limpar</button>
            <button onClick={selectToday}>Hoje</button>
          </footer>
        </aside>

        <div className="admin-barber-day-content">
          <div className="admin-barber-day-toolbar">
            <button
              className="admin-barber-date-input"
              onClick={() => {
                const reference = day ? dayToDate(day) : dayToDate(getLocalDate())
                setMonthDate(new Date(reference.getFullYear(), reference.getMonth(), 1))
              }}
            >
              <CalendarIcon />
              <span>{day ? formatDay(day) : 'Selecione uma data'}</span>
            </button>

            <article className="admin-barber-day-stat">
              <span>Agendamentos</span>
              <strong>{bookings.length}</strong>
            </article>
            <article className="admin-barber-day-stat completed">
              <span>Concluídos</span>
              <strong>{completed}</strong>
            </article>
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
                <div className="admin-barber-empty">
                  <span><CalendarIcon /></span>
                  <strong>{day ? 'Nenhum atendimento para este dia.' : 'Selecione uma data no calendário.'}</strong>
                  <small>Os atendimentos aparecerão aqui quando estiverem cadastrados.</small>
                </div>
              ) : null}
            </div>

            <footer className="admin-barber-table-footer">
              <span>{loading ? 'Carregando...' : `${bookings.length} atendimentos no dia`}</span>
              <strong>Total: {formatCurrency(total)}</strong>
            </footer>
          </section>
        </div>
      </div>
    </section>
  )
}
