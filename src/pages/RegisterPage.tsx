import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/useAuth'
import { ApiError } from '../services/api'
import { ScissorsIcon, UserIcon } from '../components/Icons'

interface RegisterPageProps {
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
}

export function RegisterPage({ navigate, notify }: RegisterPageProps) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name || !email || !phone || !password || !confirmPassword) {
      notify('error', 'Preencha todos os campos antes de continuar.')
      return
    }

    if (password.length < 8) {
      notify('error', 'A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      notify('error', 'As senhas não coincidem.')
      return
    }

    try {
      setIsSubmitting(true)
      await register(name, email, phone, password)
      notify('success', 'Conta criada com sucesso.')
      navigate('/barbershops')
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Não foi possível criar a conta agora.'
      notify('error', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-portal-page">
      <div className="register-portal-shade" />

      <section className="register-portal-copy" aria-label="FlowBarber">
        <p className="register-eyebrow">Agendamento simples para sua rotina</p>
        <h1>
          Sua barbearia favorita, <span>sempre à mão.</span>
        </h1>
        <p>
          Crie sua conta na FlowBarber para encontrar barbearias, reservar horários e
          acompanhar seus próximos atendimentos em um só lugar.
        </p>
      </section>

      <section className="register-glass-panel" aria-label="Criar conta">
        <div className="register-brand">
          <ScissorsIcon className="icon-lg" />
          <span>FlowBarber</span>
        </div>

        <div className="register-form-heading">
          <div className="register-account-badge">
            <UserIcon className="icon-md" />
            <span>Conta de cliente</span>
          </div>
          <h2>Crie sua conta</h2>
          <p>Cadastre-se para começar a agendar online sem complicação.</p>
        </div>

        <form className="register-form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Nome completo</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome completo"
            />
          </label>
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
            <span>Telefone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(00) 00000-0000"
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
          <label>
            <span>Confirmar senha</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="register-panel-links">
          <button onClick={() => navigate('/login')}>Já tem uma conta?</button>
          <span className="separator">|</span>
          <a href="#termos">Termos de uso</a>
          <span className="separator">|</span>
          <a href="#privacidade">Política de privacidade</a>
        </div>
      </section>
    </div>
  )
}
