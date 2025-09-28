# Azure Application Insights - Setup Monitoring
# Configura dashboards e alertas para produção

param(
    [string]$ResourceGroup = "rg-azuria-prod",
    [string]$ApplicationInsightsName = "ai-jxbkuxsj7yfpo",
    [string]$Location = "eastus2"
)

Write-Host "🚀 Configurando Monitoramento Azure Application Insights..." -ForegroundColor Green

# Verificar se está logado no Azure
$account = az account show --query user.name -o tsv 2>$null
if (-not $account) {
    Write-Host "❌ Não está logado no Azure. Execute 'az login' primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Logado como: $account" -ForegroundColor Green

# 1. Configurar Alertas de Disponibilidade
Write-Host "📊 Configurando alertas de disponibilidade..." -ForegroundColor Yellow

$availabilityAlert = @{
    name = "azuria-availability-alert"
    description = "Alert when availability drops below 99%"
    severity = 2
    frequency = "PT5M"
    windowSize = "PT15M"
    criteria = @{
        "allOf" = @(
            @{
                "metricName" = "availabilityResults/availabilityPercentage"
                "operator" = "LessThan"
                "threshold" = 99
                "timeAggregation" = "Average"
            }
        )
    }
} | ConvertTo-Json -Depth 10

# 2. Configurar Alertas de Performance
Write-Host "⚡ Configurando alertas de performance..." -ForegroundColor Yellow

$performanceAlert = @{
    name = "azuria-performance-alert"
    description = "Alert when response time exceeds 2 seconds"
    severity = 3
    frequency = "PT5M"
    windowSize = "PT15M"
    criteria = @{
        "allOf" = @(
            @{
                "metricName" = "requests/duration"
                "operator" = "GreaterThan"
                "threshold" = 2000
                "timeAggregation" = "Average"
            }
        )
    }
} | ConvertTo-Json -Depth 10

# 3. Configurar Alertas de Erros
Write-Host "🚨 Configurando alertas de erros..." -ForegroundColor Yellow

$errorAlert = @{
    name = "azuria-error-rate-alert"
    description = "Alert when error rate exceeds 5%"
    severity = 2
    frequency = "PT5M"
    windowSize = "PT15M"
    criteria = @{
        "allOf" = @(
            @{
                "metricName" = "requests/failed"
                "operator" = "GreaterThan"
                "threshold" = 5
                "timeAggregation" = "Average"
            }
        )
    }
} | ConvertTo-Json -Depth 10

# 4. Configurar Alertas de Volume de Tráfego
Write-Host "📈 Configurando alertas de tráfego..." -ForegroundColor Yellow

$trafficAlert = @{
    name = "azuria-traffic-spike-alert"
    description = "Alert when traffic spikes above normal"
    severity = 4
    frequency = "PT5M"
    windowSize = "PT15M"
    criteria = @{
        "allOf" = @(
            @{
                "metricName" = "requests/count"
                "operator" = "GreaterThan"
                "threshold" = 1000
                "timeAggregation" = "Total"
            }
        )
    }
} | ConvertTo-Json -Depth 10

# Salvar configurações dos alertas
$availabilityAlert | Out-File -FilePath "monitoring-alerts-availability.json" -Encoding UTF8
$performanceAlert | Out-File -FilePath "monitoring-alerts-performance.json" -Encoding UTF8
$errorAlert | Out-File -FilePath "monitoring-alerts-errors.json" -Encoding UTF8
$trafficAlert | Out-File -FilePath "monitoring-alerts-traffic.json" -Encoding UTF8

Write-Host "✅ Configurações de alertas salvas!" -ForegroundColor Green

# 5. Dashboard JSON para Azuria
Write-Host "📊 Criando dashboard customizado..." -ForegroundColor Yellow

$dashboardJson = @'
{
    "lenses": {
        "0": {
            "order": 0,
            "parts": {
                "0": {
                    "position": {
                        "x": 0,
                        "y": 0,
                        "colSpan": 6,
                        "rowSpan": 4
                    },
                    "metadata": {
                        "inputs": [
                            {
                                "name": "resourceTypeMode",
                                "isOptional": true
                            },
                            {
                                "name": "ComponentId",
                                "value": {
                                    "SubscriptionId": "{subscription-id}",
                                    "ResourceGroup": "rg-azuria-prod",
                                    "Name": "ai-jxbkuxsj7yfpo"
                                },
                                "isOptional": true
                            }
                        ],
                        "type": "Extension/HubsExtension/PartType/MonitorChartPart",
                        "settings": {
                            "content": {
                                "options": {
                                    "chart": {
                                        "metrics": [
                                            {
                                                "resourceMetadata": {
                                                    "id": "/subscriptions/{subscription-id}/resourceGroups/rg-azuria-prod/providers/Microsoft.Insights/components/ai-jxbkuxsj7yfpo"
                                                },
                                                "name": "requests/count",
                                                "aggregationType": 1,
                                                "namespace": "microsoft.insights/components",
                                                "metricVisualization": {
                                                    "displayName": "Server requests"
                                                }
                                            }
                                        ],
                                        "title": "📊 Azuria - Total Requests",
                                        "titleKind": 2,
                                        "visualization": {
                                            "chartType": 2,
                                            "legendVisualization": {
                                                "isVisible": true,
                                                "position": 2,
                                                "hideSubtitle": false
                                            },
                                            "axisVisualization": {
                                                "x": {
                                                    "isVisible": true,
                                                    "axisType": 2
                                                },
                                                "y": {
                                                    "isVisible": true,
                                                    "axisType": 1
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "1": {
                    "position": {
                        "x": 6,
                        "y": 0,
                        "colSpan": 6,
                        "rowSpan": 4
                    },
                    "metadata": {
                        "inputs": [
                            {
                                "name": "resourceTypeMode",
                                "isOptional": true
                            },
                            {
                                "name": "ComponentId",
                                "value": {
                                    "SubscriptionId": "{subscription-id}",
                                    "ResourceGroup": "rg-azuria-prod",
                                    "Name": "ai-jxbkuxsj7yfpo"
                                },
                                "isOptional": true
                            }
                        ],
                        "type": "Extension/HubsExtension/PartType/MonitorChartPart",
                        "settings": {
                            "content": {
                                "options": {
                                    "chart": {
                                        "metrics": [
                                            {
                                                "resourceMetadata": {
                                                    "id": "/subscriptions/{subscription-id}/resourceGroups/rg-azuria-prod/providers/Microsoft.Insights/components/ai-jxbkuxsj7yfpo"
                                                },
                                                "name": "requests/duration",
                                                "aggregationType": 4,
                                                "namespace": "microsoft.insights/components",
                                                "metricVisualization": {
                                                    "displayName": "Server response time"
                                                }
                                            }
                                        ],
                                        "title": "⚡ Azuria - Response Time",
                                        "titleKind": 2,
                                        "visualization": {
                                            "chartType": 2
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "metadata": {
        "model": {
            "timeRange": {
                "value": {
                    "relative": {
                        "duration": 24,
                        "timeUnit": 1
                    }
                },
                "type": "MsPortalFx.Composition.Configuration.ValueTypes.TimeRange"
            }
        }
    }
}
'@

# Salvar dashboard
$dashboardJson | Out-File -FilePath "azuria-dashboard.json" -Encoding UTF8

Write-Host "✅ Dashboard JSON criado!" -ForegroundColor Green

# 6. Instruções para execução
Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Execute os comandos abaixo para criar os alertas:" -ForegroundColor White
Write-Host ""
Write-Host "# Criar Action Group (grupo de notificação)" -ForegroundColor Gray
Write-Host 'az monitor action-group create --name "azuria-alerts" --resource-group "rg-azuria-prod" --short-name "azuria"' -ForegroundColor Yellow
Write-Host ""
Write-Host "# Criar alertas de métrica" -ForegroundColor Gray
Write-Host 'az monitor metrics alert create --name "azuria-availability" --resource-group "rg-azuria-prod" --scopes "/subscriptions/{subscription-id}/resourceGroups/rg-azuria-prod/providers/Microsoft.Insights/components/ai-jxbkuxsj7yfpo" @monitoring-alerts-availability.json' -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Para criar o dashboard:" -ForegroundColor White
Write-Host "   - Vá para o Azure Portal → Dashboards" -ForegroundColor Gray
Write-Host "   - Import azuria-dashboard.json" -ForegroundColor Gray
Write-Host "   - Substitua {subscription-id} pelo ID real da sua subscription" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Para visualizar métricas em tempo real:" -ForegroundColor White
Write-Host "   - Azure Portal → Application Insights → ai-jxbkuxsj7yfpo → Live Metrics" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Setup de monitoramento concluído!" -ForegroundColor Green