import { useState } from 'react'
import { resetPassword } from '../../services/backend'
import type { ToastMessage } from '../../types/models'

export function ResetPasswordPage({
  token,
  navigate,
  notify,
}: {
  token?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const isStrongPassword = (value: string) => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    )
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return notify('error', 'Link inválido')
    if (!isStrongPassword(password)) {
      return notify(
        'error',
        'A senha deve ter pelo menos 8 caracteres, incluir letra maiúscula, letra minúscula, número e símbolo.'
      )
    }
    if (password !== confirmPassword) return notify('error', 'As senhas não coincidem')

    try {
      setLoading(true)
      await resetPassword(token, password)
      notify('success', 'Senha alterada')
      navigate('/auth/login')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível alterar a senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header"><h1>Nova senha</h1></div>
        <form className="login-form" onSubmit={submit}>
          <div className="form-group">
            <label>Nova senha</label>
            <div className="form-input-wrapper">
              <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Confirmar senha</label>
            <div className="form-input-wrapper">
              <input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
          </div>
          <button className="login-button" disabled={loading}>
            {loading ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
