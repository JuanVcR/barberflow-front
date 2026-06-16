import { CalendarIcon, ClipboardIcon, ClockIcon, ScissorsIcon, SettingsIcon, ShieldIcon, StoreIcon, UsersIcon } from '../../components/Icons'
import type { ToastMessage } from '../../types/models'

type SectionTone = 'purple' | 'mint' | 'gold'

interface SectionAction {
  label: string
  path?: string
}

interface OpsSectionPageProps {
  title: string
  eyebrow: string
  description: string
  tone: SectionTone
  stats: Array<{ label: string; value: string; detail: string }>
  rows: Array<[string, string, string, string]>
  actions: SectionAction[]
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const toneClass: Record<SectionTone, string> = {
  purple: 'ops-hero-purple',
  mint: 'ops-hero-mint',
  gold: 'ops-hero-gold',
}

const accentClass: Record<SectionTone, string> = {
  purple: 'accent-purple',
  mint: 'accent-mint',
  gold: 'accent-gold',
}

const sidebarClass: Record<SectionTone, string> = {
  purple: 'purple',
  mint: 'mint',
  gold: 'gold',
}

export function OpsSectionPage({
  title,
  eyebrow,
  description,
  tone,
  stats,
  rows,
  actions,
  navigate,
  notify,
}: OpsSectionPageProps) {
  return (
    <section className={'ops-page ops-page-' + tone}>
      <aside className={'ops-sidebar ' + sidebarClass[tone]} aria-label={eyebrow}>
        <div className="ops-sidebar-logo">{tone === 'purple' ? <ShieldIcon /> : tone === 'mint' ? <StoreIcon /> : <ScissorsIcon />}</div>
        <button className="ops-side-button active" title="Resumo"><CalendarIcon /></button>
        <button className="ops-side-button" title="Equipe"><UsersIcon /></button>
        <button className="ops-side-button" title="Relatorios"><ClipboardIcon /></button>
        <button className="ops-side-button" title="Configuracoes"><SettingsIcon /></button>
      </aside>

      <div className="ops-workspace">
        <header className={'ops-hero ' + toneClass[tone]}>
          <div>
            <span className="ops-kicker">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="ops-hero-actions">
            <button className="ops-action" onClick={() => notify('success', title + ' atualizado')}>Salvar</button>
            <button className="ops-action dark" onClick={() => navigate(tone === 'purple' ? '/admin/super-admin' : tone === 'mint' ? '/admin/barbershop-dashboard' : '/professional/dashboard')}>
              Voltar
            </button>
          </div>
        </header>

        <div className="ops-stat-grid">
          {stats.map((stat) => (
            <article className={'ops-stat-card ' + accentClass[tone]} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </article>
          ))}
        </div>

        <div className="ops-two-columns wide-left">
          <section className="ops-panel">
            <div className="ops-panel-header">
              <div>
                <span className="ops-kicker">Lista</span>
                <h2>Dados principais</h2>
              </div>
              <select className="ops-select" aria-label="Filtro">
                <option>Todos</option>
                <option>Ativos</option>
                <option>Pendentes</option>
              </select>
            </div>
            <div className="ops-table">
              {rows.map(([first, second, third, fourth]) => (
                <div className="ops-table-row" key={first}>
                  <strong>{first}</strong>
                  <span>{second}</span>
                  <span className={'ops-badge ' + (third === 'Ativo' || third === 'Confirmado' || third === 'Online' ? 'ok' : third === 'Pendente' ? 'warn' : 'info')}>{third}</span>
                  <span>{fourth}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-panel">
            <div className="ops-panel-header">
              <div>
                <span className="ops-kicker">Acoes</span>
                <h2>Atalhos da tela</h2>
              </div>
              <ClockIcon className="ops-panel-icon" />
            </div>
            <div className="ops-task-list">
              {actions.map((action) => (
                <button className="ops-module-card compact" key={action.label} onClick={() => action.path ? navigate(action.path) : notify('info', action.label)}>
                  <strong>{action.label}</strong>
                  <span>{action.path ? 'Abrir tela relacionada' : 'Executar acao operacional'}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
