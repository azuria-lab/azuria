
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { useRateLimit } from '@/hooks/useRateLimit';

interface RateLimitStatusProps {
  identifier?: string;
  maxRequests?: number;
  windowMs?: number;
}

const RateLimitStatus: React.FC<RateLimitStatusProps> = ({
  identifier = 'api',
  maxRequests = 60,
  windowMs = 60000 // 1 minute
}) => {
  const rateLimit = useRateLimit({ maxRequests, windowMs, identifier });
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const resetTime = rateLimit.getResetTime();
      const now = Date.now();
      setTimeUntilReset(Math.max(0, resetTime - now));
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimit]);

  const remainingRequests = rateLimit.getRemainingRequests();
  const usagePercentage = ((maxRequests - remainingRequests) / maxRequests) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Rate Limit Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rateLimit.isLimited && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Rate limit exceeded. Try again in {Math.ceil(timeUntilReset / 1000)} seconds.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Usage</span>
            <Badge variant={usagePercentage > 80 ? "destructive" : "default"}>
              {maxRequests - remainingRequests}/{maxRequests}
            </Badge>
          </div>
          <Progress value={usagePercentage} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Remaining:</span>
            <br />
            {remainingRequests} requests
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <div>
              <span className="font-medium">Reset in:</span>
              <br />
              {Math.ceil(timeUntilReset / 1000)}s
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RateLimitStatus;
