import { useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { CalendarIcon, SettingsIcon, UserIcon } from '../components/Icons'
import type { Booking } from '../types/models'

interface AccountPageProps {
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
  isAuthenticated: boolean
}

const storageKey = 'customer-bookings'

export function AccountPage({ navigate, notify, isAuthenticated }: AccountPageProps) {
  const { user, updateProfile, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'settings'>('bookings')
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })

  const bookings = useMemo(() => {
    const storedBookings = localStorage.getItem(storageKey)
    const allBookings = storedBookings ? (JSON.parse(storedBookings) as Booking[]) : []
    if (!user) return allBookings
    return allBookings.filter((booking) => booking.userId === user.id || user.id === 'session-user')
  }, [user])

  if (!isAuthenticated || !user) {
    return (
      <section className="section shell container">
        <div className="empty-state">
          <h2>{'Fa\u00e7a login primeiro'}</h2>
          <button className="primary-button" onClick={() => navigate('/login')}>
            {'Ir para o login'}
          </button>
        </div>
      </section>
    )
  }

  const saveProfile = () => {
    updateProfile(formData)
    notify('success', 'Perfil atualizado com sucesso.')
  }

  const handleLogout = () => {
    logout()
    notify('info', 'Voc\u00ea saiu da conta.')
    navigate('/')
  }

  return (
    <section className="section shell container narrow">
      <div className="panel-card">
        <div className="account-header">
          <div className="account-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="tab-strip">
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            <CalendarIcon className="icon-xs" />
            {'Agendamentos'}
          </button>
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            <UserIcon className="icon-xs" />
            {'Perfil'}
          </button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <SettingsIcon className="icon-xs" />
            {'Configura\u00e7\u00f5es'}
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div className="stack-list">
            <h2>{'Meus agendamentos'}</h2>
            {bookings.length === 0 && (
              <div className="empty-state">{'Voc\u00ea ainda n\u00e3o tem agendamentos confirmados.'}</div>
            )}
            {bookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <div className="booking-top">
                  <div>
                    <h3>{booking.barbershopName}</h3>
                    <p>{booking.serviceName}</p>
                  </div>
                  <span className={'status-pill ' + booking.status}>{booking.status}</span>
                </div>
                <div className="booking-grid">
                  <span>{'Barbeiro: ' + booking.barberName}</span>
                  <span>{'Data: ' + new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  <span>{'Hor\u00e1rio: ' + booking.time}</span>
                </div>
                <div className="button-row left">
                  <button className="outline-button" type="button" onClick={() => navigate('/booking-detail/' + booking.id)}>
                    {'Ver detalhes'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="form-stack">
            <h2>{'Dados do perfil'}</h2>
            <label>
              <span>{'Nome completo'}</span>
              <input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              />
            </label>
            <label>
              <span>{'Email'}</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              />
            </label>
            <label>
              <span>{'Telefone'}</span>
              <input
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              />
            </label>
            <button className="primary-button" onClick={saveProfile} type="button">
              {'Salvar altera\u00e7\u00f5es'}
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="stack-list">
            <div className="settings-block">
              <h3>{'Alterar senha'}</h3>
              <div className="form-stack compact">
                <input type="password" placeholder={'Senha atual'} />
                <input type="password" placeholder={'Nova senha'} />
                <input type="password" placeholder={'Confirmar nova senha'} />
                <button className="outline-button" type="button">{'Atualizar senha'}</button>
              </div>
            </div>

            <div className="settings-block">
              <h3>{'Notifica\u00e7\u00f5es'}</h3>
              <label className="toggle-row">
                <input type="checkbox" defaultChecked />
                <span>{'Emails sobre agendamentos'}</span>
              </label>
              <label className="toggle-row">
                <input type="checkbox" defaultChecked />
                <span>{'Lembretes de hor\u00e1rio'}</span>
              </label>
              <label className="toggle-row">
                <input type="checkbox" />
                <span>{'Promo\u00e7\u00f5es e novidades'}</span>
              </label>
            </div>

            <div className="settings-block">
              <h3 className="danger-text">{'Zona de perigo'}</h3>
              <button className="danger-button" type="button">{'Excluir conta'}</button>
            </div>
            <button className="outline-button full-width" onClick={handleLogout} type="button">
              {'Sair da conta'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
