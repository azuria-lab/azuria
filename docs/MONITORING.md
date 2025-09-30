# Sistema de Monitoramento Azuria

## Visão Geral

O sistema de monitoramento do Azuria fornece capacidades abrangentes de observabilidade e health check para garantir que sua aplicação esteja funcionando otimamente em produção.

## Funcionalidades

### 🔍 Health Check Automatizado
- Script de verificação de saúde do sistema
- Verificação de dependências, tipos, testes e build
- Relatórios de status com pontuação de saúde
- Integração com CI/CD

### 📊 Dashboard de Monitoramento
- Interface visual em tempo real
- Métricas de performance e sistema
- Alertas e notificações
- Histórico de performance

### ⚡ Monitoramento de Performance
- Web Vitals (CLS, FID, LCP, FCP, TTFB)
- Tempo de resposta da API
- Uso de memória JavaScript
- Status da conexão de rede

### 🚨 Sistema de Alertas
- Detecção automática de problemas
- Notificações via GitHub Issues
- Escalação de alertas
- Thresholds configuráveis

## Como Usar

### Health Check Manual

```bash
# Executar health check completo
npm run health-check

# Exemplo de saída
🔍 Running Azuria Health Checks...

📊 Health Check Results:

✅ Passing:
   Node.js Version: Node.js v18.17.0 (✓ >= 18)
   Package Manager: npm (✓ consistent)
   Dependencies: All dependencies can be installed
   TypeScript: No type errors
   ESLint: No linting errors
   Tests: All smoke tests passing
   Build: Production build successful

📈 Summary:
   Health Score: 100%
   Passed: 10/11
   Warnings: 0
   Failed: 0

🎉 Excellent! Your application is production ready.
```

### Dashboard de Monitoramento

```tsx
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';

function App() {
  return (
    <div>
      <MonitoringDashboard />
    </div>
  );
}
```

### Hook de Monitoramento

```tsx
import { useMonitoring } from '@/hooks/useMonitoring';

function MyComponent() {
  const {
    metrics,
    overall,
    score,
    uptime,
    isLoading,
    refresh,
    generateReport
  } = useMonitoring({
    autoRefresh: true,
    interval: 30000, // 30 segundos
    enablePerformanceTracking: true
  });

  if (isLoading) {
    return <div>Carregando métricas...</div>;
  }

  return (
    <div>
      <h2>Status Geral: {overall}</h2>
      <p>Pontuação de Saúde: {score}%</p>
      <p>Uptime: {uptime}</p>
      
      {metrics.map((metric) => (
        <div key={metric.id}>
          <h3>{metric.name}: {metric.value}</h3>
          <p>Status: {metric.status}</p>
        </div>
      ))}
      
      <button onClick={refresh}>Atualizar</button>
      <button onClick={() => console.log(generateReport())}>
        Gerar Relatório
      </button>
    </div>
  );
}
```

## Configuração

### Configuração de Monitoramento

O arquivo `src/config/monitoring.ts` contém todas as configurações:

```typescript
import { getMonitoringConfig } from '@/config/monitoring';

// Configuração para ambiente de produção
const config = getMonitoringConfig('production');

// Configuração para desenvolvimento
const devConfig = getMonitoringConfig('development');
```

### Thresholds Personalizados

```typescript
const customConfig = {
  ...monitoringConfig,
  metrics: {
    ...monitoringConfig.metrics,
    thresholds: {
      responseTime: {
        warning: 300,  // 300ms
        critical: 800  // 800ms
      },
      errorRate: {
        warning: 0.5,  // 0.5%
        critical: 2    // 2%
      }
    }
  }
};
```

## GitHub Actions Health Check

O workflow `.github/workflows/health-check.yml` executa verificações automáticas:

### Configuração do Workflow

```yaml
# Executa a cada 6 horas
schedule:
  - cron: '0 */6 * * *'

# Execução manual
workflow_dispatch:
  inputs:
    environment:
      description: 'Environment to check'
      default: 'production'
```

### Funcionalidades do Workflow

