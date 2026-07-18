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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  })

  useEffect(() => {
    Promise.all([fetchClientProfile(), fetchFavoriteBarbershops()])
      .then(([profileData, favoriteData]) => {
        setProfile(profileData)
        setFormData({
          name: profileData.name ?? '',
          email: profileData.email ?? '',
          phone: profileData.phone ?? '',
          cpf: profileData.cpf ?? '',
        })
        setFavorites([...favoriteData].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar perfil'))
  }, [notify])

  const save = async () => {
    if (!profile) return
    try {
      const updated = await updateClientProfile({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        cpf: formData.cpf || undefined,
      })
      setProfile(updated)
      setFormData({
        name: updated.name ?? '',
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        cpf: updated.cpf ?? '',
      })
      updateSessionProfile({ name: updated.name, email: updated.email ?? '', phone: updated.phone })
      setEditing(false)
      notify('success', 'Perfil atualizado')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar perfil')
    }
  }

  if (!profile) return <div className="profile-page">Carregando perfil...</div>

  const mainBarbershop = favorites[0]

  return (
    <div className="profile-page">
      <button className="back-button" onClick={() => navigate('/customer/explore')}>← Voltar</button>

      <div className="profile-top">
        <div className="profile-avatar-large">{profile.name.charAt(0)}</div>
        <div className="profile-title">
          <h1>{profile.name}</h1>
          <div className="profile-subtitle">Cliente{mainBarbershop ? ` · ${mainBarbershop.name}` : ''}</div>
        </div>
        <button className="edit-button" onClick={() => editing ? save() : setEditing(true)}>
          {editing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      <div className="card personal-card">
        <div className="card-header">INFORMAÇÕES PESSOAIS</div>
        <div className="card-body two-columns">
          <div>
            <div className="label">Nome completo</div>
            {editing ? (
              <input
                className="profile-input"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            ) : (
              <div className="value">{profile.name}</div>
            )}

            <div className="label">E-mail</div>
            {editing ? (
              <input
                className="profile-input"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              />
            ) : (
              <div className="value muted">{profile.email ?? 'Não informado'}</div>
            )}
          </div>

          <div>
            <div className="label">CPF</div>
            {editing ? (
              <input
                className="profile-input"
                value={formData.cpf}
                onChange={(event) => setFormData((current) => ({ ...current, cpf: event.target.value }))}
              />
            ) : (
              <div className="value">{profile.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não informado'}</div>
            )}

            <div className="label">Telefone</div>
            {editing ? (
              <input
                className="profile-input"
                value={formData.phone}
                onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
              />
            ) : (
              <div className="value">{profile.phone ? `(${profile.phone.slice(0,2)}) ${profile.phone.slice(2,7)}-${profile.phone.slice(7)}` : 'Não informado'}</div>
            )}
          </div>
        </div>
      </div>

      <div className="card favorites-card">
        <div className="card-header">BARBEARIAS VINCULADAS</div>
        <div className="card-body">
          {favorites.map((shop) => (
            <div key={shop.id} className="favorite-row">
              <div className="favorite-avatar small">{shop.name.charAt(0)}</div>
              <div className="favorite-info"><div className="fav-name">{shop.name}</div><div className="fav-address">{shop.address || 'Endereço não informado'}</div></div>
              <div className="fav-badge">Vinculada</div>
            </div>
          ))}
          {!favorites.length ? <p>Nenhuma barbearia vinculada.</p> : null}
        </div>
      </div>

      <div className="card logout-card">
        <div className="card-body logout-body">
          <div>
            <div className="label strong">Encerrar sessão</div>
            <div className="muted">Você será desconectado da sua conta.</div>
          </div>
          <div>
            <button className="logout-button" onClick={() => { logout(); navigate('/') }}>Sair</button>
          </div>
        </div>
      </div>
    </div>
  )
}
