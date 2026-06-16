# Exemplos de Uso

## Exemplo Completo - Agendamento

```typescript
import {
  fetchBarbershops,
  fetchAvailableTimes,
  createBooking,
  loginUser
} from '@/services/backend'

async function completeFlow() {
  // 1. Login
  await loginUser({ email: 'user@test.com', password: 'pass' })
  
  // 2. Listar barbearias
  const shops = await fetchBarbershops()
  const shop = shops[0]
  
  // 3. Selecionar serviço e barbeiro
  const service = shop.services[0]
  const barber = shop.barbers[0]
  
  // 4. Verificar disponibilidade
  const times = await fetchAvailableTimes({
    barberId: barber.id,
    serviceId: service.id,
    day: '2026-05-15'
  })
  
  // 5. Criar agendamento
  const booking = await createBooking({
    barbershopId: shop.id,
    barberId: barber.id,
    serviceId: service.id,
    day: '2026-05-15',
    time: times[0]
  })
  
  console.log('Agendamento criado:', booking)
}
```

## Com React Hook

```typescript
import { useState, useEffect } from 'react'
import { fetchBarbershops } from '@/services/backend'

function BarbershopList() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchBarbershops()
      .then(setShops)
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Carregando...</div>
  
  return (
    <ul>
      {shops.map(shop => <li key={shop.id}>{shop.name}</li>)}
    </ul>
  )
}
```

