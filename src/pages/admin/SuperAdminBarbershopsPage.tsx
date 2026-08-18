import { useEffect, useMemo, useState } from 'react'
import {
  fetchAdminBarbershops,
  type AdminBarbershop,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface SuperAdminBarbershopsPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '-'

export function SuperAdminBarbershopsPage({
  navigate,
  notify,
}: SuperAdminBarbershopsPageProps) {
  const [barbershops, setBarbershops] = useState<AdminBarbershop[]>([])
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminBarbershops()
      .then(setBarbershops)
      .catch((error) =>
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar barbearias'),
      )
      .finally(() => setLoading(false))
  }, [notify])

  const visibleBarbershops = useMemo(
    () =>
      barbershops.filter((barbershop) => {
        if (filter === 'ACTIVE') return barbershop.setupCompleted
        if (filter === 'PENDING') return !barbershop.setupCompleted
        return true
      }),
    [barbershops, filter],
  )

  const active = barbershops.filter((barbershop) => barbershop.setupCompleted).length
  const pending = barbershops.length - active
  const proPlan = barbershops.filter((barbershop) => barbershop.plan === 'PRO').length

  return (
    <section className="super-shops-page">
      <div className="super-shops-shell">
        <header className="super-shops-header">
          <div>
            <span>Super ADM</span>
            <h1>Barbearias</h1>
            <p>Unidades cadastradas na plataforma.</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')}>
            ← Voltar
          </button>
        </header>

        <div className="super-shops-stats">
          <article>
            <span>Total</span>
            <strong>{loading ? '-' : barbershops.length}</strong>
            <small>Barbearias cadastradas</small>
          </article>
          <article>
            <span>Ativas</span>
            <strong>{loading ? '-' : active}</strong>
            <small>Configuração concluída</small>
          </article>
          <article>
            <span>Pendentes</span>
            <strong>{loading ? '-' : pending}</strong>
            <small>Aguardando configuração</small>
          </article>
          <article>
            <span>Plano Pro</span>
            <strong>{loading ? '-' : proPlan}</strong>
            <small>Unidades no plano PRO</small>
          </article>
        </div>

        <section className="super-shops-card">
          <div className="super-shops-card-header">
            <div>
              <span>Lista</span>
              <h2>Barbearias cadastradas</h2>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
            >
              <option value="ALL">Todas</option>
              <option value="ACTIVE">Ativas</option>
              <option value="PENDING">Pendentes</option>
            </select>
          </div>

          <div className="super-shops-table">
            <div className="super-shops-row head">
              <strong>Nome</strong>
              <span>Plano</span>
              <span>Status</span>
              <span>Slug</span>
              <span>Cadastro</span>
            </div>
            {visibleBarbershops.map((barbershop) => (
              <div className="super-shops-row" key={barbershop.id}>
                <strong>{barbershop.name}</strong>
                <span className="super-shops-plan">{barbershop.plan ?? 'FREE'}</span>
                <span className={'super-shops-status ' + (barbershop.setupCompleted ? 'active' : 'pending')}>
                  {barbershop.setupCompleted ? 'Ativa' : 'Pendente'}
                </span>
                <span>{barbershop.slug}</span>
                <span>{formatDate(barbershop.createdAt)}</span>
              </div>
            ))}
            {!loading && visibleBarbershops.length === 0 ? (
              <div className="super-shops-row">
                <strong>Nenhuma barbearia encontrada</strong>
                <span>-</span><span>-</span><span>-</span><span>-</span>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  )
}
