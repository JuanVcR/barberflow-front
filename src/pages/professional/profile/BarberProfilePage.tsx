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
    || 'B'

  return (
    <div className="barber-profile-page">
      <button className="barber-profile-back" onClick={() => navigate('/professional/agenda')}>
        Voltar
      </button>

      <h1>Meu Perfil</h1>

      <div className="barber-profile-summary">
        <div className="barber-profile-avatar">
          {initials}
        </div>
        <strong>{profile.barbershop?.name ?? 'Barbearia'}</strong>
      </div>

      <section className="barber-profile-form">
        <label>
          Nome
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label>
          Telefone
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        <div className="barber-profile-services">
          <h2>Serviços vinculados</h2>
          <div>
            {profile.services.length
              ? profile.services.map((service) => (
                  <span key={service.id}>
                    {service.name}
                  </span>
                ))
              : <p>Nenhum serviço vinculado.</p>}
          </div>
        </div>
      </section>

      <button className="barber-profile-save" onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </div>
  )
}
