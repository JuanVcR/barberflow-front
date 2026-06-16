import { useEffect, useState } from 'react'
import type { ToastMessage } from '../../../types/models'
import {
  fetchAdminBarbershops,
  fetchWorkingHours,
  updateWorkingHours,
  type AdminBarbershop,
  type WorkingHour,
} from '../../../services/backend'

const days = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']

interface WorkingHoursPageProps {
  barbershopId?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function WorkingHoursPage({ barbershopId, navigate, notify }: WorkingHoursPageProps) {
  const [shops, setShops] = useState<AdminBarbershop[]>([])
  const [selectedShop, setSelectedShop] = useState(barbershopId ?? '')
  const [hours, setHours] = useState<WorkingHour[]>(
    [1, 2, 3, 4, 5, 6].map((weekDay) => ({ weekDay, startTime: '08:00', endTime: '18:00' })),
  )

  useEffect(() => {
    fetchAdminBarbershops().then((data) => {
      setShops(data)
      if (!selectedShop && data[0]) setSelectedShop(data[0].id)
    })
  }, [selectedShop])

  useEffect(() => {
    if (!selectedShop) return
    fetchWorkingHours(selectedShop).then((data) => {
      if (data.length) setHours(data)
    })
  }, [selectedShop])

  const updateRow = (weekDay: number, patch: Partial<WorkingHour>) => {
    setHours((current) =>
      current.map((item) => (item.weekDay === weekDay ? { ...item, ...patch } : item)),
    )
  }

  const save = async () => {
    if (!selectedShop) return

    try {
      await updateWorkingHours(selectedShop, hours)
      notify('success', 'Horarios atualizados')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar horarios')
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: '0 auto' }}>
      <button onClick={() => navigate('/admin/dashboard')}>Voltar</button>
      <h1>Horarios de funcionamento</h1>

      <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} style={{ margin: '16px 0', padding: 10 }}>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>{shop.name}</option>
        ))}
      </select>

      <div style={{ display: 'grid', gap: 10 }}>
        {hours.map((item) => (
          <div key={item.weekDay} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 10, alignItems: 'center' }}>
            <strong>{days[item.weekDay]}</strong>
            <input type="time" value={item.startTime} onChange={(e) => updateRow(item.weekDay, { startTime: e.target.value })} />
            <input type="time" value={item.endTime} onChange={(e) => updateRow(item.weekDay, { endTime: e.target.value })} />
          </div>
        ))}
      </div>

      <button className="primary-button" onClick={save} style={{ marginTop: 20 }}>
        Salvar horarios
      </button>
    </div>
  )
}
