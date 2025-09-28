# 🔍 Monitor DNS Simples - azuria.app.br

## Status Atual (27/09/2025)
- ✅ DNS configurado no registro.br
- ⏳ Propagação em andamento
- 🎯 Aguardando: CNAME para `blue-tree-0b17b720f.2.azurestaticapps.net`

## 🧪 Teste Rápido

Execute este comando para verificar o status:

```powershell
nslookup azuria.app.br 8.8.8.8
```

## 📊 Status Esperado

### ⏳ **Ainda Propagando (Estado Atual)**
```
Nome:    azuria.app.br
Address: [IP direto ou sem CNAME]
```

### ✅ **Propagação Completa (Objetivo)**
```
azuria.app.br   canonical name = blue-tree-0b17b720f.2.azurestaticapps.net
blue-tree-0b17b720f.2.azurestaticapps.net   internet address = [IP do Azure]
```

## 🚀 Próximo Passo (Após Propagação)

Quando o DNS mostrar o CNAME correto, execute:

```bash
az staticwebapp hostname set --name "swa-jxbkuxsj7yfpo" --resource-group "Azuria-Resources" --hostname "azuria.app.br" --validation-method "cname-delegation"
```

## ⏰ Timeline
- **Agora**: DNS configurado, propagação iniciada
- **1-6 horas**: Propagação parcial
- **6-24 horas**: Propagação completa
- **Após propagação**: Configurar no Azure SWA

---
**Teste periodicamente com o comando acima e me avise quando o CNAME aparecer!** 🎯