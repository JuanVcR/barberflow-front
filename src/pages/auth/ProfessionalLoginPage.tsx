import { useState } from 'react'
import type { ToastMessage } from '../../types/models'
import { useAuth } from '../../context/useAuth'
import { getDashboardPathForRole } from '../../utils/navigation'

interface ProfessionalLoginPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
  onLoginSuccess?: (email: string) => void
}

export function ProfessionalLoginPage({
  navigate,
  notify,
  onLoginSuccess,
}: ProfessionalLoginPageProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const loggedUser = await login(email, password)
      notify('success', 'Login realizado com sucesso')
      onLoginSuccess?.(email)
      navigate(getDashboardPathForRole(loggedUser.role, loggedUser.accountRole))
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Entrar - <span className="login-subtitle-text">Profissional</span></h1>
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

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <a className="forgot-link" onClick={() => navigate('/auth/forgot-password')}>
            Esqueci minha senha
          </a>
          <p>
            Não tem conta? <a onClick={() => navigate('/auth/professional-register')}>Criar conta</a>
          </p>
          <a className="forgot-link" onClick={() => navigate('/auth/login')}>
            É um cliente? Fazer login
          </a>
        </div>
      </div>
    </div>
  )
}
