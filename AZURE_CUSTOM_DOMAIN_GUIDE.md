# 🎯 Próximos Passos - Adicionar Custom Domain no Azure

**Data**: 1 de Outubro de 2025  
**Status**: ✅ DNS configurado no registro.br, aguardando propagação

---

## ✅ O Que Já Foi Feito

1. ✅ **Registro A criado**: `azuria.app.br → 20.36.155.201`
2. ✅ **Registro CNAME criado**: `www.azuria.app.br → blue-tree-0b17b720f.2.azurestaticapps.net`
3. ✅ **www.azuria.app.br adicionado no Azure**: Status Ready ✅
4. ✅ **Alterações salvas no registro.br**: "Zona DNS atualizada com sucesso!"

---

## ⏳ Situação Atual

### DNS Propagando
- 🔄 **Registro A**: Propagando (pode levar 30min - 2h)
- ✅ **Registro CNAME**: Já funcionando
- ⏳ **Azure validation**: Aguardando DNS propagar

### Mensagem do registro.br
> "No momento, os servidores DNS do domínio se encontram em transição. Servidores DNS externos poderão ser delegados em seu domínio em aproximadamente 1h39m15s"

**Isso é normal!** É apenas o período de carência do modo avançado.

---

## 🚀 Próximo Passo: Adicionar azuria.app.br no Azure

### Quando Fazer?
**Aguarde 30 minutos a 2 horas** após salvar as alterações no registro.br.

### Como Verificar se Está Pronto?

Execute este comando no PowerShell:
```powershell
nslookup azuria.app.br
```

**Quando mostrar** `20.36.155.201`, está pronto! ✅

---

## 📝 Guia Passo a Passo - Azure Portal

### Passo 1: Acessar Azure Portal

1. Abra: https://portal.azure.com
2. Login com: **azuria.labs@gmail.com**

### Passo 2: Ir para Static Web Apps

1. Na barra de busca (topo), digite: **"Static Web Apps"**
2. Clique em **"Static Web Apps"** nos resultados
3. Na lista, clique em: **swa-jxbkuxsj7yfpo**

### Passo 3: Adicionar Custom Domain

1. No menu lateral esquerdo, clique em **"Custom domains"**
2. Você verá que **www.azuria.app.br** já está lá com status **Ready** ✅
3. Clique no botão **"+ Add"** (no topo)

### Passo 4: Configurar o Domínio

Na janela que abrir:

```
Domain name: azuria.app.br
```

**Importante**: Digite SEM "www", apenas `azuria.app.br`

Clique em **"Next"**

### Passo 5: Escolher Método de Validação

Selecione: **"TXT record"** (recomendado)

Clique em **"Generate code"**

### Passo 6: Copiar Código de Validação

O Azure vai mostrar algo como:

```
Record type: TXT
Host name: _dnsauth.azuria.app.br (ou _dnsauth)
Value: [um código longo tipo: 1234567890abcdef...]
```

**COPIE** o valor mostrado (o código longo)

### Passo 7: Adicionar TXT Record no registro.br

1. **Volte ao registro.br**: https://registro.br/painel
2. **Vá em**: azuria.app.br → DNS → Configurar zona DNS → **Nova entrada**
3. **Preencha**:
   ```
   Tipo: TXT
   Nome: _dnsauth (ou _dnsauth.azuria.app.br)
   Dados: [COLE o código que copiou do Azure]
   ```
4. Clique em **"ADICIONAR"**
5. Clique em **"SALVAR ALTERAÇÕES"**

### Passo 8: Validar no Azure

1. **Volte ao Azure Portal**
2. **Aguarde 5-10 minutos** (para o TXT propagar)
3. Clique em **"Validate"** (ou "Validate and add")
4. Se der erro, aguarde mais 10 minutos e tente novamente

### Passo 9: Aguardar Status "Ready"

- Azure vai validar o domínio
- Status mudará de "Validating" para **"Ready"** ✅
- Isso pode levar de **5 minutos a 1 hora**

---

## 🔐 SSL Certificate (Automático)

### Após o Status "Ready"

