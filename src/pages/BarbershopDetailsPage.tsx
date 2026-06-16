import { useEffect, useState } from 'react'
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  UserIcon,
} from '../components/Icons'
import { fetchBarbershopBySlug } from '../services/backend'
import type { Barbershop } from '../types/models'

interface BarbershopDetailsPageProps {
  slug: string
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
  isAuthenticated: boolean
}

export function BarbershopDetailsPage({
  slug,
  navigate,
  notify,
  isAuthenticated,
}: BarbershopDetailsPageProps) {
  const [shop, setShop] = useState<Barbershop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    queueMicrotask(() => {
      setIsLoading(true)
      setErrorMessage('')
    })


    fetchBarbershopBySlug(slug)
      .then((data) => {
        if (isMounted) {
          setShop(data)
        }
      })
      .catch((error) => {
        if (isMounted) {
          setShop(null)
          setErrorMessage(
            error instanceof Error ? error.message : 'N\u00e3o foi poss\u00edvel carregar a barbearia.',
          )
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
  }, [slug])

  const handleBook = (serviceId: string) => {
    if (!shop) return

    if (!isAuthenticated) {
      notify('error', 'Fa\u00e7a login antes de agendar um hor\u00e1rio.')
      navigate('/login')
      return
    }

    navigate('/book/' + shop.id + '?service=' + serviceId)
  }

  if (isLoading) {
    return (
      <section className="section shell container">
        <div className="empty-state">{'Carregando detalhes da barbearia...'}</div>
      </section>
    )
  }

  if (!shop) {
    return (
      <section className="section shell container">
        <div className="empty-state">
          <h2>{errorMessage || 'Barbearia n\u00e3o encontrada'}</h2>
          <button className="primary-button" onClick={() => navigate('/barbershops')}>
            {'Voltar para a lista'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="details-page">
      <div className="details-hero">
        <img src={shop.image} alt={shop.name} />
        <div className="details-rating">
          <StarIcon className="icon-sm fill-icon" />
          {shop.rating}
        </div>
      </div>

      <section className="shell container details-card">
        <div className="section-heading">
          <p className="eyebrow">{'Barbearia em destaque'}</p>
          <h1>{shop.name}</h1>
          <p>{shop.description}</p>
        </div>

        <div className="details-info-grid">
          <span>
            <MapPinIcon className="icon-sm accent" />
            {shop.address}
          </span>
          <span>
            <PhoneIcon className="icon-sm accent" />
            {shop.phone}
          </span>
          <span>
            <MailIcon className="icon-sm accent" />
            {shop.email}
          </span>
          <span>
            <ClockIcon className="icon-sm accent" />
            {shop.workingHours.start + ' - ' + shop.workingHours.end}
          </span>
        </div>
      </section>

      <section className="section shell container">
        <div className="section-heading">
          <h2>{'Servi\u00e7os'}</h2>
        </div>
        <div className="service-grid">
          {shop.services.map((service) => (
            <article key={service.id} className="service-card">
              <img src={service.image} alt={service.name} className="service-image" />
              <div className="service-content">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <div>
                    <strong>{'R$ ' + service.price}</strong>
                    <span>{service.duration + ' min'}</span>
                  </div>
                  <button className="primary-button" onClick={() => handleBook(service.id)}>
                    {'Agendar'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell container">
        <div className="section-heading">
          <h2>{'Barbeiros'}</h2>
        </div>
        <div className="barber-grid">
          {shop.barbers.map((barber) => (
            <article key={barber.id} className="barber-card">
              <div className="avatar-placeholder">
                <UserIcon className="icon-lg" />
              </div>
              <h3>{barber.name}</h3>
              <p>{'Barbeiro profissional'}</p>
              <div className="star-row">
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon key={index} className="icon-xs fill-icon" />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
