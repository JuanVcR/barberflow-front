import { useState } from 'react'
import type { ToastMessage } from '../../types/models'
import { useAuth } from '../../context/useAuth'

interface RegisterPageProps {
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

export function RegisterPage({ navigate, notify }: RegisterPageProps) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      notify('error', 'Nome é obrigatório')
      return
    }
    if (!email.trim()) {
      notify('error', 'Email é obrigatório')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify('error', 'Email inválido')
      return
    }
    if (!phone.trim()) {
      notify('error', 'Telefone é obrigatório')
      return
    }
    if (!password.trim()) {
      notify('error', 'Senha é obrigatória')
      return
    }
    if (password.length < 8) {
      notify('error', 'Senha deve ter pelo menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      notify('error', 'As senhas não conferem')
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, phone, password)
      notify('success', 'Cadastro realizado com sucesso')
      navigate('/customer/explore')
    } catch (error) {
      // NOVO: Mensagem detalhada
      const message = error instanceof Error 
        ? error.message 
        : 'Erro ao realizar cadastro'
      
      if (message.includes('email')) {
        notify('error', 'Este email já está registrado')
      } else if (message.includes('cpf')) {
        notify('error', 'Este CPF já está registrado')
      } else {
        notify('error', message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Cadastro - <span className="register-subtitle-text">Cliente</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Nome:</label>
            <div className="form-input-wrapper">
              <input
                type="text"
                placeholder="seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label>Telefone</label>
            <div className="form-input-wrapper">
              <input
                type="tel"
                placeholder="Telefone:"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password:</label>
            <div className="form-input-wrapper">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <div className="form-input-wrapper">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="register-button">
            {isLoading ? 'Carregando...' : 'Criar minha conta'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Já tem uma conta? <a onClick={() => navigate('/auth/login')}>Fazer login</a>
          </p>
        </div>
      </div>
    </div>
  )
}
