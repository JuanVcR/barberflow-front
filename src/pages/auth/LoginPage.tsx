import { useState } from 'react'
import type { ToastMessage } from '../../types/models'
import { useAuth } from '../../context/useAuth'
import { getDashboardPathForRole } from '../../utils/navigation'

interface LoginPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
  onLoginSuccess?: () => void
}

export function LoginPage({ navigate, notify, onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [keepLogged, setKeepLogged] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ✅ NOVO: Validação
    if (!email.trim()) {
      notify('error', 'Email é obrigatório')
      return
    }
    if (!password.trim()) {
      notify('error', 'Senha é obrigatória')
      return
    }
    
    setIsLoading(true)

    try {
      const loggedUser = await login(email, password)
      notify('success', 'Login realizado com sucesso')
      onLoginSuccess?.()
      navigate(getDashboardPathForRole(loggedUser.role, loggedUser.accountRole))
    } catch (error) {
      // ✅ NOVO: Mensagem de erro melhorada
      const message = error instanceof Error 
        ? error.message 
        : 'Email ou senha incorretos'
      notify('error', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Entrar - <span className="login-subtitle-text">Cliente</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <div className="form-input-wrapper">
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <div className="form-input-wrapper">
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="checkbox-group">
            <input
              id="keep-logged"
              type="checkbox"
              checked={keepLogged}
              onChange={(e) => setKeepLogged(e.target.checked)}
            />
            <label htmlFor="keep-logged">Manter conectado</label>
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Novo por aqui? <a onClick={() => navigate('/auth/register')}>Criar conta</a>
          </p>
          <a className="forgot-link" onClick={() => navigate('/auth/forgot-password')}>
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  )
}
