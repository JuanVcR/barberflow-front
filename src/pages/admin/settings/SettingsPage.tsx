import { useEffect, useState } from 'react'
import {
  fetchAdminBarbershops,
  updateAdminBarbershop,
  uploadBarbershopImage,
  type AdminBarbershop,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface SettingsPageProps {
  navigate?: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function SettingsPage({ navigate, notify }: SettingsPageProps) {
  const [barbershop, setBarbershop] = useState<AdminBarbershop | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null)

  useEffect(() => {
    fetchAdminBarbershops()
      .then((items) => setBarbershop(items[0] ?? null))
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar configurações'))
  }, [notify])

  const save = async () => {
    if (!barbershop) return

    try {
      setSaving(true)
      const updated = await updateAdminBarbershop(barbershop.id, {
        name: barbershop.name.trim(),
        address: barbershop.address?.trim() || null,
        phoneOwner: barbershop.phoneOwner?.replace(/\D/g, '') || null,
      })
      setBarbershop((current) => current ? { ...current, ...updated } : updated)
      notify('success', 'Configurações salvas')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const upload = async (type: 'logo' | 'cover', file?: File) => {
    if (!barbershop || !file) return

    try {
      setUploading(type)
      const updated = await uploadBarbershopImage(barbershop.id, type, file)
      setBarbershop((current) => current ? { ...current, ...updated } : updated)
      notify('success', type === 'logo' ? 'Logo atualizada' : 'Capa atualizada')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="settings-page">
      <button onClick={() => navigate?.('/admin/dashboard')}>Voltar</button>
      <h1>Configurações da Unidade</h1>
      {barbershop ? (
        <div className="form-stack" style={{ marginTop: 24 }}>
          <div className="settings-images">
            <label>
              <span>Logo da barbearia</span>
              {barbershop.logoUrl ? <img src={barbershop.logoUrl} alt="Logo da barbearia" /> : null}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => upload('logo', event.target.files?.[0])}
                disabled={uploading !== null}
              />
            </label>
            <label>
              <span>Foto de capa</span>
              {barbershop.coverUrl ? <img src={barbershop.coverUrl} alt="Capa da barbearia" /> : null}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => upload('cover', event.target.files?.[0])}
                disabled={uploading !== null}
              />
            </label>
          </div>
          <label>
            <span>Nome</span>
            <input
              value={barbershop.name}
              onChange={(event) => setBarbershop({ ...barbershop, name: event.target.value })}
            />
          </label>
          <label>
            <span>Endereço</span>
            <input
              value={barbershop.address ?? ''}
              onChange={(event) => setBarbershop({ ...barbershop, address: event.target.value })}
            />
          </label>
          <label>
            <span>Telefone</span>
            <input
              value={barbershop.phoneOwner ?? ''}
              onChange={(event) => setBarbershop({ ...barbershop, phoneOwner: event.target.value })}
            />
          </label>
          <p><strong>CNPJ:</strong> {barbershop.cnpj || 'Não informado'}</p>
          <p><strong>Plano:</strong> {barbershop.plan || 'FREE'}</p>
          <p><strong>Status:</strong> {barbershop.setupCompleted ? 'Ativa' : 'Configuração pendente'}</p>
          <button className="primary-button" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      ) : <p>Nenhuma barbearia vinculada.</p>}
    </div>
  )
}