O Azure vai automaticamente:
1. ✅ Provisionar certificado SSL (Let's Encrypt)
2. ✅ Configurar HTTPS
3. ✅ Redirecionar HTTP → HTTPS
4. ✅ Renovar certificado a cada 90 dias

### Tempo de Provisionamento SSL
- **Mínimo**: 10 minutos
- **Típico**: 2-4 horas
- **Máximo**: 48 horas

---

## 🔍 Como Monitorar o Progresso

### Via PowerShell

```powershell
# 1. Verificar DNS propagou
nslookup azuria.app.br
# Deve mostrar: 20.36.155.201

# 2. Verificar TXT record
nslookup -type=TXT _dnsauth.azuria.app.br

# 3. Verificar custom domains no Azure
az staticwebapp hostname list `
  --name "swa-jxbkuxsj7yfpo" `
  --resource-group "Azuria-Resources" `
  --output table

# 4. Limpar cache DNS (se necessário)
ipconfig /flushdns
```

### Via Azure Portal

1. Azure Portal → Static Web Apps → swa-jxbkuxsj7yfpo
2. Custom domains → Verificar status de `azuria.app.br`
3. Status possíveis:
   - ⏳ **Validating** → Em processo
   - ❌ **Failed** → Erro (verificar DNS)
   - ✅ **Ready** → Funcionando!

### Via Navegador (após SSL)

- Teste: https://azuria.app.br
- Teste: https://www.azuria.app.br
- Verificar: Certificado SSL válido (cadeado verde)

---

## ⏱️ Timeline Completa

| Tempo | Ação | Status | Quem Faz |
|-------|------|--------|----------|
| **Agora** | DNS propagando | 🔄 | Automático |
| **30min-2h** | DNS propagado | ⏳ | Aguardar |
| **Após DNS** | Adicionar no Azure Portal | 📝 | **Você** |
| **+5-10min** | Adicionar TXT no registro.br | 📝 | **Você** |
| **+5-60min** | Azure valida domínio | 🔄 | Automático |
| **+10min-48h** | SSL provisiona | 🔄 | Automático |
| **Final** | TUDO FUNCIONANDO | ✅ | Pronto! |

---

## 📋 Checklist Detalhado

### Agora (Completo) ✅
- [x] Registro A adicionado no registro.br
- [x] Registro CNAME adicionado no registro.br
- [x] Alterações salvas ("Zona DNS atualizada com sucesso!")
- [x] www.azuria.app.br funcionando no Azure

### Aguardar (30min - 2h) ⏳
- [ ] DNS do registro A propagar
- [ ] Verificar: `nslookup azuria.app.br` → `20.36.155.201`

### Azure Portal (Você Faz) 📝
- [ ] Acessar Azure Portal
- [ ] Ir em Static Web Apps → swa-jxbkuxsj7yfpo
- [ ] Custom domains → + Add
- [ ] Adicionar: azuria.app.br
- [ ] Escolher validação: TXT record
- [ ] Gerar código de validação

### registro.br (Você Faz) 📝
- [ ] Adicionar TXT record:
  - Tipo: TXT
  - Nome: _dnsauth
  - Dados: [código do Azure]
- [ ] Salvar alterações

### Validação (Automático) 🔄
- [ ] Azure valida domínio (5-60min)
- [ ] Status muda para "Ready"
- [ ] SSL provisiona (10min-48h)

### Teste Final (Verificar) ✅
- [ ] https://azuria.app.br funciona
- [ ] https://www.azuria.app.br funciona
- [ ] Certificado SSL válido
- [ ] HTTP redireciona para HTTPS

---

## 🆘 Troubleshooting

### "DNS não propaga"
```powershell
# Limpar cache
ipconfig /flushdns

# Testar com DNS público
nslookup azuria.app.br 8.8.8.8

# Verificar online
# Acesse: https://dnschecker.org
# Digite: azuria.app.br
# Tipo: A
```

**Solução**: Aguardar mais tempo (pode levar até 24h em casos raros)

### "Azure não valida domínio"
**Causas possíveis**:
1. DNS ainda não propagou → Aguardar mais
2. TXT record incorreto → Verificar valor copiado
3. TXT não propagou → Aguardar 10-30 minutos

**Solução**: 
```powershell
# Verificar TXT
nslookup -type=TXT _dnsauth.azuria.app.br
```

### "SSL não provisiona"
**Causas possíveis**:
1. Domínio não validado → Verificar status "Ready"
2. Aguardar mais tempo → Pode levar até 48h

**Solução**: Verificar no Azure Portal se status é "Ready"

### "Erro CNAME Record is invalid"
**Causa**: DNS ainda não propagou

**Solução**: 
1. Aguardar 30 minutos
2. Verificar: `nslookup azuria.app.br`
3. Tentar novamente

---

## 💡 Dicas Importantes

### 1. Paciência é Fundamental
- DNS pode levar até 24h para propagar globalmente
- SSL pode levar até 48h para provisionar
- **Não se preocupe!** É normal e esperado

### 2. Não Faça Múltiplas Tentativas Rápidas
- Se der erro ao adicionar no Azure, aguarde 30min
- Múltiplas tentativas não aceleram o processo
- Aguarde a propagação DNS completa

### 3. Verifique Cada Passo
- Use `nslookup` para confirmar DNS
- Verifique Azure Portal para status
- Aguarde mensagens de confirmação

### 4. TXT Record é Crítico
- Copie o código EXATAMENTE como aparece
- Não adicione espaços ou quebras de linha
- Verifique que salvou no registro.br

---

## 📞 Comandos Úteis de Referência

```powershell
# Verificar DNS A record
nslookup azuria.app.br

# Verificar DNS CNAME
nslookup www.azuria.app.br

# Verificar TXT record
nslookup -type=TXT _dnsauth.azuria.app.br

# Verificar com DNS público
nslookup azuria.app.br 8.8.8.8

# Limpar cache DNS
ipconfig /flushdns

# Listar custom domains no Azure
az staticwebapp hostname list `
  --name "swa-jxbkuxsj7yfpo" `
  --resource-group "Azuria-Resources" `
  --output table

# Verificar static web app
az staticwebapp show `
  --name "swa-jxbkuxsj7yfpo" `
  --resource-group "Azuria-Resources"
```

---

## 🎯 Resumo do Seu Próximo Passo

### AGORA:
⏳ **Aguardar 30 minutos a 2 horas** para DNS propagar

### DEPOIS:
1. Verificar DNS: `nslookup azuria.app.br`
2. Se mostrar `20.36.155.201` → **Seguir guia acima** para adicionar no Azure Portal
3. Adicionar TXT record no registro.br
4. Aguardar validação e SSL

---

## 🎉 Resultado Final Esperado

Após completar todos os passos:

```
✅ https://azuria.app.br → Seu site
✅ https://www.azuria.app.br → Seu site
✅ Certificado SSL válido
✅ HTTP redireciona para HTTPS
✅ Renovação SSL automática
✅ Tudo gerenciado pelo Azure
```

---

**Me chame quando o DNS propagar (30min-2h) e eu te ajudo com o Azure Portal!** 🚀

Ou se preferir, pode seguir este guia sozinho. Está tudo explicado passo a passo! 😊

---

*Criado em: 1 de Outubro de 2025, 20:15 UTC*  
*Próxima verificação: Após 30 minutos (DNS propagação)*
