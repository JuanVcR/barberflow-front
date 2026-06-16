# Nova Arquitetura de Frontend - Barbershop

## 📋 Visão Geral

A aplicação foi reorganizada seguindo uma arquitetura profissional e modular, dividida em diferentes áreas de usuário:

1. **Área Pública** - Visitantes e Marketing
2. **Painel do Cliente** - Agendamentos e Exploração
3. **Painel do Barbeiro/Profissional** - Gestão operacional
4. **Painel Administrativo** - Dono da Barbearia
5. **Autenticação** - Login e Recuperação de Senha

## 📁 Estrutura de Pastas

```
src/
├── pages/
│   ├── public/                        # Páginas públicas (sem autenticação)
│   │   ├── LandingPage.tsx           # Página inicial com busca
│   │   ├── BarbershopListPublicPage.tsx # Listagem pública
│   │   └── BarbershopDetailsPublicPage.tsx # Detalhes públicos
│   │
│   ├── auth/                          # Páginas de autenticação
│   │   ├── LoginPage.tsx             # Login do cliente
│   │   ├── RegisterPage.tsx          # Registro do cliente
│   │   ├── ForgotPasswordPage.tsx    # Recuperar senha
│   │   └── ProfessionalLoginPage.tsx # Login do profissional
│   │
│   ├── customer/                      # Painel do cliente
│   │   ├── explore/
│   │   │   └── ExplorePage.tsx       # Explorar barbearias
│   │   ├── appointments/
│   │   │   ├── AppointmentsPage.tsx  # Lista de agendamentos
│   │   │   └── CustomerProfilePage.tsx # Perfil do cliente
│   │   └── booking/
│   │       └── BookingPage.tsx       # Fluxo de agendamento (4 passos)
│   │
│   ├── professional/                 # Painel do barbeiro
│   │   ├── dashboard/
│   │   │   └── ProfessionalDashboardPage.tsx # Dashboard operacional
│   │   ├── schedule/
│   │   │   └── SchedulePage.tsx      # Agenda/Calendário
│   │   ├── services/
│   │   │   └── ServicesPage.tsx      # Gestão de serviços
│   │   ├── availability/
│   │   │   └── AvailabilityPage.tsx  # Horários de trabalho
│   │   └── blocking/
│   │       └── BlockingPage.tsx      # Bloqueio de horários
│   │
│   └── admin/                         # Painel administrativo
│       ├── AdminDashboardPage.tsx    # Dashboard principal
│       ├── team/
│       │   └── TeamPage.tsx          # Gestão da equipe
│       ├── reports/
│       │   └── ReportsPage.tsx       # Relatórios financeiros
│       └── settings/
│           └── SettingsPage.tsx      # Configurações da unidade
│
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx        # Componente de proteção de rotas
│   │   └── UnauthorizedPage.tsx      # Página de não autorizado
│   └── ...
└── types/
    └── models.ts                     # Definições de tipos e rotas
```

## 🔀 Sistema de Roteamento

### Padrões de URL

#### Página Pública (Landing)
```
/                           # Landing page
/public/barbershops        # Listagem de barbearias
/public/barbershop/:slug   # Detalhes de uma barbearia
```

#### Autenticação
```
/auth/login                    # Login do cliente
/auth/register                 # Registro do cliente
/auth/forgot-password          # Recuperar senha
/auth/professional-login       # Login do profissional
```

#### Painel do Cliente
```
/customer/explore             # Explorar barbearias (com favoritos)
/customer/appointments        # Meus agendamentos
/customer/booking/:id         # Fluxo de agendamento
/customer/profile             # Perfil do cliente
```

#### Painel do Barbeiro
```
/professional/dashboard       # Dashboard operacional
/professional/schedule        # Agenda
/professional/services        # Gestão de serviços
/professional/availability    # Horários de trabalho
/professional/blocking        # Bloquear horários
```

#### Painel Admin
```
/admin/dashboard             # Dashboard principal
/admin/team                  # Gestão de equipe
/admin/reports               # Relatórios
/admin/settings              # Configurações
```

## 🔐 Role-Based Access Control (RBAC)

O sistema implementa controle de acesso baseado em papel. Cada usuário tem um `role`:

- **customer**: Cliente que faz agendamentos
- **professional**: Barbeiro que gerencia sua agenda
- **admin**: Dono da barbearia que gerencia tudo

### ProtectedRoute Component

```tsx
<ProtectedRoute
  user={user}
  requiredRole="customer"
  fallback={<UnauthorizedPage />}
>
  <CustomerPage />
</ProtectedRoute>
```

## 📱 Fluxo do Cliente

1. **Landing** → Busca barbearia
2. **Explorar** → Lista com filtros e favoritos
3. **Booking (4 passos)**:
   - Selecionar serviço
   - Selecionar profissional
   - Selecionar data/hora
   - Revisar e confirmar
4. **Agendamentos** → Ver próximos e histórico
5. **Perfil** → Editar dados e preferências

## 🎭 Fluxo do Profissional

1. **Dashboard** → Resumo do dia (clientes, faturamento, avaliação)
2. **Agenda** → Visualizar todos os agendamentos
3. **Serviços** → Criar, editar ou deletar serviços
4. **Disponibilidade** → Definir horários fixos de trabalho
5. **Bloqueios** → Fechar horários manualmente (almoço, folga, etc)

## 💼 Fluxo do Admin

1. **Dashboard** → Acesso rápido às funcionalidades
2. **Equipe** → Adicionar/remover profissionais
3. **Relatórios** → Faturamento, performance, serviços mais lucrativos
4. **Configurações** → Dados da unidade, política de cancelamento

## 🎨 Componentes Reutilizáveis

### ProtectedRoute
Protege rotas verificando autenticação e role do usuário.

### UnauthorizedPage
Página exibida quando o usuário não tem permissão.

## 🔄 Sincronização em Tempo Real (TODO)

Para melhorar a UX, recomenda-se implementar:
- WebSockets na agenda do profissional
- Atualização automática quando um cliente agenda
- Notificações em tempo real

## ⏳ Estados de Carregamento (TODO)

Implementar Skeleton Screens para:
- Listagem de barbearias
- Agenda
- Detalhes de barbearia
- Perfil do usuário

## 🚀 Como Iniciar

1. Todos os tipos de usuário começam na landing page
2. Fazer login com seu papel (cliente/profissional)
3. Será redirecionado automaticamente para o painel correspondente
4. Acesso negado redireciona para home ou página de erro

## 📝 Próximos Passos

- [ ] Integrar com API backend
- [ ] Implementar autenticação real
- [ ] Adicionar WebSockets para tempo real
- [ ] Implementar Skeleton Screens
- [ ] Adicionar persistência de favoritos
- [ ] Testes E2E
- [ ] Dark mode
