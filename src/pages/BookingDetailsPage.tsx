import { useCallback, useEffect, useState } from 'react'
import type { Booking, ToastMessage } from '../types/models'
import {
  cancelBooking,
  completeBooking,
  fetchAvailableTimes,
  fetchBarbershopById,
  fetchBookingDetails,
  registerBookingPayment,
  rescheduleBooking,
  updateBookingServices,
} from '../services/backend'
import type { Service } from '../types/models'
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
  const [shopServices, setShopServices] = useState<Service[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const backPath = isClient
    ? '/customer/appointments'
    : isAdmin
      ? '/admin/appointments'
      : '/professional/agenda'
  const statusLabel = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    SCHEDULED: 'Agendado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Concluído',
  }[booking?.status ?? 'SCHEDULED']

  const load = useCallback(() => {
    fetchBookingDetails(bookingId)
      .then((data) => {
        setBooking(data)
        setDay(data.date)
        setStartTime(data.time)
        setSelectedServiceIds(data.services?.map((service) => service.id) ?? [data.serviceId])
        if (!isClient) {
          fetchBarbershopById(data.barbershopId)
            .then((shop) => setShopServices(
              shop?.services.filter((service) => !service.barberIds?.length || service.barberIds.includes(data.barberId)) ?? [],
            ))
            .catch(() => setShopServices([]))
        }
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Agendamento nao encontrado'))
  }, [bookingId, isClient, notify])

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

  const saveServices = async () => {
    try {
      const updated = await updateBookingServices(bookingId, selectedServiceIds)
      setBooking(updated)
      notify('success', 'Serviços atualizados')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar serviços')
    }
  }

  if (!booking) {
    return (
      <div className="booking-detail-page">
        <button className="booking-detail-back" onClick={() => navigate(backPath)}>← Voltar</button>
        <p>Carregando agendamento...</p>
      </div>
    )
  }

  return (
    <div className="booking-detail-page">
      <button className="booking-detail-back" onClick={() => navigate(backPath)}>← Voltar</button>
      <h1>Detalhe do agendamento</h1>

      <section className="booking-detail-summary">
        <div className="booking-detail-icon">⌂</div>
        <div>
          <h2>{booking.barbershopName}</h2>
          <p>Serviço: {booking.serviceName}</p>
          <p>Barbeiro: {booking.barberName}</p>
          <span className={'booking-detail-status ' + booking.status.toLowerCase()}>
            {statusLabel}
          </span>
        </div>
      </section>

      {booking.status === 'SCHEDULED' ? (
        <>
          <div className="booking-detail-grid">
            <section className="booking-detail-card">
              <h2>Reagendar</h2>
              <label>
                Nova data
                <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
              </label>
              <label>
                Novo horário
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                  <option value="">Selecione um horário</option>
                  {availableTimes.map((time) => <option key={time}>{time}</option>)}
                </select>
              </label>
              <button className="booking-detail-button" onClick={reschedule} disabled={!day || !startTime}>
                Salvar novo horário
              </button>
            </section>

            {!isClient ? (
              <section className="booking-detail-card">
                <h2>Serviços realizados</h2>
                <div className="booking-detail-checks">
                  {shopServices.map((service) => (
                    <label key={service.id}>
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id)}
                        onChange={(event) => setSelectedServiceIds((current) => event.target.checked
                          ? [...current, service.id]
                          : current.filter((id) => id !== service.id))}
                      />
                      {service.name}
                    </label>
                  ))}
                </div>
                <button className="booking-detail-button" onClick={saveServices} disabled={!selectedServiceIds.length}>
                  Salvar serviços
                </button>
              </section>
            ) : null}
          </div>

          {!isClient ? (
            <section className="booking-detail-card booking-detail-payment">
              <h2>Pagamento e conclusão</h2>
              <div className="booking-detail-payment-grid">
                <label>
                  Forma de pagamento
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}
                  >
                    <option value="PIX">PIX</option>
                    <option value="CASH">Dinheiro</option>
                    <option value="DEBIT">Débito</option>
                    <option value="CREDIT">Crédito</option>
                  </select>
                </label>
                <label>
                  Valor pago (R$)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0,00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </label>
              </div>
              <button className="booking-detail-button" onClick={payAndComplete}>
                Registrar e concluir
              </button>
              <button className="booking-detail-button danger" onClick={cancel}>
                Cancelar agendamento
              </button>
            </section>
          ) : null}

          {isClient ? (
            <button className="booking-detail-button danger wide" onClick={cancel}>
              Cancelar agendamento
            </button>
          ) : null}
        </>
      ) : (
        <section className="booking-detail-card">
          <p>Este agendamento já foi finalizado e não aceita novas alterações.</p>
        </section>
      )}
    </div>
  )
}
