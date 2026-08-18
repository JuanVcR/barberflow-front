import { useEffect, useMemo, useState } from 'react'
import {
  cancelBarbershopSubscription,
  createPlanPayment,
  fetchAdminBarbershops,
  fetchPlanPrices,
  type AdminBarbershop,
  type PlanPayment,
  type PlanPrice,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

type Plan = 'FREE' | 'BASIC' | 'PRO'

const planDetails: Array<{
  plan: Plan
  name: string
  description: string
  barbers: string
  services: string
  action: string
}> = [
  {
    plan: 'FREE',
    name: 'Inicial',
    description: 'Para começar com agenda online e controle simples da barbearia.',
    barbers: '1 barbeiro',
    services: 'Até 5 serviços',
    action: 'Assinar inicial',
  },
  {
    plan: 'BASIC',
    name: 'Profissional',
    description: 'Para barbearias que já têm equipe e precisam organizar a agenda.',
    barbers: 'De 2 a 5 barbeiros',
    services: 'Até 20 serviços',
    action: 'Assinar profissional',
  },
  {
    plan: 'PRO',
    name: 'Premium',
    description: 'Para operações maiores que precisam crescer sem limite de cadastro.',
    barbers: 'Barbeiros ilimitados',
    services: 'Serviços ilimitados',
    action: 'Assinar premium',
  },
]

const planLabel: Record<Plan, string> = {
  FREE: 'Inicial',
  BASIC: 'Profissional',
  PRO: 'Premium',
}

export function SubscriptionPage({
  notify,
}: {
  notify: (tone: ToastMessage['tone'], text: string) => void
}) {
  const [barbershop, setBarbershop] = useState<AdminBarbershop | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPlan, setSavingPlan] = useState<Plan | ''>('')
  const [cancelling, setCancelling] = useState(false)
  const [payment, setPayment] = useState<PlanPayment | null>(null)
  const [prices, setPrices] = useState<PlanPrice[]>([])

  useEffect(() => {
    Promise.all([fetchAdminBarbershops(), fetchPlanPrices()])
      .then(([barbershops, planPrices]) => {
        setBarbershop(barbershops[0] ?? null)
        setPrices(planPrices)
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar plano'))
      .finally(() => setLoading(false))
  }, [notify])

  const currentPlan = (barbershop?.plan ?? 'FREE') as Plan
  const subscriptionCancelled = barbershop?.subscriptionStatus === 'CANCELLED'
  const currentDetails = useMemo(
    () => planDetails.find((item) => item.plan === currentPlan) ?? planDetails[0],
    [currentPlan],
  )

  const priceLabel = (plan: Plan) => {
    const price = prices.find((item) => item.plan === plan)
    const amount = price?.amount

    if (amount === null || amount === undefined) return 'Sob consulta'

    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }) + '/mês'
  }

  const changePlan = async (plan: Plan) => {
    if (!barbershop || plan === currentPlan) return

    const selectedPrice = prices.find((item) => item.plan === plan)

    if (plan === 'PRO' && (selectedPrice?.amount === null || selectedPrice?.amount === undefined)) {
      notify('info', 'O plano Premium e sob consulta. Entre em contato para contratar.')
      return
    }

    const confirmed = window.confirm(
      `Assinar o plano ${planLabel[plan]}?`,
    )

    if (!confirmed) return

    try {
      setSavingPlan(plan)
      const createdPayment = await createPlanPayment(barbershop.id, plan)
      setPayment(createdPayment)
      notify('success', 'Pix gerado para pagamento')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao gerar pagamento')
    } finally {
      setSavingPlan('')
    }
  }

  const refreshPlan = async () => {
    try {
      const barbershops = await fetchAdminBarbershops()
      setBarbershop(barbershops[0] ?? null)
      notify('success', 'Plano atualizado na tela')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar plano')
    }
  }

  const cancelSubscription = async () => {
    if (!barbershop) return

    const confirmed = window.confirm('Cancelar o plano atual?')
    if (!confirmed) return

    try {
      setCancelling(true)
      const updated = await cancelBarbershopSubscription(barbershop.id)
      setBarbershop((current) => current ? { ...current, ...updated } : updated)
      setPayment(null)
      notify('success', 'Plano cancelado')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao cancelar plano')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <section className="subscription-page">
      <header className="subscription-header">
        <div>
          <span>ADM barbearia</span>
          <h1>Planos</h1>
          <p>Veja seu plano atual, assine outro ou cancele quando precisar.</p>
        </div>
      </header>

      {loading ? (
        <div className="subscription-panel">Carregando planos...</div>
      ) : !barbershop ? (
        <div className="subscription-panel">Nenhuma barbearia vinculada a esta conta.</div>
      ) : (
        <>
          <section className="subscription-current">
            <div>
              <span>Plano atual</span>
              <h2>{currentDetails.name}</h2>
              <p>
                {barbershop.name}
                {subscriptionCancelled ? ' · Cancelamento solicitado' : ''}
              </p>
            </div>
            <div className="subscription-current-actions">
              <strong>{priceLabel(currentPlan)}</strong>
              <button
                type="button"
                disabled={subscriptionCancelled || cancelling}
                onClick={() => void cancelSubscription()}
              >
                {subscriptionCancelled ? 'Plano cancelado' : cancelling ? 'Cancelando...' : 'Cancelar plano'}
              </button>
            </div>
          </section>

          {payment ? (
            <section className="subscription-payment">
              <div>
                <span>Pagamento Pix</span>
                <h2>Plano {planLabel[payment.plan]}</h2>
                <p>
                  Pague o QR Code abaixo. Quando o Mercado Pago confirmar, o plano sera liberado automaticamente.
                </p>
              </div>

              {payment.qrCodeBase64 ? (
                <img src={`data:image/png;base64,${payment.qrCodeBase64}`} alt="QR Code Pix" />
              ) : null}

              {payment.qrCode ? (
                <label>
                  Pix copia e cola
                  <textarea value={payment.qrCode} readOnly rows={4} />
                </label>
              ) : null}

              <div className="subscription-payment-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (payment.qrCode) void navigator.clipboard.writeText(payment.qrCode)
                    notify('success', 'Codigo Pix copiado')
                  }}
                >
                  Copiar Pix
                </button>
                {payment.ticketUrl ? (
                  <a href={payment.ticketUrl} target="_blank" rel="noreferrer">
                    Abrir no Mercado Pago
                  </a>
                ) : null}
                <button type="button" className="ghost" onClick={() => void refreshPlan()}>
                  Ja paguei
                </button>
              </div>
            </section>
          ) : null}

          <div className="subscription-grid">
            {planDetails.map((item) => {
              const isCurrent = item.plan === currentPlan && !subscriptionCancelled
              const isSaving = savingPlan === item.plan

              return (
                <article className={'subscription-card ' + (isCurrent ? 'active' : '')} key={item.plan}>
                  {isCurrent ? <span className="subscription-badge">Plano atual</span> : null}
                  <h2>{item.name}</h2>
                  <strong>{priceLabel(item.plan)}</strong>
                  <p>{item.description}</p>
                  <ul>
                    <li>{item.barbers}</li>
                    <li>{item.services}</li>
                    <li>Agenda online</li>
                    <li>Gestão de clientes</li>
                  </ul>
                  <button
                    disabled={isCurrent || Boolean(savingPlan)}
                    onClick={() => void changePlan(item.plan)}
                  >
                    {isCurrent ? 'Usando agora' : isSaving ? 'Salvando...' : item.action}
                  </button>
                </article>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
