import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createAdminBarbershop,
  fetchAdminBarbers,
  fetchAdminBarbershops,
  fetchAdminServices,
  fetchPendingBarberInvites,
  inviteBarber,
  type AdminBarber,
  type AdminBarbershop,
  type AdminService,
  type BarberInvite,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface RegistrationManagementPageProps {
  isSuperAdmin: boolean
  notify: (tone: ToastMessage['tone'], text: string) => void
}

type RegistrationTab = 'BARBERSHOP' | 'BARBER'

const emptyBarbershopForm = {
  name: '',
  slug: '',
  address: '',
  phoneOwner: '',
  cnpj: '',
}

const emptyBarberForm = {
  name: '',
  email: '',
  phone: '',
  serviceIds: [] as string[],
}

function createSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function RegistrationManagementPage({
  isSuperAdmin,
  notify,
}: RegistrationManagementPageProps) {
  const [tab, setTab] = useState<RegistrationTab>(isSuperAdmin ? 'BARBERSHOP' : 'BARBER')
  const [shops, setShops] = useState<AdminBarbershop[]>([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [services, setServices] = useState<AdminService[]>([])
  const [invites, setInvites] = useState<BarberInvite[]>([])
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [barbershopForm, setBarbershopForm] = useState(emptyBarbershopForm)
  const [barberForm, setBarberForm] = useState(emptyBarberForm)
  const [latestInviteUrl, setLatestInviteUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadShops = useCallback(async () => {
    try {
      const data = await fetchAdminBarbershops()
      setShops(data)
      setSelectedShopId((current) => current || data[0]?.id || '')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível carregar as barbearias.')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    void loadShops()
  }, [loadShops])

  const loadBarberData = useCallback(async () => {
    if (!selectedShopId) {
      setServices([])
      setInvites([])
      setBarbers([])
      return
    }

    try {
      const [serviceData, inviteData, barberData] = await Promise.all([
        fetchAdminServices(selectedShopId),
        fetchPendingBarberInvites(selectedShopId),
        fetchAdminBarbers(selectedShopId),
      ])

      setServices(serviceData)
      setInvites(inviteData)
      setBarbers(barberData)
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível carregar os convites.')
    }
  }, [notify, selectedShopId])

  useEffect(() => {
    if (tab === 'BARBER') void loadBarberData()
  }, [loadBarberData, tab])

  const selectedShop = useMemo(
    () => shops.find((shop) => shop.id === selectedShopId),
    [selectedShopId, shops],
  )

  const updateBarbershopName = (name: string) => {
    setBarbershopForm((current) => ({ ...current, name, slug: createSlug(name) }))
  }

  const submitBarbershop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isSuperAdmin) {
      notify('error', 'Apenas o Super Admin pode cadastrar barbearias.')
      return
    }

    setSubmitting(true)

    try {
      await createAdminBarbershop({
        name: barbershopForm.name.trim(),
        slug: barbershopForm.slug.trim(),
        address: barbershopForm.address.trim(),
        phoneOwner: barbershopForm.phoneOwner.replace(/\D/g, ''),
        cnpj: barbershopForm.cnpj.replace(/\D/g, ''),
        plan: 'FREE',
      })
      setBarbershopForm(emptyBarbershopForm)
      notify('success', 'Barbearia cadastrada com sucesso.')
      await loadShops()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível cadastrar a barbearia.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setBarberForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId],
    }))
  }

  const submitBarberInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedShopId) {
      notify('error', 'Selecione uma barbearia.')
      return
    }

    setSubmitting(true)

    try {
      const result = await inviteBarber(selectedShopId, {
        name: barberForm.name.trim(),
        email: barberForm.email.trim(),
        phone: barberForm.phone.replace(/\D/g, ''),
        serviceIds: barberForm.serviceIds,
      })
      setLatestInviteUrl(result.inviteUrl)
      setBarberForm(emptyBarberForm)
      notify(result.emailSent ? 'success' : 'info', result.message)
      await loadBarberData()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível enviar o convite.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyInvite = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      notify('success', 'Link do convite copiado.')
    } catch {
      notify('error', 'Não foi possível copiar o link.')
    }
  }

  return (
    <section className="registration-page">
      <div className="registration-workspace">
        <header className="registration-header">
          <h1>{isSuperAdmin ? 'Cadastros' : 'Convidar Barbeiros'}</h1>
          <p>
            {isSuperAdmin
              ? 'Adicione barbearias e barbeiros diretamente na plataforma'
              : 'Adicione barbeiros enviando um convite por e-mail. Eles criam a própria conta ao aceitar.'}
          </p>
        </header>

        {isSuperAdmin ? (
          <div className="registration-tabs">
            <button className={tab === 'BARBERSHOP' ? 'active' : ''} onClick={() => setTab('BARBERSHOP')}>
              Nova Barbearia
            </button>
            <button className={tab === 'BARBER' ? 'active' : ''} onClick={() => setTab('BARBER')}>
              Novo Barbeiro
            </button>
          </div>
        ) : null}

        {tab === 'BARBERSHOP' && isSuperAdmin ? (
          <div className="registration-grid">
            <form className="registration-card registration-form" onSubmit={submitBarbershop}>
              <h2>Dados da barbearia</h2>

              <label>
                <span>Nome da barbearia</span>
                <input value={barbershopForm.name} onChange={(event) => updateBarbershopName(event.target.value)} placeholder="Ex: Barbearia do Carlos" minLength={2} required />
              </label>
              <label>
                <span>Slug</span>
                <input value={barbershopForm.slug} readOnly required />
              </label>
              <label>
                <span>Endereço</span>
                <input value={barbershopForm.address} onChange={(event) => setBarbershopForm({ ...barbershopForm, address: event.target.value })} placeholder="Rua, número, cidade e UF" minLength={3} required />
              </label>
              <label>
                <span>Telefone do responsável</span>
                <input value={barbershopForm.phoneOwner} onChange={(event) => setBarbershopForm({ ...barbershopForm, phoneOwner: event.target.value })} placeholder="(11) 99999-0000" minLength={10} required />
              </label>
              <label>
                <span>CNPJ</span>
                <input value={barbershopForm.cnpj} onChange={(event) => setBarbershopForm({ ...barbershopForm, cnpj: event.target.value })} placeholder="00.000.000/0001-00" minLength={14} required />
              </label>

              <button className="registration-primary-button" type="submit" disabled={submitting}>
                {submitting ? 'Cadastrando...' : 'Cadastrar barbearia'}
              </button>
            </form>

            <section className="registration-card registration-list">
              <div className="registration-card-header">
                <h2>Barbearias cadastradas</h2>
                <span>{shops.length} total</span>
              </div>
              {loading ? <p>Carregando...</p> : shops.map((shop) => (
                <article className="registration-list-item" key={shop.id}>
                  <div className="registration-item-icon">B</div>
                  <div>
                    <strong>{shop.name}</strong>
                    <small>{shop.address || 'Endereço não informado'}</small>
                    <small>{shop.slug}</small>
                  </div>
                  <span className="registration-plan">{shop.plan || 'FREE'}</span>
                  <time>{shop.createdAt ? formatDate(shop.createdAt) : '-'}</time>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <div className="registration-grid invite-grid">
            <div className="registration-invite-column">
              <form className="registration-card registration-form" onSubmit={submitBarberInvite}>
                <h2>Enviar convite</h2>
                <label>
                  <span>Barbearia</span>
                  <select value={selectedShopId} onChange={(event) => setSelectedShopId(event.target.value)} required>
                    <option value="">Selecione</option>
                    {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Nome do barbeiro</span>
                  <input value={barberForm.name} onChange={(event) => setBarberForm({ ...barberForm, name: event.target.value })} placeholder="Nome completo" minLength={2} required />
                </label>
                <label>
                  <span>E-mail</span>
                  <input type="email" value={barberForm.email} onChange={(event) => setBarberForm({ ...barberForm, email: event.target.value })} placeholder="barbeiro@email.com" required />
                </label>
                <label>
                  <span>Telefone</span>
                  <input value={barberForm.phone} onChange={(event) => setBarberForm({ ...barberForm, phone: event.target.value })} placeholder="(11) 99999-0000" minLength={11} required />
                </label>

                <fieldset className="registration-services">
                  <legend>Serviços que ele executa (opcional)</legend>
                  {services.length === 0 ? <small>Nenhum serviço cadastrado.</small> : services.map((service) => (
                    <label key={service.id}>
                      <input type="checkbox" checked={barberForm.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} />
                      <span>{service.name}</span>
                    </label>
                  ))}
                </fieldset>

                <button className="registration-primary-button" type="submit" disabled={submitting || !selectedShopId}>
                  {submitting ? 'Enviando...' : 'Enviar convite'}
                </button>
              </form>

              {latestInviteUrl ? (
                <section className="registration-card invite-link-card">
                  <h2>Link de convite</h2>
                  <p>Compartilhe este link diretamente. Válido por 7 dias.</p>
                  <input value={latestInviteUrl} readOnly />
                  <button className="registration-secondary-button" onClick={() => void copyInvite(latestInviteUrl)}>Copiar link</button>
                </section>
              ) : null}

              <div className="registration-summary">
                <article><span>Pendentes</span><strong>{invites.length}</strong></article>
                <article><span>Ativos</span><strong>{barbers.length}</strong></article>
              </div>
            </div>

            <div>
              <section className="registration-card registration-list">
                <div className="registration-card-header">
                  <h2>Convites enviados</h2>
                  <span>{invites.length} total</span>
                </div>
                {invites.length === 0 ? <p>Nenhum convite pendente para {selectedShop?.name || 'esta barbearia'}.</p> : invites.map((invite) => (
                  <article className="registration-list-item invite-item" key={invite.id}>
                    <div className="registration-avatar">{getInitials(invite.name)}</div>
                    <div>
                      <strong>{invite.name}</strong>
                      <small>{invite.email}</small>
                      <small>Expira em {formatDate(invite.expiresAt)}</small>
                    </div>
                    <span className="invite-status">Pendente</span>
                    <button onClick={() => void copyInvite(invite.inviteUrl)}>Copiar link</button>
                  </article>
                ))}
              </section>

              <aside className="registration-card registration-help">
                <strong>Como funciona</strong>
                <p>
                  O barbeiro recebe um link com o token preenchido automaticamente. Ao aceitar,
                  informa uma senha de pelo menos 8 caracteres e pode substituir nome e telefone.
                  A disponibilidade semanal é definida depois do primeiro acesso.
                </p>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
