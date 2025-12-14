# Lista de Eventos Analytics - Modais

## Eventos Implementados

### Modal Maquininha

#### 1. modal_maquininha_opened
**Quando**: Ao abrir o modal da maquininha  
**Payload**:
```typescript
{
  origin: 'calculadora-rapida',
  valor_venda: number
}
```
**Exemplo**:
```javascript
{
  origin: 'calculadora-rapida',
  valor_venda: 350.00
}
```

#### 2. modal_maquininha_saved
**Quando**: Ao clicar em "Salvar" e aplicar taxa  
**Payload**:
```typescript
{
  tax_percent: number,
  parcelas: number,
  bandeira: string,
  preset_id?: string
}
```
**Exemplo**:
```javascript
{
  tax_percent: 3.99,
  parcelas: 2,
  bandeira: 'visa'
}
```

#### 3. maquininha_preset_saved
**Quando**: Ao salvar um preset de maquininha  
**Payload**:
```typescript
{
  preset_id: string
}
```
**Exemplo**:
```javascript
{
  preset_id: '1702562400000'
}
```

---

### Modal Impostos

#### 4. modal_impostos_opened
**Quando**: Ao abrir o modal de impostos  
**Payload**:
```typescript
{
  origin: 'calculadora-rapida',
  valor_venda: number
}
```
**Exemplo**:
```javascript
{
  origin: 'calculadora-rapida',
  valor_venda: 350.00
}
```

#### 5. modal_impostos_saved
**Quando**: Ao clicar em "Salvar" e aplicar impostos  
**Payload**:
```typescript
{
  icms: number,
  pis: number,
  cofins: number,
  percentual_total: number,
  preset_id?: string
}
```
**Exemplo**:
```javascript
{
  icms: 18,
  pis: 1.65,
  cofins: 7.6,
  percentual_total: 27.25
}
```

#### 6. impostos_preset_saved
**Quando**: Ao salvar um preset de impostos  
**Payload**:
```typescript
{
  preset_id: string
}
```
**Exemplo**:
```javascript
{
  preset_id: '1702562400001'
}
```

---

### Eventos Comuns

#### 7. preset_selected
**Quando**: Ao selecionar um preset salvo (maquininha ou impostos)  
**Payload**:
```typescript
{
  preset_id: string,
  type: 'maquininha' | 'impostos'
}
```
**Exemplo**:
```javascript
{
  preset_id: '1702562400000',
  type: 'maquininha'
}
```

#### 8. modal_cancelled
**Quando**: Ao fechar/cancelar qualquer modal  
**Payload**:
```typescript
{
  type: 'maquininha' | 'impostos'
}
```
**Exemplo**:
```javascript
{
  type: 'maquininha'
}
```

---

## Implementação

### Código de Rastreamento

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

// No componente
const { trackEvent } = useAnalytics();

// Exemplo de uso
trackEvent('modal_maquininha_opened', {
  origin: 'calculadora-rapida',
  valor_venda: valorVenda,
});
```

### Fluxo Típico de Uso - Maquininha

1. **Abertura**: `modal_maquininha_opened`
2. **Seleção de preset** (opcional): `preset_selected`
3. **Edição de valores**: (sem evento)
4. **Salvar preset** (opcional): `maquininha_preset_saved`
5. **Aplicar taxa**: `modal_maquininha_saved`

ou

5. **Cancelar**: `modal_cancelled`

### Fluxo Típico de Uso - Impostos

1. **Abertura**: `modal_impostos_opened`
2. **Seleção de preset** (opcional): `preset_selected`
3. **Edição de valores**: (sem evento)
4. **Salvar preset** (opcional): `impostos_preset_saved`
5. **Aplicar impostos**: `modal_impostos_saved`

ou

5. **Cancelar**: `modal_cancelled`

---

## Métricas Sugeridas

### Conversão
- Taxa de abertura vs conclusão (salvar)
- Taxa de cancelamento
- Uso de presets vs entrada manual

### Engajamento
- Número médio de edições antes de salvar
- Presets mais usados
- Bandeiras de cartão mais comuns
- Estados mais usados (impostos)

### Performance
- Tempo médio no modal
- Tempo entre abertura e primeira ação
- Abandono (cancelamento)

### Usuários
- % de usuários free tentando salvar presets
- Conversão free → pago via CTA de presets
- Retenção de usuários que usam presets

---

## Dashboard Analytics Sugerido

### Visão Geral
```
┌─────────────────────────────────────────┐
│ Modais - Últimos 30 dias                │
├─────────────────────────────────────────┤
│ Total de Aberturas: 1,234               │
│ Taxa de Conclusão: 78%                  │
│ Taxa de Cancelamento: 22%               │
│ Presets Criados: 345                    │
└─────────────────────────────────────────┘
```

### Por Modal
```
┌──────────────┬──────────────┬──────────────┐
│              │ Maquininha   │ Impostos     │
├──────────────┼──────────────┼──────────────┤
│ Aberturas    │ 789          │ 445          │
│ Conclusões   │ 623 (79%)    │ 340 (76%)    │
│ Cancelados   │ 166 (21%)    │ 105 (24%)    │
│ Presets      │ 234          │ 111          │
└──────────────┴──────────────┴──────────────┘
```

### Presets Mais Usados
```
Maquininha:
1. Stone Visa - 45 usos
2. Mercado Pago Débito - 32 usos
3. PagSeguro 3x - 28 usos

Impostos:
1. SP Simples Nacional - 67 usos
2. RJ Lucro Presumido - 23 usos
3. MG Simples - 21 usos
```

---

## Integração com Google Analytics

Se estiver usando Google Analytics 4:

```typescript
// gtag.js
gtag('event', 'modal_maquininha_opened', {
  event_category: 'Calculadora',
  event_label: 'Maquininha',
  value: valorVenda,
});
```

## Integração com Mixpanel

```typescript
// mixpanel
mixpanel.track('Modal Maquininha Opened', {
  origin: 'calculadora-rapida',
  valor_venda: valorVenda,
});
```

## Integração com Amplitude

```typescript
// amplitude
amplitude.getInstance().logEvent('modal_maquininha_opened', {
  origin: 'calculadora-rapida',
  valor_venda: valorVenda,
});
```

---

## Testes

Para testar eventos em desenvolvimento:

```typescript
// Mock do hook useAnalytics
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn((event, payload) => {
      console.log('Analytics Event:', event, payload);
    }),
  }),
}));
```

Ou verificar no console do navegador (modo desenvolvimento):

```javascript
// Os eventos devem aparecer no console
console.log('Analytics Event: modal_maquininha_opened', { ... });
```
