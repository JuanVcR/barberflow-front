# Guia de Desenvolvimento - Nova Arquitetura

## 🎯 Visão Geral Rápida

A aplicação foi reorganizada em áreas de usuário. Cada área tem sua própria estrutura de páginas e componentes.

## 🗂️ Estrutura por Papel

### Cliente (Customer)
**Caminho**: `/customer/*`
- `explore` - Buscar e listar barbearias
- `appointments` - Ver agendamentos
- `booking` - Fazer novo agendamento (4 passos)
- `profile` - Perfil do usuário

### Profissional (Professional)
**Caminho**: `/professional/*`
- `dashboard` - Resumo diário
- `schedule` - Agenda de clientes
- `services` - Gerenciar preços e tempos
- `availability` - Definir horários de trabalho
- `blocking` - Bloquear horários (almoço, folga)

### Admin (Admin)
**Caminho**: `/admin/*`
- `dashboard` - Painel principal
- `team` - Gerenciar barbeiros
- `reports` - Relatórios financeiros
- `settings` - Configurações da unidade

### Público (Public)
**Caminho**: `/public/*`
- `barbershops` - Listar barbearias
- `barbershop/:slug` - Detalhes de uma barbearia

### Autenticação (Auth)
**Caminho**: `/auth/*`
- `login` - Login cliente
- `register` - Registro cliente
- `forgot-password` - Recuperar senha
- `professional-login` - Login profissional

## 🔐 Proteção de Rotas

No App.tsx, as rotas são protegidas verificando `user?.role`:

```tsx
// Professional Routes (Protected)
if (isAuthenticated && user?.role === 'professional') {
  if (route.name === 'professional-dashboard') 
    return <ProfessionalDashboardPage {...} />
}
```

## 📝 Criando uma Nova Página

1. Crie o arquivo em `src/pages/[area]/[recurso]/[Resource]Page.tsx`
2. Implemente a interface com `navigate`, `notify` e qualquer outro prop necessário
3. Adicione o tipo de rota em `types/models.ts` em `AppRoute`
4. Importe e renderize em `App.tsx` no `useMemo`
5. Exporte em `src/pages/index.ts` se necessário

## 🔄 Navegação

Use a função `navigate()` passada por props:

```tsx
// Dentro de uma página
onClick={() => navigate('/customer/appointments')}
```

## 📢 Notificações

Use a função `notify()` passada por props:

```tsx
// Success
notify('success', 'Agendamento confirmado')

// Error
notify('error', 'Erro ao salvar')

// Info
notify('info', 'Operação realizada')
```

## 🎨 Componentes Reutilizáveis

### ProtectedRoute
Para proteger uma seção de uma página:

```tsx
<ProtectedRoute
  user={user}
  requiredRole="customer"
  fallback={<UnauthorizedPage navigate={navigate} />}
>
  <div>Conteúdo apenas para clientes</div>
</ProtectedRoute>
```

## 🧪 Testing

Ao testar páginas protegidas, certifique-se de passar:
- `user` com `role` apropriado
- `navigate` como função mock
- `notify` como função mock

## ⚡ Performance

Cada página utiliza:
- `useState` para estado local
- `useEffect` para efeitos colaterais
- `useMemo` (em App.tsx) para renderização eficiente

## 🔗 Links Úteis

- Documentação: [NEW_ARCHITECTURE.md](./NEW_ARCHITECTURE.md)
- Tipos: [src/types/models.ts](../src/types/models.ts)
- App Router: [src/App.tsx](../src/App.tsx)

## 📋 Checklist para Nova Página

- [ ] Arquivo criado em local correto
- [ ] Tipo de rota adicionado em `models.ts`
- [ ] Rota adicionada em `parseRoute()` em App.tsx
- [ ] Renderização adicionada em `useMemo()` em App.tsx
- [ ] Exportação adicionada em `pages/index.ts`
- [ ] Props interface documentada
- [ ] Lógica de proteção implementada (se necessário)
- [ ] Notificações implementadas (se necessário)
- [ ] Navegação testada

## 🚨 Debugging

Se uma página não aparece:
1. Verifique se o tipo de rota está em `AppRoute` em `models.ts`
2. Verifique se a rota é parseada corretamente em `parseRoute()`
3. Verifique se o componente é renderizado em `useMemo()` em App.tsx
4. Verifique o hash da URL no browser

## 💡 Dicas

- Use paths hash-based: `#/customer/explore`
- Sempre passe `navigate` como prop
- Sempre passe `notify` como prop para feedback do usuário
- Use o padrão de naming: `[Feature][Area]Page.tsx`
- Mantenha páginas simples e reutilizáveis
