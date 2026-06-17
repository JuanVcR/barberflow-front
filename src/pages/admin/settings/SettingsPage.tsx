import { useEffect, useState } from 'react'
import {
  fetchAdminBarbershops,
  updateAdminBarbershop,
  uploadBarbershopImage,
  type AdminBarbershop,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'
import { ClipboardIcon, ScissorsIcon, ShieldIcon, StoreIcon } from '../../../components/Icons'

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

  const removeImage = async (type: 'logo' | 'cover') => {
    if (!barbershop) return

    try {
      setUploading(type)
      const updated = await updateAdminBarbershop(barbershop.id, {
        [type === 'logo' ? 'logoUrl' : 'coverUrl']: null,
      })
      setBarbershop((current) => current ? { ...current, ...updated } : updated)
      notify('success', type === 'logo' ? 'Logo removida' : 'Capa removida')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao remover imagem')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="settings-page">
      <button className="settings-back-button" onClick={() => navigate?.('/admin/dashboard')}>← Voltar</button>
      <h1>Configurações da Unidade</h1>
      {barbershop ? (
        <div className="settings-content">
          <div className="settings-images">
            <label className="settings-image-card">
              <span>Logo da barbearia</span>
              <div className="settings-image-preview">
                {barbershop.logoUrl ? <img src={barbershop.logoUrl} alt="Logo da barbearia" /> : <ScissorsIcon />}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => upload('logo', event.target.files?.[0])}
                disabled={uploading !== null}
              />
              <span className="settings-upload-button">{uploading === 'logo' ? 'Enviando...' : 'Clique para escolher logo'}</span>
              {barbershop.logoUrl ? (
                <button type="button" onClick={() => void removeImage('logo')} disabled={uploading !== null}>
                  Remover logo
                </button>
              ) : null}
            </label>
            <label className="settings-image-card">
              <span>Foto de capa</span>
              <div className="settings-image-preview">
                {barbershop.coverUrl ? <img src={barbershop.coverUrl} alt="Capa da barbearia" /> : <StoreIcon />}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => upload('cover', event.target.files?.[0])}
                disabled={uploading !== null}
              />
              <span className="settings-upload-button">{uploading === 'cover' ? 'Enviando...' : 'Clique para escolher capa'}</span>
              {barbershop.coverUrl ? (
                <button type="button" onClick={() => void removeImage('cover')} disabled={uploading !== null}>
                  Remover capa
                </button>
              ) : null}
            </label>
          </div>

          <section className="settings-form-card">
            <label className="settings-field settings-field-full">
              <span>Nome</span>
              <input
                value={barbershop.name}
                onChange={(event) => setBarbershop({ ...barbershop, name: event.target.value })}
              />
            </label>
            <label className="settings-field">
              <span>Endereço</span>
              <input
                placeholder="Endereço da barbearia"
                value={barbershop.address ?? ''}
                onChange={(event) => setBarbershop({ ...barbershop, address: event.target.value })}
              />
            </label>
            <label className="settings-field">
              <span>Telefone</span>
              <input
                value={barbershop.phoneOwner ?? ''}
                onChange={(event) => setBarbershop({ ...barbershop, phoneOwner: event.target.value })}
              />
            </label>
          </section>

          <section className="settings-summary-card">
            <p><ClipboardIcon /><span><strong>CNPJ:</strong> {barbershop.cnpj || 'Não informado'}</span></p>
            <p><ShieldIcon /><span><strong>Plano:</strong> {barbershop.plan || 'FREE'}</span></p>
            <p><StoreIcon /><span><strong>Status:</strong> {barbershop.setupCompleted ? 'Ativa' : 'Configuração pendente'}</span></p>
            <div className="settings-progress"><span /></div>
          </section>

          <button className="primary-button" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      ) : <p>Nenhuma barbearia vinculada.</p>}
    </div>
  )
}
