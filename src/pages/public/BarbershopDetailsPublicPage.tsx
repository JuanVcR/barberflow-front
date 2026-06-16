import { useEffect, useState } from 'react'
import type { Barbershop, ToastMessage } from '../../types/models'
import { fetchBarbershopBySlug } from '../../services/backend'

interface BarbershopDetailsPublicProps {
  slug?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
  isAuthenticated?: boolean
}

export function BarbershopDetailsPublicPage({
  slug,
  navigate,
  notify,
  isAuthenticated,
}: BarbershopDetailsPublicProps) {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    if (!slug) {
      queueMicrotask(() => {
        setIsLoading(false)
      })
      return () => {
        isMounted = false
      }
    }


    fetchBarbershopBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setBarbershop(data)
        }
      })
      .catch((error) => {
        if (isMounted) {
          notify('error', error instanceof Error ? error.message : 'Erro ao carregar barbearia')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [notify, slug])

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando detalhes...</div>
  }

  if (!barbershop) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Barbearia não encontrada</h2>
        <button onClick={() => navigate('/public/barbershops')}>Voltar</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <button onClick={() => navigate('/public/barbershops')} style={{ marginBottom: '20px' }}>
        ← Voltar
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Imagem */}
        <div>
          {barbershop.image && <img src={barbershop.image} alt={barbershop.name} />}
        </div>

        {/* Detalhes */}
        <div>
          <h1>{barbershop.name}</h1>
          <p>{barbershop.address}</p>

          <div style={{ marginTop: '30px' }}>
            <h3>Profissionais</h3>
            <ul>
              {barbershop.professionals.map((prof) => (
                <li key={prof.id}>{prof.name}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Serviços</h3>
            <div>
              {barbershop.services.map((service) => (
                <div key={service.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                  <strong>{service.name}</strong> - R$ {service.price.toFixed(2)}
                  <br />
                  <small>{service.duration} min</small>
                </div>
              ))}
            </div>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => navigate(`/customer/booking/${barbershop.id}`)}
              style={{
                marginTop: '30px',
                padding: '12px 30px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Agendar Agora
            </button>
          ) : (
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <p>
                <button onClick={() => navigate('/auth/login')} style={{ cursor: 'pointer' }}>
                  Faça login
                </button>{' '}
                para agendar seu horário
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
