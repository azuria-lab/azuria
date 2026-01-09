/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COGNITIVE DASHBOARD PAGE - Página de Monitoramento do Sistema Cognitivo
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Página dedicada para visualização em tempo real do sistema cognitivo Modo Deus.
 * Mostra status do CentralNucleus, engines, eventos, governança e memória.
 *
 * @module pages/CognitiveDashboardPage
 */

import { ArrowLeft, Brain, ExternalLink, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CognitiveDashboard } from '@/components/ai/consciousness';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CognitiveDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Sistema Cognitivo - Modo Deus
            </h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real do núcleo de consciência e engines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/azuria-ia">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Azuria AI Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sobre o Modo Deus</AlertTitle>
        <AlertDescription>
          O sistema cognitivo gerencia todos os engines de IA, garantindo que as
          emissões de eventos e ações sejam governadas centralmente. O CentralNucleus
          é responsável por processar requisições e manter o estado de consciência.
        </AlertDescription>
      </Alert>

      {/* Dashboard Principal */}
      <CognitiveDashboard />

      {/* Cards Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CentralNucleus</CardTitle>
            <CardDescription>Núcleo de Consciência</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Coordena todos os engines, processa eventos e mantém o estado 
              global do sistema de IA.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">EngineGovernance</CardTitle>
            <CardDescription>Sistema de Permissões</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Controla quais engines podem emitir eventos e executar ações,
              baseado em privilégios e categorias.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">UnifiedMemory</CardTitle>
            <CardDescription>Sistema de Memória</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Gerencia memória de curto prazo (STM), trabalho (WM) e longo prazo
              (LTM) com sync Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
