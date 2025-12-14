# Documentação - Modais Maquininha e Impostos

## Visão Geral

Implementação de dois modais auxiliares integrados à Calculadora Rápida (/calculadora-rapida):
- **Modal da Maquininha**: Calculadora de taxas por bandeira e parcelas
- **Modal de Impostos**: Calculadora fiscal simplificada (ICMS, PIS, COFINS)

## Estrutura de Presets

### Maquininha Presets

Armazenados em: `localStorage` com chave `azuria_maquininha_presets`

```typescript
interface MaquininhaPreset {
  id: string;                    // Timestamp único
  nome: string;                  // Nome do preset (ex: "Stone Visa")
  maquininha_fornecedor: string; // Fornecedor da maquininha
  bandeira: string;              // visa | mastercard | elo | outro
  parcelas_default: number;      // Parcelas padrão (0-12, 0 = débito)
  taxas_por_parcela: {           // Mapa de taxas
    [parcela: number]: number;   // parcela -> taxa %
  };
  created_at: string;            // ISO timestamp de criação
  updated_at: string;            // ISO timestamp de atualização
}
```

**Exemplo**:
```json
{
  "id": "1702562400000",
  "nome": "Stone Visa",
  "maquininha_fornecedor": "manual",
  "bandeira": "visa",
  "parcelas_default": 1,
  "taxas_por_parcela": {
    "0": 1.99,
    "1": 2.49,
    "2": 3.99,
    "3": 4.99,
    "4": 5.99,
    "5": 6.99,
    "6": 7.99,
    "7": 8.49,
    "8": 8.99,
    "9": 9.49,
    "10": 9.99,
    "11": 10.49,
    "12": 10.99
  },
  "created_at": "2023-12-14T12:00:00.000Z",
  "updated_at": "2023-12-14T12:00:00.000Z"
}
```

### Impostos Presets

Armazenados em: `localStorage` com chave `azuria_impostos_presets`

```typescript
interface ImpostosPreset {
  id: string;                          // Timestamp único
  nome: string;                        // Nome do preset (ex: "SP Simples Nacional")
  origemUF: string;                    // UF de origem (ex: "SP")
  destinoUF: string;                   // UF de destino (ex: "RJ")
  tipoOperacao: 'interna' | 'interestadual';
  icms: number;                        // Percentual ICMS
  pis: number;                         // Percentual PIS
  cofins: number;                      // Percentual COFINS
  created_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
}
```

**Exemplo**:
```json
{
  "id": "1702562400001",
  "nome": "SP Simples Nacional",
  "origemUF": "SP",
  "destinoUF": "SP",
  "tipoOperacao": "interna",
  "icms": 18,
  "pis": 1.65,
  "cofins": 7.6,
  "created_at": "2023-12-14T12:00:00.000Z",
  "updated_at": "2023-12-14T12:00:00.000Z"
}
```

## Eventos Analytics

### Modal Maquininha

| Evento | Payload | Quando dispara |
|--------|---------|----------------|
| `modal_maquininha_opened` | `{ origin: string, valor_venda: number }` | Ao abrir o modal |
| `modal_maquininha_saved` | `{ tax_percent: number, parcelas: number, bandeira: string, preset_id?: string }` | Ao salvar taxa |
| `maquininha_preset_saved` | `{ preset_id: string }` | Ao salvar preset |
| `preset_selected` | `{ preset_id: string, type: 'maquininha' }` | Ao selecionar preset |
| `modal_cancelled` | `{ type: 'maquininha' }` | Ao cancelar modal |

**Exemplo de payload**:
```javascript
trackEvent('modal_maquininha_opened', {
  origin: 'calculadora-rapida',
  valor_venda: 350.00
});

trackEvent('modal_maquininha_saved', {
  tax_percent: 3.99,
  parcelas: 2,
  bandeira: 'visa'
});
```

### Modal Impostos

| Evento | Payload | Quando dispara |
|--------|---------|----------------|
| `modal_impostos_opened` | `{ origin: string, valor_venda: number }` | Ao abrir o modal |
| `modal_impostos_saved` | `{ icms: number, pis: number, cofins: number, percentual_total: number, preset_id?: string }` | Ao salvar impostos |
| `impostos_preset_saved` | `{ preset_id: string }` | Ao salvar preset |
| `preset_selected` | `{ preset_id: string, type: 'impostos' }` | Ao selecionar preset |
| `modal_cancelled` | `{ type: 'impostos' }` | Ao cancelar modal |

