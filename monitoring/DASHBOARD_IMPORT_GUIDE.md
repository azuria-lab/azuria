# 📊 Guia de Importação dos Dashboards de Produção

## 🎯 Visão Geral

Este guia contém instruções detalhadas para importar os dashboards de monitoramento da Azuria no Azure Portal.

### 📋 Dashboards Disponíveis

1. **🏠 Dashboard Principal** (`azuria-production-dashboard.json`)
   - KPIs principais, Core Web Vitals, conversões, erros
   - Análise geográfica e por dispositivos

2. **⚡ Dashboard de Performance** (`azuria-performance-dashboard.json`)
   - Core Web Vitals detalhados, tempos de resposta
   - Performance por páginas e dispositivos

3. **📈 Dashboard de Business Intelligence** (`azuria-business-dashboard.json`)
   - Métricas de negócio, receita potencial
   - Análise de coorte e funil de conversão

---

## 🚀 Importação via Azure Portal

### Passo 1: Acesse o Azure Portal

1. Abra o [Azure Portal](https://portal.azure.com)
2. Navegue para **Dashboard** no menu principal
3. Clique em **+ New dashboard** > **Upload**

### Passo 2: Configurar Resource Context

Antes de importar, configure o contexto do Application Insights:

```json
{
  "subscriptionId": "cdb292f9-b4c2-4513-ae78-de6238161d25", 
  "resourceGroupName": "Azuria-Resources",
  "resourceName": "ai-jxbkuxsj7yfpo"
}
```

### Passo 3: Importar Dashboard Principal

1. **Upload do arquivo**: `monitoring/dashboards/azuria-production-dashboard.json`
2. **Configurar nome**: "🏠 Azuria - Dashboard de Produção"
3. **Verificar tiles**: Confirme que todos os 11 tiles carregaram
4. **Salvar dashboard**

#### Tiles Esperados:
- ✅ Status Geral da Aplicação
- 📊 Core Web Vitals (LCP, FID, CLS)
- 👥 Usuários Ativos e Sessões
- 🔢 Uso da Calculadora
- 🌍 Distribuição Geográfica
- 📱 Breakdown por Dispositivos
- 🎯 Funil de Conversão
- ❌ Monitoramento de Erros
- 🔗 Performance das APIs
- ⚡ Tempo de Resposta
- 📈 Tendências de Tráfego

### Passo 4: Importar Dashboard de Performance

1. **Upload do arquivo**: `monitoring/dashboards/azuria-performance-dashboard.json`
2. **Configurar nome**: "⚡ Azuria - Performance & Core Web Vitals"
3. **Verificar tiles**: Confirme que todos os 9 tiles carregaram

#### Tiles Esperados:
- ⏱️ Core Web Vitals - Status
- 📊 LCP Distribution
- 🖱️ FID Analysis
- 📐 CLS Trends
- 🚀 API Performance
- 📄 Performance por Página
- 📱 Performance por Dispositivo
- 🔄 Browser Timings
- 🌐 Network Analysis

### Passo 5: Importar Dashboard de Business Intelligence

1. **Upload do arquivo**: `monitoring/dashboards/azuria-business-dashboard.json`
2. **Configurar nome**: "📈 Azuria - Business Intelligence"
3. **Verificar tiles**: Confirme que todos os 10 tiles carregaram

#### Tiles Esperados:
- 💰 Receita Potencial
- 👥 Análise de Coorte
- 📊 Adoção de Features
- 🎯 Funil de Conversão Completo
- 🏪 Performance do Marketplace
- 📱 Engajamento por Dispositivo
- 🌍 Análise Geográfica de Receita
- ⭐ Satisfação do Usuário
- 🔄 Retenção de Usuários
- 📈 Crescimento Mensal

---

## 🔧 Configuração Avançada

### Refresh Intervals Recomendados

```json
{
  "production_dashboard": "5 minutos",
  "performance_dashboard": "1 minuto", 
  "business_dashboard": "15 minutos"
}
```

### Filtros Globais

Configure filtros globais para cada dashboard:

1. **Time Range**: Últimas 24 horas (padrão)
2. **Environment**: Production
3. **Application**: ai-jxbkuxsj7yfpo

### Alertas Integrados

Os dashboards incluem links para alertas configurados. Certifique-se de que os seguintes alertas estejam ativos:

- 🔥 **Critical Response Time** (> 5s)
- ❌ **High Error Rate** (> 5%)
- 📉 **Low Availability** (< 95%)
- 🐌 **Poor Core Web Vitals** (LCP > 4s)
- 💥 **Exception Spike** (> 10/min)

---

## 📊 Workbooks Interativos

### Performance Workbook

O workbook de performance oferece análise interativa:

```powershell
# Local do arquivo
monitoring/workbooks/azuria-performance-workbook.json

# Para importar:
# 1. Azure Portal > Monitor > Workbooks
# 2. + New > Upload from JSON  
# 3. Select file e configure parameters
```

### Parâmetros Disponíveis:
- **TimeRange**: Período de análise
- **Environment**: Ambiente (prod/dev)
- **Page Filter**: Filtro por páginas específicas
- **Device Type**: Tipo de dispositivo

---

## 🎯 Validação da Importação

### Checklist de Verificação:

- [ ] **Dashboard Principal**: Todos os tiles carregando dados
- [ ] **Performance Dashboard**: Core Web Vitals funcionando
- [ ] **Business Dashboard**: Métricas de conversão ativas
- [ ] **Filtros Globais**: Funcionando corretamente
- [ ] **Refresh**: Auto-refresh configurado
- [ ] **Alertas**: Links para alertas funcionando
- [ ] **Drill-down**: Navegação entre dashboards

### Troubleshooting Comum:

1. **Tiles em branco**: Verificar permissões no Application Insights
2. **Dados não carregam**: Confirmar subscription e resource group
3. **Queries com erro**: Validar sintaxe KQL
4. **Alertas não funcionam**: Verificar Action Groups

---

## 📈 Próximos Passos

1. **📧 Configure Alertas Personalizados**
   ```powershell
   .\scripts\configure-smart-alerts.ps1
   ```

2. **🔍 Ative Monitoring Avançado**
   - Dependency tracking
   - User flow analysis
   - Performance profiling

3. **📊 Configure Relatórios Automáticos**
   - Weekly performance reports
   - Monthly business intelligence summary
   - Quarterly capacity planning

4. **🎯 Otimize Baseado nos Dados**
   - Identifique páginas lentas
   - Analise padrões de conversão
   - Monitore trends de crescimento

---

## 📞 Suporte

Para dúvidas sobre os dashboards:

1. **📖 Documentação**: `monitoring/DASHBOARD_OVERVIEW.md`
2. **🔍 Queries KQL**: `monitoring/queries/azuria-kql-queries.md`
3. **⚠️ Troubleshooting**: Verificar logs do Application Insights
4. **📧 Alertas**: Revisar configuração em Action Groups

**Dashboard URL Pattern:**
```
https://portal.azure.com/#@{tenantId}/dashboard/arm/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/microsoft.portal/dashboards/{dashboardName}
```

---

*🎉 Parabéns! Seus dashboards de produção estão prontos para monitorar a Azuria em tempo real!*