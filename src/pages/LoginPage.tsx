import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/useAuth'
import { ApiError } from '../services/api'
import { ScissorsIcon, UserIcon, ClipboardIcon, ShieldIcon } from '../components/Icons'

type UserType = 'client' | 'barber' | 'admin'

interface LoginPageProps {
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
}

export function LoginPage({ navigate, notify }: LoginPageProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userType) {
      notify('info', 'Selecione seu tipo de usuário para continuar.')
      return
    }

    if (!email || !password) {
      notify('error', 'Preencha email e senha para continuar.')
      return
    }

    try {
      setIsSubmitting(true)
      await login(email, password)
      notify('success', 'Login realizado com sucesso.')
      navigate('/barbershops')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Não foi possível entrar agora.'
      notify('error', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-full-page">
      <div className="auth-overlay-full">
        <div className="auth-form-content">
          <div className="auth-brand-centered">
            <ScissorsIcon className="icon-lg" />
            <span>BarberShop</span>
          </div>

          <div className="auth-form-header-centered">
            <h2>Entrar na BarberShop como:</h2>
          </div>

          <div className="user-type-grid-horizontal">
            <button
              type="button"
              className={`user-type-card-large ${userType === 'client' ? 'selected' : ''}`}
              onClick={() => setUserType('client')}
            >
              <div className="user-type-icon">
                <UserIcon className="icon-md" />
              </div>
              <span className="user-type-label">Cliente</span>
            </button>
            <button
              type="button"
              className={`user-type-card-large ${userType === 'barber' ? 'selected' : ''}`}
              onClick={() => setUserType('barber')}
            >
              <div className="user-type-icon">
                <ClipboardIcon className="icon-md" />
              </div>
              <span className="user-type-label">Barbeiro</span>
            </button>
            <button
              type="button"
              className={`user-type-card-large ${userType === 'admin' ? 'selected' : ''}`}
              onClick={() => setUserType('admin')}
            >
              <div className="user-type-icon">
                <ShieldIcon className="icon-md" />
              </div>
              <span className="user-type-label">Administrador</span>
            </button>
          </div>

          {userType && (
            <form className="form-stack-centered" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                />
              </label>
              <label>
                <span>Senha</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </label>
              <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          <div className="auth-footer-links">
            <button onClick={() => navigate('/register')}>Criar conta</button>
            <span className="separator">|</span>
            <a href="#termos">Termos de uso</a>
            <span className="separator">|</span>
            <a href="#privacidade">Política de privacidade</a>
          </div>
        </div>
      </div>
    </div>
  )
}
