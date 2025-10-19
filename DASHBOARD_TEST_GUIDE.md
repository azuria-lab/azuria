# 📋 Guia de Testes - Dashboard & Settings

> **Status**: Pronto para testes após correções TypeScript  
> **Data**: 18 de Outubro de 2025  
> **Versão**: 1.0

---

## 🎯 O Que Foi Implementado

### 1. **Enhanced UserProfileButton** ✨
Botão de perfil melhorado no header com:
- Avatar maior (36x36px) com anel colorido
- Nome do usuário exibido ao lado do avatar (desktop)
- Badge PRO com ícone de coroa (quando aplicável)
- Dropdown menu expandido e organizado

### 2. **SettingsPage Integrada** ⚙️
Página de configurações com:
- Integração real com Supabase Auth
- Atualização de perfil (nome, telefone, empresa)
- Tabs organizadas (Perfil, Notificações, Segurança, Assinatura, Empresa)
- Redirecionamento automático se não logado

### 3. **Header Condicional** 🎨
O header já estava correto:
- Mostra UserProfileButton quando logado
- Mostra botões "Entrar/Cadastro Grátis" quando deslogado

---

## ✅ Checklist de Testes

### 📍 **TESTE 1: Verificar Header (Deslogado)**
**Objetivo**: Confirmar que usuários deslogados veem os botões de login/registro

**Passos**:
1. Abrir http://localhost:8080 (ou qualquer página)
2. Garantir que está deslogado (se não, fazer logout)

**Resultado Esperado**:
- ✅ Deve ver botões "Entrar" e "Cadastro Grátis" no canto superior direito
- ✅ **NÃO** deve ver avatar/nome de usuário

**Screenshot esperado**:
```
┌─────────────────────────────────────────────┐
│ AZURIA   [Início] [Sobre]    [Entrar] [📝] │
└─────────────────────────────────────────────┘
```

---

### 📍 **TESTE 2: Login e Verificar UserProfileButton**
**Objetivo**: Confirmar que após login, o header mostra o perfil do usuário

**Passos**:
1. Clicar em "Entrar"
2. Fazer login com suas credenciais
3. Observar o canto superior direito do header

**Resultado Esperado**:
- ✅ Avatar circular com suas iniciais (ou foto se tiver)
- ✅ Nome do usuário ao lado do avatar (desktop)
- ✅ Badge PRO com coroa (se for usuário PRO)
- ✅ **NÃO** deve mais ver "Entrar/Cadastro Grátis"

**Screenshot esperado (usuário PRO)**:
```
┌─────────────────────────────────────────────┐
│ AZURIA   [Início] [Dashboard]  [👤 João ⚡] │
│                                    PRO      │
└─────────────────────────────────────────────┘
```

**Screenshot esperado (usuário FREE)**:
```
┌─────────────────────────────────────────────┐
│ AZURIA   [Início] [Dashboard]     [👤 Maria]│
└─────────────────────────────────────────────┘
```

---

### 📍 **TESTE 3: Explorar Dropdown do Perfil**
**Objetivo**: Testar todas as opções do menu dropdown

**Passos**:
1. Clicar no avatar/nome no header
2. Observar o menu que aparece

**Resultado Esperado**:

**Seção 1 - Informações do Perfil**:
- ✅ Nome completo em negrito
- ✅ Email abaixo do nome (cinza claro)
- ✅ Badge "Plano PRO Ativo" em dourado (se PRO)

**Seção 2 - Ações Rápidas** (ícones em azul):
- ✅ 📊 Dashboard
- ✅ 🧮 Calculadora
- ✅ 📜 Histórico

**Seção 3 - Configurações** (ícones cinza):
- ✅ 👤 Meu Perfil
- ✅ ⚙️ Configurações

**Seção 4 - Upgrade** (só para usuários FREE):
- ✅ ✨ Upgrade para PRO (fundo amarelo claro)

**Seção 5 - Sair**:
- ✅ 🚪 Sair (texto vermelho)

**Screenshot esperado do dropdown**:
```
┌──────────────────────────┐
│ João Silva               │
│ joao@exemplo.com         │
│ [PRO] Plano PRO Ativo    │
├──────────────────────────┤
│ 📊 Dashboard             │
│ 🧮 Calculadora           │
│ 📜 Histórico             │
├──────────────────────────┤
│ 👤 Meu Perfil            │
│ ⚙️ Configurações         │
├──────────────────────────┤
│ ✨ Upgrade para PRO      │ (só se não for PRO)
├──────────────────────────┤
│ 🚪 Sair                  │
└──────────────────────────┘
```

