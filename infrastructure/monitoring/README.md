# 📊 Azure Monitoring Dashboards for Azuria

Este diretório contém dashboards personalizados para monitoramento da aplicação Azuria no Azure Application Insights.

## 🎯 Dashboards Disponíveis

### 1. **Main Dashboard** (`azuria-main-dashboard.json`)
- **Core Web Vitals**: FCP, LCP, FID, CLS, TTFB, INP 
- **Application Performance**: Request volume, response times, success rates
- **User Analytics**: Active users, page views, session duration
- **Business Metrics**: Calculation completions, user interactions

### 2. **Alerts & SLA Dashboard** (`azuria-alerts-dashboard.json`)
- **Real-time Alerts**: Active alerts by severity
- **SLA Monitoring**: Availability percentages, response time SLAs
- **Health Status**: Application health score with traffic light system
- **Incident Tracking**: MTTR analysis, recovery patterns

### 3. **Infrastructure Dashboard** (`azuria-infrastructure-dashboard.json`)
- **Azure Static Web Apps**: Performance and usage metrics
- **Cost Analysis**: Resource usage and estimated costs
- **Network Performance**: CDN, external dependencies
- **Database Monitoring**: Supabase performance metrics

## 🚀 Deployment

### Automated Deployment
```powershell
.\deploy-dashboards.ps1 -ResourceGroup "rg-azuria-prod" -SubscriptionId "your-subscription-id" -AppInsightsName "ai-azuria-prod"
```

### Manual Deployment
1. Open Azure Portal
2. Navigate to Application Insights
3. Go to **Workbooks** section
4. Click **+ New**
5. Use **Advanced Editor**
6. Paste dashboard JSON content
7. Save workbook

## 📈 Dashboard Features

### Query Capabilities
- **KQL Queries**: Advanced Kusto queries for deep insights
- **Real-time Data**: Live metrics with 5-minute refresh
- **Historical Analysis**: 7-day and 30-day trend analysis
- **Custom Metrics**: Core Web Vitals and business events

### Visualization Types
- **Timecharts**: Performance trends over time
- **Tables**: Top errors, slowest pages, user sessions
- **Pie Charts**: Error distribution, page popularity
- **Gauges**: SLA compliance, health scores

### Interactive Parameters
- **Time Range**: 5m, 15m, 1h, 4h, 12h, 1d, 2d, 3d, 7d
- **Severity Filters**: Critical, Error, Warning, Info, Verbose
- **Custom Filters**: User segments, feature flags, geographic regions

## 🔧 Customization

### Adding New Metrics
1. Update KQL queries in dashboard JSON
2. Add new visualization blocks
3. Configure appropriate formatting and thresholds

### Threshold Configuration
```json
{
  "thresholds": {
    "fcp": { "good": 1800, "needsImprovement": 3000 },
    "lcp": { "good": 2500, "needsImprovement": 4000 },
    "availability": { "excellent": 99.9, "good": 99.0 }
  }
}
```

### Alert Integration
- **Metric Alerts**: Based on performance thresholds
- **Anomaly Detection**: ML-powered unusual pattern detection
- **Smart Groups**: Correlated alert clustering

## 📊 Key Performance Indicators (KPIs)

### Core Web Vitals Targets
- **FCP (First Contentful Paint)**: < 1.8s (Good), < 3.0s (Needs Improvement)
- **LCP (Largest Contentful Paint)**: < 2.5s (Good), < 4.0s (Needs Improvement)
- **FID (First Input Delay)**: < 100ms (Good), < 300ms (Needs Improvement)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Good), < 0.25 (Needs Improvement)

### SLA Targets
- **Availability**: > 99.9% (Excellent), > 99% (Good)
- **Response Time**: < 1s avg (Fast), < 3s (Acceptable)
- **Error Rate**: < 1% (Healthy), < 5% (Warning)

### Business Metrics
- **User Engagement**: Daily/Monthly active users
- **Feature Adoption**: Calculation completions, feature usage
- **Performance Impact**: Business metrics correlation with technical metrics

## 🔍 Troubleshooting

### Common Issues

**Dashboard not loading data:**
- Verify Application Insights connection
- Check KQL query syntax
- Confirm data is being ingested

**Missing metrics:**
- Ensure custom metrics are being sent from application
- Verify metric names match dashboard queries
- Check data retention policy

**Permission errors:**
- Ensure proper RBAC roles (Reader on Application Insights)
- Verify subscription access
- Check resource group permissions

### Data Sources
- **Application Insights**: Primary telemetry data
- **Custom Metrics**: Core Web Vitals, business events
- **Traces**: Error logs, performance traces
- **Dependencies**: External service calls

## 📝 Maintenance

### Regular Updates
- **Monthly**: Review and update thresholds based on performance trends
- **Quarterly**: Add new business metrics and KPIs
- **Annually**: Architecture review and dashboard optimization

### Performance Optimization
- **Query Optimization**: Use summarize and bin() for better performance
- **Data Sampling**: Implement sampling for high-volume queries
- **Caching**: Leverage Application Insights query caching

## 🔗 Related Resources

- [Azure Application Insights Documentation](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [KQL Query Language Reference](https://docs.microsoft.com/azure/data-explorer/kusto/query/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Azure Workbooks Documentation](https://docs.microsoft.com/azure/azure-monitor/platform/workbooks-overview)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Azure Application Insights, Azure Static Web Apps