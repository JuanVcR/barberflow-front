import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from '../../components/Icons'
import { cancelBooking, fetchAdminBarbershops, fetchWeeklyBookings } from '../../services/backend'
import type { Booking, ToastMessage } from '../../types/models'

interface Props {
  mode: 'admin' | 'barber'
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

function toDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fromDay(day: string) {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year, month - 1, date)
}

function weekStart(date = new Date()) {
  const value = new Date(date)
  value.setDate(value.getDate() - ((value.getDay() + 6) % 7))
  return toDay(value)
}

function moveWeek(day: string, amount: number) {
  const value = fromDay(day)
  value.setDate(value.getDate() + amount * 7)
  return toDay(value)
}

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function bookingValue(booking: Booking) {
  return booking.amountPaid ?? booking.services?.reduce((sum, service) => sum + service.price, 0) ?? 0
}

export function StaffWeekAgendaPage({ mode, navigate, notify }: Props) {
  const [startDay, setStartDay] = useState(weekStart)
  const [barbershopId, setBarbershopId] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode !== 'admin') return
    fetchAdminBarbershops()
      .then((shops) => setBarbershopId(shops[0]?.id ?? ''))
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar barbearia'))
  }, [mode, notify])

  const load = useCallback(async () => {
    if (mode === 'admin' && !barbershopId) return
    setLoading(true)
    try {
      const result = await fetchWeeklyBookings(startDay, mode === 'admin' ? barbershopId : undefined)
      setBookings(result.bookings)
    } catch (error) {
      setBookings([])
      notify('error', error instanceof Error ? error.message : 'Erro ao carregar agenda semanal')
    } finally {
      setLoading(false)
    }
  }, [barbershopId, mode, notify, startDay])

  useEffect(() => {
    void load()
  }, [load])

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = fromDay(startDay)
    date.setDate(date.getDate() + index)
    return toDay(date)
  }), [startDay])
  const active = bookings.filter((booking) => booking.status !== 'CANCELLED')

  const cancel = async (bookingId: string) => {
    if (!window.confirm('Cancelar este agendamento?')) return
    try {
      await cancelBooking(bookingId, 'Cancelado pelo painel')
      notify('success', 'Agendamento cancelado')
      await load()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao cancelar')
    }
  }

  return (
    <section className="staff-week-page">
      <header className="staff-week-header">
        <div>
          <span>{mode === 'admin' ? 'ADM da barbearia' : 'Barbeiro'}</span>
          <h1>Agenda semanal</h1>
          <p>Veja e gerencie todos os atendimentos da semana.</p>
        </div>
        <button className="primary-button" onClick={() => navigate(mode === 'admin' ? '/admin/quick-booking' : '/professional/quick-booking')}>
          Cadastrar cliente
        </button>
      </header>

      <div className="staff-week-toolbar">
        <button onClick={() => setStartDay(moveWeek(startDay, -1))}>Semana anterior</button>
        <div><CalendarIcon /><strong>{fromDay(days[0]).toLocaleDateString('pt-BR')} a {fromDay(days[6]).toLocaleDateString('pt-BR')}</strong></div>
        <button onClick={() => setStartDay(moveWeek(startDay, 1))}>Próxima semana</button>
        <button onClick={() => setStartDay(weekStart())}>Hoje</button>
      </div>

      <div className="staff-week-stats">
        <article><span>Agendamentos</span><strong>{active.length}</strong></article>
        <article><span>Concluídos</span><strong>{bookings.filter((item) => item.status === 'COMPLETED').length}</strong></article>
        <article><span>Receita prevista</span><strong>{currency(active.reduce((sum, item) => sum + bookingValue(item), 0))}</strong></article>
      </div>

      <div className="staff-week-grid">
        {days.map((day) => {
          const dayBookings = bookings.filter((item) => item.date === day).sort((a, b) => a.time.localeCompare(b.time))
          return (
            <section className="staff-week-day" key={day}>
              <header>
                <span>{fromDay(day).toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                <strong>{fromDay(day).toLocaleDateString('pt-BR')}</strong>
                <small>{dayBookings.length} atendimento(s)</small>
              </header>
              {dayBookings.map((booking) => (
                <article className="staff-week-booking" key={booking.id}>
                  <div>
                    <strong>{booking.time} · {booking.clientName || 'Cliente'}</strong>
                    <span>{booking.serviceName}</span>
                    {mode === 'admin' ? <small>{booking.barberName}</small> : null}
                  </div>
                  <span className={`staff-week-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  <div className="staff-week-actions">
                    <button onClick={() => navigate('/booking-detail/' + booking.id)}>Abrir</button>
                    {booking.status === 'SCHEDULED' ? <button className="danger" onClick={() => cancel(booking.id)}>Cancelar</button> : null}
                  </div>
                </article>
              ))}
              {!loading && dayBookings.length === 0 ? <p className="staff-week-empty">Nenhum atendimento.</p> : null}
            </section>
          )
        })}
      </div>
    </section>
  )
}
