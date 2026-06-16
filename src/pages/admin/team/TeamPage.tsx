import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  cancelBarberInvite,
  fetchAdminBarbers,
  fetchAdminBarbershops,
  fetchAdminServices,
  fetchPendingBarberInvites,
  inviteBarber,
  removeAdminBarber,
  type AdminBarber,
  type AdminBarbershop,
  type AdminService,
  type BarberInvite,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'

interface TeamPageProps {
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  serviceIds: [] as string[],
}

export function TeamPage({ notify }: TeamPageProps) {
  const [shops, setShops] = useState<AdminBarbershop[]>([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [invites, setInvites] = useState<BarberInvite[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [latestInviteUrl, setLatestInviteUrl] = useState('')

  useEffect(() => {
    fetchAdminBarbershops()
      .then((data) => {
        setShops(data)
        setSelectedShopId((current) => current || data[0]?.id || '')
      })
      .catch((error) => {
        notify('error', error instanceof Error ? error.message : 'Nao foi possivel carregar as barbearias')
        setLoading(false)
      })
  }, [notify])

  const loadTeam = useCallback(async () => {
    if (!selectedShopId) {
      setBarbers([])
      setServices([])
      setInvites([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const [barberData, serviceData, inviteData] = await Promise.all([
        fetchAdminBarbers(selectedShopId),
        fetchAdminServices(selectedShopId),
        fetchPendingBarberInvites(selectedShopId),
      ])

      setBarbers(barberData)
      setServices(serviceData)
      setInvites(inviteData)
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Nao foi possivel carregar a equipe')
    } finally {
      setLoading(false)
    }
  }, [notify, selectedShopId])

  useEffect(() => {
    void loadTeam()
  }, [loadTeam])

  const toggleService = (serviceId: string) => {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId],
    }))
  }

  const copyInviteLink = async (inviteUrl: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      notify('success', 'Link do convite copiado.')
    } catch {
      notify('error', 'Nao foi possivel copiar o link automaticamente.')
    }
  }

  const submitInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedShopId) {
      notify('error', 'Selecione uma barbearia.')
      return
    }

    setSubmitting(true)

    try {
      const result = await inviteBarber(selectedShopId, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ''),
        serviceIds: form.serviceIds,
      })

      setLatestInviteUrl(result.inviteUrl)
      setForm(emptyForm)
      setShowForm(false)
      notify(result.emailSent ? 'success' : 'info', result.message)
      await loadTeam()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Nao foi possivel criar o convite')
    } finally {
      setSubmitting(false)
    }
  }

  const cancelInvite = async (invite: BarberInvite) => {
    if (!window.confirm(`Cancelar o convite enviado para ${invite.email}?`)) return

    try {
      await cancelBarberInvite(selectedShopId, invite.id)
      notify('success', 'Convite cancelado.')
      await loadTeam()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Nao foi possivel cancelar o convite')
    }
  }

  const removeBarber = async (barber: AdminBarber) => {
    if (!window.confirm(`Remover ${barber.name} desta barbearia?`)) return

    try {
      await removeAdminBarber(selectedShopId, barber.id)
      notify('success', 'Barbeiro removido.')
      await loadTeam()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Nao foi possivel remover o barbeiro')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '960px', margin: '0 auto' }}>
      <button onClick={() => window.history.back()} style={{ marginBottom: '20px', cursor: 'pointer' }}>
        Voltar
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', marginBottom: 24 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Equipe</h1>
          <label>
            <span style={{ display: 'block', marginBottom: 6 }}>Barbearia</span>
            <select value={selectedShopId} onChange={(event) => setSelectedShopId(event.target.value)}>
              {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
            </select>
          </label>
        </div>
        <button className="dark-button" onClick={() => setShowForm((current) => !current)} disabled={!selectedShopId}>
          {showForm ? 'Fechar' : '+ Convidar barbeiro'}
        </button>
      </div>

      {showForm && (
        <form className="form-stack" onSubmit={submitInvite} style={{ marginBottom: 28 }}>
          <h2>Convidar novo barbeiro</h2>
          <div className="two-columns">
            <label>
              <span>Nome</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} required />
            </label>
            <label>
              <span>E-mail</span>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
          </div>
          <label>
            <span>Telefone</span>
            <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} minLength={11} required />
          </label>
          <fieldset style={{ border: '1px solid #ddd', borderRadius: 6, padding: 14 }}>
            <legend>Servicos</legend>
            {services.length === 0 ? (
              <p>Nenhum servico cadastrado.</p>
            ) : services.map((service) => (
              <label key={service.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={form.serviceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                />
                <span>{service.name} ({service.duration} min)</span>
              </label>
            ))}
          </fieldset>
          <button className="dark-button" type="submit" disabled={submitting}>
            {submitting ? 'Criando convite...' : 'Enviar convite'}
          </button>
        </form>
      )}

      {latestInviteUrl && (
        <div className="info-box" style={{ marginBottom: 28 }}>
          <strong>Ultimo convite criado</strong>
          <p style={{ overflowWrap: 'anywhere' }}>{latestInviteUrl}</p>
          <button className="outline-button" onClick={() => void copyInviteLink(latestInviteUrl)}>
            Copiar link
          </button>
        </div>
      )}

      {loading ? (
        <p>Carregando equipe...</p>
      ) : (
        <>
          <h2>Barbeiros ativos ({barbers.length})</h2>
          <div style={{ display: 'grid', gap: 12, marginBottom: 30 }}>
            {barbers.length === 0 && <p>Nenhum barbeiro cadastrado.</p>}
            {barbers.map((barber) => (
              <article key={barber.id} style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
                <strong>{barber.name}</strong>
                <p>{barber.email} | {barber.phone}</p>
                <p>{barber.services.map((service) => service.name).join(', ') || 'Sem servicos vinculados'}</p>
                <button className="outline-button" onClick={() => void removeBarber(barber)}>Remover</button>
              </article>
            ))}
          </div>

          <h2>Convites pendentes ({invites.length})</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {invites.length === 0 && <p>Nenhum convite pendente.</p>}
            {invites.map((invite) => (
              <article key={invite.id} style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
                <strong>{invite.name}</strong>
                <p>{invite.email} | {invite.phone}</p>
                <small>Expira em {new Date(invite.expiresAt).toLocaleString('pt-BR')}</small>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="outline-button" onClick={() => void copyInviteLink(invite.inviteUrl)}>Copiar link</button>
                  <button className="outline-button" onClick={() => void cancelInvite(invite)}>Cancelar convite</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
