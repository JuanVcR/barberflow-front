# URLs e Navegação - Barbershop App

## 🌐 Mapa de URLs

### 🏠 Landing e Público

```
#/                                    Landing Page
#/public/barbershops                  Listagem de Barbearias
#/public/barbershop/:slug             Detalhes da Barbearia
```

### 🔐 Autenticação

```
#/auth/login                          Login do Cliente
#/auth/register                       Registro do Cliente
#/auth/forgot-password                Recuperar Senha
#/auth/professional-login             Login do Profissional
```

### 👤 Cliente

```
#/customer/explore                    Explorar Barbearias
#/customer/appointments               Meus Agendamentos
#/customer/booking/:barbershopId      Fluxo de Agendamento
#/customer/profile                    Perfil do Cliente
```

### ✂️ Profissional

```
#/professional/dashboard              Dashboard Operacional
#/professional/schedule               Agenda/Calendário
#/professional/services               Gestão de Serviços
#/professional/availability           Horários de Trabalho
#/professional/blocking               Bloquear Horários
```

### 📊 Administrador

```
#/admin/dashboard                     Dashboard Principal
#/admin/team                          Gestão da Equipe
#/admin/reports                       Relatórios Financeiros
#/admin/settings                      Configurações
```

### 🔄 Compatibilidade (Legacy)

```
#/                                    Home (compat)
#/login                               Login (compat)
#/register                            Register (compat)
#/barbershops                         Barbearias (compat)
#/barbershop/:slug                    Detalhes (compat)
#/book/:barbershopId                  Booking (compat)
#/account                             Account (compat)
#/partner/login                       Partner Login (compat)
#/partner/create                      Partner Create (compat)
```

## 🧭 Fluxos Recomendados

### Fluxo do Cliente

1. **Primeiro Acesso**
   - `#/` → Landing Page
   - `#/auth/login` → Fazer login
   - `#/customer/explore` → Dashboard do cliente

2. **Explorando Barbearias**
   - `#/customer/explore` → Ver barbearias
   - Clica em "Agendar" → `#/customer/booking/:id`

3. **Agendamento (4 passos)**
   ```
   Passo 1: Selecionar Serviço
   Passo 2: Selecionar Profissional
   Passo 3: Selecionar Data/Hora
   Passo 4: Revisar e Confirmar
   ```

4. **Ver Agendamentos**
   - `#/customer/appointments` → Lista de agendamentos

5. **Perfil**
   - `#/customer/profile` → Editar dados

### Fluxo do Profissional

1. **Primeiro Acesso**
   - `#/auth/professional-login` → Fazer login
   - `#/professional/dashboard` → Dashboard

2. **Gerenciar Agenda**
   - `#/professional/schedule` → Ver calendário
   - `#/professional/blocking` → Bloquear horários

3. **Configurar Serviços**
   - `#/professional/services` → Adicionar/editar serviços

4. **Disponibilidade**
   - `#/professional/availability` → Definir horários

### Fluxo do Admin

1. **Acesso ao Painel**
   - `#/admin/dashboard` → Dashboard principal

2. **Gerenciar Equipe**
   - `#/admin/team` → Adicionar barbeiros

3. **Ver Relatórios**
   - `#/admin/reports` → Faturamento e performance

4. **Configurações**
   - `#/admin/settings` → Dados da unidade

## 📱 Navegação Programática

### Cliente

```tsx
// Ir para exploração
navigate('/customer/explore')

// Fazer novo agendamento
navigate(`/customer/booking/${barbershopId}`)

// Ver agendamentos
navigate('/customer/appointments')

// Ver perfil
navigate('/customer/profile')
```

### Profissional

```tsx
// Dashboard
navigate('/professional/dashboard')

// Agenda
navigate('/professional/schedule')

// Serviços
navigate('/professional/services')

// Disponibilidade
navigate('/professional/availability')

// Bloqueios
navigate('/professional/blocking')
```

### Admin

```tsx
// Dashboard
navigate('/admin/dashboard')

// Equipe
navigate('/admin/team')

// Relatórios
navigate('/admin/reports')

// Configurações
navigate('/admin/settings')
```

## 🔗 Redirecionamentos Automáticos

- Se não autenticado: `#/auth/login`
- Se role inválido: `#/auth/login`
- Se cliente: `#/customer/explore` (após login)
- Se profissional: `#/professional/dashboard` (após login)
- Se admin: `#/admin/dashboard` (após login)

## 🧪 Testando URLs

Abra o navegador e teste:

```
# Landing
http://localhost:5173/#/

# Cliente
http://localhost:5173/#/customer/explore

# Profissional
http://localhost:5173/#/professional/dashboard

# Admin
http://localhost:5173/#/admin/dashboard

# Public
http://localhost:5173/#/public/barbershops
```

## ⚠️ Notas Importantes

- Todas as rotas usam hash-based routing (`#/`)
- Protegidas por role do usuário (RBAC)
- Sem match redireciona para landing
- User role determina acesso às páginas
- Logout redireciona para `#/auth/login`

## 📚 Referência Completa

Para mais detalhes, veja:
- [NEW_ARCHITECTURE.md](./NEW_ARCHITECTURE.md) - Arquitetura completa
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Guia do desenvolvedor
- [src/types/models.ts](../src/types/models.ts) - Tipos de rotas
