# Azuria AI Integration Guide

## 📋 Overview

This document outlines the integration points and requirements for connecting **Azuria AI** to the Price Suggestions feature in the Advanced Calculator.

## 🎯 Current State

The feature is currently implemented using **rule-based logic** (`src/hooks/usePriceSuggestions.ts`). This serves as a functional placeholder until Azuria AI is ready.

### What's Already Built:

✅ TypeScript interfaces and types (`src/types/aiPriceSuggestions.ts`)  
✅ Hook structure with `generateSuggestions()` function  
✅ UI component ready to receive AI data  
✅ Confidence scoring system  
✅ 4 pricing strategies (Conservative, Competitive, Premium, AI-Recommended)

## 🔌 API Integration Requirements

### Endpoint Structure

```typescript
POST /api/azuria-ai/price-suggestions

// Request Body
interface PriceSuggestionInput {
  // Required fields
  cost: number;
  targetMargin: number;
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  marketplace: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
  includePaymentFee: boolean;
  
  // Optional fields for enhanced AI analysis
  monthlyVolume?: number;
  productCategory?: string;
  competitorPrices?: number[];
  seasonality?: 'high' | 'normal' | 'low';
  brandStrength?: 'unknown' | 'emerging' | 'established' | 'premium';
}

// Response
interface PriceSuggestion[] {
  strategy: 'conservative' | 'competitive' | 'premium' | 'ai-recommended';
  label: string;
  icon: string;
  description: string;
  suggestedPrice: number;
  confidence: number; // 0-100
  rationale: {
    marketPosition: string;
    conversionExpectation: string;
    profitExpectation: string;
    competitiveAnalysis: string;
    risks: string[];
    opportunities: string[];
  };
  expectedOutcome: {
    conversionRate: number;
    monthlyRevenue?: number;
    monthlyProfit?: number;
    roi?: number;
    breakEvenDays?: number;
  };
  color: string;
}
```

## 🤖 AI Analysis Expectations

### What Azuria AI Should Analyze:

1. **Historical Pricing Data**
   - User's past pricing decisions
   - Performance of previous price points
   - Seasonal trends in their sales

2. **Competitor Intelligence**
   - Current market prices for similar products
   - Competitor positioning (if data available)
   - Price gaps in the market

3. **Market Trends**
   - Category-specific pricing benchmarks
   - Seasonality patterns
   - Demand elasticity indicators

4. **Brand & Product Context**
   - Brand strength assessment
   - Product differentiation level
   - Customer segment targeting

5. **Financial Optimization**
   - Break-even analysis
   - ROI projections
   - Cash flow implications

### AI-Generated Content:

1. **Confidence Scores** (0-100)
   - Based on data quality and market conditions
   - Higher confidence = more historical data + stable market

2. **Rationale Explanations**
   - Natural language justification for each price
   - Personalized to user's specific context
   - References to data points when available

3. **Risk & Opportunity Analysis**
   - Specific, actionable insights
   - Based on user's business profile
   - Market-specific considerations

4. **Predicted Outcomes**
   - ML-based conversion rate predictions
   - Revenue/profit projections
   - ROI estimates with confidence intervals

## 🔄 Integration Steps

### Phase 1: Replace Hook Logic

**File:** `src/hooks/usePriceSuggestions.ts`

Replace the `generateSuggestions()` function:

```typescript
const generateSuggestions = async (input: PriceSuggestionInput): Promise<PriceSuggestion[]> => {
  try {
    const response = await fetch('/api/azuria-ai/price-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // Add auth
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const suggestions: PriceSuggestion[] = await response.json();
    return suggestions;
  } catch (error) {
    console.error('Azuria AI error:', error);
    // Fallback to rule-based logic if AI fails
    return generateRuleBasedSuggestions(input);
  }
};
```

### Phase 2: Add Loading States

Update component to handle async AI calls:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchSuggestions = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const suggestions = await generateSuggestions(input);
    setSuggestions(suggestions);
  } catch (err) {
    setError('Não foi possível gerar sugestões. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
};
```

### Phase 3: Add AI Branding

Add Azuria AI logo and "Powered by Azuria AI" badge:

```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <img src="/azuria-ai-logo.svg" alt="Azuria AI" className="h-5 w-5" />
  <span>Sugestões geradas por Azuria AI</span>
  {confidence > 80 && <Badge variant="success">Alta Confiança</Badge>}
</div>
```

### Phase 4: Analytics & Feedback

Track user interactions:

```typescript
// When user selects a suggestion
trackEvent('ai_suggestion_selected', {
  strategy: suggestion.strategy,
  confidence: suggestion.confidence,
  price_difference: suggestedPrice - currentPrice,
});

// Collect feedback
<Button onClick={() => provideFeedback('helpful')}>
  👍 Sugestão útil
</Button>
```

## 📊 Success Metrics

Track these KPIs post-integration:

1. **AI Suggestion Adoption Rate**
   - % of users who apply AI suggestions
   - Which strategy is most popular

2. **Confidence vs Accuracy**
   - Do high-confidence suggestions perform better?
   - Calibration of confidence scores

3. **Revenue Impact**
   - Compare outcomes: AI suggestions vs manual pricing
   - Track conversion rate improvements

4. **User Satisfaction**
   - Thumbs up/down feedback
   - Feature usage frequency

## 🧪 Testing Checklist

Before going live:

- [ ] Test with various product categories
- [ ] Test with different marketplace configurations
- [ ] Test with edge cases (very high/low costs)
- [ ] Test fallback to rule-based logic
- [ ] Test API timeout handling
- [ ] Test with missing optional fields
- [ ] Validate confidence score range (0-100)
- [ ] Check all rationale text is generated
- [ ] Verify expected outcomes calculations
- [ ] Test mobile responsiveness

## 🚀 Deployment Plan

### Beta Phase
1. Enable for 10% of users
2. Monitor error rates and API latency
3. Collect feedback
4. Compare AI vs rule-based performance

### Full Launch
1. Gradual rollout to 100%
2. A/B test different AI model parameters
3. Continuous model retraining
4. Regular confidence calibration

## 📝 Future Enhancements

Once Azuria AI is stable:

1. **Real-time Market Updates**
   - Dynamic pricing suggestions based on current market
   - Competitor price tracking integration

2. **Personalized Learning**
   - AI learns from user's past decisions
   - Adapts to user's risk tolerance

3. **Multi-language Support**
   - Generate rationales in Portuguese, English, Spanish

4. **Advanced Scenarios**
   - "What-if" analysis with AI
   - Promotional pricing strategies
   - Bundle pricing optimization

## 🆘 Support & Maintenance

**Primary Contact:** AI Team  
**Documentation:** [Internal AI Docs Link]  
**Monitoring:** Datadog dashboard for AI service health  
**Fallback:** Rule-based logic ensures feature always works

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Ready for AI Integration  
**Version:** 1.0
