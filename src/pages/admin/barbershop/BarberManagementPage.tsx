import { useEffect, useState } from 'react'
import {
  fetchAdminBarbers,
  fetchAdminBarberDay,
  fetchAdminBarbershops,
  fetchAdminServices,
  removeAdminBarber,
  updateAdminBarberServices,
  type AdminBarber,
  type AdminService,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'
import { CalendarIcon, ClipboardIcon, MailIcon, PhoneIcon, ScissorsIcon } from '../../../components/Icons'

interface BarberManagementPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function getLocalDate() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export function BarberManagementPage({ navigate, notify }: BarberManagementPageProps) {
  const [shopId, setShopId] = useState('')
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [services, setServices] = useState<AdminService[]>([])
  const [editing, setEditing] = useState<AdminBarber | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [todayCounts, setTodayCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const load = async (barbershopId: string) => {
    const [barberData, serviceData] = await Promise.all([
      fetchAdminBarbers(barbershopId),
      fetchAdminServices(barbershopId),
    ])
    setBarbers(barberData)
    setServices(serviceData)

    const counts = await Promise.all(
      barberData.map(async (barber) => {
        try {
          const bookings = await fetchAdminBarberDay(barbershopId, barber.id, getLocalDate())
          return [barber.id, bookings.length] as const
        } catch {
          return [barber.id, 0] as const
        }
      }),
    )
    setTodayCounts(Object.fromEntries(counts))
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
    <section className="ops-page ops-page-gold barber-management-page">
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
          <section className="ops-panel barber-services-panel">
            <h2>Serviços de {editing.name}</h2>
            <div className="barber-service-options">
              {services.map((service) => (
                <label className="barber-service-choice" key={service.id}>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                  />
                  <span>{service.name}</span>
                </label>
              ))}
            </div>
            <div className="barber-service-actions">
              <button className="primary-button" onClick={() => void saveServices()}>Salvar serviços</button>
              <button className="outline-button" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </section>
        ) : null}

        <div className="barber-card-list">
          {barbers.map((barber) => (
            <article className="barber-overview-card" key={barber.id}>
              <div className="barber-overview-avatar">{getInitials(barber.name)}</div>

              <div className="barber-overview-info">
                <div className="barber-overview-title">
                  <strong>{barber.name}</strong>
                  <span className="barber-overview-active">Ativo</span>
                </div>
                <div className="barber-overview-services">
                  {barber.services.length
                    ? barber.services.map((service) => <span key={service.id}><ScissorsIcon /> {service.name}</span>)
                    : <span>Sem serviços</span>}
                </div>
                <div className="barber-overview-contact">
                  <span><PhoneIcon /> {barber.phone || '-'}</span>
                  <span><MailIcon /> {barber.email || '-'}</span>
                </div>
              </div>

              <div className="barber-overview-today">
                <small>hoje</small>
                <strong>{todayCounts[barber.id] ?? 0} atend.</strong>
              </div>

              <div className="barber-overview-actions">
                <button onClick={() => navigate(`/admin/barbers/${barber.id}/day?barbershopId=${shopId}&name=${encodeURIComponent(barber.name)}`)}>
                  <CalendarIcon /> Agenda
                </button>
                <button onClick={() => navigate(`/admin/barbers/${barber.id}/history?barbershopId=${shopId}&name=${encodeURIComponent(barber.name)}`)}>
                  <ClipboardIcon /> Histórico
                </button>
                <button onClick={() => startEditing(barber)}>
                  <ScissorsIcon /> Serviços
                </button>
                <button className="danger" onClick={() => void remove(barber)} aria-label={'Remover ' + barber.name}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
          {!loading && !barbers.length ? <div className="ops-empty-row">Nenhum barbeiro cadastrado.</div> : null}
        </div>
      </div>
    </section>
  )
}
