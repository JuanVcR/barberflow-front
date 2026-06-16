import { useEffect, useState } from 'react'
import type { User } from '../../types/models'
import { CalendarIcon, ClipboardIcon, ScissorsIcon, SettingsIcon, ShieldIcon, StoreIcon, UsersIcon } from '../../components/Icons'
import { fetchAdminBarbershops, getAdminStats } from '../../services/backend'
import type { AdminBarbershop } from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface AdminDashboardPageProps {
  user: User | null
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const formatCurrency = (value?: number) => (typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-')

const modules = [
  { title: 'Super administrador', text: 'Controle de barbearias, planos, usuarios globais e repasses.', icon: ShieldIcon, path: '/admin/super-admin' },
  { title: 'Dashboard da barbearia', text: 'Operacao diaria com agenda, equipe, servicos e indicadores.', icon: StoreIcon, path: '/admin/barbershop-dashboard' },
  { title: 'Equipe e barbeiros', text: 'Convites, status de barbeiros, aprovacoes e permissoes.', icon: UsersIcon, path: '/admin/team' },
  { title: 'Servicos e precos', text: 'Catalogo, duracao, comissoes e disponibilidade por profissional.', icon: ScissorsIcon, path: '/admin/services' },
  { title: 'Relatorios', text: 'Faturamento, ocupacao, cancelamentos e performance.', icon: ClipboardIcon, path: '/admin/reports' },
  { title: 'Configuracoes', text: 'Dados da unidade, horarios, politicas e canais de contato.', icon: SettingsIcon, path: '/admin/settings' },
]

export function AdminDashboardPage({ user, navigate, notify }: AdminDashboardPageProps) {
  const [barbershops, setBarbershops] = useState<AdminBarbershop[]>([])
  const [stats, setStats] = useState<{ professionals: number; appointments: number; revenue: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        const [shopsData, statsData] = await Promise.all([
          fetchAdminBarbershops(),
          getAdminStats()
        ])

        if (!mounted) return

        setBarbershops(shopsData)
        setStats(statsData)
      } catch {
        if (mounted) notify('error', 'Erro ao carregar dados do dashboard')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [notify])

  if (!user) {
    return (
      <section className="ops-page">
        <div className="ops-empty-state">Voce precisa estar logado para acessar o painel administrativo.</div>
      </section>
    )
  }

  const quickStats = [
    { label: 'Barbearias ativas', value: barbershops.length.toString(), trend: 'Total na rede' },
    { label: 'Agendamentos hoje', value: stats?.appointments.toString() ?? '0', trend: 'Sincronizado' },
    { label: 'Receita mensal', value: formatCurrency(stats?.revenue), trend: 'Acumulado' },
  ]

  return (
    <section className="ops-page">
      <aside className="ops-sidebar" aria-label="Navegacao administrativa">
        <div className="ops-sidebar-logo"><ScissorsIcon /></div>
        <button className="ops-side-button active" title="Dashboard"><CalendarIcon /></button>
        <button className="ops-side-button" title="Barbearias" onClick={() => navigate('/admin/super-admin')}><StoreIcon /></button>
        <button className="ops-side-button" title="Equipe" onClick={() => navigate('/admin/team')}><UsersIcon /></button>
        <button className="ops-side-button" title="Configuracoes" onClick={() => navigate('/admin/settings')}><SettingsIcon /></button>
      </aside>

      <div className="ops-workspace">
        <header className="ops-hero ops-hero-purple">
          <div>
            <span className="ops-kicker">Painel administrativo</span>
            <h1>Central BarberFlow</h1>
            <p>Visao unificada para acompanhar plataforma, barbearias, equipe e operacao diaria.</p>
          </div>
          <div className="ops-user-card">
            <span>{user.name}</span>
            <strong>Administrador</strong>
          </div>
        </header>

        {loading ? (
          <div className="ops-empty-state">Carregando dados do painel...</div>
        ) : (
          <>
            <div className="ops-stat-grid">
              {quickStats.map((stat) => (
                <article className="ops-stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.trend}</small>
                </article>
              ))}
            </div>

            <div className="ops-two-columns">
              <section className="ops-panel">
                <div className="ops-panel-header">
                  <div>
                    <span className="ops-kicker">Barbearias</span>
                    <h2>Monitoramento rapido</h2>
                  </div>
                  <button className="ops-action" onClick={() => navigate('/admin/super-admin')}>Abrir</button>
                </div>
                <div className="ops-table">
                  {barbershops.length === 0 ? (
                    <div className="ops-table-row">Nenhuma barbearia encontrada.</div>
                  ) : (
                    barbershops.map((shop) => {
                      const status = shop.setupCompleted ? 'Ativa' : 'Pendente'
                      return (
                        <div className="ops-table-row" key={shop.id}>
                          <strong>{shop.name}</strong>
                          <span>{shop.plan || 'N/A'}</span>
                          <span className={'ops-badge ' + (status === 'Ativa' ? 'ok' : status === 'Pendente' ? 'warn' : 'info')}>{status}</span>
                          <span>-</span>
                          <span>-</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>

              <section className="ops-panel">
                <div className="ops-panel-header">
                  <div>
                    <span className="ops-kicker">Pendencias</span>
                    <h2>Fila de decisao</h2>
                  </div>
                  <button className="ops-action muted">Hoje</button>
                </div>
                <div className="ops-task-list">
                  <div className="ops-empty-state">Nenhuma pendência encontrada.</div>
                </div>
              </section>
            </div>

            <section className="ops-panel">
              <div className="ops-panel-header">
                <div>
                  <span className="ops-kicker">Modulos</span>
                  <h2>Areas principais</h2>
                </div>
              </div>
              <div className="ops-module-grid">
                {modules.map((module) => {
                  const Icon = module.icon
                  return (
                    <button className="ops-module-card" key={module.title} onClick={() => navigate(module.path)}>
                      <Icon />
                      <strong>{module.title}</strong>
                      <span>{module.text}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  )
}