**Exemplo de payload**:
```javascript
trackEvent('modal_impostos_opened', {
  origin: 'calculadora-rapida',
  valor_venda: 350.00
});

trackEvent('modal_impostos_saved', {
  icms: 18,
  pis: 1.65,
  cofins: 7.6,
  percentual_total: 27.25
});
```

## Permissões por Plano

| Funcionalidade | Free | Iniciante | Premium |
|----------------|------|-----------|---------|
| Abrir modais | ✅ | ✅ | ✅ |
| Usar calculadoras | ✅ | ✅ | ✅ |
| Aplicar valores | ✅ | ✅ | ✅ |
| Salvar presets | ❌ | ✅ | ✅ |
| Editar presets | ❌ | ✅ | ✅ |
| Remover presets | ❌ | ✅ | ✅ |

## Cálculos

### Maquininha

**Fórmula**: `valor_recebido = valor_venda * (1 - taxa_percentual / 100)`

Exemplo:
- Valor da venda: R$ 350,00
- Taxa 2x: 3,99%
- Valor recebido: R$ 350,00 * (1 - 0,0399) = R$ 336,03

### Impostos

**Fórmula**: `impostos_estimados = (valor_venda * percentual_total) / 100`

Onde: `percentual_total = icms + pis + cofins`

Exemplo:
- Valor da venda: R$ 350,00
- ICMS: 18%
- PIS: 1,65%
- COFINS: 7,6%
- Total: 27,25%
- Impostos: R$ 350,00 * 0,2725 = R$ 95,38
- Valor recebido: R$ 350,00 - R$ 95,38 = R$ 254,62

## Acessibilidade

- ✅ Focus trap nos modais
- ✅ Fechar com tecla ESC
- ✅ Labels ARIA adequados
- ✅ Navegação por teclado
- ✅ Contraste adequado
- ✅ Inputs com validação visual

## Responsividade

- **Mobile**: Modal em tela cheia
- **Tablet**: Modal centralizado (80% largura)
- **Desktop**: Modal centralizado (500px largura máxima)

## Arquivos Criados

```
src/
├── components/
│   └── calculators/
│       └── modals/
│           ├── MaquininhaModal.tsx       # Modal da maquininha
│           └── ImpostosModal.tsx         # Modal de impostos
├── hooks/
│   ├── useMaquininhaPresets.ts          # Gerenciamento de presets maquininha
│   ├── useImpostosPresets.ts            # Gerenciamento de presets impostos
│   └── useUserPlan.ts                   # Verificação de plano do usuário
└── domains/
    └── calculator/
        └── components/
            ├── RapidCalculator.tsx      # Integração dos modais (modificado)
            └── CalculatorContent.tsx    # Props dos modais (modificado)
```

## Sincronização Futura

A estrutura de presets está preparada para sincronização futura com backend:

1. **ID único**: Permite identificação do preset
2. **Timestamps**: `created_at` e `updated_at` para controle de versão
3. **User ID**: Pode ser adicionado quando implementar autenticação
4. **Estrutura JSON**: Compatível com APIs REST/GraphQL

**Sugestão de endpoint futuro**:
```
POST /api/presets/maquininha
GET /api/presets/maquininha
PUT /api/presets/maquininha/:id
DELETE /api/presets/maquininha/:id

POST /api/presets/impostos
GET /api/presets/impostos
PUT /api/presets/impostos/:id
DELETE /api/presets/impostos/:id
```

## Migração de Dados

Para migrar presets do localStorage para backend:

```typescript
async function migratePresetsToBackend(userId: string) {
  // Maquininha
  const maquininhaPresets = JSON.parse(
    localStorage.getItem('azuria_maquininha_presets') || '[]'
  );
  
  for (const preset of maquininhaPresets) {
    await api.post('/api/presets/maquininha', {
      ...preset,
      user_id: userId
    });
  }
  
  // Impostos
  const impostosPresets = JSON.parse(
    localStorage.getItem('azuria_impostos_presets') || '[]'
  );
  
  for (const preset of impostosPresets) {
    await api.post('/api/presets/impostos', {
      ...preset,
      user_id: userId
    });
  }
}
```
