import { useState } from 'react'
import { SearchIcon } from '../../components/Icons'

interface LandingPageProps {
  navigate: (path: string) => void
}

export function LandingPage({ navigate }: LandingPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = () => {
    const trimmed = searchTerm.trim()
    navigate(trimmed ? '/public/barbershops?search=' + encodeURIComponent(trimmed) : '/public/barbershops')
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
            <button onClick={handleSearch} className="landing-search-button">
              Buscar
            </button>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/public/barbershops')}
            className="landing-cta-button"
          >
            Explorar Todas as Barbearias
          </button>
        </div>
      </section>
    </div>
  )
}