- ✅ Verificação automática da saúde do sistema
- 📋 Geração de relatórios detalhados
- 🚨 Criação automática de issues em caso de falha
- 📎 Upload de artefatos com relatórios completos

## Métricas Coletadas

### Performance Metrics
- **Time to First Byte (TTFB)**: Tempo de resposta do servidor
- **DOM Content Loaded**: Tempo de parsing do DOM
- **Page Load Complete**: Tempo total de carregamento
- **JavaScript Memory Usage**: Uso de memória do JS
- **Network Connection**: Status da conexão de rede

### Application Metrics
- **API Health**: Tempo de resposta das APIs
- **Error Rate**: Taxa de erro da aplicação
- **Service Availability**: Disponibilidade dos serviços

### System Metrics
- **Node.js Version**: Versão do Node.js
- **Package Manager**: Consistência do gerenciador de pacotes
- **Dependencies**: Status das dependências
- **TypeScript**: Verificação de tipos
- **ESLint**: Qualidade do código
- **Tests**: Status dos testes
- **Build**: Status do build de produção

## Alertas e Notificações

### Níveis de Status

- 🟢 **Healthy**: Tudo funcionando normalmente
- 🟡 **Warning**: Degradação de performance detectada
- 🔴 **Critical**: Problemas críticos que requerem atenção imediata

### Geração Automática de Issues

Quando o health check falha, um issue é automaticamente criado com:

- 📊 Relatório detalhado do status
- 🔗 Link para o workflow que falhou
- ✅ Checklist de ações recomendadas
- 🏷️ Labels apropriadas para organização

## Scripts Disponíveis

```bash
# Health check completo
npm run health-check

# Análise de bundle
npm run analyze

# Verificação de tipos
npm run type-check

# Execução de testes
npm run test:smoke

# Build de produção
npm run build
```

## Integração com Application Insights

O sistema de monitoramento se integra com o Azure Application Insights através do `ApplicationInsightsProvider`:

```tsx
import { ApplicationInsightsProvider } from '@/lib/ApplicationInsightsProvider';

function App() {
  return (
    <ApplicationInsightsProvider>
      <MonitoringDashboard />
    </ApplicationInsightsProvider>
  );
}
```

## Troubleshooting

### Health Check Falhando

1. **Verifique dependências**: `npm ci`
2. **Execute type check**: `npm run type-check`
3. **Execute testes**: `npm run test:smoke`
4. **Verifique build**: `npm run build`

### Dashboard Não Carregando

1. Verifique se o hook `useMonitoring` está configurado corretamente
2. Verifique a console do navegador para erros
3. Confirme se as métricas de performance estão disponíveis

### Alertas Não Funcionando

1. Verifique as configurações do GitHub Actions
2. Confirme se os secrets estão configurados
3. Verifique se o workflow tem permissões para criar issues

## Desenvolvimento

### Adicionando Novas Métricas

```typescript
// Em useMonitoring.ts
const newMetric: MonitoringMetric = {
  id: generateSecureId(),
  name: 'Nova Métrica',
  status: 'healthy',
  value: '100%',
  description: 'Descrição da métrica',
  lastChecked: new Date(),
  trend: 'stable'
};
```

### Customizando Thresholds

```typescript
// Em monitoring.ts
const customThresholds = {
  responseTime: {
    warning: 200,
    critical: 500
  }
};
```

## Melhores Práticas

1. **Monitore Continuamente**: Mantenha o auto-refresh ativo em produção
2. **Configure Alertas**: Defina thresholds apropriados para seu ambiente
3. **Revise Relatórios**: Analise os health checks regularmente
4. **Otimize Performance**: Use as métricas para identificar gargalos
5. **Documente Issues**: Mantenha um registro dos problemas encontrados

## Suporte

Para problemas ou sugestões relacionadas ao sistema de monitoramento:

1. Verifique os issues existentes no GitHub
2. Execute `npm run health-check` para diagnóstico
3. Consulte os logs do Application Insights
4. Revise a documentação de troubleshooting

---

**Nota**: Este sistema de monitoramento foi projetado para fornecer observabilidade completa da aplicação Azuria, garantindo alta disponibilidade e performance otimizada em produção.