import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { CalendarIcon, ClockIcon, ScissorsIcon, UserIcon } from '../components/Icons'
import { fetchAvailableTimes, fetchBarbershopById, createBooking } from '../services/backend'
import { ApiError } from '../services/api'
import type { Barbershop, Booking } from '../types/models'

interface BookingPageProps {
  barbershopId: string
  serviceId?: string
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
  isAuthenticated: boolean
}

const storageKey = 'customer-bookings'

export function BookingPage({
  barbershopId,
  serviceId,
  navigate,
  notify,
  isAuthenticated,
}: BookingPageProps) {
  const { user } = useAuth()
  const [shop, setShop] = useState<Barbershop | null>(null)
  const [selectedService, setSelectedService] = useState(serviceId ?? '')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [isLoadingShop, setIsLoadingShop] = useState(true)
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      notify('error', 'Fa\u00e7a login antes de agendar.')
      navigate('/login')
    }
  }, [isAuthenticated, navigate, notify])

  useEffect(() => {
    let isMounted = true

    fetchBarbershopById(barbershopId)
      .then((data) => {
        if (isMounted) {
          setShop(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setShop(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingShop(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [barbershopId])

  const availableDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() + index)
      return date.toISOString().split('T')[0]
    })
  }, [])

  const availableBarbers = useMemo(() => {
    if (!shop || !selectedService) return []
    const service = shop.services.find((item) => item.id === selectedService)
    if (!service) return shop.barbers
    if (!service.barberIds || service.barberIds.length === 0) return shop.barbers
    return shop.barbers.filter((barber) => service.barberIds?.includes(barber.id))
  }, [selectedService, shop])

  const selectedServiceInfo = shop?.services.find((item) => item.id === selectedService)
  const selectedBarberInfo = shop?.barbers.find((item) => item.id === selectedBarber)

  useEffect(() => {
    setSelectedBarber('')
    setSelectedTime('')
    setTimeSlots([])
  }, [selectedService])

  useEffect(() => {
    setSelectedTime('')
    setTimeSlots([])
  }, [selectedBarber, selectedDate])

  useEffect(() => {
    if (!selectedBarber || !selectedService || !selectedDate) {
      return
    }

    let isMounted = true
    setIsLoadingTimes(true)

    fetchAvailableTimes({
      barberId: selectedBarber,
      serviceId: selectedService,
      day: selectedDate,
    })
      .then((times) => {
        if (isMounted) {
          setTimeSlots(times)
        }
      })
      .catch(() => {
        if (isMounted) {
          setTimeSlots([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTimes(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedBarber, selectedDate, selectedService])

  const confirmBooking = async () => {
    if (!shop || !selectedServiceInfo || !selectedBarberInfo || !selectedDate || !selectedTime || !user) {
      notify('error', 'Preencha todos os campos antes de confirmar.')
      return
    }

    try {
      setIsSubmitting(true)
      const booking = await createBooking({
        barberId: selectedBarberInfo.id,
        serviceId: selectedServiceInfo.id,
        barbershopId: shop.id,
        day: selectedDate,
        time: selectedTime,
      })

      const storedBookings = localStorage.getItem(storageKey)
      const bookings = storedBookings ? (JSON.parse(storedBookings) as Booking[]) : []
      localStorage.setItem(storageKey, JSON.stringify([booking, ...bookings]))

      notify(
        'success',
        'Agendamento confirmado para ' + selectedServiceInfo.name + ' com ' + selectedBarberInfo.name + '.',
      )
      navigate('/account')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'N\u00e3o foi poss\u00edvel confirmar o agendamento.'
      notify('error', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingShop) {
    return (
      <section className="section shell container narrow">
        <div className="empty-state">{'Carregando op\u00e7\u00f5es de agendamento...'}</div>
      </section>
    )
  }

  if (!shop) {
    return (
      <section className="section shell container narrow">
        <div className="empty-state">{'Barbearia n\u00e3o encontrada.'}</div>
      </section>
    )
  }

  return (
    <section className="section shell container narrow">
      <div className="panel-card">
        <div className="section-heading">
          <p className="eyebrow">{'Agendamento'}</p>
          <h1>{'Agende sua visita'}</h1>
          <p>{shop.name}</p>
        </div>

        <div className="summary-box">
          <div>
            <UserIcon className="icon-sm accent" />
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="form-stack">
          <label>
            <span>
              <ScissorsIcon className="icon-xs accent" />
              {' Servi\u00e7o'}
            </span>
            <select value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>
              <option value="">{'Escolha um servi\u00e7o'}</option>
              {shop.services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name + ' - R$ ' + service.price + ' (' + service.duration + ' min)'}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>
              <UserIcon className="icon-xs accent" />
              {' Barbeiro'}
            </span>
            <select value={selectedBarber} onChange={(event) => setSelectedBarber(event.target.value)}>
              <option value="">{'Escolha um barbeiro'}</option>
              {availableBarbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>
              <CalendarIcon className="icon-xs accent" />
              {' Data'}
            </span>
            <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
              <option value="">{'Escolha uma data'}</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                  })}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="input-label">
              <ClockIcon className="icon-xs accent" />
              {' Hor\u00e1rio'}
            </span>
            <div className="time-grid">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={selectedTime === time ? 'time-button selected' : 'time-button'}
                  onClick={() => setSelectedTime(time)}
                  type="button"
                >
                  {time}
                </button>
              ))}
            </div>
            {isLoadingTimes && <p className="helper-text">{'Buscando hor\u00e1rios dispon\u00edveis...'}</p>}
            {!isLoadingTimes && selectedDate && selectedBarber && timeSlots.length === 0 && (
              <p className="helper-text">{'Nenhum hor\u00e1rio dispon\u00edvel para esta combina\u00e7\u00e3o.'}</p>
            )}
          </div>

          {selectedServiceInfo && selectedBarberInfo && selectedDate && selectedTime && (
            <div className="booking-recap">
              <h3>{'Resumo do agendamento'}</h3>
              <p>{'Servi\u00e7o: ' + selectedServiceInfo.name}</p>
              <p>{'Barbeiro: ' + selectedBarberInfo.name}</p>
              <p>{'Data: ' + new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
              <p>{'Hor\u00e1rio: ' + selectedTime}</p>
              <strong>{'Total: R$ ' + selectedServiceInfo.price}</strong>
            </div>
          )}

          <button
            className="primary-button full-width large"
            onClick={confirmBooking}
            type="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </div>
      </div>
    </section>
  )
}
