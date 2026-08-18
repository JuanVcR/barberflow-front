import { useEffect, useState } from 'react'
import {
  fetchBarberProfile,
  updateBarberAvailability,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface AvailabilityPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

type Row = { weekDay: number; startTime: string; endTime: string; active: boolean }

export function AvailabilityPage({ navigate, notify }: AvailabilityPageProps) {
  const [rows, setRows] = useState<Row[]>(
    days.map((_, weekDay) => ({ weekDay, startTime: '09:00', endTime: '18:00', active: false })),
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBarberProfile()
      .then((profile) => {
        setRows((current) => current.map((row) => {
          const saved = profile.availability.find((item) => item.weekDay === row.weekDay)
          return saved ? { ...saved, active: true } : row
        }))
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar disponibilidade'))
  }, [notify])

  const updateRow = (weekDay: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => row.weekDay === weekDay ? { ...row, ...patch } : row))

  const save = async () => {
    try {
      setSaving(true)
      await updateBarberAvailability(
        rows.filter((row) => row.active).map(({ weekDay, startTime, endTime }) => ({ weekDay, startTime, endTime })),
      )
      notify('success', 'Disponibilidade atualizada')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao salvar disponibilidade')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="availability-page">
      <button className="back-button" onClick={() => navigate('/professional/agenda')}>Voltar</button>
      <h1>Disponibilidade</h1>
      <div className="availability-card">
        {rows.map((row) => (
          <div className="availability-row" key={row.weekDay}>
            <label className="availability-switch">
              <input type="checkbox" checked={row.active} onChange={(event) => updateRow(row.weekDay, { active: event.target.checked })} />
              <span />
            </label>
            <strong>{days[row.weekDay]}</strong>
            <label>
              <span>Das</span>
              <input type="time" disabled={!row.active} value={row.startTime} onChange={(event) => updateRow(row.weekDay, { startTime: event.target.value })} />
            </label>
            <label>
              <span>às</span>
              <input type="time" disabled={!row.active} value={row.endTime} onChange={(event) => updateRow(row.weekDay, { endTime: event.target.value })} />
            </label>
          </div>
        ))}
        <button className="availability-save" onClick={save} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar disponibilidade'}
        </button>
      </div>
    </div>
  )
}
