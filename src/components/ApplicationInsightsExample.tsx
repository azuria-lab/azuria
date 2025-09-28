// components/ApplicationInsightsExample.tsx
import React from 'react';
import { useApplicationInsights } from '@/hooks/useApplicationInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ApplicationInsightsExample: React.FC = () => {
  const { 
    trackEvent, 
    trackUserInteraction, 
    trackPricingCalculation,
    trackFeatureUsage,
    trackError
  } = useApplicationInsights();

  const handleTrackEvent = () => {
    trackEvent('Example_Event', { 
      component: 'ApplicationInsightsExample',
      action: 'button_click'
    });
  };

  const handleTrackCalculator = () => {
    trackPricingCalculation('simple', {
      cost: 100,
      margin: 20,
      tax: 10
    });
  };

  const handleTrackFeature = () => {
    trackFeatureUsage('application_insights_demo', {
      location: 'example_component'
    });
  };

  const handleTrackError = () => {
    try {
      throw new Error('Example error for testing Application Insights');
    } catch (error) {
      trackError(error as Error, {
        component: 'ApplicationInsightsExample',
        action: 'test_error'
      });
    }
  };

  const handleTrackInteraction = () => {
    trackUserInteraction('demo_interaction', 'ApplicationInsightsExample', {
      testMode: true
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Application Insights Demo</CardTitle>
        <CardDescription>
          Test Application Insights tracking functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleTrackEvent} variant="outline">
            Track Custom Event
          </Button>
          
          <Button onClick={handleTrackCalculator} variant="outline">
            Track Calculator Usage
          </Button>
          
          <Button onClick={handleTrackFeature} variant="outline">
            Track Feature Usage
          </Button>
          
          <Button onClick={handleTrackInteraction} variant="outline">
            Track User Interaction
          </Button>
          
          <Button onClick={handleTrackError} variant="destructive">
            Track Error (Test)
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Application Insights Status</h4>
          <p className="text-sm text-muted-foreground">
            {process.env.NODE_ENV === 'production' 
              ? '✅ Production mode - Events are being tracked'
              : '⚠️ Development mode - Events may be disabled'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Connection String: {process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING ? 'Configured' : 'Not configured'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationInsightsExample;