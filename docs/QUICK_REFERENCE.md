# Quick Reference - API

## Principais Funções

### Autenticação
```typescript
import { loginUser, registerUser } from '@/services/backend'

// Login
const { token } = await loginUser({ email, password })

// Registrar
const user = await registerUser({ name, email, phone, password })
```

### Barbearias
```typescript
import { fetchBarbershops, fetchBarbershopBySlug } from '@/services/backend'

// Listar todas
const shops = await fetchBarbershops()

// Buscar por slug
const shop = await fetchBarbershopBySlug('barbearia-central')
```

### Agendamentos
```typescript
import { fetchAvailableTimes, createBooking } from '@/services/backend'

// Horários disponíveis
const times = await fetchAvailableTimes({
  barberId: 'uuid',
  serviceId: 'uuid',
  day: '2026-05-15'
})

// Criar agendamento
const booking = await createBooking({
  barbershopId: 'uuid',
  barberId: 'uuid',
  serviceId: 'uuid',
  day: '2026-05-15',
  time: '09:00'
})
```

## Tipos
```typescript
import type { 
  User, Barber, Service, 
  Barbershop, Booking 
} from '@/types/models'
```

## Tratamento de Erros
```typescript
import { ApiError } from '@/services/api'

try {
  await fetchBarbershops()
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Erro ${error.status}: ${error.message}`)
  }
}
```

