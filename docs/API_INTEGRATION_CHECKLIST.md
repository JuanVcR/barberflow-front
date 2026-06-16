# Checklist de Integração com API

## 📋 Visão Geral

Este documento lista todas as integrações de API necessárias para o funcionamento completo da aplicação.

## 🔐 Autenticação

- [ ] Integrar `LoginPage` com `/api/auth/login`
- [ ] Integrar `RegisterPage` com `/api/auth/register`
- [ ] Integrar `ForgotPasswordPage` com `/api/auth/forgot-password`
- [ ] Integrar `ProfessionalLoginPage` com `/api/auth/professional-login`
- [ ] Atualizar `AuthContext` para guardar token JWT
- [ ] Implementar refresh token
- [ ] Persistir user com role em localStorage

## 👤 Cliente

### Explorar
- [ ] `ExplorePage` - GET `/api/barbershops` com filtros
- [ ] Implementar busca por nome/localização
- [ ] Implementar favoritos (GET/POST `/api/customers/favorites`)
- [ ] Persistir favoritos localmente

### Agendamentos
- [ ] `AppointmentsPage` - GET `/api/customers/:id/appointments`
- [ ] Implementar filtro por status (próximos/histórico)
- [ ] Implementar cancelamento - DELETE `/api/appointments/:id`
- [ ] Mostrar histórico de pagamentos - GET `/api/customers/:id/payments`

### Booking (4 passos)
- [ ] Passo 1: GET `/api/barbershops/:id/services`
- [ ] Passo 2: GET `/api/services/:id/professionals`
- [ ] Passo 3: GET `/api/professionals/:id/availability` (com filtro de data)
- [ ] Passo 4: POST `/api/appointments` (criar agendamento)

### Perfil
- [ ] `CustomerProfilePage` - GET/PUT `/api/customers/:id`
- [ ] Implementar edição de perfil
- [ ] Implementar preferências de notificação

## ✂️ Profissional

### Dashboard
- [ ] GET `/api/professionals/:id/stats/today` (clientes, faturamento, avaliação)
- [ ] GET `/api/professionals/:id/appointments?date=today` (agenda de hoje)

### Agenda
- [ ] GET `/api/professionals/:id/schedule?date=:date`
- [ ] Mostrar status dos agendamentos (confirmado, pendente, finalizado)
- [ ] PUT `/api/appointments/:id/status` (confirmar/finalizar)

### Serviços
- [ ] GET `/api/professionals/:id/services`
- [ ] POST `/api/professionals/:id/services` (criar)
- [ ] PUT `/api/professionals/:id/services/:id` (editar)
- [ ] DELETE `/api/professionals/:id/services/:id` (deletar)

### Disponibilidade
- [ ] GET/PUT `/api/professionals/:id/working-hours`
- [ ] Salvar horários por dia da semana

### Bloqueios
- [ ] GET `/api/professionals/:id/blocked-times`
- [ ] POST `/api/professionals/:id/blocked-times` (criar bloqueio)
- [ ] DELETE `/api/professionals/:id/blocked-times/:id` (remover bloqueio)

## 📊 Admin

### Dashboard
- [ ] GET `/api/admin/stats` (resumo geral)
- [ ] Mostrar quick links para team, reports, settings

### Equipe
- [ ] GET `/api/admin/team` (lista de profissionais)
- [ ] POST `/api/admin/team/invite` (convidar novo profissional)
- [ ] PUT `/api/admin/team/:id/approve` (aprovar profissional pendente)
- [ ] DELETE `/api/admin/team/:id` (remover profissional)
- [ ] PUT `/api/admin/team/:id/role` (mudar role para admin)

### Relatórios
- [ ] GET `/api/admin/reports/monthly` (faturamento mensal)
- [ ] GET `/api/admin/reports/services` (serviços mais lucrativos)
- [ ] GET `/api/admin/reports/professionals` (performance dos profissionais)
- [ ] GET `/api/admin/reports/clients` (clientes novos)

### Configurações
- [ ] GET/PUT `/api/admin/settings` (dados da unidade)
- [ ] Incluir: nome, endereço, telefone, email, descrição, política de cancelamento

## 🔄 Dados Públicos

- [ ] GET `/api/barbershops` (listagem pública)
- [ ] GET `/api/barbershops?search=:query` (busca)
- [ ] GET `/api/barbershops/:slug` (detalhes)
- [ ] GET `/api/barbershops/:id/professionals` (profissionais)
- [ ] GET `/api/barbershops/:id/services` (serviços)

## 🔔 Notificações (Future)

- [ ] Implementar WebSockets para atualizações em tempo real
- [ ] Notificar profissional quando novo agendamento
- [ ] Notificar cliente sobre confirmação/cancelamento
- [ ] Notificar admin de novos profissionais pendentes

## 🖼️ Upload de Imagens

- [ ] Upload de foto na página de detalhes (barbershop)
- [ ] Upload de foto do perfil (cliente/profissional)
- [ ] Upload de imagens de serviço
- [ ] Salvar em CDN ou storage

## ✅ Validações

### Frontend
- [ ] Email válido
- [ ] Senha com requisitos mínimos
- [ ] Telefone formatado
- [ ] Preço > 0
- [ ] Duração > 0
- [ ] Data/hora válidas

### Backend (implementado)
- [ ] Duplicação de email
- [ ] Permissões de acesso (RBAC)
- [ ] Dados obrigatórios

## 🔒 Segurança

- [ ] CSRF token
- [ ] Rate limiting em login
- [ ] Criptografia de senhas
- [ ] HTTPS only
- [ ] Validação de entrada no backend
- [ ] Sanitização de output

## 🧪 Testes

- [ ] Testes unitários para componentes
- [ ] Testes de integração de API
- [ ] E2E testing dos fluxos principais
- [ ] Mock de API durante desenvolvimento

## 📝 Documentação

- [ ] Documentar endpoints de API
- [ ] Criar postman collection
- [ ] Documentar modelos de dados
- [ ] Guia de deployment

## 🚀 Deployment

- [ ] CI/CD pipeline
- [ ] Build otimizado
- [ ] Environment variables
- [ ] Error logging
- [ ] Analytics

## 📋 Prioridade

### Alta (MVP)
- [x] Autenticação básica
- [x] Cliente: Explorar + Booking
- [x] Profissional: Dashboard + Agenda
- [x] Admin: Team + Settings

### Média
- [ ] Relatórios
- [ ] Bloqueios
- [ ] Disponibilidade
- [ ] Favoritos

### Baixa
- [ ] Dark mode
- [ ] Notificações em tempo real
- [ ] Analytics
- [ ] Mobile app

## 📞 Contato com Backend

Coordenar com o time de backend:
- Formato de respostas de API
- Codes de erro
- Autenticação (JWT vs Sessions)
- CORS configuration
- Rate limiting
- API versioning
