import { useEffect, useState } from 'react'
import {
  createBarberBlock,
  deleteBarberBlock,
  fetchBarberBlocks,
  type BarberBlock,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface BlockingPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BlockingPage({ navigate, notify }: BlockingPageProps) {
  const [blocks, setBlocks] = useState<BarberBlock[]>([])
  const [form, setForm] = useState({ day: '', startTime: '', endTime: '', reason: '' })

  const load = () => fetchBarberBlocks().then(setBlocks)

  useEffect(() => {
    load().catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar bloqueios'))
  }, [notify])

  const create = async () => {
    if (!form.day) return notify('error', 'Informe a data')
    try {
      await createBarberBlock({
        day: form.day,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        reason: form.reason || undefined,
      })
      setForm({ day: '', startTime: '', endTime: '', reason: '' })
      await load()
      notify('success', 'Bloqueio criado')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao criar bloqueio')
    }
  }

  const remove = async (id: string) => {
    await deleteBarberBlock(id)
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate('/professional/agenda')}>Voltar</button>
      <h1>Bloqueios</h1>
      <div style={{ display: 'grid', gap: 10, padding: 20, background: '#f5f5f5' }}>
        <input type="date" value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })} />
        <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
        <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
        <input placeholder="Motivo" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
        <button onClick={create}>Criar bloqueio</button>
      </div>
      {blocks.map((block) => (
        <div key={block.id} style={{ padding: 15, borderBottom: '1px solid #ddd' }}>
          <strong>{new Date(block.day + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
          <span> {block.startTime && block.endTime ? `${block.startTime} - ${block.endTime}` : 'Dia inteiro'} · {block.reason || 'Sem motivo'}</span>
          <button onClick={() => remove(block.id)} style={{ float: 'right' }}>Remover</button>
        </div>
      ))}
      {!blocks.length ? <p>Nenhum bloqueio cadastrado.</p> : null}
    </div>
  )
}
