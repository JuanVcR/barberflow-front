# Documentação Completa da API - Barbearia

## Base URL

- **Local**: `http://localhost:3000`
- **Variável de ambiente**: `VITE_API_URL`

## Autenticação

```http
Authorization: Bearer TOKEN
Content-Type: application/json
```

---

## 🔐 Auth - Autenticação

### POST /api/auth/register
Registrar novo cliente

Body:
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456",
  "phone": "11999999999",
  "cpf": "12345678900"
}
```

### POST /api/auth/login
Fazer login

Body:
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

Response:
```json
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "account": {
    "id": "uuid",
    "email": "joao@email.com",
    "role": "CLIENT"
  }
}
```

---

## 💈 Barbearias

### GET /api/barbershops
Listar todas as barbearias

Response: Array de Barbershop com serviços

### GET /api/barbershops/:slug
Obter detalhes de uma barbearia

Exemplo: `GET /api/barbershops/barbearia-central`

---

## 📅 Agendamentos

### GET /api/availability
Consultar horários disponíveis

Query:
```
?barberId=UUID&serviceId=UUID&day=YYYY-MM-DD
```

Response:
```json
["09:00", "09:30", "10:00"]
```

### POST /api/bookings
Criar agendamento (requer autenticação)

Body:
```json
{
  "barbershopId": "uuid",
  "barberId": "uuid",
  "serviceId": "uuid",
  "day": "2026-05-15",
  "startTime": "09:00"
}
```

Ou com múltiplos serviços:
```json
{
  "barbershopId": "uuid",
  "barberId": "uuid",
  "serviceIds": ["uuid-1", "uuid-2"],
  "day": "2026-05-15",
  "startTime": "09:00"
}
```

---

## 👤 Cliente

### GET /api/clients/me
Perfil do cliente (requer autenticação)

### PATCH /api/clients/me
Atualizar perfil do cliente

Body:
```json
{
  "name": "João Silva",
  "phone": "11999999999",
  "email": "joao@email.com"
}
```

---

## ✅ Frontend Integration Checklist

- Salvar `token` no localStorage após login
- Enviar `Authorization: Bearer TOKEN` em rotas protegidas
- Usar `/api/auth/login` e `/api/auth/register`
- Atualizar UI ao cancelar/agendar/reagendar
- Renovar token ao expirar

