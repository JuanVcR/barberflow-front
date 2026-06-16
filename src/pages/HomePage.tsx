import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon, ScissorsIcon, SearchIcon, UsersIcon } from '../components/Icons'
import { fetchBarbershops } from '../services/backend'
import type { Barbershop } from '../types/models'

interface HomePageProps {
  navigate: (path: string) => void
}

export function HomePage({ navigate }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('')
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
  }, [])

  const featuredServices = useMemo(() => {
    return barbershops.flatMap((shop) => shop.services).slice(0, 3)
  }, [barbershops])

  const handleSearch = () => {
    const trimmed = searchTerm.trim()
    navigate(trimmed ? '/barbershops?search=' + encodeURIComponent(trimmed) : '/barbershops')
  }

  return (
    <div>
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="shell container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{'Plataforma premium de cuidados'}</p>
            <h1>{'Seu corte perfeito j\u00e1 est\u00e1 esperando por voc\u00ea.'}</h1>
            <p className="hero-text">
              {'Descubra as melhores barbearias da sua regi\u00e3o e agende seu pr\u00f3ximo hor\u00e1rio online em poucos toques.'}
            </p>

            <div className="hero-search">
              <label className="search-box">
                <SearchIcon className="icon-sm" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={'Buscar barbearia...'}
                />
              </label>
              <button className="primary-button large" onClick={handleSearch}>
                {'Buscar hor\u00e1rios'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell container">
        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">
              <ScissorsIcon className="icon-md" />
            </div>
            <h3>{'Servi\u00e7os de qualidade'}</h3>
            <p>{'Profissionais experientes e produtos premium do in\u00edcio ao fim.'}</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <UsersIcon className="icon-md" />
            </div>
            <h3>{'Barbeiros experientes'}</h3>
            <p>{'Escolha o especialista ideal para o seu estilo, rotina e prefer\u00eancias.'}</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <CalendarIcon className="icon-md" />
            </div>
            <h3>{'Agendamento f\u00e1cil'}</h3>
            <p>{'Agende seu hor\u00e1rio online sem liga\u00e7\u00f5es, filas ou formul\u00e1rios complicados.'}</p>
          </article>
        </div>
      </section>

      <section className="section shell container">
        <div className="section-heading center">
          <p className="eyebrow">{'Servi\u00e7os populares'}</p>
          <h2>{'Tudo o que voc\u00ea precisa para manter o visual em dia.'}</h2>
          <p>
            {isLoading
              ? 'Carregando destaques...'
              : barbershops.length > 0
                ? barbershops.length + ' barbearias dispon\u00edveis para reserva online.'
                : 'Conecte o back-end para exibir as barbearias cadastradas.'}
          </p>
        </div>

        <div className="service-grid">
          {featuredServices.map((service) => (
            <article key={service.id} className="service-card">
              <img src={service.image} alt={service.name} className="service-image" />
              <div className="service-content">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <strong>{'R$ ' + service.price}</strong>
                  <span>{service.duration + ' min'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!isLoading && featuredServices.length === 0 && (
          <div className="empty-state">{'Nenhum servi\u00e7o encontrado no momento.'}</div>
        )}

        <div className="center action-row">
          <button className="primary-button" onClick={() => navigate('/barbershops')}>
            {'Ver todas as barbearias'}
          </button>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell container cta-box">
          <div>
            <p className="eyebrow">{'Para parceiros'}</p>
            <h2>{'Tem uma barbearia?'}</h2>
            <p>{'Cadastre seu neg\u00f3cio e comece a atrair mais clientes online.'}</p>
          </div>
          <button className="outline-light-button" onClick={() => navigate('/partner/login')}>
            {'\u00c1rea do parceiro'}
          </button>
        </div>
      </section>
    </div>
  )
}
