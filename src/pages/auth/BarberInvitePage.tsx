import { useEffect, useState, type FormEvent } from 'react'
import { ScissorsIcon } from '../../components/Icons'
import {
  acceptBarberInvite,
  fetchBarberInvite,
  type BarberInviteDetails,
} from '../../services/backend'
import type { ToastMessage } from '../../types/models'

interface BarberInvitePageProps {
  token?: string
  navigate: (path: string) => void
  notify: (tone: ToastMessage['tone'], text: string) => void
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('pt-BR')
}

export function BarberInvitePage({ token = '', navigate, notify }: BarberInvitePageProps) {
  const [invite, setInvite] = useState<BarberInviteDetails | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loadingInvite, setLoadingInvite] = useState(Boolean(token))
  const [submitting, setSubmitting] = useState(false)
  const [inviteError, setInviteError] = useState(token ? '' : 'Token do convite não informado.')

  useEffect(() => {
    let active = true

    if (!token) return

    fetchBarberInvite(token)
      .then((data) => {
        if (!active) return
        setInvite(data)
        setName(data.name)
        setPhone(data.phone)
        setInviteError('')
      })
      .catch((error) => {
        if (!active) return
        setInvite(null)
        setInviteError(error instanceof Error ? error.message : 'Convite inválido ou expirado.')
      })
      .finally(() => {
        if (active) setLoadingInvite(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!invite) {
      notify('error', 'O convite precisa ser válido.')
      return
    }

    if (password !== passwordConfirmation) {
      notify('error', 'As senhas não coincidem.')
      return
    }

    try {
      setSubmitting(true)
      await acceptBarberInvite({
        token: invite.token,
        password,
        name: name.trim() || undefined,
        phone: phone.replace(/\D/g, '') || undefined,
      })
      notify('success', 'Conta criada. Faça login como barbeiro.')
      navigate('/auth/professional-login')
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Não foi possível aceitar o convite.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="barber-invite-page">
      <aside className="barber-invite-aside">
        <button className="barber-invite-brand" onClick={() => navigate('/')}>
          <ScissorsIcon />
          <span>BarberFlow</span>
        </button>

        <div className="barber-invite-presentation">
          <span className="barber-invite-symbol">
            <ScissorsIcon />
          </span>
          <p className="barber-invite-eyebrow">Convite profissional</p>
          <h1>
            Você foi convidado para a
            <strong>{invite?.barbershop.name ?? 'BarberFlow'}</strong>
          </h1>
          <p>Crie sua conta para fazer parte da equipe e começar a atender.</p>

          <ul>
            <li><span />Gerencie sua agenda de atendimentos</li>
            <li><span />Acompanhe seu histórico profissional</li>
            <li><span />Configure sua disponibilidade semanal</li>
          </ul>
        </div>

        <div className="barber-invite-shop">
          <span>Barbearia</span>
          <strong>{invite?.barbershop.name ?? '-'}</strong>
          <small>{invite?.barbershop.address || 'Endereço não informado'}</small>
        </div>
      </aside>

      <section className="barber-invite-content">
        <div className="barber-invite-form-wrap">
          <header>
            <p className="barber-invite-eyebrow">Bem-vindo à equipe</p>
            <h2>Criar sua conta</h2>
            <p>
              {loadingInvite
                ? 'Validando convite...'
                : invite
                  ? `Convite para ${invite.barbershop.name} · expira em ${formatDate(invite.expiresAt)}`
                  : inviteError}
            </p>
          </header>

          <form className="barber-invite-form" onSubmit={submit}>
            <label>
              <span>Token do convite</span>
              <div className={'barber-invite-token ' + (invite ? 'valid' : 'invalid')}>
                <b>{invite ? '✓' : '!'}</b>
                <input value={token} readOnly />
                <small>{loadingInvite ? 'Validando' : invite ? 'Válido' : 'Inválido'}</small>
              </div>
            </label>

            <label>
              <span>E-mail</span>
              <input type="email" value={invite?.email ?? ''} readOnly />
            </label>

            <label>
              <span>Nome completo (opcional)</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                placeholder="Seu nome completo"
              />
            </label>

            <label>
              <span>Telefone (opcional)</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                minLength={11}
                placeholder="(11) 99999-0000"
              />
            </label>

            <label>
              <span>Criar senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </label>

            <label>
              <span>Confirmar senha</span>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                minLength={8}
                placeholder="Repita a senha"
                required
              />
            </label>

            <button type="submit" disabled={!invite || loadingInvite || submitting}>
              {submitting ? 'Criando conta...' : 'Aceitar convite e criar conta'}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="barber-invite-terms">
            Ao criar sua conta você concorda com os <a href="#/terms">termos de uso</a>.
          </p>
        </div>
      </section>
    </main>
  )
}
