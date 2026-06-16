import type { User } from '../../../types/models'

interface DashboardProps {
  user: User | null
  navigate: (path: string) => void
  title: string
  links: Array<{ label: string; path: string }>
}

export function SimpleDashboard({ user, navigate, title, links }: DashboardProps) {
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Você precisa estar logado</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>{title}</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
          Bem-vindo, <strong>{user.name}</strong>
        </p>

        <div className="dashboard-cards">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="dashboard-card"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
