import type { User } from '../types/models'

interface AdminDashboardPageProps {
  user: User | null
  navigate: (path: string) => void
}

export function AdminDashboardPage({ user, navigate }: AdminDashboardPageProps) {
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Você precisa estar logado</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Painel Administrativo</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div
          onClick={() => navigate('/admin/team')}
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#000'
            e.currentTarget.style.backgroundColor = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.backgroundColor = '#f5f5f5'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>👥 Gerenciar Equipe</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Adicione, remova e aprove barbeiros
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/reports')}
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#000'
            e.currentTarget.style.backgroundColor = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.backgroundColor = '#f5f5f5'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>📊 Relatórios</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Veja faturamento e performance
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/settings')}
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '2px solid transparent',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#000'
            e.currentTarget.style.backgroundColor = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.backgroundColor = '#f5f5f5'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>⚙️ Configurações</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Altere dados da unidade
          </p>
        </div>
      </div>
    </div>
  )
}
