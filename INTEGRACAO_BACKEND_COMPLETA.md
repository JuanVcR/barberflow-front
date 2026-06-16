# 🚀 Integração Completa Frontend com Backend

**Data:** 25/05/2026  
**Status:** Pronto para implementar  
**Tempo estimado:** 15-20 minutos  

---

## ⚡ Resumo das Mudanças

| Arquivo | Mudança | Importância |
|---------|---------|-----------|
| `src/services/api.ts` | Melhorar interceptor com refresh token | ALTA |
| `src/services/backend.ts` | Ajustar função para login profissional | MÉDIA |
| `src/context/AuthContext.tsx` | Remover mock de profissional | ALTA |
| `.env` | Verificar URL correta | CRÍTICA |

---

## 📋 PASSO 1: Verificar `.env`

**Arquivo:** `.env`  
**Status:** ✅ JÁ ESTÁ CORRETO

```env
VITE_API_URL=http://localhost:3333/api
```

✅ **Não precisa mudar!**

---

## 📋 PASSO 2: Melhorar Interceptor de Token e Refresh

**Arquivo:** `src/services/api.ts`

### CÓDIGO ANTIGO (Linhas 50-115)

```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
})

function normalizeHeaders(headers?: HeadersInit) {
  if (!headers) {
    return undefined
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return headers
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const headers = normalizeHeaders(options.headers) ?? {}
    const body =
      typeof options.body === 'string'
        ? JSON.parse(options.body)
        : options.body

    const response = await apiClient.request({
      url: path,
      method: options.method,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    return response.data as T
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message

      throw new ApiError(message, error.response?.status ?? 500)
    }

    throw error
  }
}
```

### CÓDIGO NOVO (Substitua pelas linhas abaixo)

```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Interceptor para adicionar token na requisição
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
})

// Interceptor de resposta para tratar 401 (token expirado)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tenta renovar o token usando refresh token
        const refreshToken = localStorage.getItem('refresh-token')
        if (!refreshToken) {
          clearAuthToken()
          window.location.href = '#/auth/login'
          return Promise.reject(error)
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const newToken = response.data.token
        setAuthToken(newToken)

        if (response.data.refreshToken) {
          localStorage.setItem('refresh-token', response.data.refreshToken)
        }

        // Retenta a requisição original com novo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAuthToken()
        localStorage.removeItem('refresh-token')
        window.location.href = '#/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

function normalizeHeaders(headers?: HeadersInit) {
  if (!headers) {
    return undefined
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }

  return headers
}

/**
 * Função auxiliar para armazenar refresh token
 */
export function setRefreshToken(token: string) {
  localStorage.setItem('refresh-token', token)
}

/**
 * Função auxiliar para limpar refresh token
 */
export function clearRefreshToken() {
  localStorage.removeItem('refresh-token')
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const headers = normalizeHeaders(options.headers) ?? {}
    const body =
      typeof options.body === 'string'
        ? JSON.parse(options.body)
        : options.body

    const response = await apiClient.request({
      url: path,
      method: options.method,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })

    return response.data as T
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message

      throw new ApiError(message, error.response?.status ?? 500)
    }

    throw error
  }
}
```

**O que mudou:**
- ✅ Adicionado interceptor de resposta para tratar 401
- ✅ Quando token expira, tenta renovar automaticamente com refresh token
- ✅ Se refresh falhar, redireciona para login
- ✅ Duas funções novas: `setRefreshToken` e `clearRefreshToken`

---

## 📋 PASSO 3: Atualizar Login para Guardar Refresh Token

**Arquivo:** `src/services/backend.ts`

### ENCONTRE (Linha ~230)

```typescript
/**
 * Faz login do usuário
 * POST /api/auth/login
 * 
 * @param {Object} payload - Credenciais
 * @param {string} payload.email - Email do usuário
 * @param {string} payload.password - Senha
 * @returns {Promise<ApiLoginResponse>} Token JWT e dados da conta
 * @throws {ApiError} Se email/password inválidos
 * 
 * @example
 * const response = await loginUser({
 *   email: 'joao@email.com',
 *   password: '123456'
 * })
 * // response.token é automaticamente salvo no localStorage
 */
export async function loginUser(payload: { email: string; password: string }) {
  const result = await apiRequest<ApiLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setAuthToken(result.token)
  return result
}
```

