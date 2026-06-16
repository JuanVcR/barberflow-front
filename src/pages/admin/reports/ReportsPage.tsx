import { useEffect, useState } from 'react'
import { getAdminReports } from '../../../services/backend'

type ReportSummary = {
  period: string
  revenue: number
  appointments: number
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ReportsPage() {
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    getAdminReports()
      .then((data) => {
        if (mounted) setReport(data)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="ops-page ops-page-gold">
      <div className="ops-workspace">
        <header className="ops-hero ops-hero-gold">
          <div>
            <span className="ops-kicker">Relatórios</span>
            <h1>Desempenho financeiro</h1>
            <p>Resumo calculado a partir dos agendamentos e pagamentos no banco.</p>
          </div>
        </header>

        <div className="ops-stat-grid">
          <article className="ops-stat-card accent-gold">
            <span>Período</span>
            <strong>{loading ? '-' : report?.period ?? '-'}</strong>
            <small>Referência atual</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Faturamento</span>
            <strong>{loading ? '-' : formatCurrency(report?.revenue ?? 0)}</strong>
            <small>Pagamentos registrados</small>
          </article>
          <article className="ops-stat-card accent-gold">
            <span>Agendamentos</span>
            <strong>{loading ? '-' : report?.appointments ?? 0}</strong>
            <small>Total no período</small>
          </article>
        </div>
      </div>
    </section>
  )
}
