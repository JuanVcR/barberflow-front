import { useCallback, useEffect, useState } from 'react'
import type { Booking, ToastMessage } from '../types/models'
import {
  cancelBooking,
  completeBooking,
  fetchAvailableTimes,
  fetchBookingDetails,
  registerBookingPayment,
  rescheduleBooking,
} from '../services/backend'
import { useAuth } from '../context/useAuth'

interface BookingDetailsPageProps {
  bookingId: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BookingDetailsPage({ bookingId, navigate, notify }: BookingDetailsPageProps) {
  const { user, partnerUser } = useAuth()
  const activeUser = user ?? partnerUser
  const isClient = activeUser?.accountRole === 'CLIENT'
  const isAdmin =
    activeUser?.accountRole === 'SUPER_ADMIN' ||
    activeUser?.accountRole === 'BARBERSHOP_ADMIN'
  const [booking, setBooking] = useState<Booking | null>(null)
  const [day, setDay] = useState('')
  const [startTime, setStartTime] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'DEBIT' | 'CREDIT' | 'PIX' | 'CASH'>('PIX')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const backPath = isClient
    ? '/customer/appointments'
    : isAdmin
      ? '/admin/dashboard'
      : '/professional/agenda'

  const load = useCallback(() => {
    fetchBookingDetails(bookingId)
      .then((data) => {
        setBooking(data)
        setDay(data.date)
        setStartTime(data.time)
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Agendamento nao encontrado'))
  }, [bookingId, notify])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!booking || !day || booking.status !== 'SCHEDULED') return

    fetchAvailableTimes({
      barberId: booking.barberId,
      serviceId: booking.serviceId,
      day,
    })
      .then((times) => {
        setAvailableTimes(
          day === booking.date && !times.includes(booking.time)
            ? [booking.time, ...times].sort()
            : times,
        )
      })
      .catch(() => setAvailableTimes([]))
  }, [booking, day])

  const cancel = async () => {
    if (!window.confirm('Cancelar este agendamento?')) return

    try {
      await cancelBooking(bookingId, 'Cancelado pelo painel')
      notify('success', 'Agendamento cancelado')
      load()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao cancelar')
    }
  }

  const reschedule = async () => {
    try {
      const updated = await rescheduleBooking(bookingId, { day, startTime })
      setBooking(updated)
      notify('success', 'Agendamento reagendado')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao reagendar')
    }
  }

  const payAndComplete = async () => {
    try {
      if (amountPaid) {
        await registerBookingPayment(bookingId, {
          paymentMethod,
          amountPaid: Number(amountPaid),
        })
      }
      const updated = await completeBooking(bookingId)
      setBooking(updated)
      notify('success', 'Agendamento concluido')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao concluir')
    }
  }

  if (!booking) {
    return (
      <div style={{ padding: 32 }}>
        <button onClick={() => navigate(backPath)}>Voltar</button>
        <p>Carregando agendamento...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <button onClick={() => navigate(backPath)}>Voltar</button>
      <h1>Detalhe do agendamento</h1>

      <section style={{ padding: 16, border: '1px solid #ddd', borderRadius: 4, margin: '20px 0' }}>
        <h2>{booking.barbershopName}</h2>
        <p>Servico: {booking.serviceName}</p>
        <p>Barbeiro: {booking.barberName}</p>
        <p>Status: {booking.status}</p>
      </section>

      {booking.status === 'SCHEDULED' ? (
        <>
          <section style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            <h2>Reagendar</h2>
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              <option value="">Selecione um horário</option>
              {availableTimes.map((time) => <option key={time}>{time}</option>)}
            </select>
            <button onClick={reschedule} disabled={!day || !startTime}>
              Salvar novo horário
            </button>
          </section>

          {!isClient ? (
            <section style={{ display: 'grid', gap: 10 }}>
              <h2>Pagamento e conclusão</h2>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}
              >
                <option value="PIX">PIX</option>
                <option value="CASH">Dinheiro</option>
                <option value="DEBIT">Débito</option>
                <option value="CREDIT">Crédito</option>
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Valor pago"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              <button className="primary-button" onClick={payAndComplete}>
                Registrar e concluir
              </button>
            </section>
          ) : null}

          <button onClick={cancel} style={{ marginTop: 16 }}>
            Cancelar agendamento
          </button>
        </>
      ) : (
        <p>Este agendamento já foi finalizado e não aceita novas alterações.</p>
      )}
    </div>
  )
}
