# 🚀 Guia: Como Executar a Migração do Bucket de Avatars

## Método 1: Via Dashboard do Supabase (Recomendado) ✅

### Passo a Passo:

1. **Acesse o SQL Editor do Supabase:**
   - Abra: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
   - Ou navegue: Dashboard → Seu Projeto → SQL Editor

2. **Cole o SQL:**
   - Abra o arquivo: `supabase/migrations/002_create_avatars_bucket.sql`
   - Copie todo o conteúdo do arquivo
   - Cole no editor SQL do Supabase

3. **Execute:**
   - Clique no botão "Run" (Executar)
   - Aguarde a confirmação de sucesso

4. **Verifique:**
   - Vá em: Storage → Buckets
   - Você deve ver um bucket chamado "avatars"

---

## Método 2: Via Script Node.js (Alternativo)

Se preferir executar via script:

1. **Obtenha a Service Role Key:**
   ```
   1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/api
   2. Copie a "service_role" key (⚠️ NUNCA compartilhe esta chave!)
   ```

2. **Adicione ao .env.local:**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   ```

3. **Execute o script:**
   ```bash
   node scripts/run-avatar-migration.mjs
   ```

---

## ✅ Como Verificar se Funcionou

Após executar a migração:

1. **No Dashboard do Supabase:**
   - Storage → Buckets → Você deve ver "avatars"
   - Clique em "avatars" → Policies → Deve ter 4 policies configuradas

2. **No seu App:**
   - Faça login
   - Vá em Configurações → Perfil
   - Clique no avatar
   - Selecione uma imagem
   - Deve fazer upload com sucesso

---

## 📦 O que esta migração cria?

### Bucket de Storage:
- **Nome**: `avatars`
- **Acesso**: Público (qualquer um pode visualizar)
- **Limite**: 5MB por arquivo
- **Tipos permitidos**: JPEG, JPG, PNG, GIF, WebP

### Políticas de Segurança (RLS):
1. ✅ Usuários autenticados podem fazer **upload**
2. ✅ Todos podem **visualizar** avatares
3. ✅ Usuários autenticados podem **atualizar** avatares
4. ✅ Usuários autenticados podem **deletar** avatares

---

## 🆘 Problemas Comuns

### "Bucket already exists"
- ✅ Não é erro! O bucket já foi criado anteriormente
- O script usa `ON CONFLICT DO NOTHING` para evitar erros

### "Policy already exists"
- ✅ Normal! O script remove as policies antigas antes de criar novas
- Se der erro, delete manualmente as policies antigas no Dashboard

### Erro de permissão
- ⚠️ Certifique-se de estar usando a **service_role key**, não a anon key
- Ou execute diretamente no SQL Editor do Dashboard (método recomendado)

---

## 📝 Próximos Passos

Após executar a migração:

1. ✅ Teste o upload de avatar nas Configurações
2. ✅ Verifique se a imagem aparece no avatar do menu
3. ✅ Teste atualizar a foto de perfil
4. ✅ Confira se as imagens ficam públicas (acessíveis via URL)

---

## 🔗 Links Úteis

- **SQL Editor**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql
- **Storage Dashboard**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/storage/buckets
- **API Settings**: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/settings/api
- **Docs Storage**: https://supabase.com/docs/guides/storage
