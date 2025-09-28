# 📊 Queries KQL Personalizadas para Azuria
# Análises avançadas de Business Intelligence e Performance

## 🎯 Business Intelligence Queries

### 1. Funil de Conversão Completo
```kql
let timeRange = ago(30d);
let visitors = pageViews 
    | where timestamp > timeRange and name contains "landing"
    | summarize Visitors = dcount(user_Id);
let signups = customEvents
    | where timestamp > timeRange and name == "user_signup"
    | summarize Signups = dcount(user_Id);
let activeUsers = customEvents
    | where timestamp > timeRange and name == "feature_usage"
    | summarize ActiveUsers = dcount(user_Id);
let premiumUsers = customEvents
    | where timestamp > timeRange and name == "subscription_upgrade"
    | summarize Premium = dcount(user_Id);
union visitors, signups, activeUsers, premiumUsers
| extend Stage = case(
    isnotnull(Visitors), "1. Visitantes",
    isnotnull(Signups), "2. Cadastros",
    isnotnull(ActiveUsers), "3. Usuários Ativos",
    isnotnull(Premium), "4. Premium",
    "Unknown"
)
| project Stage, Count = coalesce(Visitors, Signups, ActiveUsers, Premium)
| order by Stage
```

### 2. Análise de Cohort - Retenção de Usuários
```kql
let cohortPeriod = 7d;
let signups = customEvents
    | where name == "user_signup"
    | extend CohortWeek = startofweek(timestamp)
    | summarize CohortSize = dcount(user_Id) by CohortWeek;
let activity = customEvents
    | where name == "feature_usage"
    | extend 
        SignupWeek = startofweek(timestamp),
        WeeksAfterSignup = (timestamp - startofweek(timestamp)) / 7d
    | summarize ActiveUsers = dcount(user_Id) by SignupWeek, WeeksAfterSignup;
signups
| join kind=inner activity on $left.CohortWeek == $right.SignupWeek
| extend RetentionRate = (ActiveUsers * 100.0) / CohortSize
| project CohortWeek, WeeksAfterSignup, RetentionRate, CohortSize, ActiveUsers
| order by CohortWeek, WeeksAfterSignup
```

### 3. Revenue Analytics por Calculadora
```kql
customEvents
| where name == "pricing_calculation"
| extend 
    calculatorType = tostring(customDimensions.type),
    cost = todouble(customDimensions.cost),
    margin = todouble(customDimensions.margin),
    potentialRevenue = todouble(customDimensions.cost) * (todouble(customDimensions.margin) / 100)
| where isnotnull(cost) and isnotnull(margin)
| summarize 
    TotalCalculations = count(),
    UniqueUsers = dcount(user_Id),
    AvgCost = avg(cost),
    AvgMargin = avg(margin),
    TotalRevenuePotential = sum(potentialRevenue),
    AvgRevenuePerCalculation = avg(potentialRevenue)
by calculatorType
| order by TotalRevenuePotential desc
```

### 4. Análise de Marketplace - Performance
```kql
customEvents
| where name == "marketplace_analysis"
| extend 
    marketplace = tostring(customDimensions.marketplace),
    products = toint(customDimensions.products_analyzed),
    duration = toint(customDimensions.analysis_duration)
| summarize 
    TotalAnalyses = count(),
    UniqueUsers = dcount(user_Id),
    AvgProducts = avg(products),
    TotalProducts = sum(products),
    AvgDuration = avg(duration),
    AnalysesPerUser = toreal(count()) / dcount(user_Id)
by marketplace
| extend EfficiencyScore = (TotalProducts * 1.0) / AvgDuration
| order by TotalAnalyses desc
```

## ⚡ Performance & Core Web Vitals

### 5. Core Web Vitals por Página
```kql
customEvents
| where name == "web_vitals"
| extend 
    metric = tostring(customDimensions.name),
    value = todouble(customDimensions.value),
    page = tostring(customDimensions.page)
| where metric in ("LCP", "FID", "CLS") and isnotempty(page)
| summarize 
    AvgValue = avg(value),
    P50Value = percentile(value, 50),
    P95Value = percentile(value, 95),
    SampleCount = count()
by page, metric
| extend Status = case(
    metric == "LCP" and AvgValue <= 2500, "Good",
    metric == "LCP" and AvgValue <= 4000, "Needs Improvement", 
    metric == "LCP", "Poor",
    metric == "FID" and AvgValue <= 100, "Good",
    metric == "FID" and AvgValue <= 300, "Needs Improvement",
    metric == "FID", "Poor", 
    metric == "CLS" and AvgValue <= 0.1, "Good",
    metric == "CLS" and AvgValue <= 0.25, "Needs Improvement",
    metric == "CLS", "Poor",
    "Unknown"
)
| order by page, metric
```

### 6. Performance de APIs por Endpoint
```kql
customEvents
| where name == "api_request"
| extend 
    endpoint = tostring(customDimensions.endpoint),
    method = tostring(customDimensions.method),
    duration = toint(customDimensions.duration),
    success = tobool(customDimensions.success)
| summarize 
    RequestCount = count(),
    AvgLatency = avg(duration),
    P95Latency = percentile(duration, 95),
    P99Latency = percentile(duration, 99),
    SuccessRate = (countif(success == true) * 100.0) / count(),
    ErrorCount = countif(success == false)
by endpoint, method
| extend PerformanceGrade = case(
    AvgLatency <= 500, "A",
    AvgLatency <= 1000, "B", 
    AvgLatency <= 2000, "C",
    AvgLatency <= 5000, "D",
    "F"
)
| order by RequestCount desc
```

