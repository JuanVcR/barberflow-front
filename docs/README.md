# Documentação da API - Barbershop Frontend

Bem-vindo! Esta pasta contém toda a documentação necessária para integrar e usar a API do backend da barbearia no frontend.

## 📚 Arquivos de Documentação

### 🚀 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Comece aqui!** Referência rápida com os endpoints mais usados e exemplos básicos.

### 📖 [API.md](./API.md)
Documentação completa de todos os endpoints disponíveis com:
- Request/Response examples
- Autenticação
- Status codes
- Filtros e parâmetros

### 💻 [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
Exemplos práticos de como usar a API em seu código React/TypeScript:
- Padrões comuns
- Hooks customizados
- Tratamento de erros
- Integração com contextos
- Exemplos com React Query

### ⚙️ [SETUP.md](./SETUP.md)
Guia de configuração e setup:
- Variáveis de ambiente
- Estrutura de arquivos
- Troubleshooting
- Performance tips

---

## 🎯 Fluxo Rápido

### 1️⃣ Login
```typescript
import { loginUser } from '@/services/backend'

await loginUser({ email, password })
// Token é automaticamente salvo em localStorage
```

### 2️⃣ Listar Barbearias
```typescript
import { fetchBarbershops } from '@/services/backend'

const shops = await fetchBarbershops()
```

### 3️⃣ Verificar Disponibilidade
```typescript
import { fetchAvailableTimes } from '@/services/backend'

const times = await fetchAvailableTimes({
  barberId: 'uuid',
  serviceId: 'uuid',
  day: '2026-05-15'
})
```

### 4️⃣ Criar Agendamento
```typescript
import { createBooking } from '@/services/backend'

const booking = await createBooking({
  barbershopId: 'uuid',
  barberId: 'uuid',
  serviceId: 'uuid',
  day: '2026-05-15',
  time: '09:00'
})
```

---

## 📂 Arquivos de Código

| Arquivo | Descrição |
|---------|-----------|
| `src/services/api.ts` | Cliente HTTP com axios, interceptores e autenticação |
| `src/services/backend.ts` | Funções de integração com API (login, bookings, etc) |
| `src/types/models.ts` | Tipos TypeScript para os modelos de dados |

Todos têm **comentários JSDoc** para melhor intellisense no editor!

---

## 🔐 Autenticação

- ✅ Token salvo em `localStorage` automaticamente
- ✅ Token enviado em todos os headers automaticamente
- ✅ Tratamento de erro 401 (sessão expirada)

```typescript
const response = await loginUser({ email, password })
// Token está em: response.token
// Salvo em: localStorage.getItem('auth-token')
// Enviado em: Authorization: Bearer <token>
```

---

## 🚀 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Barbearias
- `GET /api/barbershops` - Listar todas
- `GET /api/barbershops/:slug` - Detalhes por slug

### Agendamentos
- `GET /api/availability` - Horários disponíveis
- `POST /api/bookings` - Criar agendamento

### Perfil
- `GET /api/clients/me` - Perfil do cliente
- `PATCH /api/clients/me` - Atualizar perfil

Veja [API.md](./API.md) para lista completa!

---

## 💡 Dicas

### Use TypeScript
```typescript
import type { Barbershop, Booking } from '@/types/models'

const shop: Barbershop = await fetchBarbershopBySlug('central')
```

### Trate Erros
```typescript
import { ApiError } from '@/services/api'

try {
  await fetchBarbershops()
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.message)
  }
}
```

### Use React Query para Cache
```typescript
import { useQuery } from '@tanstack/react-query'

export function useBarbershops() {
  return useQuery({
    queryKey: ['barbershops'],
    queryFn: fetchBarbershops,
    staleTime: 1000 * 60 * 5
  })
}
```

---

## 🆘 Troubleshooting

**"Erro 401"** → Token expirou ou inválido. Fazer login novamente.

**"CORS Error"** → Verificar variável `VITE_API_URL` e permissões do backend.

**"Token não está sendo enviado"** → Verificar se `localStorage` contém `auth-token`.

Veja [SETUP.md](./SETUP.md) para mais soluções!

---

## 📚 Recursos

- 📖 Documentação API: [API.md](./API.md)
- 💻 Exemplos de Código: [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
- ⚙️ Configuração: [SETUP.md](./SETUP.md)
- ⚡ Referência Rápida: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## ✅ Checklist de Implementação

- [ ] Configurar `VITE_API_URL` em `.env`
- [ ] Implementar página de login com `loginUser()`
- [ ] Implementar listagem com `fetchBarbershops()`
- [ ] Implementar seleção de data/hora com `fetchAvailableTimes()`
- [ ] Implementar criação de agendamento com `createBooking()`
- [ ] Adicionar tratamento de erros com `ApiError`
- [ ] Implementar logout com `clearAuthToken()`
- [ ] Adicionar loading states
- [ ] Adicionar mensagens de sucesso/erro

---

## 🎓 Estrutura de Pasta Recomendada

```
src/
├── components/
│   ├── BarbershopList.tsx
│   ├── BookingForm.tsx
│   ├── LoginForm.tsx
│   └── ...
├── context/
│   └── AuthContext.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── ...
├── services/
│   ├── api.ts          ✅ Já existe
│   └── backend.ts      ✅ Já existe
├── types/
│   └── models.ts       ✅ Já existe
└── ...
```

---

## 📞 Suporte

Em caso de dúvidas:

1. Consulte a documentação relevante (links acima)
2. Verifique os comentários JSDoc no código
3. Veja exemplos em [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
4. Confira troubleshooting em [SETUP.md](./SETUP.md)

---

**Versão**: 1.0  
**Última atualização**: Maio 2026  
**Status**: ✅ Completa e documentada
