import { useEffect, useMemo, useState } from 'react'
import { ClockIcon, MapPinIcon, SearchIcon, StarIcon } from '../components/Icons'
import { fetchBarbershops } from '../services/backend'
import type { Barbershop } from '../types/models'
import { getQueryParams } from '../utils/navigation'

interface BarbershopListPageProps {
  navigate: (path: string) => void
}

export function BarbershopListPage({ navigate }: BarbershopListPageProps) {
  const [searchTerm, setSearchTerm] = useState(() => getQueryParams().get('search') ?? '')
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    fetchBarbershops()
      .then((data) => {
        if (isMounted) {
          setBarbershops(data)
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'N\u00e3o foi poss\u00edvel carregar as barbearias.')
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

  const filteredBarbershops = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return barbershops
    }

    return barbershops.filter((shop) => {
      return (
        shop.name.toLowerCase().includes(term) ||
        shop.address.toLowerCase().includes(term) ||
        shop.services.some((service) => service.name.toLowerCase().includes(term))
      )
    })
  }, [barbershops, searchTerm])

  return (
    <section className="section shell container">
      <div className="section-heading">
        <p className="eyebrow">{'Escolha seu lugar'}</p>
        <h1>{'Encontre sua pr\u00f3xima barbearia.'}</h1>
        <p>
          {isLoading
            ? 'Carregando barbearias...'
            : filteredBarbershops.length + ' barbearias premium dispon\u00edveis agora.'}
        </p>
      </div>

      <label className="search-box wide">
        <SearchIcon className="icon-sm" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={'Buscar por nome, localiza\u00e7\u00e3o ou servi\u00e7o...'}
        />
      </label>

      {errorMessage && <div className="empty-state">{errorMessage}</div>}

      {!errorMessage && (
        <div className="shop-grid">
          {filteredBarbershops.map((shop) => (
            <article key={shop.id} className="shop-card">
              <div className="shop-image-wrap">
                <img src={shop.image} alt={shop.name} className="shop-image" />
                <div className="rating-pill">
                  <StarIcon className="icon-xs fill-icon" />
                  <span>{shop.rating}</span>
                </div>
              </div>

              <div className="shop-content">
                <h3>{shop.name}</h3>
                <p>{shop.description}</p>

                <div className="shop-info">
                  <span>
                    <MapPinIcon className="icon-xs" />
                    {shop.address}
                  </span>
                  <span>
                    <ClockIcon className="icon-xs" />
                    {shop.workingHours.start + ' - ' + shop.workingHours.end}
                  </span>
                </div>

                <div className="shop-footer">
                  <div>
                    <small>{'A partir de'}</small>
                    <strong>{'R$ ' + Math.min(...shop.services.map((service) => service.price))}</strong>
                  </div>
                  <span>{shop.services.length + ' servi\u00e7os'}</span>
                </div>

                <button
                  className="primary-button full-width"
                  onClick={() => navigate('/barbershop/' + shop.slug)}
                >
                  {'Ver detalhes'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && !errorMessage && filteredBarbershops.length === 0 && (
        <div className="empty-state">{'Nenhuma barbearia encontrada para "' + searchTerm + '".'}</div>
      )}
    </section>
  )
}
