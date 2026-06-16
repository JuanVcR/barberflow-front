# 🚨 4 AJUSTES CRÍTICOS - PRONTO PARA COPIAR

**Objetivo:** Melhorar tratamento de erros e feedback do usuário  
**Tempo:** ~30 min  
**Dificuldade:** Fácil (copy-paste)  

---

## ✅ AJUSTE 1: Componente Toast (Notificações Visíveis)

**Arquivo:** `src/components/Toast.tsx` (CRIAR NOVO)

```typescript
import { useState, useEffect } from 'react'

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3'
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: colors[type],
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
        fontSize: '14px',
        maxWidth: '300px'
      }}
    >
      {message}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
```

---

## ✅ AJUSTE 2: Hook para Gerenciar Toasts

**Arquivo:** `src/hooks/useToast.ts` (CRIAR NOVO)

```typescript
import { useState } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    const toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    return id
  }

  const remove = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, add, remove }
}
```

---

## ✅ AJUSTE 3: Validações Simples

**Arquivo:** `src/utils/validators.ts` (CRIAR NOVO)

```typescript
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validatePhone(phone: string): boolean {
  return /^\d{10,11}$/.test(phone.replace(/\D/g, ''))
}

export function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  return clean.length === 11
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0
}
```

---

## 📋 AGORA INTEGRE EM 3 ARQUIVOS:

### INTEGRAÇÃO 1: `src/pages/auth/LoginPage.tsx`

**ANTES:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    await login(email, password)
    notify('success', 'Login realizado com sucesso')
    onLoginSuccess?.()
    navigate('/customer/explore')
  } catch (error) {
    notify('error', 'Erro ao fazer login')
  } finally {
    setIsLoading(false)
  }
}
```

**DEPOIS:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // ✅ NOVO: Validação
  if (!email.trim()) {
    notify('error', 'Email é obrigatório')
    return
  }
  if (!password.trim()) {
    notify('error', 'Senha é obrigatória')
    return
  }
  
  setIsLoading(true)

  try {
    await login(email, password)
    notify('success', 'Login realizado com sucesso')
    onLoginSuccess?.()
    navigate('/customer/explore')
  } catch (error) {
    // ✅ NOVO: Mensagem de erro melhorada
    const message = error instanceof Error 
      ? error.message 
      : 'Email ou senha incorretos'
    notify('error', message)
  } finally {
    setIsLoading(false)
  }
}
```

**Mudanças:**
- Linhas 3-12: NOVO - Validação antes de enviar
- Linhas 23-25: MODIFICADO - Pega mensagem real do erro

---

### INTEGRAÇÃO 2: `src/pages/customer/booking/BookingPage.tsx`

**ANTES:**
```typescript
const handleConfirm = async () => {
  try {
    setLoading(true)
    await createBooking({
      barberId: selectedProfessional!,
      serviceId: selectedService!,
      barbershopId: barbershop!.id,
      day: selectedDate,
      time: selectedTime,
    })
    notify('success', 'Agendamento confirmado!')
    navigate('/customer/appointments')
  } catch (err) {
    notify('error', err instanceof Error ? err.message : 'Erro ao confirmar agendamento')
  } finally {
    setLoading(false)
  }
}
```

**DEPOIS:**
```typescript
const handleConfirm = async () => {
  // ✅ NOVO: Validação adicional
  if (!selectedProfessional) {
    notify('error', 'Selecione um profissional')
    return
  }
  if (!selectedService) {
    notify('error', 'Selecione um serviço')
    return
  }
  if (!selectedDate) {
    notify('error', 'Selecione uma data')
    return
  }
  if (!selectedTime) {
    notify('error', 'Selecione um horário')
    return
  }

  try {
    setLoading(true)
    await createBooking({
      barberId: selectedProfessional,
      serviceId: selectedService,
      barbershopId: barbershop!.id,
      day: selectedDate,
      time: selectedTime,
    })
    notify('success', 'Agendamento confirmado! Você receberá confirmação por email.')
    navigate('/customer/appointments')
  } catch (err) {
    // ✅ NOVO: Tratamento de erro melhorado
    let message = 'Erro ao confirmar agendamento'
    
    if (err instanceof Error) {
      message = err.message
    }
    
    // Se erro específico da API
    if (message.includes('horário')) {
      message = 'Este horário não está mais disponível. Escolha outro.'
    }
    if (message.includes('profissional')) {
      message = 'Este profissional não está mais disponível.'
    }
    
    notify('error', message)
  } finally {
    setLoading(false)
  }
}
```

