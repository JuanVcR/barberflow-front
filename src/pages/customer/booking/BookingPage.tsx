import { useEffect, useState } from 'react'
import type { ToastMessage, Barbershop, Barber } from '../../../types/models'
import { fetchBarbershopById, createBooking, fetchAvailableTimes } from '../../../services/backend'

type BookingStep = 'service' | 'professional' | 'datetime' | 'review'

interface BookingPageProps {
  barbershopId: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BookingPage({ barbershopId, navigate, notify }: BookingPageProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  useEffect(() => {
    fetchBarbershopById(barbershopId)
      .then(setBarbershop)
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar barbearia'))
      .finally(() => setLoading(false))
  }, [barbershopId, notify])

  useEffect(() => {
    if (selectedProfessional && selectedService && selectedDate) {
      setSelectedTime('')
      fetchAvailableTimes({
        barberId: selectedProfessional,
        serviceId: selectedService,
        day: selectedDate,
      })
        .then(setAvailableTimes)
        .catch(() => {
          setAvailableTimes([])
          notify('error', 'Erro ao consultar horários')
        })
    }
  }, [selectedProfessional, selectedService, selectedDate, notify])

  if (loading) return <div className="booking-page"><p>Carregando...</p></div>
  if (!barbershop) return <div className="booking-page"><p>Barbearia não encontrada</p></div>

  const services = barbershop.services
  const professionals = barbershop.professionals

  const selectedServiceObj = services.find((s) => s.id === selectedService)
  const selectedProfObj = professionals.find((p: Barber) => p.id === selectedProfessional)

  // Generate dates for next 7 days
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
    if (currentStep === 'service' && !selectedService) {
      notify('error', 'Selecione um serviço')
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
    // Validação antes de confirmar
    if (!selectedProfessional) {
      notify('error', 'Selecione um profissional')
      return
    }
    if (!selectedService) {
      notify('error', 'Selecione um serviço')
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
        serviceId: selectedService,
        barbershopId: barbershop!.id,
        day: selectedDate,
        time: selectedTime,
      })
      notify('success', 'Agendamento confirmado! Você receberá confirmação por email.')
      navigate('/customer/appointments')
    } catch (err) {
      // Tratamento da mensagem retornada pela API
      let message = 'Erro ao confirmar agendamento'
      
      if (err instanceof Error) {
        message = err.message
      }
      
      // Se erro específico da API
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

      {/* Progress Stepper */}
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

      {/* Step 1: Service Selection */}
      {currentStep === 'service' && (
        <div className="booking-step">
          <h2>Passo 1: Serviço</h2>
          <div className="service-options">
            {services.map((service) => (
              <button
                key={service.id}
                className={`service-option ${selectedService === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="service-name">{service.name}</div>
                <div className="service-details">R$ {service.price} • {service.duration} min</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Professional Selection */}
      {currentStep === 'professional' && (
        <div className="booking-step">
          <div className="booking-summary">
            <strong>{selectedServiceObj?.name}</strong>
            <span>{selectedServiceObj?.price && `R$ ${selectedServiceObj.price}`}</span>
          </div>
          <h2>Passo 2: Barbeiro</h2>
          <div className="professional-options">
            {professionals.map((prof: Barber) => (
              <button
                key={prof.id}
                className={`professional-option ${selectedProfessional === prof.id ? 'selected' : ''}`}
                onClick={() => setSelectedProfessional(prof.id)}
              >
                <div className="prof-avatar">{prof.name.charAt(0)}</div>
                <div>{prof.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date and Time Selection */}
      {currentStep === 'datetime' && (
        <div className="booking-step">
          <div className="booking-summary">
            <strong>{selectedServiceObj?.name}</strong>
            <span>{selectedServiceObj?.price && `R$ ${selectedServiceObj.price}`}</span>
            <strong>{selectedProfObj?.name}</strong>
          </div>
          
          <h2>Passo 3: Horário</h2>
          
          {/* Calendar */}
          <div className="calendar-section">
            <h3>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
            <div className="calendar-dates">
              {generateDates().map((date, idx) => {
                const dateStr = date.toISOString().split('T')[0]
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

          {/* Available Times */}
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

      {/* Step 4: Review and Confirm */}
      {currentStep === 'review' && (
        <div className="booking-step">
          <h2>Passo 4: Confirmação</h2>
          <div className="booking-review">
            <div className="review-item">
              <label>Serviço selecionado</label>
              <strong>{selectedServiceObj?.name}</strong>
            </div>
            <div className="review-item">
              <label>Barbeiro</label>
              <strong>{selectedProfObj?.name}</strong>
              <span className="price">{selectedServiceObj?.price && `R$ ${selectedServiceObj.price}`}</span>
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

      {/* Navigation Buttons */}
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
