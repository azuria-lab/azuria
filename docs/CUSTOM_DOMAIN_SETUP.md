# Configuração DNS para azuria.app.br

## 🌐 Domínio Personalizado Azure Static Web Apps

O domínio **azuria.app.br** foi registrado no registro.br e precisa ser configurado para apontar para o Azure Static Web Apps.

### 📋 Informações Atuais

- **Domínio**: azuria.app.br
- **Registrar**: registro.br
- **Azure Static Web App**: swa-jxbkuxsj7yfpo
- **URL Padrão Azure**: https://blue-tree-0b17b720f.2.azurestaticapps.net/

### 🔧 Configuração DNS no registro.br

#### Passo 1: Acessar o painel DNS
1. Acesse: https://registro.br
2. Faça login com suas credenciais
3. Navegue até "Meus Domínios"
4. Selecione "azuria.app.br"
5. Clique em "DNS" ou "Gerenciar DNS"

#### Passo 2: Configurar registros CNAME
Adicione os seguintes registros DNS:

```dns
# Registro principal (www)
Tipo: CNAME
Nome: www
Valor: blue-tree-0b17b720f.2.azurestaticapps.net

# Registro raiz (apex domain)
Tipo: CNAME  
Nome: @
Valor: blue-tree-0b17b720f.2.azurestaticapps.net
```

**Nota**: Alguns provedores DNS não permitem CNAME no apex domain (@). Neste caso, use:
```dns
# Alternativa para apex domain
Tipo: A
Nome: @
Valor: [IP do Azure Static Web Apps - será fornecido pelo Azure]
```

### 🚀 Script de Configuração Automática

Execute o script PowerShell para configurar o domínio no Azure:

```powershell
# Configurar domínio personalizado
.\scripts\configure-custom-domain.ps1 -ResourceGroupName "Azuria-Resources" -StaticWebAppName "swa-jxbkuxsj7yfpo"
```

### ✅ Verificação da Configuração

#### Verificar DNS (após propagação - 24-48h):
```bash
# Verificar CNAME
nslookup azuria.app.br

# Verificar HTTPS
curl -I https://azuria.app.br
```

#### Status no Azure Portal:
1. Azure Portal → Static Web Apps → swa-jxbkuxsj7yfpo
2. Custom domains → Verificar status do domínio
3. SSL certificate → Aguardar provisionamento automático

### 🔒 Certificado SSL

- **Provisionamento**: Automático via Azure
- **Tipo**: Let's Encrypt (renovação automática)
- **Tempo**: 24-48 horas após validação DNS
- **Status**: Verificar no Azure Portal

### 📊 Monitoramento

Após configuração, os seguintes URLs estarão disponíveis:

- **Produção**: https://azuria.app.br
- **Staging**: https://blue-tree-0b17b720f-[branch].2.azurestaticapps.net/
- **Default**: https://blue-tree-0b17b720f.2.azurestaticapps.net/

### 🚨 Troubleshooting

#### DNS não propaga:
```bash
# Verificar servidores DNS
dig NS azuria.app.br

# Flush DNS local
ipconfig /flushdns
```

#### SSL não provisiona:
1. Verificar validação DNS completa
2. Aguardar até 48 horas
3. Verificar logs no Azure Portal
4. Contatar suporte Azure se necessário

### 📝 Checklist de Configuração

- [ ] Domínio registrado no registro.br ✅
- [ ] DNS configurado (CNAME para Azure SWA)
- [ ] Domínio adicionado no Azure Static Web Apps
- [ ] Validação DNS completa
- [ ] Certificado SSL provisionado
- [ ] Testes de conectividade realizados
- [ ] Monitoramento configurado

### 🎯 Próximos Passos

1. **Configurar DNS**: Adicionar registros CNAME no registro.br
2. **Executar Script**: Configurar domínio no Azure
3. **Aguardar Propagação**: DNS pode levar até 48h
4. **Verificar SSL**: Certificado automático do Azure
5. **Atualizar Links**: Usar azuria.app.br em toda aplicação