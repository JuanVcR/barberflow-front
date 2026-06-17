import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createAdminService,
  deleteAdminService,
  fetchAdminBarbershops,
  fetchAdminServices,
  updateAdminService,
  type AdminBarbershop,
  type AdminService,
} from '../../../services/backend'
import type { ToastMessage } from '../../../types/models'
import { ClockIcon, ScissorsIcon } from '../../../components/Icons'

interface ServicesManagePageProps {
  barbershopId?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const emptyForm = { name: '', price: '', duration: '' }

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function ServicesManagePage({ barbershopId, notify }: ServicesManagePageProps) {
  const [shops, setShops] = useState<AdminBarbershop[]>([])
  const [selectedShop, setSelectedShop] = useState(barbershopId ?? '')
  const [services, setServices] = useState<AdminService[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadServices = useCallback((shopId: string) => {
    if (!shopId) {
      setServices([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetchAdminServices(shopId)
      .then(setServices)
      .catch((error) => {
        setServices([])
        notify('error', error instanceof Error ? error.message : 'Erro ao carregar serviços')
      })
      .finally(() => setLoading(false))
  }, [notify])

  useEffect(() => {
    fetchAdminBarbershops()
      .then((items) => {
        setShops(items)
        const nextShop = barbershopId ?? items[0]?.id ?? ''
        setSelectedShop(nextShop)
        loadServices(nextShop)
      })
      .catch(() => setLoading(false))
  }, [barbershopId, loadServices])

  const selectShop = (shopId: string) => {
    setSelectedShop(shopId)
    setEditingId('')
    setForm(emptyForm)
    loadServices(shopId)
  }

  const edit = (service: AdminService) => {
    setEditingId(service.id)
    setForm({
      name: service.name,
      price: String(service.price),
      duration: String(service.duration),
    })
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedShop) return notify('error', 'Nenhuma barbearia selecionada')

    const price = Number(form.price)
    const duration = Number(form.duration)

    if (price <= 0 || duration <= 0) {
      notify('error', 'Preço e duração devem ser maiores que zero')
      return
    }

    try {
      setSaving(true)
      const payload = { name: form.name.trim(), price, duration }

      if (editingId) {
        await updateAdminService(selectedShop, editingId, payload)
        notify('success', 'Serviço atualizado')
      } else {
        await createAdminService(selectedShop, payload)
        notify('success', 'Serviço criado')
      }

      setEditingId('')
      setForm(emptyForm)
      loadServices(selectedShop)
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao salvar serviço')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (service: AdminService) => {
    if (!selectedShop || !window.confirm(`Excluir o serviço ${service.name}?`)) return

    try {
      await deleteAdminService(selectedShop, service.id)
      notify('success', 'Serviço excluído')
      loadServices(selectedShop)
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao excluir serviço')
    }
  }

  return (
    <section className="ops-page ops-page-gold service-management-page">
      <div className="ops-workspace services-price-page">
        <header className="ops-hero ops-hero-gold">
          <div>
            <h1>Serviços & Preços</h1>
            <p>{loading ? 'Carregando...' : `${services.length} cadastrados`}</p>
          </div>
          <select value={selectedShop} onChange={(event) => selectShop(event.target.value)}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </select>
        </header>

        <form className="form-stack ops-panel service-form-panel" onSubmit={submit}>
          <h2>{editingId ? 'Editar serviço' : 'Novo serviço'}</h2>
          <div className="service-form-grid">
            <label>
              <span>Nome</span>
              <div className="service-input-shell">
                <ScissorsIcon />
                <input
                  value={form.name}
                  minLength={2}
                  required
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>
            </label>
            <label>
              <span>Preço</span>
              <div className="service-input-shell">
                <b>$</b>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  required
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                />
              </div>
            </label>
            <label>
              <span>Duração (min)</span>
              <div className="service-input-shell">
                <ClockIcon />
                <input
                  type="number"
                  min="1"
                  value={form.duration}
                  required
                  onChange={(event) => setForm({ ...form, duration: event.target.value })}
                />
              </div>
            </label>
          </div>
          <div className="service-form-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar serviço'}
            </button>
            {editingId ? (
              <button type="button" onClick={() => { setEditingId(''); setForm(emptyForm) }}>
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>

        <div className="services-price-table">
          <div className="services-price-row header">
            <span>Serviço</span><span>Duração</span><span>Preço</span><span>Status</span><span />
          </div>
          {services.map((service) => (
            <div className="services-price-row" key={service.id}>
              <strong className="service-name-cell"><ScissorsIcon /> {service.name}</strong>
              <span className="service-duration-cell"><ClockIcon /> {service.duration} min</span>
              <strong>{formatCurrency(service.price)}</strong>
              <span className="service-status active">Ativo</span>
              <span className="service-actions">
                <button onClick={() => edit(service)}>Editar</button>
                <button onClick={() => void remove(service)}>Excluir</button>
              </span>
            </div>
          ))}
          {!loading && services.length === 0 ? (
            <div className="services-price-empty">Nenhum serviço cadastrado.</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