## 🚨 Error Analysis & Monitoring

### 7. Top Erros com Context
```kql
exceptions
| extend 
    errorType = tostring(type),
    errorMessage = tostring(message),
    userAgent = tostring(client_Browser),
    country = tostring(client_CountryOrRegion)
| summarize 
    ErrorCount = count(),
    UniqueUsers = dcount(user_Id),
    FirstSeen = min(timestamp),
    LastSeen = max(timestamp),
    AffectedCountries = make_set(country, 5),
    AffectedBrowsers = make_set(userAgent, 3)
by errorType, errorMessage
| order by ErrorCount desc
| take 20
```

### 8. Error Rate por Página
```kql
union 
(pageViews | summarize TotalViews = count() by name),
(exceptions 
    | extend pageName = tostring(customDimensions.page)
    | where isnotempty(pageName)
    | summarize ErrorCount = count() by pageName)
| join kind=fullouter (pageViews | summarize TotalViews = count() by name) 
    on $left.pageName == $right.name
| extend 
    Page = coalesce(pageName, name),
    Errors = coalesce(ErrorCount, 0),
    Views = coalesce(TotalViews, 0)
| extend ErrorRate = (Errors * 100.0) / Views
| where Views > 0
| order by ErrorRate desc
```

## 👥 User Behavior Analysis

### 9. Jornada do Usuário - Sequência de Eventos
```kql
let userJourney = customEvents
| union pageViews
| extend EventType = case(
    name == "pricing_calculation", "Calculator Used",
    name == "marketplace_analysis", "Marketplace Analyzed", 
    name == "user_signup", "User Signup",
    name == "subscription_upgrade", "Premium Upgrade",
    name == "feature_usage", "Feature Used",
    name contains "landing", "Landing Visit",
    "Page View"
)
| project timestamp, user_Id, EventType, name
| order by user_Id, timestamp;
userJourney
| summarize Journey = make_list(EventType), EventCount = count() by user_Id
| extend JourneyPath = strcat_array(Journey, " → ")
| summarize UserCount = count() by JourneyPath
| order by UserCount desc
| take 50
```

### 10. Análise de Sessão - Engagement
```kql
pageViews
| extend SessionDuration = duration / 1000.0
| summarize 
    PageViews = count(),
    SessionDuration = sum(SessionDuration),
    UniquePages = dcount(name),
    BounceRate = (countif(SessionDuration < 30) * 100.0) / count()
by session_Id, user_Id
| summarize 
    AvgPagesPerSession = avg(PageViews),
    AvgSessionDuration = avg(SessionDuration),
    AvgUniquePages = avg(UniquePages),
    OverallBounceRate = avg(BounceRate),
    TotalSessions = count()
| extend 
    EngagementScore = case(
        AvgSessionDuration >= 300 and AvgPagesPerSession >= 5, "High",
        AvgSessionDuration >= 120 and AvgPagesPerSession >= 3, "Medium",
        "Low"
    )
```

## 📈 Growth & Trends

### 11. Crescimento Semanal de Métricas
```kql
let timeRange = ago(90d);
union 
(pageViews | where timestamp > timeRange | extend MetricType = "Page Views"),
(customEvents | where timestamp > timeRange and name == "user_signup" | extend MetricType = "Signups"),
(customEvents | where timestamp > timeRange and name == "pricing_calculation" | extend MetricType = "Calculations"),
(customEvents | where timestamp > timeRange and name == "subscription_upgrade" | extend MetricType = "Premium Upgrades")
| summarize Count = count() by MetricType, Week = startofweek(timestamp)
| order by Week, MetricType
| serialize
| extend PreviousWeekCount = prev(Count, 1)
| extend GrowthRate = case(
    PreviousWeekCount > 0, ((Count - PreviousWeekCount) * 100.0) / PreviousWeekCount,
    0.0
)
| project Week, MetricType, Count, GrowthRate
```

### 12. Segmentação de Usuários por Comportamento
```kql
let userSegmentation = customEvents
| where name in ("pricing_calculation", "marketplace_analysis", "subscription_upgrade")
| summarize 
    Calculations = countif(name == "pricing_calculation"),
    Analyses = countif(name == "marketplace_analysis"),
    Upgrades = countif(name == "subscription_upgrade"),
    LastActivity = max(timestamp)
by user_Id
| extend 
    UserType = case(
        Upgrades > 0, "Premium User",
        Calculations >= 10 or Analyses >= 5, "Power User",
        Calculations >= 3 or Analyses >= 2, "Active User",
        Calculations >= 1 or Analyses >= 1, "Trial User",
        "Inactive User"
    ),
    DaysSinceLastActivity = (now() - LastActivity) / 1d;
userSegmentation
| summarize 
    UserCount = count(),
    AvgCalculations = avg(Calculations),
    AvgAnalyses = avg(Analyses),
    AvgDaysSinceActivity = avg(DaysSinceLastActivity)
by UserType
| order by UserCount desc
```

---

## 🎛️ Como Usar as Queries

1. **Azure Portal** → **Application Insights** → **Logs**
2. Cole a query desejada
3. Ajuste o período de tempo conforme necessário
4. Execute e analise os resultados
5. Salve queries úteis como **Favoritos**

## 📊 Criação de Alertas Customizados

Para criar alertas baseados nessas queries:
1. Vá para **Alerts** → **New alert rule**
2. Selecione **Custom log query**
3. Cole a query modificada para retornar condições específicas
4. Configure thresholds e ações

---

*Queries otimizadas para Application Insights: ai-jxbkuxsj7yfpo*  
*Criado em: 27/09/2025*