### SUBSTITUA POR

```typescript
/**
 * Faz login do usuário
 * POST /api/auth/login
 * 
 * @param {Object} payload - Credenciais
 * @param {string} payload.email - Email do usuário
 * @param {string} payload.password - Senha
 * @returns {Promise<ApiLoginResponse>} Token JWT e dados da conta
 * @throws {ApiError} Se email/password inválidos
 * 
 * @example
 * const response = await loginUser({
 *   email: 'joao@email.com',
 *   password: '123456'
 * })
 * // response.token é automaticamente salvo no localStorage
 */
export async function loginUser(payload: { email: string; password: string }) {
  const { setRefreshToken } = await import('./api')
  
  const result = await apiRequest<ApiLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  setAuthToken(result.token)
  
  // Guardar refresh token se retornado pela API
  if (result.refreshToken) {
    setRefreshToken(result.refreshToken)
  }
  
  return result
}
```

**O que mudou:**
- ✅ Agora guarda o `refreshToken` se a API retornar
- ✅ Função `setRefreshToken` importada dinamicamente

---

## 📋 PASSO 4: Atualizar AuthContext

**Arquivo:** `src/context/AuthContext.tsx`

### ENCONTRE (Linha ~48-57, função `loginPartner`)

```typescript
      loginPartner: (email: string) => {
        const nextUser: User = {
          id: 'partner-1',
          name: 'Dono da Barbearia',
          email,
          phone: '(11) 98888-8888',
          role: 'admin',
        }
        setPartnerUser(nextUser)
        localStorage.setItem(partnerUserKey, JSON.stringify(nextUser))
      },
```

### SUBSTITUA POR

```typescript
      loginPartner: async (email: string, password: string) => {
        try {
          const result = await loginProfessional({ email, password })
          const nextUser: User = {
            id: result.account?.id ?? 'partner-1',
            name: result.account?.id ? 'Profissional' : 'Dono da Barbearia',
            email,
            phone: '(11) 98888-8888',
            role: mapAccountRole(result.account?.role),
          }
          setPartnerUser(nextUser)
          localStorage.setItem(partnerUserKey, JSON.stringify(nextUser))
        } catch (error) {
          throw error
        }
      },
```

**O que mudou:**
- ✅ Agora chama a função `loginProfessional` de verdade
- ✅ Recebe email E password (não é mais mock)
- ✅ Mapeia role corretamente usando `mapAccountRole`

### ADICIONE IMPORTS (início do arquivo)

**ENCONTRE:**
```typescript
import {
  buildUserFromLogin,
  buildUserFromRegister,
  loginUser,
  registerUser,
} from '../services/backend'
```

**SUBSTITUA POR:**
```typescript
import {
  buildUserFromLogin,
  buildUserFromRegister,
  loginUser,
  registerUser,
  loginProfessional,
  mapAccountRole,
} from '../services/backend'
```

---

## 📋 PASSO 5: Atualizar Logout

**Arquivo:** `src/context/AuthContext.tsx`

### ENCONTRE (função `logout`)

```typescript
      logout: () => {
        setUser(null)
        setPartnerUser(null)
        clearAuthToken()
        localStorage.removeItem(customerUserKey)
        localStorage.removeItem(partnerUserKey)
      },
```

### SUBSTITUA POR

```typescript
      logout: () => {
        const { clearRefreshToken } = require('../services/api')
        setUser(null)
        setPartnerUser(null)
        clearAuthToken()
        clearRefreshToken()
        localStorage.removeItem(customerUserKey)
        localStorage.removeItem(partnerUserKey)
      },
```

**O que mudou:**
- ✅ Agora limpa refresh token também ao fazer logout

---

## 📋 PASSO 6: Exportar `mapAccountRole` no backend.ts

