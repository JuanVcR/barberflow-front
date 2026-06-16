import { useEffect, useState } from 'react'
import {
  fetchAdminBarbers,
  fetchAdminBarbershops,
  fetchAdminServices,
  removeAdminBarber,
  updateAdminBarberServices,
  type AdminBarber,
  type AdminService,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'
import { MailIcon, PhoneIcon } from '../../../components/Icons'

interface BarberManagementPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function BarberManagementPage({ navigate, notify }: BarberManagementPageProps) {
  const [shopId, setShopId] = useState('')
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [editing, setEditing] = useState<AdminBarber | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const load = async (barbershopId: string) => {
    const [barberData, serviceData] = await Promise.all([
      fetchAdminBarbers(barbershopId),
      fetchAdminServices(barbershopId),
    ])
    setBarbers(barberData)
    setServices(serviceData)
  }

  useEffect(() => {
    fetchAdminBarbershops()
      .then(async (shops) => {
        const firstShop = shops[0]
        if (!firstShop) return
        setShopId(firstShop.id)
        await load(firstShop.id)
      })
      .catch((error) =>
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar barbeiros'),
      )
      .finally(() => setLoading(false))
  }, [notify])

  const startEditing = (barber: AdminBarber) => {
    setEditing(barber)
    setSelectedServices(barber.services.map((service) => service.id))
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    )
  }

  const saveServices = async () => {
    if (!editing || !shopId) return

    try {
      await updateAdminBarberServices(shopId, editing.id, selectedServices)
      await load(shopId)
      setEditing(null)
      notify('success', 'Serviços do barbeiro atualizados')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao atualizar serviços')
    }
  }

  const remove = async (barber: AdminBarber) => {
    if (!shopId || !window.confirm(`Remover ${barber.name} desta barbearia?`)) return

    try {
      await removeAdminBarber(shopId, barber.id)
      await load(shopId)
      notify('success', 'Barbeiro removido')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao remover barbeiro')
    }
  }

  return (
    <section className="ops-page ops-page-gold">
      <div className="ops-workspace compact-list-page">
        <header className="ops-hero ops-hero-gold">
          <div>
            <h1>Barbeiros</h1>
            <p>{loading ? 'Carregando...' : `${barbers.length} cadastrados`}</p>
          </div>
          <button className="ops-action" onClick={() => navigate('/admin/barber-invites')}>
            + Novo barbeiro
          </button>
        </header>

        {editing ? (
          <section className="ops-panel">
            <h2>Serviços de {editing.name}</h2>
            <div style={{ display: 'grid', gap: 8, margin: '18px 0' }}>
              {services.map((service) => (
                <label key={service.id}>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                  />
                  {' '}{service.name}
                </label>
              ))}
            </div>
            <button className="primary-button" onClick={() => void saveServices()}>Salvar serviços</button>
            <button onClick={() => setEditing(null)}>Cancelar</button>
          </section>
        ) : null}

        <div className="barber-card-list">
          {barbers.map((barber) => (
            <article className="barber-list-card" key={barber.id}>
              <div className="barber-card-column barber-identification">
                <span className="barber-card-label">Identificação</span>
                <div className="barber-identity">
                  <div className="barber-avatar">{getInitials(barber.name)}</div>
                  <div className="barber-list-name">
                    <strong>{barber.name}</strong>
                    <span>
                      {barber.services.map((service) => service.name).join(', ') ||
                        'Sem serviços'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="barber-card-column barber-contact">
                <span className="barber-card-label">Contato</span>
                <span><PhoneIcon /> {barber.phone || '-'}</span>
                <span><MailIcon /> {barber.email || '-'}</span>
              </div>

              <div className="barber-card-column">
                <span className="barber-card-label">Status</span>
                <span className="barber-status ok">Ativo</span>
              </div>

              <div className="barber-card-column barber-card-actions">
                <span className="barber-card-label">Ações</span>
                <div>
                  <button className="barber-services-action" onClick={() => startEditing(barber)}>
                    Serviços
                  </button>
                  <button
                    className="barber-delete-action"
                    onClick={() => void remove(barber)}
                    aria-label={'Remover ' + barber.name}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!loading && !barbers.length ? <div className="ops-empty-row">Nenhum barbeiro cadastrado.</div> : null}
        </div>
      </div>
    </section>
  )
}
