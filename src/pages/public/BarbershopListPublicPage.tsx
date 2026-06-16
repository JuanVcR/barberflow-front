import { useEffect, useState } from 'react'
import { fetchBarbershops } from '../../services/backend'
import type { Barbershop } from '../../types/models'

interface BarbershopListPublicProps {
  navigate: (path: string) => void
  searchTerm?: string
}

export function BarbershopListPublicPage({ navigate, searchTerm }: BarbershopListPublicProps) {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchBarbershops()
      .then((data) => {
        if (isMounted) {
          setBarbershops(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setBarbershops([])
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
  }, [searchTerm])

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando barbearias...</div>
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <h1>Barbearias Disponíveis</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        {barbershops.map((shop) => (
          <div
            key={shop.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/public/barbershop/${shop.slug}`)}
          >
            <div
              style={{
                backgroundColor: '#f0f0f0',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={shop.image}
                alt={shop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '15px' }}>
              <h3>{shop.name}</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>{shop.address}</p>
              <p style={{ marginTop: '10px' }}>
                {shop.professionals.length} profissionais • {shop.services.length} serviços
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
