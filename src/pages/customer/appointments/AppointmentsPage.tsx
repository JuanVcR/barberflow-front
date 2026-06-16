import { useEffect, useState } from 'react'
import { cancelBooking, getAppointments } from '../../../services/backend'
import type { Booking, ToastMessage } from '../../../types/models'

interface AppointmentsPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function AppointmentsPage({ navigate, notify }: AppointmentsPageProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
  const [appointments, setAppointments] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getAppointments()
      .then((data) => {
        if (mounted) setAppointments(data)
      })
      .catch((error) => {
        if (mounted) notify('error', error instanceof Error ? error.message : 'Erro ao carregar agendamentos')
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [notify])

  const upcomingAppointments = appointments.filter((apt) => apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'SCHEDULED')
  const historyAppointments = appointments.filter((apt) => apt.status === 'COMPLETED' || apt.status === 'CANCELLED')

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await cancelBooking(id)
        setAppointments((current) =>
          current.map((appointment) =>
            appointment.id === id
              ? { ...appointment, status: 'CANCELLED' }
              : appointment,
          ),
        )
        notify('success', 'Agendamento cancelado')
      } catch (error) {
        notify('error', error instanceof Error ? error.message : 'Erro ao cancelar agendamento')
      }
    }
  }

  const handleDetails = (id: string) => {
    navigate(`/customer/appointments/${id}`)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { weekday: 'short', month: '2-digit', day: '2-digit' }).toUpperCase()
  }

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : historyAppointments

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1>Meus Agendamentos</h1>
          <p className="appointments-subtitle">Gerencie seus horários marcados</p>
        </div>
        <button
          className="primary-button"
          onClick={() => navigate('/customer/explore')}
          style={{ gap: '0.5rem' }}
        >
          <span>+</span> Novo Agendamento
        </button>
      </div>

      {/* Tabs */}
      <div className="appointments-tabs">
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Próximos ({upcomingAppointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico ({historyAppointments.length})
        </button>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {isLoading ? (
          <div className="empty-state-appointments">
            <p>Carregando agendamentos...</p>
          </div>
        ) : displayAppointments.length === 0 ? (
          <div className="empty-state-appointments">
            <button
              className="primary-button"
              onClick={() => navigate('/customer/explore')}
            >
              VOCE NAO POSSUI AGENDAMENTO. DESEJA CRIAR UM?
            </button>
          </div>
        ) : (
          displayAppointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-date">
                <div className="date-box">{formatDate(apt.date).split(' ')[1]}</div>
                <div className="date-label">{formatDate(apt.date).split(' ')[0]}</div>
              </div>

              <div className="appointment-info">
                <div className="appointment-top">
                  <div>
                    <h3>{apt.barbershopName}</h3>
                    <p className="address">{apt.date}</p>
                  </div>
                  <div className="appointment-actions">
                    <button
                      className={`action-button ${activeTab === 'upcoming' ? 'cancel' : 'rebook'}`}
                      onClick={() => activeTab === 'upcoming' ? handleCancel(apt.id) : handleDetails(apt.id)}
                    >
                      {activeTab === 'upcoming' ? 'Cancelar' : 'Ver Detalhes'}
                    </button>
                  </div>
                </div>

                <div className="appointment-details">
                  <span className="detail-item">
                    <strong>{apt.barberName.charAt(0)}</strong> {apt.barberName}
                  </span>
                  <span className="detail-item">{apt.time}</span>
                  <span className="detail-item">{apt.serviceName}</span>
                </div>

                {apt.status === 'COMPLETED' && (
                  <span className="status-badge completed">Concluído</span>
                )}
                {apt.status === 'CANCELLED' && (
                  <span className="status-badge cancelled">Cancelado</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
