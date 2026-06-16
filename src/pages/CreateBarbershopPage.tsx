import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, StoreIcon } from '../components/Icons'
import { createAdminBarbershop, updateBarbershopLocation } from '../services/backend'

interface CreateBarbershopPageProps {
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
  isPartnerAuthenticated: boolean
}

export function CreateBarbershopPage({ navigate, notify, isPartnerAuthenticated }: CreateBarbershopPageProps) {
  const [formData, setFormData] = useState({ name: '', description: '', address: '', phone: '', email: '', startTime: '09:00', endTime: '18:00' })
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isPartnerAuthenticated) {
      notify('info', 'Faça login como parceiro antes de cadastrar uma barbearia.')
      navigate('/partner/login')
    }
  }, [isPartnerAuthenticated, navigate, notify])

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleLocationError = (error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      notify('error', 'Permissao de localizacao negada. Libere o acesso no navegador e tente novamente.')
    } else if (error.code === error.TIMEOUT) {
      notify('error', 'A busca pela localizacao excedeu o tempo limite. Tente novamente.')
    } else {
      notify('error', 'Sua localizacao esta indisponivel no momento.')
    }
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      notify('error', 'Este navegador nao oferece suporte a geolocalizacao.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
        setIsLocating(false)
        notify('success', 'Localizacao capturada. Ela sera salva ao concluir o cadastro.')
      },
      (error) => {
        setIsLocating(false)
        handleLocationError(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const slug = formData.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const barbershop = await createAdminBarbershop({
        name: formData.name,
        slug,
        address: formData.address,
        phoneOwner: formData.phone,
      })

      if (location) {
        await updateBarbershopLocation(barbershop.id, location)
      }

      notify('success', 'Barbearia cadastrada com sucesso.')
      navigate('/admin/barbershop-dashboard')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Nao foi possivel cadastrar a barbearia.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section shell container narrow">
      <div className="panel-card">
        <div className="auth-header">
          <div className="auth-badge dark"><StoreIcon className="icon-lg" /></div>
          <h1>{'Cadastrar barbearia'}</h1>
          <p>{'Preencha as informações abaixo para publicar o perfil da sua barbearia.'}</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-block">
            <h2>{'Informações Básicas'}</h2>
            <label><span>{'Nome da Barbearia'}</span><input name="name" value={formData.name} onChange={updateField} required /></label>
            <label><span>{'Descrição'}</span><textarea name="description" rows={5} value={formData.description} onChange={updateField} required /></label>
          </div>

          <div className="form-block">
            <h2>{'Localização e Contato'}</h2>
            <label><span><MapPinIcon className="icon-xs" />{' Endereço'}</span><input name="address" value={formData.address} onChange={updateField} required /></label>
            <button className="outline-button" type="button" onClick={handleUseLocation} disabled={isLocating || isSubmitting}>
              <MapPinIcon className="icon-xs" />
              {isLocating ? ' Obtendo localizacao...' : location ? ' Localizacao capturada' : ' Usar minha localizacao'}
            </button>
            <div className="two-columns">
              <label><span><PhoneIcon className="icon-xs" />{' Telefone'}</span><input name="phone" value={formData.phone} onChange={updateField} required /></label>
              <label><span><MailIcon className="icon-xs" />{' Email'}</span><input type="email" name="email" value={formData.email} onChange={updateField} required /></label>
            </div>
          </div>

          <div className="form-block">
            <h2><ClockIcon className="icon-sm" />{' Horário de Funcionamento'}</h2>
            <div className="two-columns">
              <label><span>{'Horário de Abertura'}</span><input type="time" name="startTime" value={formData.startTime} onChange={updateField} required /></label>
              <label><span>{'Horário de Fechamento'}</span><input type="time" name="endTime" value={formData.endTime} onChange={updateField} required /></label>
            </div>
          </div>

          <div className="info-box">
            <h3>{'Próximos Passos'}</h3>
            <ul>
              <li>{'Adicione seus serviços e preços.'}</li>
              <li>{'Cadastre seus barbeiros e especialidades.'}</li>
              <li>{'Configure a agenda de cada profissional.'}</li>
              <li>{'Comece a receber agendamentos online.'}</li>
            </ul>
          </div>

          <div className="button-row">
            <button className="outline-button" type="button" onClick={() => navigate('/partner/login')} disabled={isSubmitting}>{'Cancelar'}</button>
            <button className="dark-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Barbearia'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
