# Setup - Configuração da API

## 1. Variáveis de Ambiente

.env ou .env.local:
```env
VITE_API_URL=http://localhost:3000/api
```

## 2. Arquivos Principais

- `src/services/api.ts` - Cliente HTTP configurado
- `src/services/backend.ts` - Funções de API
- `src/types/models.ts` - Tipos TypeScript

## 3. Como Usar

```typescript
import { fetchBarbershops } from '@/services/backend'

const shops = await fetchBarbershops()
```

Token é automaticamente enviado em todas requisições protegidas.

## 4. Troubleshooting

- **Erro 401**: Token expirado, fazer login novamente
- **CORS Error**: Verificar VITE_API_URL e backend
- **Token não envia**: Verificar localStorage

