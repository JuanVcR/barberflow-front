import { useEffect, useMemo, useState } from 'react'
import { fetchAdminUsers, type AdminUserRow } from '../../services/backend'

const roleLabels: Record<AdminUserRow['role'], string> = {
  SUPER_ADMIN: 'Super Admin',
  BARBERSHOP_ADMIN: 'ADM Barbearia',
  BARBER: 'Barbeiro',
  CLIENT: 'Cliente',
}

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatCreatedAt(value?: string) {
  if (!value) return '-'
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return months[date.getMonth()] + '/' + date.getFullYear()
}

function getStatusClass(status?: string) {
  const normalized = (status ?? '').toLowerCase()

  if (normalized.includes('ativo')) return 'active'
  if (normalized.includes('trial')) return 'trial'
  if (normalized.includes('inativo')) return 'inactive'
  return ''
}

type FilterRole = 'ALL' | 'BARBERSHOP_ADMIN' | 'BARBER'

export function SuperAdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterRole>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetchAdminUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch(() => {
        if (active) setUsers([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()

    return users.filter((user) => {
      const matchesFilter = filter === 'ALL' || user.role === filter
      const matchesSearch =
        term.length === 0 ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.barbershop ?? '').toLowerCase().includes(term)

      return matchesFilter && matchesSearch
    })
  }, [filter, search, users])

  return (
    <section className="ops-page ops-page-gold">
      <div className="ops-workspace super-users-page">
        <header className="ops-hero super-users-hero">
          <div>
            <h1>{'Usuários'}</h1>
            <p>{users.length + ' usuários na plataforma'}</p>
          </div>
        </header>

        <div className="super-users-toolbar">
          <label className="super-users-search">
            <span>{'Buscar'}</span>
            <input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="super-users-filters" aria-label="Filtros de usuários">
            <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>
              {'Todos'}
            </button>
            <button
              className={filter === 'BARBERSHOP_ADMIN' ? 'active' : ''}
              onClick={() => setFilter('BARBERSHOP_ADMIN')}
            >
              {'ADM Barbearia'}
            </button>
            <button className={filter === 'BARBER' ? 'active' : ''} onClick={() => setFilter('BARBER')}>
              {'Barbeiro'}
            </button>
          </div>
        </div>

        <div className="super-users-table" role="table" aria-label="Usuários">
          <div className="super-users-row super-users-head" role="row">
            <span>{'Nome'}</span>
            <span>{'E-mail'}</span>
            <span>{'Função'}</span>
            <span>{'Barbearia'}</span>
            <span>{'Status'}</span>
            <span>{'Desde'}</span>
          </div>

          {filteredUsers.map((user) => (
            <div className="super-users-row" role="row" key={user.id}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className={'super-users-role role-' + user.role.toLowerCase()}>{roleLabels[user.role]}</span>
              <span>{user.barbershop || '-'}</span>
              <span className={'super-users-status ' + getStatusClass(user.status)}>{user.status || 'Ativo'}</span>
              <span>{formatCreatedAt(user.createdAt)}</span>
            </div>
          ))}

          {!loading && filteredUsers.length === 0 ? (
            <div className="super-users-empty">{'Nenhum usuário encontrado.'}</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
