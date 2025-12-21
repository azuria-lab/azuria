# Security Policy

Este software é proprietário. Relatos de vulnerabilidades devem ser feitos de forma privada.

## ⚠️ Incidente de Segurança - 2024-12-21

Este projeto passou por remediação de segurança após exposição acidental de API keys.

### Ações Realizadas
- ✅ Todas as chaves foram rotacionadas
- ✅ Histórico Git foi reescrito (arquivos .env removidos)
- ✅ Código frontend limpo de `VITE_*_API_KEY`
- ✅ Chamadas de IA migradas para Edge Functions

---

## 🚫 Regras para Desenvolvedores e Agentes de IA

### NUNCA FAZER
- ❌ Criar ou editar arquivos `.env` diretamente
- ❌ Commitar segredos, API keys ou tokens
- ❌ Usar prefixo `VITE_` para chaves de API sensíveis
- ❌ Expor API keys no código frontend
- ❌ Logar API keys ou tokens

### SEMPRE FAZER
- ✅ Usar `.env.example` apenas como template
- ✅ Armazenar segredos em Supabase Dashboard → Settings → Secrets
- ✅ Chamar serviços de IA via Edge Functions (ex: `azuria-chat`)
- ✅ Usar `Deno.env.get()` em Edge Functions para segredos

---

## Variáveis de Ambiente

### Frontend (Seguro)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (chave pública)
```

### Backend ONLY (NUNCA no Frontend)
```
GEMINI_API_KEY=AIza... (NUNCA expor!)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (NUNCA expor!)
```

---

## Reporte de Vulnerabilidade

- Envie via [GitHub Security Advisories](https://docs.github.com/code-security/security-advisories)
- Responderemos em até 72 horas úteis
- Não publique detalhes técnicos antes de correção
