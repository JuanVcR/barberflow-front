import { useEffect, useState } from 'react'
import { fetchBarbershops } from '../../../services/backend'
import type { Barbershop } from '../../../types/models'

interface ExplorePageProps {
  navigate: (path: string) => void
}

export function ExplorePage({ navigate }: ExplorePageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
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
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((fav) => fav !== id) : [...current, id]
    )
  }

  const filteredBarbershops = barbershops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="customer-explore-page">
      <h1>Explorar Barbearias</h1>

      <div className="customer-explore-search">
        <input
          type="text"
          placeholder="Buscar barbearia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredBarbershops.map((shop) => (
            <div
              key={shop.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
              }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ marginBottom: '5px' }}>{shop.name}</h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>{shop.address}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(shop.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                    }}
                  >
                    {favorites.includes(shop.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  {shop.professionals.length} profissionais • {shop.services.length} serviços
                </div>
                <button
                  className="customer-explore-book-button"
                  onClick={() => navigate(`/customer/booking/${shop.id}`)}
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
