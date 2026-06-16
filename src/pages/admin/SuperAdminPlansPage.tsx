import { useEffect, useMemo, useState } from 'react'
import {
  fetchAdminBarbershops,
  updateAdminBarbershop,
  type AdminBarbershop,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

type Plan = 'FREE' | 'BASIC' | 'PRO'

const plans: Array<{
  plan: Plan
  barbers: string
  services: string
}> = [
  { plan: 'FREE', barbers: 'Até 2', services: 'Até 5' },
  { plan: 'BASIC', barbers: 'Até 10', services: 'Até 20' },
  { plan: 'PRO', barbers: 'Ilimitados', services: 'Ilimitados' },
]

export function SuperAdminPlansPage({
  notify,
}: {
  notify: (tone: ToastMessage['tone'], text: string) => void
}) {
  const [barbershops, setBarbershops] = useState<AdminBarbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')

  const load = () =>
    fetchAdminBarbershops()
      .then(setBarbershops)
      .finally(() => setLoading(false))

  useEffect(() => {
    void load()
  }, [])

  const totals = useMemo(
    () =>
      plans.map(({ plan }) => ({
        plan,
        total: barbershops.filter(
          (barbershop) => (barbershop.plan ?? 'FREE') === plan,
        ).length,
      })),
    [barbershops],
  )

  const update = async (
    barbershop: AdminBarbershop,
    payload: { plan?: Plan; setupCompleted?: boolean },
  ) => {
    try {
      setSavingId(barbershop.id)
      const updated = await updateAdminBarbershop(barbershop.id, payload)
      setBarbershops((current) =>
        current.map((item) =>
          item.id === barbershop.id ? { ...item, ...updated } : item,
        ),
      )
      notify('success', 'Barbearia atualizada')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar plano')
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="ops-page ops-page-gold">
      <div className="ops-workspace">
        <header className="ops-hero ops-hero-gold">
          <div>
            <span className="ops-kicker">Super ADM</span>
            <h1>Planos</h1>
            <p>Controle de capacidade e ativação das unidades.</p>
          </div>
        </header>

        <div className="ops-stat-grid">
          {plans.map(({ plan, barbers, services }) => (
            <article className="ops-stat-card accent-gold" key={plan}>
              <span>Plano {plan}</span>
              <strong>{loading ? '-' : totals.find((item) => item.plan === plan)?.total}</strong>
              <small>{barbers} barbeiros · {services} serviços</small>
            </article>
          ))}
        </div>

        <section className="ops-panel">
          <div className="ops-panel-header">
            <div>
              <span className="ops-kicker">Assinaturas</span>
              <h2>Barbearias</h2>
            </div>
          </div>
          <div className="ops-table ops-table-five">
            <div className="ops-table-row">
              <strong>Barbearia</strong>
              <span>Plano</span>
              <span>Status</span>
              <span>Slug</span>
              <span>Ação</span>
            </div>
            {barbershops.map((barbershop) => (
              <div className="ops-table-row" key={barbershop.id}>
                <strong>{barbershop.name}</strong>
                <select
                  value={barbershop.plan ?? 'FREE'}
                  disabled={savingId === barbershop.id}
                  onChange={(event) =>
                    void update(barbershop, { plan: event.target.value as Plan })
                  }
                >
                  {plans.map(({ plan }) => <option key={plan}>{plan}</option>)}
                </select>
                <span className={'ops-badge ' + (barbershop.setupCompleted ? 'ok' : 'warn')}>
                  {barbershop.setupCompleted ? 'Ativa' : 'Pendente'}
                </span>
                <span>{barbershop.slug}</span>
                <button
                  disabled={savingId === barbershop.id}
                  onClick={() =>
                    void update(barbershop, {
                      setupCompleted: !barbershop.setupCompleted,
                    })
                  }
                >
                  {barbershop.setupCompleted ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
