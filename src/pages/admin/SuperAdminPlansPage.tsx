import { useEffect, useMemo, useState } from 'react'
import {
  fetchSuperAdminPlans,
  updateAdminBarbershop,
  updatePlanPrices,
  type AdminBarbershop,
  type PlanPrice,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

type Plan = 'FREE' | 'BASIC' | 'PRO'

const plans: Array<{
  plan: Plan
  label: string
  barbers: string
  services: string
}> = [
  { plan: 'FREE', label: 'Inicial', barbers: '1 barbeiro', services: 'Até 5 serviços' },
  { plan: 'BASIC', label: 'Profissional', barbers: 'De 2 a 5 barbeiros', services: 'Até 20 serviços' },
  { plan: 'PRO', label: 'Premium', barbers: 'Ilimitados barbeiros', services: 'Ilimitados serviços' },
]

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return 'Sob consulta'

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(value?: string | null) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('pt-BR')
}

function parsePrice(value: string) {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

export function SuperAdminPlansPage({
  notify,
}: {
  notify: (tone: ToastMessage['tone'], text: string) => void
}) {
  const [barbershops, setBarbershops] = useState<AdminBarbershop[]>([])
  const [prices, setPrices] = useState<PlanPrice[]>([])
  const [priceDraft, setPriceDraft] = useState<Record<Plan, string>>({
    FREE: '',
    BASIC: '',
    PRO: '',
  })
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [savingPrices, setSavingPrices] = useState(false)

  const applyPrices = (nextPrices: PlanPrice[]) => {
    setPrices(nextPrices)
    setPriceDraft({
      FREE: String(nextPrices.find((item) => item.plan === 'FREE')?.pendingAmount ?? nextPrices.find((item) => item.plan === 'FREE')?.amount ?? '').replace('.', ','),
      BASIC: String(nextPrices.find((item) => item.plan === 'BASIC')?.pendingAmount ?? nextPrices.find((item) => item.plan === 'BASIC')?.amount ?? '').replace('.', ','),
      PRO: String(nextPrices.find((item) => item.plan === 'PRO')?.pendingAmount ?? nextPrices.find((item) => item.plan === 'PRO')?.amount ?? '').replace('.', ','),
    })
  }

  const load = () =>
    fetchSuperAdminPlans()
      .then((data) => {
        setBarbershops(data.barbershops)
        applyPrices(data.prices)
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar planos'))
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

  const savePrices = async () => {
    const freeAmount = parsePrice(priceDraft.FREE)
    const basicAmount = parsePrice(priceDraft.BASIC)
    const proAmount = parsePrice(priceDraft.PRO)

    if (!freeAmount) {
      notify('error', 'Informe um valor valido para o plano Inicial')
      return
    }

    if (!basicAmount) {
      notify('error', 'Informe um valor valido para o plano Profissional')
      return
    }

    try {
      setSavingPrices(true)
      const data = await updatePlanPrices([
        { plan: 'FREE', amount: freeAmount },
        { plan: 'BASIC', amount: basicAmount },
        { plan: 'PRO', amount: proAmount },
      ])
      setBarbershops(data.barbershops)
      applyPrices(data.prices)
      notify(
        data.priceEmailScheduled && !data.priceEmailSent ? 'warning' : 'success',
        data.priceEmailScheduled && !data.priceEmailSent
          ? 'Reajuste agendado, mas o email nao foi enviado'
          : 'Reajuste agendado e emails enviados',
      )
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao salvar precos')
    } finally {
      setSavingPrices(false)
    }
  }

  return (
    <section className="super-plans-page">
      <div className="super-plans-shell">
        <header className="super-plans-header">
          <div>
            <span>Super ADM</span>
            <h1>Planos</h1>
            <p>Controle de capacidade, preços e ativação das unidades.</p>
          </div>
        </header>

        <div className="super-plans-stats">
          {plans.map(({ plan, label, barbers, services }) => {
            const price = prices.find((item) => item.plan === plan)

            return (
              <article key={plan}>
                <span>Plano {label}</span>
                <strong>{loading ? '-' : totals.find((item) => item.plan === plan)?.total}</strong>
                <small>{barbers} · {services}</small>
                <em>{formatCurrency(price?.amount)}</em>
              </article>
            )
          })}
        </div>

        <section className="super-price-panel">
          <div>
            <span>Reajuste</span>
            <h2>Preços dos planos</h2>
            <p>O novo valor entra somente no primeiro dia do próximo mês e os admins recebem aviso por email.</p>
          </div>

          <div className="super-price-grid">
            <label>
              Plano Inicial
              <input
                value={priceDraft.FREE}
                onChange={(event) => setPriceDraft((current) => ({ ...current, FREE: event.target.value }))}
                placeholder="29,90"
              />
            </label>
            <label>
              Plano Profissional
              <input
                value={priceDraft.BASIC}
                onChange={(event) => setPriceDraft((current) => ({ ...current, BASIC: event.target.value }))}
                placeholder="49,90"
              />
            </label>
            <label>
              Plano Premium
              <input
                value={priceDraft.PRO}
                onChange={(event) => setPriceDraft((current) => ({ ...current, PRO: event.target.value }))}
                placeholder="Sob consulta"
              />
            </label>
          </div>

          {prices.some((item) => item.pendingEffectiveAt) ? (
            <div className="super-price-pending">
              {prices
                .filter((item) => item.pendingEffectiveAt)
                .map((item) => (
                  <span key={item.plan}>
                    {item.plan}: {formatCurrency(item.pendingAmount)} em {formatDate(item.pendingEffectiveAt)}
                  </span>
                ))}
            </div>
          ) : null}

          <button disabled={savingPrices} onClick={() => void savePrices()}>
            {savingPrices ? 'Salvando...' : 'Salvar reajuste'}
          </button>
        </section>

        <section className="super-plans-table-card">
          <div className="super-plans-table-title">
            <span>Assinaturas</span>
            <h2>Barbearias</h2>
          </div>

          <div className="super-plans-table">
            <div className="super-plans-row head">
              <strong>Barbearia</strong>
              <span>Plano</span>
              <span>Status</span>
              <span>Slug</span>
              <span>Ação</span>
            </div>

            {barbershops.map((barbershop) => (
              <div className="super-plans-row" key={barbershop.id}>
                <strong>{barbershop.name}</strong>
                <select
                  value={barbershop.plan ?? 'FREE'}
                  disabled={savingId === barbershop.id}
                  onChange={(event) =>
                    void update(barbershop, { plan: event.target.value as Plan })
                  }
                >
                  {plans.map(({ plan, label }) => (
                    <option key={plan} value={plan}>{label}</option>
                  ))}
                </select>
                <span className={'super-plan-status ' + (barbershop.setupCompleted ? 'active' : 'pending')}>
                  {barbershop.setupCompleted ? 'Ativa' : 'Pendente'}
                </span>
                <span>{barbershop.slug}</span>
                <button
                  className={barbershop.setupCompleted ? 'outline' : ''}
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
