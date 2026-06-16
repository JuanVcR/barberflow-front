import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import {
  fetchClientProfile,
  fetchFavoriteBarbershops,
  updateClientProfile,
  type ClientProfile,
  type FavoriteBarbershop,
} from '../../../services/backend'
import type { User, ToastMessage } from '../../../types/models'

interface CustomerProfilePageProps {
  user: User | null
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function CustomerProfilePage({ navigate, notify }: CustomerProfilePageProps) {
  const { logout, updateProfile: updateSessionProfile } = useAuth()
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [favorites, setFavorites] = useState<FavoriteBarbershop[]>([])
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    Promise.all([fetchClientProfile(), fetchFavoriteBarbershops()])
      .then(([profileData, favoriteData]) => {
        setProfile(profileData)
        setFavorites(favoriteData)
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar perfil'))
  }, [notify])

  const save = async () => {
    if (!profile) return
    try {
      const updated = await updateClientProfile({
        name: profile.name,
        phone: profile.phone,
        cpf: profile.cpf || undefined,
      })
      setProfile(updated)
      updateSessionProfile({ name: updated.name, email: updated.email ?? '', phone: updated.phone })
      setEditing(false)
      notify('success', 'Perfil atualizado')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    }
  }

  if (!profile) return <div className="profile-page">Carregando perfil...</div>

  return (
    <div className="profile-page">
      <button className="back-button" onClick={() => navigate('/customer/explore')}>Voltar</button>
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">{profile.name.charAt(0)}</div>
          <div className="profile-details"><h1>{profile.name}</h1><p>{profile.email}</p></div>
        </div>
        <button className="edit-button" onClick={() => editing ? save() : setEditing(true)}>
          {editing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      <div className="profile-section">
        <h2>Informações pessoais</h2>
        <div className="info-grid">
          <label>Nome<input disabled={!editing} value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
          <label>CPF<input disabled={!editing} value={profile.cpf ?? ''} onChange={(event) => setProfile({ ...profile, cpf: event.target.value })} /></label>
          <label>E-mail<input disabled value={profile.email ?? ''} /></label>
          <label>Telefone<input disabled={!editing} value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
        </div>
      </div>

      <div className="profile-section">
        <h2>Barbearias vinculadas</h2>
        <div className="favorite-list">
          {favorites.map((shop) => (
            <div key={shop.id} className="favorite-item">
              <div className="favorite-avatar">{shop.name.charAt(0)}</div>
              <div className="favorite-info"><h3>{shop.name}</h3><p>{shop.address || 'Endereço não informado'}</p></div>
            </div>
          ))}
          {!favorites.length ? <p>Nenhuma barbearia vinculada.</p> : null}
        </div>
      </div>

      <div className="profile-section danger">
        <button className="logout-button" onClick={() => { logout(); navigate('/') }}>Sair</button>
      </div>
    </div>
  )
}
