# 🔧 Guia de Configuração do .env

## Como Obter as Credenciais do Supabase

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto **Azuria**

2. **Obter as Credenciais:**
   - No menu lateral, clique em **Settings** (⚙️)
   - Clique em **API**
   - Você verá duas informações importantes:
     - **Project URL** (URL do projeto)
     - **anon public** (Chave pública/anon key)

3. **Criar o arquivo .env:**

Na raiz do projeto `c:\Rômulo\Projetos\azuria`, crie um arquivo chamado `.env` com o seguinte conteúdo:

```env
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://crpzkppsriranmeumfqs.supabase.co

# Chave pública (anon key) do Supabase
# Obtenha em: Dashboard > Settings > API > Project API keys > anon public
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# ===========================================
# MERCADO PAGO CONFIGURATION (OPCIONAL)
# ===========================================
# Comece com credenciais de TEST primeiro!
# Obtenha em: https://www.mercadopago.com.br/developers/panel/app

# Chave pública TEST (começa com TEST-)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica-aqui

# Access token TEST (começa com TEST-)
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui

# ===========================================
# ENVIRONMENT
# ===========================================
NODE_ENV=development
```

## ⚠️ Importante

1. **NÃO commite o arquivo .env no Git!**
   - O `.env` já está no `.gitignore`
   - Nunca compartilhe suas chaves em repositórios públicos

2. **Use credenciais TEST primeiro:**
   - Sempre comece com chaves TEST do Mercado Pago
   - Migre para PRODUCTION somente após validação completa

3. **Validar arquivo .env:**
   - Certifique-se de que o arquivo está na **raiz do projeto**
   - Não deixe espaços antes ou depois do `=`
   - Não use aspas nas variáveis

## ✅ Como Testar se Está Funcionando

Após criar o `.env`, execute:

```powershell
# Reiniciar o servidor de desenvolvimento
npm run dev
```

A aplicação deve:
- ✅ Conectar ao Supabase automaticamente
- ✅ Permitir signup/login de usuários
- ✅ Salvar dados no banco de dados

## 🔍 Verificar Conexão

No console do navegador (F12), você deve ver:
- Supabase client inicializado
- Nenhum erro de conexão

## 📞 Problemas Comuns

### Erro: "supabaseUrl is required"
**Solução:** Verifique se `VITE_SUPABASE_URL` está definido no `.env`

### Erro: "supabaseAnonKey is required"
**Solução:** Verifique se `VITE_SUPABASE_ANON_KEY` está definido no `.env`

### Erro: "Invalid API key"
**Solução:** Copie novamente a chave do Dashboard do Supabase

### Variáveis não carregam
**Solução:** 
1. Certifique-se de que o `.env` está na raiz do projeto
2. Reinicie o servidor (`npm run dev`)
3. Variáveis devem começar com `VITE_` para serem expostas no front-end

## 📚 Referências

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Setup do Mercado Pago](./MERCADOPAGO_SETUP_GUIDE.md)
- [Variáveis de Ambiente no Vite](https://vitejs.dev/guide/env-and-mode.html)
