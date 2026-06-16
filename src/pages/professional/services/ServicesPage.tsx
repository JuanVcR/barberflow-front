import { useEffect, useState } from 'react'
import { fetchBarberProfile, type BarberProfile } from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface ServicesPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function ServicesPage({ navigate, notify }: ServicesPageProps) {
  const [services, setServices] = useState<BarberProfile['services']>([])

  useEffect(() => {
    fetchBarberProfile()
      .then((profile) => setServices(profile.services))
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar serviços'))
  }, [notify])

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/professional/agenda')}>Voltar</button>
      <h1>Meus Serviços</h1>
      {services.map((service) => (
        <div key={service.id} style={{ padding: 15, borderBottom: '1px solid #ddd' }}>
          <strong>{service.name}</strong>
          <span style={{ float: 'right' }}>{service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {service.duration} min</span>
        </div>
      ))}
      {!services.length ? <p>Nenhum serviço vinculado ao seu perfil.</p> : null}
    </div>
  )
}
