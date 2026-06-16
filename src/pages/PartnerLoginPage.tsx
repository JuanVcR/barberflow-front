import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/useAuth'
import { StoreIcon } from '../components/Icons'
import { getDashboardPathForRole } from '../utils/navigation'

interface PartnerLoginPageProps {
  navigate: (path: string) => void
  notify: (tone: 'success' | 'error' | 'info', text: string) => void
}

export function PartnerLoginPage({ navigate, notify }: PartnerLoginPageProps) {
  const { loginPartner } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !password) {
      notify('error', 'Informe suas credenciais de parceiro para continuar.')
      return
    }

    try {
      const loggedUser = await loginPartner(email, password)
      notify('success', 'Login de parceiro realizado com sucesso.')
      navigate(getDashboardPathForRole(loggedUser.role, loggedUser.accountRole))
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Erro ao fazer login')
    }
  }

  return (
    <section className="auth-section shell container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge dark">
            <StoreIcon className="icon-lg" />
          </div>
          <h1>{'Área do parceiro'}</h1>
          <p>{'Acesse o painel da sua barbearia e gerencie seu cadastro.'}</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            <span>{'Email da Barbearia'}</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>{'Senha'}</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="dark-button full-width" type="submit">
            {'Entrar'}
          </button>
        </form>

        <div className="auth-links">
          <button onClick={() => navigate('/partner/create')}>{'Criar cadastro de parceiro'}</button>
          <button onClick={() => navigate('/login')}>{'Login de cliente'}</button>
        </div>
      </div>
    </section>
  )
}
