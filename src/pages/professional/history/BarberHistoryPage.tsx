import { useEffect, useMemo, useState } from 'react'
import { fetchBarberHistory } from '../../../services/backend'
import type { Booking, ToastMessage } from '../../../types/models'

interface BarberHistoryPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function BarberHistoryPage({ navigate, notify }: BarberHistoryPageProps) {
  const [history, setHistory] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBarberHistory()
      .then(setHistory)
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar histórico'))
      .finally(() => setLoading(false))
  }, [notify])

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthBookings = useMemo(
    () => history.filter((booking) => booking.date.startsWith(currentMonth)),
    [currentMonth, history],
  )
  const monthRevenue = monthBookings.reduce((total, booking) => total + (booking.amountPaid ?? 0), 0)
  const completed = monthBookings.filter((booking) => booking.status === 'COMPLETED').length

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={() => navigate('/professional/agenda')}>Voltar</button>
      <h1>Histórico de Atendimentos</h1>

      <div className="ops-stat-grid">
        <article className="ops-stat-card"><span>Este mês</span><strong>{loading ? '-' : monthBookings.length}</strong><small>Agendamentos</small></article>
        <article className="ops-stat-card"><span>Receita mensal</span><strong>{loading ? '-' : currency(monthRevenue)}</strong><small>Pagamentos registrados</small></article>
        <article className="ops-stat-card"><span>Concluídos</span><strong>{loading ? '-' : completed}</strong><small>No mês atual</small></article>
      </div>

      <div className="ops-table ops-table-five">
        <div className="ops-table-row"><strong>Data</strong><span>Cliente</span><span>Serviço</span><span>Valor</span><span>Status</span></div>
        {history.map((booking) => (
          <div className="ops-table-row" key={booking.id}>
            <strong>{new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
            <span>{booking.clientName ?? 'Cliente'}</span>
            <span>{booking.serviceName}</span>
            <span>{booking.amountPaid == null ? '-' : currency(booking.amountPaid)}</span>
            <span className={'ops-badge ' + (booking.status === 'COMPLETED' ? 'ok' : booking.status === 'CANCELLED' ? 'warn' : 'info')}>{booking.status}</span>
          </div>
        ))}
        {!loading && history.length === 0 ? <p>Nenhum atendimento encontrado.</p> : null}
      </div>
    </div>
  )
}
