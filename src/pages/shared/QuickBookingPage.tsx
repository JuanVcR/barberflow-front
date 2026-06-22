import { useEffect, useMemo, useState } from 'react'
import {
  createQuickBooking,
  fetchAdminBarbers,
  fetchAdminBarbershops,
  fetchAdminServices,
  fetchAvailableTimes,
  fetchBarberProfile,
  type AdminBarber,
  type AdminService,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface Props {
  mode: 'admin' | 'barber'
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

function today() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

export function QuickBookingPage({ mode, navigate, notify }: Props) {
  const [barbershopId, setBarbershopId] = useState('')
  const [services, setServices] = useState<AdminService[]>([])
  const [barbers, setBarbers] = useState<AdminBarber[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [day, setDay] = useState(today)
  const [time, setTime] = useState('')
  const [times, setTimes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (mode === 'admin') {
      fetchAdminBarbershops()
        .then(async (shops) => {
          const shopId = shops[0]?.id ?? ''
          setBarbershopId(shopId)
          if (!shopId) return
          const [serviceData, barberData] = await Promise.all([fetchAdminServices(shopId), fetchAdminBarbers(shopId)])
          setServices(serviceData)
          setBarbers(barberData)
        })
        .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar dados'))
      return
    }

    fetchBarberProfile()
      .then((profile) => {
        setBarbershopId(profile.barbershopId)
        setServices(profile.services)
        setBarbers([{ id: profile.id, name: profile.name, phone: profile.phone, email: '', services: profile.services }])
        setBarberId(profile.id)
      })
      .catch((error) => notify('error', error instanceof Error ? error.message : 'Erro ao carregar perfil'))
  }, [mode, notify])

  const availableBarbers = useMemo(
    () => serviceId ? barbers.filter((barber) => barber.services.some((service) => service.id === serviceId)) : barbers,
    [barbers, serviceId],
  )

  useEffect(() => {
    if (!barberId || !serviceId || !day) {
      setTimes([])
      return
    }
    fetchAvailableTimes({ barberId, serviceId, day }).then(setTimes).catch(() => setTimes([]))
  }, [barberId, day, serviceId])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await createQuickBooking({
        client: { name, phone, email: email || undefined },
        barberId,
        serviceId,
        barbershopId,
        day,
        time,
      })
      notify('success', 'Cliente e agendamento cadastrados')
      navigate(mode === 'admin' ? '/admin/appointments' : '/professional/agenda')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao cadastrar atendimento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="quick-booking-page">
      <header>
        <button onClick={() => navigate(mode === 'admin' ? '/admin/appointments' : '/professional/agenda')}>Voltar</button>
        <div><h1>Cadastro rápido</h1><p>Cadastre o cliente e já reserve o atendimento.</p></div>
      </header>
      <form className="quick-booking-card" onSubmit={submit}>
        <label>Nome*<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>Telefone*<input value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
        <label className="wide">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /><small>Opcional. Pode ser usado depois para lembretes.</small></label>
        <label>Serviço*
          <select value={serviceId} onChange={(event) => { setServiceId(event.target.value); if (mode === 'admin') setBarberId(''); setTime('') }} required>
            <option value="">Selecione</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
        </label>
        <label>Barbeiro*
          <select value={barberId} onChange={(event) => { setBarberId(event.target.value); setTime('') }} required>
            <option value="">Selecione</option>
            {availableBarbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
          </select>
        </label>
        <label>Data*<input type="date" min={today()} value={day} onChange={(event) => { setDay(event.target.value); setTime('') }} required /></label>
        <label>Horário*
          <select value={time} onChange={(event) => setTime(event.target.value)} required>
            <option value="">Selecione</option>
            {times.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <button className="primary-button wide" type="submit" disabled={saving || !time}>{saving ? 'Salvando...' : 'Cadastrar e agendar'}</button>
      </form>
    </section>
  )
}