---

### 📍 **TESTE 4: Navegação - Dashboard**
**Objetivo**: Verificar link do Dashboard no dropdown

**Passos**:
1. Clicar no avatar → "Dashboard"
2. Observar a URL e conteúdo da página

**Resultado Esperado**:
- ✅ URL: http://localhost:8080/dashboard
- ✅ Página do dashboard carrega com stats, gráficos, dicas
- ✅ Mensagem de boas-vindas: "Olá, [Seu Nome]! 👋"

---

### 📍 **TESTE 5: Navegação - Configurações**
**Objetivo**: Acessar a página de configurações

**Passos**:
1. Clicar no avatar → "Configurações"
2. Observar a URL e layout da página

**Resultado Esperado**:
- ✅ URL: http://localhost:8080/configuracoes
- ✅ Título: "Configurações"
- ✅ Subtítulo: "Gerencie sua conta Azuria+ e preferências do app."
- ✅ Tabs visíveis: Perfil, Notificações, Segurança, Assinatura

**Screenshot esperado**:
```
┌─────────────────────────────────────────────┐
│          Configurações                      │
│  Gerencie sua conta Azuria+ e preferências │
├─────────────────────────────────────────────┤
│ [Perfil] [🔔Notific.] [🔒Segur.] [💳Assin.] │
├─────────────────────────────────────────────┤
│                                             │
│  Informações do Perfil                      │
│  ┌─────────────────────────┐               │
│  │ Nome: [João Silva    ]  │               │
│  │ Email: joao@exemplo.com │ (readonly)    │
│  │ [Atualizar Perfil]      │               │
│  └─────────────────────────┘               │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 📍 **TESTE 6: Editar Perfil nas Configurações**
**Objetivo**: Atualizar nome do usuário

**Passos**:
1. Em Configurações → Tab "Perfil"
2. Alterar o nome no campo "Nome"
3. Clicar em "Atualizar Perfil"
4. Observar feedback

**Resultado Esperado**:
- ✅ Toast verde: "Perfil atualizado com sucesso"
- ✅ Nome atualizado no campo
- ✅ (Opcional) Verificar se o nome no header também atualizou

**Possível Erro**:
- ❌ Se aparecer "Erro ao atualizar perfil", verificar:
  - Se está logado corretamente
  - Se a tabela `user_profiles` existe no Supabase
  - Console do navegador para detalhes do erro

---

### 📍 **TESTE 7: Logout**
**Objetivo**: Deslogar e verificar retorno ao estado inicial

**Passos**:
1. Clicar no avatar → "Sair"
2. Observar mudanças no header
3. Tentar acessar /dashboard ou /configuracoes

**Resultado Esperado**:
- ✅ Toast: "Logout realizado com sucesso"
- ✅ Header volta a mostrar "Entrar/Cadastro Grátis"
- ✅ Avatar/nome desaparece
- ✅ Ao tentar acessar /dashboard → redireciona para /entrar
- ✅ Ao tentar acessar /configuracoes → redireciona para /entrar

---

### 📍 **TESTE 8: Responsividade (Mobile)**
**Objetivo**: Verificar funcionamento em telas pequenas

**Passos**:
1. Abrir DevTools (F12)
2. Ativar modo mobile (Ctrl+Shift+M)
3. Escolher dispositivo: iPhone 12 Pro (390x844)
4. Fazer login
5. Observar o header

**Resultado Esperado**:
- ✅ Avatar visível (36x36px)
- ✅ Nome do usuário **oculto** (só no desktop)
- ✅ Badge PRO aparece como ícone pequeno no canto do avatar
- ✅ Dropdown abre normalmente ao clicar no avatar

---

### 📍 **TESTE 9: Dark Mode (Se Implementado)**
**Objetivo**: Verificar visual no modo escuro

**Passos**:
1. Ativar dark mode (se disponível)
2. Observar cores do UserProfileButton e dropdown

**Resultado Esperado**:
- ✅ Avatar com anel em tons escuros
- ✅ Dropdown com fundo escuro (dark:bg-gray-800)
- ✅ Textos legíveis em modo escuro
- ✅ Badge PRO em dourado ainda visível

---

## 🐛 Troubleshooting

### Problema 1: "Erro ao atualizar perfil"
**Causa**: Tabela `user_profiles` não sincronizada ou permissões RLS incorretas

**Solução**:
1. Verificar se os 3 SQLs foram aplicados corretamente
2. No Supabase Dashboard → Table Editor → verificar se `user_profiles` existe
3. Verificar RLS policies da tabela

### Problema 2: Avatar não aparece após login
**Causa**: Contexto de autenticação não está atualizando

**Solução**:
1. Verificar console do navegador (F12) para erros
2. Fazer hard refresh (Ctrl+Shift+R)
3. Limpar localStorage: `localStorage.clear()` no console
4. Fazer login novamente

### Problema 3: Nome não aparece no header (desktop)
**Causa**: CSS responsivo pode estar ocultando

**Solução**:
1. Inspecionar elemento (botão direito → Inspect)
2. Verificar classe: `hidden md:flex` deve estar presente
3. Garantir que a tela é ≥ 768px (breakpoint `md`)

### Problema 4: Dropdown não abre
**Causa**: JavaScript de shadcn/ui DropdownMenu não carregou

**Solução**:
1. Verificar console para erros de importação
2. Verificar se `@radix-ui/react-dropdown-menu` está instalado
3. Reiniciar dev server: `npm run dev`

### Problema 5: Erro 404 ao acessar /configuracoes
**Causa**: Rota não configurada ou servidor não reiniciado

**Solução**:
1. Verificar `src/App.tsx` → deve ter `<Route path="/configuracoes" element={<SettingsPage />} />`
2. Reiniciar servidor: `Ctrl+C` no terminal, depois `npm run dev`

---

## 📊 Status de Erros TypeScript

**Último type-check**: 79 erros encontrados

**Erros principais**:
1. ✅ **SettingsPage**: `@/shared/contexts/auth-context` → CORRIGIDO para `@/domains/auth/context/AuthContext`
2. ✅ **SettingsPage**: `phone` e `company` não existem em tipo → CORRIGIDO com type assertion
3. ⚠️ **useDashboardStats**: Novas tabelas não estão nos tipos do Supabase (precisa regenerar tipos)
4. ⚠️ **NotificationDropdown**: `is_read` vs `isRead` (snake_case vs camelCase)

**Próximos passos técnicos**:
1. Regenerar tipos do Supabase: `npm run generate:types` (se existir script)
2. Ou usar type assertions temporários para novas tabelas
3. Padronizar nomenclatura (snake_case do banco vs camelCase do TypeScript)

---

## 📝 Notas Importantes

### Sobre os Dados do Dashboard
- Os dados de estatísticas vêm da tabela `user_daily_stats`
- Atividades vêm de `user_activities`
- Notificações vêm de `user_notifications`
- **Se estiver vazio**: Fazer alguns cálculos para popular dados

### Sobre Permissões RLS
- Todas as tabelas do dashboard têm Row Level Security (RLS) ativo
- Apenas o usuário logado pode ver seus próprios dados
- Se der erro de permissão: verificar policies no Supabase

### Sobre Settings
- Email é **readonly** (não pode ser alterado diretamente)
- Para mudar email: implementar fluxo de verificação
- Senha só pode ser alterada com senha atual (segurança)

---

## ✅ Resumo Final

**Quando todos os testes passarem**:
- [x] Header condicional funcionando
- [x] UserProfileButton exibindo nome e avatar
- [x] Dropdown com todas as opções
- [x] Navegação para Dashboard e Configurações
- [x] Atualização de perfil salvando no banco
- [x] Logout funcionando corretamente
- [x] Responsividade mobile OK

**Status geral**: ✨ **Pronto para produção após testes!**

---

## 🚀 Próximos Passos (Após Validação)

1. **Implementar tema escuro** real (não só CSS, mas persistir escolha)
2. **Avatar upload** (integrar com Supabase Storage)
3. **Página "Meu Perfil"** separada com mais detalhes
4. **Notificações push** (implementar lógica real)
5. **Trocar senha** (integrar com Supabase Auth)
6. **Exportar dados** (GDPR compliance)
7. **Deletar conta** (com confirmação e limpeza de dados)

---

**Criado por**: GitHub Copilot  
**Para**: Projeto Azuria+ Pricing Calculator  
**Última atualização**: 2025-10-18
