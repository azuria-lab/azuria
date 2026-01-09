// AI Components
export { default as AIChatbot } from './AIChatbot';
export { default as AIMarketInsights } from './AIMarketInsights';
export { default as DemandForecast } from './DemandForecast';
export { default as IntelligentPricingSuggestions } from './IntelligentPricingSuggestions';
export { default as MLPricingDashboard } from './MLPricingDashboard';
export { default as MarketTrendAnalyzer } from './MarketTrendAnalyzer';
export { default as PersonalizedRecommendations } from './PersonalizedRecommendations';
export { default as PriceOptimizationEngine } from './PriceOptimizationEngine';
export { default as SeasonalityAnalysis } from './SeasonalityAnalysis';

// Chat Components (different implementations)
export { AzuriaChat } from './AzuriaChat';
export { AzuriaAIChat } from './AzuriaAIChat';

// Avatar Components (different implementations)
export { AzuriaAvatar } from './AzuriaAvatar';
export { AzuriaAIAvatar } from './AzuriaAIAvatar';
export { AzuriaAvatarImage } from './AzuriaAvatarImage';

// Chat Components
export { default as ChatFloatingButton } from './chat/ChatFloatingButton';
export { default as ChatHeader } from './chat/ChatHeader';
export { default as ChatInput } from './chat/ChatInput';
export { default as ChatMessage } from './chat/ChatMessage';
export { default as TypingIndicator } from './chat/TypingIndicator';

// Demand Forecast Components
export { default as DemandForecastActions } from './demand-forecast/DemandForecastActions';
export { default as DemandForecastHeader } from './demand-forecast/DemandForecastHeader';
export { default as DemandMetrics } from './demand-forecast/DemandMetrics';
export { default as ForecastChart } from './demand-forecast/ForecastChart';
export { default as InsightsPanel } from './demand-forecast/InsightsPanel';

// Intelligent Pricing Components
export { default as AIRecommendationPanel } from './intelligent-pricing/AIRecommendationPanel';
export { default as PricingActions } from './intelligent-pricing/PricingActions';
export { default as PricingHeader } from './intelligent-pricing/PricingHeader';
export { default as PricingInputForm } from './intelligent-pricing/PricingInputForm';
export { default as PricingStrategiesList } from './intelligent-pricing/PricingStrategiesList';

// Seasonality Components
export { default as SeasonalityActions } from './seasonality/SeasonalityActions';
export { default as SeasonalityCharts } from './seasonality/SeasonalityCharts';
export { default as SeasonalityDetails } from './seasonality/SeasonalityDetails';
export { default as SeasonalityHeader } from './seasonality/SeasonalityHeader';
export { default as SeasonalityInsights } from './seasonality/SeasonalityInsights';
export { default as SeasonalityMetrics } from './seasonality/SeasonalityMetrics';

// Consciousness Dashboard Components
export {
  CognitiveDashboard,
  useCognitiveDashboard,
  type DashboardData,
} from './consciousness';