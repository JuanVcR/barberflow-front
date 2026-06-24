import { useState } from 'react'
import { SearchIcon } from '../../components/Icons'

interface LandingPageProps {
  navigate: (path: string) => void
}

export function LandingPage({ navigate }: LandingPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const getSearchPath = () => {
    const trimmed = searchTerm.trim()
    return trimmed ? '/public/barbershops?search=' + encodeURIComponent(trimmed) : '/public/barbershops'
  }

  const handleSearch = () => {
    navigate(getSearchPath())
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1>Sua Barbearia, Agora Online</h1>
          <p className="landing-hero-subtitle">
            Encontre as melhores barbearias perto de você e agende seu corte em segundos
          </p>

          {/* Search Bar */}
          <div className="landing-search-container">
            <div className="landing-search-box">
              <SearchIcon className="icon-sm" />
              <input
                type="text"
                placeholder="Buscar barbearia, serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <a
              href={'#' + getSearchPath()}
              onClick={(event) => {
                event.preventDefault()
                handleSearch()
              }}
              className="landing-search-button"
            >
              Buscar
            </a>
          </div>

          {/* CTA Button */}
          <a
            href="#/public/barbershops"
            onClick={(event) => {
              event.preventDefault()
              navigate('/public/barbershops')
            }}
            className="landing-cta-button"
          >
            Explorar Todas as Barbearias
          </a>
        </div>
      </section>
    </div>
  )
}
