import { useEffect, useState } from 'react'
import {
  fetchBarberProfile,
  updateBarberProfile,
  type BarberProfile,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface BarberProfilePageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function BarberProfilePage({ navigate, notify }: BarberProfilePageProps) {
  const [profile, setProfile] = useState<BarberProfile | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBarberProfile()
      .then((data) => {
        setProfile(data)
        setName(data.name)
        setPhone(data.phone)
      })
      .catch((error) =>
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar perfil'),
      )
      .finally(() => setLoading(false))
  }, [notify])

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateBarberProfile({ name, phone })
      setProfile((current) => current ? { ...current, ...updated } : updated)
      notify('success', 'Perfil atualizado')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Carregando perfil...</div>
  if (!profile) return <div style={{ padding: 20 }}>Perfil de barbeiro não encontrado.</div>

  const initials = profile.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate('/professional/agenda')} style={{ marginBottom: 20 }}>
        Voltar
      </button>

      <h1>Meu Perfil Profissional</h1>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ddd', margin: '0 auto 15px', display: 'grid', placeItems: 'center', fontSize: 30 }}>
          {initials}
        </div>
        <strong>{profile.barbershop.name}</strong>
      </div>

      <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Nome</label>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 15 }}
      />

      <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Telefone</label>
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 20 }}
      />

      <h2>Serviços vinculados</h2>
      <div style={{ marginBottom: 20 }}>
        {profile.services.length
          ? profile.services.map((service) => (
              <span key={service.id} style={{ display: 'inline-block', padding: '6px 12px', background: '#f2f2f2', borderRadius: 20, margin: '0 8px 8px 0' }}>
                {service.name}
              </span>
            ))
          : <p>Nenhum serviço vinculado.</p>}
      </div>

      <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: 12 }}>
        {saving ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </div>
  )
}
