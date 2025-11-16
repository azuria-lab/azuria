/**
 * Componente para controlar acesso a features baseado no plano
 * Bloqueia conteúdo que não está disponível no plano atual
 */

import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import type { PlanFeatures } from '@/types/subscription';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const FeatureGate = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) => {
  const { hasFeature, currentPlan } = useFeatureAccess();
  const navigate = useNavigate();
  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Feature Bloqueada</CardTitle>
        </div>
        <CardDescription>
          Esta funcionalidade não está disponível no plano {currentPlan.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertTitle>Faça upgrade para desbloquear</AlertTitle>
          <AlertDescription>
            Atualize seu plano para acessar esta funcionalidade e muito mais.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button onClick={() => navigate('/pricing')} className="w-full">
          Ver Planos
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Wrapper inline para features bloqueadas
 */
interface FeatureBlockProps {
  blocked: boolean;
  message?: string;
  children: React.ReactNode;
}

export const FeatureBlock = ({
  blocked,
  message = 'Esta funcionalidade não está disponível no seu plano',
  children,
}: FeatureBlockProps) => {
  const navigate = useNavigate();

  if (!blocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none blur-sm opacity-50">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <CardTitle>Feature Bloqueada</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/pricing')} className="w-full">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
