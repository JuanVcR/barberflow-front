import { useEffect, useState } from 'react'
import type { ToastMessage, Barbershop, Barber } from '../../../types/models'
import { fetchBarbershopById, createBooking, fetchAvailableTimes } from '../../../services/backend'

type BookingStep = 'service' | 'professional' | 'datetime' | 'review'

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function spaceTimesByDuration(times: string[], duration: number) {
  if (duration <= 0) return times

  let lastSelected: number | null = null

  return [...times]
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))
    .filter((time) => {
      const current = timeToMinutes(time)

      if (lastSelected === null || current - lastSelected >= duration) {
        lastSelected = current
        return true
      }

      return false
    })
}

interface BookingPageProps {
  barbershopId: string
  serviceId?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BookingPage({ barbershopId, serviceId, navigate, notify }: BookingPageProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(serviceId ? [serviceId] : [])
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const selectedServices = barbershop?.services.filter((service) => selectedServiceIds.includes(service.id)) ?? []
  const selectedServiceNames = selectedServices.map((service) => service.name).join(', ')
  const selectedTotalPrice = selectedServices.reduce((total, service) => total + service.price, 0)
  const selectedTotalDuration = selectedServices.reduce((total, service) => total + service.duration, 0)

  useEffect(() => {
    fetchBarbershopById(barbershopId)
      .then(setBarbershop)
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar barbearia'))
      .finally(() => setLoading(false))
  }, [barbershopId, notify])

  useEffect(() => {
    if (selectedProfessional && selectedServiceIds.length && selectedDate) {
      setSelectedTime('')
      fetchAvailableTimes({
        barberId: selectedProfessional,
        serviceIds: selectedServiceIds,
        day: selectedDate,
      })
        .then((times) => setAvailableTimes(spaceTimesByDuration(times, selectedTotalDuration)))
        .catch((error) => {
          setAvailableTimes([])
          notify('error', error instanceof Error ? error.message : 'Erro ao consultar horários')
        })
    }
  }, [selectedProfessional, selectedServiceIds, selectedDate, selectedTotalDuration, notify])

  if (loading) return <div className="booking-page"><p>Carregando...</p></div>
  if (!barbershop) return <div className="booking-page"><p>Barbearia não encontrada</p></div>

  const services = barbershop.services
  const professionals = barbershop.professionals

  const selectedProfObj = professionals.find((p: Barber) => p.id === selectedProfessional)
  const availableProfessionals = selectedServiceIds.length
    ? professionals.filter((professional) =>
        selectedServices.every((service) => service.barberIds?.includes(professional.id)),
      )
    : []

  const selectService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    )
    setSelectedProfessional(null)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableTimes([])
  }

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const generateDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const handleNext = () => {
    if (currentStep === 'service' && selectedServiceIds.length === 0) {
      notify('error', 'Selecione ao menos um serviço')
      return
    }
    if (currentStep === 'professional' && !selectedProfessional) {
      notify('error', 'Selecione um profissional')
      return
    }
    if (currentStep === 'datetime' && (!selectedDate || !selectedTime)) {
      notify('error', 'Selecione data e hora')
      return
    }

    const steps: BookingStep[] = ['service', 'professional', 'datetime', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: BookingStep[] = ['service', 'professional', 'datetime', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleConfirm = async () => {
    if (!selectedProfessional) {
      notify('error', 'Selecione um profissional')
      return
    }
    if (selectedServiceIds.length === 0) {
      notify('error', 'Selecione ao menos um serviço')
      return
    }
    if (!selectedDate) {
      notify('error', 'Selecione uma data')
      return
    }
    if (!selectedTime) {
      notify('error', 'Selecione um horário')
      return
    }

    try {
      setLoading(true)
      await createBooking({
        barberId: selectedProfessional,
        serviceIds: selectedServiceIds,
        barbershopId: barbershop!.id,
        day: selectedDate,
        time: selectedTime,
      })
      notify('success', 'Agendamento confirmado! Você receberá confirmação por email.')
      navigate('/customer/appointments')
    } catch (err) {
      let message = 'Erro ao confirmar agendamento'
      
      if (err instanceof Error) {
        message = err.message
      }
      
      if (message.includes('horário')) {
        notify('error', 'Este horário não está mais disponível. Escolha outro.')
      } else if (message.includes('profissional')) {
        notify('error', 'Este profissional não está mais disponível.')
      } else if (message.includes('disponível')) {
        notify('error', 'Serviço não disponível nesta data.')
      } else {
        notify('error', message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button className="back-button" onClick={() => navigate('/customer/explore')}>← Voltar</button>
        <h1>Novo agendamento</h1>
        <p className="booking-barbershop">{barbershop.name} • {barbershop.address}</p>
      </div>

      <div className="booking-stepper">
        {['Serviço', 'Barbeiro', 'Horário', 'Confirmar'].map((label, idx) => {
          const steps: BookingStep[] = ['service', 'professional', 'datetime', 'review']
          const isActive = steps.indexOf(currentStep) >= idx
          const isCompleted = steps.indexOf(currentStep) > idx
          
          return (
            <div key={label} className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-number">{idx + 1}</div>
              <div className="step-label">{label}</div>
            </div>
          )
        })}
      </div>

      {currentStep === 'service' && (
        <div className="booking-step">
          <h2>Passo 1: Serviço</h2>
          <p className="booking-step-hint">Você pode selecionar mais de um serviço no mesmo agendamento.</p>
          <div className="service-options">
            {services.map((service) => (
              <button
                key={service.id}
                className={`service-option ${selectedServiceIds.includes(service.id) ? 'selected' : ''}`}
                onClick={() => selectService(service.id)}
              >
                <div className="service-name">{service.name}</div>
                <div className="service-details">R$ {service.price} • {service.duration} min</div>
              </button>
            ))}
          </div>
          {selectedServices.length ? (
            <div className="booking-total">
              <strong>{selectedServices.length} serviço(s) selecionado(s)</strong>
              <span>R$ {selectedTotalPrice} • {selectedTotalDuration} min</span>
            </div>
          ) : null}
        </div>
      )}

      {currentStep === 'professional' && (
        <div className="booking-step">
          <div className="booking-summary">
            <strong>{selectedServiceNames}</strong>
            <span>R$ {selectedTotalPrice} • {selectedTotalDuration} min</span>
          </div>
          <h2>Passo 2: Barbeiro</h2>
          <div className="professional-options">
            {availableProfessionals.map((prof: Barber) => (
              <button
                key={prof.id}
                className={`professional-option ${selectedProfessional === prof.id ? 'selected' : ''}`}
                onClick={() => setSelectedProfessional(prof.id)}
              >
                <div className="prof-avatar">{prof.name.charAt(0)}</div>
                <div>{prof.name}</div>
              </button>
            ))}
            {selectedServiceIds.length > 0 && availableProfessionals.length === 0 ? (
              <p>Nenhum barbeiro atende todos os serviços selecionados.</p>
            ) : null}
          </div>
        </div>
      )}

      {currentStep === 'datetime' && (
        <div className="booking-step">
          <div className="booking-summary">
            <strong>{selectedServiceNames}</strong>
            <span>R$ {selectedTotalPrice} • {selectedTotalDuration} min</span>
            <strong>{selectedProfObj?.name}</strong>
          </div>
          
          <h2>Passo 3: Horário</h2>
          
          <div className="calendar-section">
            <h3>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
            <div className="calendar-dates">
              {generateDates().map((date, idx) => {
                const dateStr = formatLocalDate(date)
                const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()
                const dayNum = date.getDate()
                
                return (
                  <button
                    key={idx}
                    className={`calendar-day ${selectedDate === dateStr ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className="day-name">{dayName}</div>
                    <div className="day-num">{dayNum}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="times-section">
            <h3>HORÁRIOS DISPONÍVEIS</h3>
            <div className="times-grid">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
              {selectedDate && availableTimes.length === 0 ? <p>Nenhum horário disponível.</p> : null}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'review' && (
        <div className="booking-step">
          <h2>Passo 4: Confirmação</h2>
          <div className="booking-review">
            <div className="review-item">
              <label>Serviços selecionados</label>
              <strong>{selectedServiceNames}</strong>
            </div>
            <div className="review-item">
              <label>Barbeiro</label>
              <strong>{selectedProfObj?.name}</strong>
              <span className="price">R$ {selectedTotalPrice}</span>
            </div>
            <div className="review-item">
              <label>Duração total</label>
              <strong>{selectedTotalDuration} min</strong>
            </div>
            <div className="review-item">
              <label>Data</label>
              <strong>{selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
            </div>
            <div className="review-item">
              <label>Hora</label>
              <strong>{selectedTime}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="booking-actions">
        <button
          className="secondary-button"
          onClick={handleBack}
          style={{ visibility: currentStep === 'service' ? 'hidden' : 'visible' }}
        >
          Voltar
        </button>
        {currentStep !== 'review' ? (
          <button className="primary-button" onClick={handleNext}>
            Próximo
          </button>
        ) : (
          <button className="primary-button dark" onClick={handleConfirm}>
            Confirmar agendamento
          </button>
        )}
      </div>
    </div>
  )
}
