import { useEffect, useState } from 'react'
import type { User, Booking } from '../../../types/models'
import { getProfessionalStats, getProfessionalAppointments } from '../../../services/backend'

interface ProfessionalDashboardPageProps {
  user: User | null
  navigate: (path: string) => void
}

interface Stats {
  appointments: number
  revenue: number
  avgRating: number
}

export function ProfessionalDashboardPage({ user, navigate }: ProfessionalDashboardPageProps) {
  const [todayStats, setTodayStats] = useState<Stats | null>(null)
  const [todayAppointments, setTodayAppointments] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    Promise.all([
      getProfessionalStats(user.id).catch(() => ({ appointments: 0, revenue: 0, avgRating: 0 })),
      getProfessionalAppointments(user.id).catch(() => []),
    ]).then(([stats, appointments]) => {
      setTodayStats(stats)
      setTodayAppointments(appointments)
      setLoading(false)
    })
  }, [user?.id])

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Você precisa estar logado</p>
      </div>
    )
  }

  if (loading) return <div style={{ padding: '40px' }}>Carregando...</div>

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Operacional</h1>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px',
          marginBottom: '40px',
        }}
      >
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ margin: 0, marginBottom: '10px' }}>Hoje</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{todayStats?.appointments || 0} clientes</div>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>
            Faturamento: R$ {(todayStats?.revenue || 0).toFixed(2)}
          </p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ margin: 0, marginBottom: '10px' }}>Avaliação</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>⭐ {todayStats?.avgRating || 0}</div>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>Média de clientes</p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ margin: 0, marginBottom: '10px' }}>Ações Rápidas</h3>
          <button
            onClick={() => navigate('/professional/blocking')}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Bloquear Horário
          </button>
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h2 style={{ marginBottom: '20px' }}>Agenda de Hoje</h2>
        <div>
          {todayAppointments.length === 0 ? (
            <p style={{ color: '#666' }}>Nenhum agendamento para hoje</p>
          ) : (
            todayAppointments.map((apt, idx) => (
              <div
                key={idx}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{apt.time}</div>
                <div>
                  <strong>{apt.barbershopName}</strong>
                  <p style={{ color: '#666', margin: '5px 0 0 0' }}>
                    {apt.serviceName}
                  </p>
                </div>
                <div
                  style={{
                    padding: '5px 10px',
                    backgroundColor: apt.status === 'pending' ? '#fff3cd' : '#e8f5e9',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {apt.status === 'confirmed' && '✓ Confirmado'}
                  {apt.status === 'pending' && '▶ Pendente'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Telas do barbeiro</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        <button
          onClick={() => navigate('/professional/agenda')}
          style={{
            padding: '15px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Agenda
        </button>
        <button
          onClick={() => navigate('/professional/current')}
          style={{
            padding: '15px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Atendimento Atual
        </button>
        <button
          onClick={() => navigate('/professional/history')}
          style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            color: '#000',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Historico
        </button>
        <button
          onClick={() => navigate('/professional/availability-new')}
          style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            color: '#000',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Disponibilidade
        </button>
        <button
          onClick={() => navigate('/professional/profile')}
          style={{
            padding: '15px',
            backgroundColor: '#f5f5f5',
            color: '#000',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Perfil
        </button>
        </div>
      </div>
    </div>
  )
}
