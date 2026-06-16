import { useState } from 'react'
import type { ToastMessage } from '../../types/models'
import { requestPasswordReset } from '../../services/backend'

interface ForgotPasswordPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function ForgotPasswordPage({ navigate, notify }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      notify('success', 'Email de recuperação enviado')
      setSubmitted(true)
    } catch {
      notify('error', 'Erro ao enviar email de recuperação')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="login-page-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Email Enviado ✓</h1>
          </div>
          <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
            Verifique seu email para recuperar sua senha
          </p>
          <button onClick={() => navigate('/auth/login')} className="login-button">
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Recuperar <span className="login-subtitle-text">Senha</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Digite seu email para receber instruções de recuperação
          </p>

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

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? 'Enviando...' : 'Enviar Email'}
          </button>
        </form>

        <div className="login-footer">
          <a onClick={() => navigate('/auth/login')}>Voltar ao login</a>
        </div>
      </div>
    </div>
  )
}