**Mudanças:**
- Linhas 2-16: NOVO - Validação forte antes de enviar
- Linhas 27-43: MODIFICADO - Tratamento de erro melhorado com mensagens específicas

---

### INTEGRAÇÃO 3: `src/pages/auth/RegisterPage.tsx`

**ANTES:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    await register(name, email, phone, password)
    notify('success', 'Conta criada com sucesso!')
    navigate('/auth/login')
  } catch (error) {
    notify('error', 'Erro ao criar conta')
  } finally {
    setIsLoading(false)
  }
}
```

**DEPOIS:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // ✅ NOVO: Validação
  if (!name.trim()) {
    notify('error', 'Nome é obrigatório')
    return
  }
  if (!email.trim()) {
    notify('error', 'Email é obrigatório')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    notify('error', 'Email inválido')
    return
  }
  if (!phone.trim()) {
    notify('error', 'Telefone é obrigatório')
    return
  }
  if (!password.trim()) {
    notify('error', 'Senha é obrigatória')
    return
  }
  if (password.length < 6) {
    notify('error', 'Senha deve ter pelo menos 6 caracteres')
    return
  }
  
  setIsLoading(true)

  try {
    await register(name, email, phone, password)
    notify('success', 'Conta criada com sucesso!')
    navigate('/auth/login')
  } catch (error) {
    // ✅ NOVO: Mensagem detalhada
    const message = error instanceof Error 
      ? error.message 
      : 'Erro ao criar conta'
    
    if (message.includes('email')) {
      notify('error', 'Este email já está registrado')
    } else if (message.includes('cpf')) {
      notify('error', 'Este CPF já está registrado')
    } else {
      notify('error', message)
    }
  } finally {
    setIsLoading(false)
  }
}
```

---

## 🎨 Estilo para Loading (Opcional)

**Em `src/App.css` adicione:**

```css
/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Button disabled state */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button com loader */
.button-with-loader {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

---

## ✅ CHECKLIST IMPLEMENTAÇÃO

- [ ] Criar `src/components/Toast.tsx`
- [ ] Criar `src/hooks/useToast.ts`
- [ ] Criar `src/utils/validators.ts`
- [ ] Modificar `src/pages/auth/LoginPage.tsx`
- [ ] Modificar `src/pages/auth/RegisterPage.tsx`
- [ ] Modificar `src/pages/customer/booking/BookingPage.tsx`
- [ ] Testar login (com erro e sucesso)
- [ ] Testar agendamento
- [ ] Testar registro
- [ ] Pronto para entregar! ✅

---

## 🧪 TESTE RÁPIDO

1. **Tente login vazio:**
   - Click "Entrar" sem preencher
   - Deve mostrar "Email é obrigatório"

2. **Tente login com email errado:**
   - Digite `teste@teste.com` com senha errada
   - Deve mostrar "Email ou senha incorretos"

3. **Tente agendamento incompleto:**
   - Click confirmar sem selecionar tudo
   - Deve mostrar qual campo falta

4. **Registro com email inválido:**
   - Digite `testeemail.com` (sem @)
   - Deve mostrar "Email inválido"

---

## ⏱️ TEMPO TOTAL

| Tarefa | Tempo |
|--------|-------|
| Criar Toast.tsx | 3 min |
| Criar useToast.ts | 2 min |
| Criar validators.ts | 2 min |
| Modificar LoginPage | 5 min |
| Modificar RegisterPage | 5 min |
| Modificar BookingPage | 10 min |
| Testar tudo | 10 min |
| **TOTAL** | **~40 min** ✅ |

---

## 🎯 RESULTADO

```
ANTES:
- Erro genérico "Erro ao fazer login"
- Usuário fica confuso
- Sem feedback visual claro

DEPOIS:
- "Email ou senha incorretos" (específico)
- "Este horário não está mais disponível"
- Toast verde aparece e desaparece
- Usuário entende o que aconteceu ✅
```

---

**Pronto para copiar! Avisa quando terminar para testar! 🚀**