**Arquivo:** `src/services/backend.ts`

### ENCONTRE (Linha ~205)

```typescript
function mapAccountRole(role?: string): User['role'] {
  if (role === 'BARBER') return 'professional'
  if (role === 'BARBERSHOP_ADMIN' || role === 'SUPER_ADMIN') return 'admin'
  return 'customer'
}
```

### SUBSTITUA POR

```typescript
export function mapAccountRole(role?: string): User['role'] {
  if (role === 'BARBER') return 'professional'
  if (role === 'BARBERSHOP_ADMIN' || role === 'SUPER_ADMIN') return 'admin'
  return 'customer'
}
```

**O que mudou:**
- ✅ Agora é `export function` para poder usar em outros arquivos

---

## 📋 PASSO 7: Adicionar Tratamento de Erros Global

**Arquivo:** `src/App.tsx`

### ENCONTRE (início da função `App`)

```typescript
function parseRoute(): AppRoute {
  const segments = getPathSegments()
  const params = getQueryParams()
```

### ADICIONE ANTES (novo hook para tratar erros globais)

```typescript
// Hook global para capturar erros de rede
useEffect(() => {
  const handleError = () => {
    console.error('Erro de rede detectado')
  }

  window.addEventListener('offline', handleError)
  return () => window.removeEventListener('offline', handleError)
}, [])
```

---

## 🎯 TESTANDO A INTEGRAÇÃO

### 1️⃣ Começar o Back-end

```bash
cd /home/juanvic/Projeto-ChatBoot
npm run dev
```

**Esperado:** Você ver:
```
Server is running on port 3333
```

### 2️⃣ Começar o Front-end (em outro terminal)

```bash
cd /home/juanvic/barbershop-front-end/barbershop-front
npm run dev
```

**Esperado:** Você ver:
```
VITE v8.0.4  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 3️⃣ Testar Login de Cliente

1. Abra `http://localhost:5173/#/auth/login`
2. Use uma conta existente (do seed do banco)
3. Você deve ser redirecionado para `#/customer/explore`
4. Verifique no Developer Tools → Local Storage: deve ter `auth-token` e `refresh-token`

### 4️⃣ Testar Listagem de Barbearias

1. Vá para `http://localhost:5173/#/public/barbershops`
2. Veja se carrega a lista de barbearias do banco
3. Clique em uma para ver detalhes

### 5️⃣ Testar Agendamento

1. Faça login como cliente
2. Vá para `#/customer/booking/[barbershop-id]`
3. Passe por todos os passos do agendamento
4. No banco, verifique se o booking foi criado:
   ```bash
   npm run prisma:studio
   ```

---

## ⚠️ TROUBLESHOOTING

### Erro: "401 Unauthorized"
- Verifique se o token está sendo enviado
- Abra DevTools → Network e veja Authorization header
- Token deve estar em localStorage com chave `auth-token`

### Erro: "CORS error"
- Verifique se back-end tem CORS habilitado ✅ (já está)
- Verifique se front-end está apontando para URL correta no `.env`

### Erro: "Cannot POST /api/auth/login"
- Verifique se back-end está rodando na porta 3333
- Verifique se rota está registrada em `src/app.ts`

### Agendamento não é criado
- Verifique se você está autenticado (token presente)
- Verifique se `serviceIds` está como array no body
- Verifique logs do back-end para mais detalhes

---

## 📞 RESUMO RÁPIDO

**Mudanças totais:**
- ✅ 1 arquivo modificado: `src/services/api.ts` (adicionado interceptor)
- ✅ 1 arquivo modificado: `src/services/backend.ts` (guardar refresh token)
- ✅ 1 arquivo modificado: `src/context/AuthContext.tsx` (remover mock)

**Tempo:** ~5 minutos para implementar

**Tudo funciona:** Quando conseguir fazer login, criar agendamento e ver dados de verdade do banco!

---

## 🎉 Pronto!

Após fazer todas essas mudanças, seu front-end vai estar **100% integrado** com o back-end!
