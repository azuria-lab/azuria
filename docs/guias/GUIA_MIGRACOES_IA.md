# 🚀 Guia Rápido: Aplicar Tabelas de IA no Supabase

## ✅ Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login
- Selecione o projeto **Azuria** (crpzkppsriranmeumfqs)

### 2. Abra o SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor**
- Clique em **New Query** (botão verde no canto superior direito)

### 3. Cole o Script
- Abra o arquivo `APLICAR_MIGRACOES_IA.sql` na raiz do projeto
- Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
- Cole no SQL Editor do Supabase (Ctrl+V)

### 4. Execute o Script
- Clique no botão **Run** (ou pressione Ctrl+Enter)
- Aguarde alguns segundos enquanto o script executa
- Você verá uma mensagem de sucesso no canto inferior

### 5. Verifique se funcionou
- No menu lateral, clique em **Table Editor**
- Você deve ver as novas tabelas:
  - ✓ `user_suggestions`
  - ✓ `suggestion_feedback`
  - ✓ `user_copilot_preferences`
  - ✓ `user_behavior_patterns`
  - ✓ `user_skill_metrics`
  - ✓ `user_tutorial_progress`
  - ✓ `user_achievements`
  - ✓ `user_personalization`

### 6. Recarregue a Aplicação
- Volte para o localhost:8080
- Faça logout e login novamente
- Os erros 406 devem ter sumido! 🎉

## 🔍 Como Verificar se Já Rodou Antes

Se você já rodou essas migrações antes, não tem problema! O script usa `CREATE TABLE IF NOT EXISTS`, então:
- ✅ Se a tabela NÃO existe: será criada
- ✅ Se a tabela JÁ existe: será ignorada (sem erro)

## ❓ Problemas Comuns

### Erro de Permissão
Se aparecer erro de permissão, verifique:
1. Você está logado na conta correta do Supabase
2. Você tem permissão de administrador no projeto

### Tabelas Aparecem mas Continuam os Erros 406
Tente:
1. Fazer logout da aplicação
2. Limpar o cache do navegador (Ctrl+Shift+Delete)
3. Fechar e reabrir o navegador
4. Fazer login novamente

## 📊 O Que Essas Tabelas Fazem?

### Co-Piloto (Sugestões Inteligentes)
- `user_suggestions`: Armazena sugestões do Co-Piloto
- `suggestion_feedback`: Feedback do usuário sobre sugestões
- `user_copilot_preferences`: Preferências do Co-Piloto

### Aprendizado de Padrões
- `user_behavior_patterns`: Padrões de uso detectados
- `user_skill_metrics`: Métricas de habilidade do usuário

### Tutoriais e Conquistas
- `user_tutorial_progress`: Progresso em tutoriais
- `user_achievements`: Conquistas desbloqueadas

### Personalização
- `user_personalization`: Perfil de personalização do usuário

---

**Dúvidas?** Me chame que eu te ajudo! 💬
