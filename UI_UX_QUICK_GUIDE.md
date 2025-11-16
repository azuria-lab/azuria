# Guia Rápido: UI/UX Improvements ✨

## Dark Mode 🌓

### Como Usar:
O botão de alternância de tema está no **Header**, lado direito.

**Opções:**
- ☀️ **Claro** - Tema light
- 🌙 **Escuro** - Tema dark  
- 💻 **Sistema** - Segue o tema do sistema operacional

**Atalho de Teclado:** `Ctrl + D` para alternar entre claro/escuro

---

## Tour Guiado 🎯

### Tours Disponíveis:

#### 1. **Marketplace Dashboard** (5 passos)
Como iniciar: Botão flutuante no canto inferior direito da página `/marketplace`

**Conteúdo:**
1. Seleção de marketplace no carrossel
2. Cards de métricas principais
3. Botão de conectar novo marketplace
4. Aba de análise de preços
5. Aba de IA Insights

#### 2. **Product Management** (5 passos)
*Em desenvolvimento - será habilitado em breve*

#### 3. **Analytics** (5 passos)
*Em desenvolvimento - será habilitado em breve*

### Navegação no Tour:
- **Setas ←/→**: Navegar entre passos
- **Enter**: Próximo passo
- **Escape**: Pular tour
- **Botões**: Anterior, Próximo, Concluir

### Para Desenvolvedores:
Adicione `data-tour="nome-unico"` aos elementos que deseja destacar no tour.

---

## Atalhos de Teclado ⌨️

### Ver Todos os Atalhos:
Pressione `Ctrl + /` para abrir o modal de ajuda.

### Atalhos Disponíveis:

#### Navegação:
- `G → D` - Ir para Dashboard
- `G → P` - Ir para Marketplaces (Products)
- `G → A` - Ir para Analytics
- `G → C` - Ir para Calculadora

*Como usar: Pressione `G`, depois a letra desejada*

#### Visualização:
- `Ctrl + D` - Alternar tema escuro/claro

#### Geral:
- `Ctrl + /` - Mostrar todos os atalhos
- `Ctrl + Shift + T` - Iniciar tour guiado da página atual
- `Ctrl + K` - Busca global *(em breve)*

---

## Recursos Implementados ✅

### ✨ Completo:
- [x] Dark Mode com 3 opções (light/dark/system)
- [x] Tour guiado com navegação por teclado
- [x] Sistema de atalhos de teclado
- [x] Modal de ajuda de atalhos
- [x] ThemeToggle no Header
- [x] TourButton em páginas relevantes
- [x] Data-tour attributes em componentes principais
- [x] Providers integrados no App
- [x] Persistência de preferências no localStorage

### 🚧 Em Progresso:
- [ ] Mais tours para outras páginas
- [ ] Busca global (Ctrl+K)
- [ ] Atalho para toggle sidebar (Ctrl+B)
- [ ] Mais data-tour attributes

---

## Para Desenvolvedores 👨‍💻

### Criar Novo Tour:

1. **Defina o tour em `src/components/tour/tours.ts`:**
```typescript
{
  id: 'meu-tour',
  name: 'Meu Tour',
  steps: [
    {
      target: '[data-tour="elemento-1"]',
      title: 'Título do Passo',
      content: 'Descrição do que fazer',
      placement: 'bottom'
    }
  ]
}
```

2. **Adicione data-tour nos elementos:**
```tsx
<div data-tour="elemento-1">
  Seu conteúdo aqui
</div>
```

3. **Adicione botão para iniciar:**
```tsx
import { TourButton } from '@/components/tour';

<TourButton tourId="meu-tour" label="Ver Tour" />
```

### Registrar Novo Atalho:

```tsx
import { useRegisterShortcut } from '@/components/keyboard';

useRegisterShortcut({
  id: 'minha-acao',
  key: 's',
  ctrl: true,
  description: 'Salvar documento',
  category: 'actions',
  action: () => {
    // Sua lógica aqui
  }
});
```

### Categorias de Atalhos:
- `navigation` - Navegação entre páginas
- `actions` - Ações como salvar, exportar
- `view` - Mudanças de visualização
- `general` - Atalhos gerais

---

## Troubleshooting 🔧

### Tour não aparece?
- Verifique se o `data-tour` está correto
- Confirme que o elemento está visível na página
- Limpe o localStorage: `localStorage.removeItem('azuria-completed-tours')`

### Atalho não funciona?
- Abra o modal com `Ctrl + /` para ver atalhos registrados
- Verifique conflitos com atalhos do navegador
- Confirme que o componente com `useRegisterShortcut` está montado

### Dark mode não persiste?
- Verifique o localStorage: `localStorage.getItem('azuria-theme')`
- Limpe e recarregue: `localStorage.removeItem('azuria-theme')`

---

## Próximos Passos 🚀

1. Adicionar mais tours para outras páginas
2. Implementar busca global (Ctrl+K)
3. Criar tour para Product Management
4. Criar tour para Analytics
5. Adicionar atalho para toggle sidebar
6. Criar configurações personalizáveis de atalhos
7. Adicionar animações no dark mode transition

---

**Versão:** 1.0.0  
**Última Atualização:** Novembro 2025  
**Status:** ✅ Core Completo - Pronto para Uso
