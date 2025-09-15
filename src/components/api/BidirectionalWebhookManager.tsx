
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
//
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, Play, Plus, Trash2, Webhook } from "lucide-react";
import { useBidirectionalWebhooks } from "@/hooks/useBidirectionalWebhooks";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";

type Direction = 'incoming' | 'outgoing' | 'bidirectional';

export default function BidirectionalWebhookManager() {
  const {
    endpoints,
    addEndpoint,
    removeEndpoint,
    registerIncomingHandler,
    sendWebhook,
    testEndpoint,
    processDeadLetterQueue,
    isProcessing,
    deadLetterQueueSize
  } = useBidirectionalWebhooks();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    url: '',
  direction: 'outgoing' as Direction,
    events: [] as string[],
    active: true,
    security: {
      secret: '',
      signatureHeader: 'X-Webhook-Signature',
      authMethod: 'hmac' as 'hmac' | 'bearer' | 'basic'
    },
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      maxBackoffMs: 30000
    }
  });

  const availableEvents = [
    'calculation.completed',
    'calculation.updated',
    'price.changed',
    'competitor.price_updated',
    'margin.threshold_reached',
    'user.subscription_changed',
    'api.quota_reached'
  ];

  const handleCreateEndpoint = async () => {
    if (!newEndpoint.name || !newEndpoint.url) {
      toast.error('Nome e URL são obrigatórios');
      return;
    }

    try {
      addEndpoint({
        ...newEndpoint,
        events: newEndpoint.events.length > 0 ? newEndpoint.events : ['calculation.completed']
      });

      // Registrar handlers para webhooks incoming
      if (newEndpoint.direction === 'incoming' || newEndpoint.direction === 'bidirectional') {
        newEndpoint.events.forEach(event => {
          registerIncomingHandler(event, async (payload) => {
            logger.info(`Received ${event} webhook:`, payload);
            // Aqui você processaria o webhook recebido
            return { success: true, processed_at: new Date().toISOString() };
          });
        });
      }

      toast.success(`Endpoint "${newEndpoint.name}" criado com sucesso`);
      setIsCreateDialogOpen(false);
      setNewEndpoint({
        name: '',
        url: '',
        direction: 'outgoing',
        events: [],
        active: true,
        security: {
          secret: '',
          signatureHeader: 'X-Webhook-Signature',
          authMethod: 'hmac'
        },
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffMs: 30000
        }
      });
  } catch (_error) {
      toast.error('Erro ao criar endpoint');
    }
  };

  const handleTestEndpoint = async (endpointId: string) => {
    try {
      const success = await testEndpoint(endpointId);
      if (success) {
        toast.success('Teste realizado com sucesso');
      } else {
        toast.error('Falha no teste de conectividade');
      }
  } catch (_error) {
      toast.error('Erro ao testar endpoint');
    }
  };

  const handleSendTestWebhook = async (endpointId: string) => {
    try {
      await sendWebhook(endpointId, 'test.manual', {
        message: 'Teste manual do webhook',
        timestamp: new Date().toISOString(),
        test_data: {
          calculation_id: 'test_123',
          selling_price: 142.85
        }
      }, { immediate: true });
      
      toast.success('Webhook de teste enviado');
  } catch (_error) {
      toast.error('Erro ao enviar webhook de teste');
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'incoming':
        return <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
      case 'outgoing':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'bidirectional':
        return <Webhook className="h-4 w-4 text-purple-600" />;
      default:
        return <Webhook className="h-4 w-4" />;
    }
  };

  const getDirectionBadge = (direction: Direction) => {
    const variants: Record<Direction, string> = {
      incoming: 'bg-blue-50 text-blue-700',
      outgoing: 'bg-green-50 text-green-700',
      bidirectional: 'bg-purple-50 text-purple-700'
    };
    
    return (
      <Badge variant="outline" className={variants[direction]}>
        {direction === 'incoming' ? 'Entrada' :
         direction === 'outgoing' ? 'Saída' : 'Bidirecional'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6" />
            Webhooks Bidirecionais
          </h2>
          <p className="text-muted-foreground">
            Gerencie webhooks de entrada e saída com retry automático
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Endpoint</DialogTitle>
              <DialogDescription>
                Configure um novo endpoint para webhooks
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Endpoint</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Sistema de Estoque"
                    value={newEndpoint.name}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="direction">Direção</Label>
                  <Select
                    value={newEndpoint.direction}
                    onValueChange={(value: string) => setNewEndpoint(prev => ({ ...prev, direction: value as Direction }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outgoing">Saída (Outgoing)</SelectItem>
                      <SelectItem value="incoming">Entrada (Incoming)</SelectItem>
                      <SelectItem value="bidirectional">Bidirecional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL do Webhook</Label>
                <Input
                  id="url"
                  placeholder="https://api.seusistema.com/webhooks"
                  value={newEndpoint.url}
                  onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>

              <div>
                <Label>Eventos</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableEvents.map(event => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={newEndpoint.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewEndpoint(prev => ({
                              ...prev,
                              events: [...prev.events, event]
                            }));
                          } else {
                            setNewEndpoint(prev => ({
                              ...prev,
                              events: prev.events.filter(e => e !== event)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={event} className="text-sm">
                        {event}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secret">Secret (HMAC)</Label>
                  <Input
                    id="secret"
                    type="password"
                    placeholder="Chave secreta para assinatura"
                    value={newEndpoint.security.secret}
                    onChange={(e) => setNewEndpoint(prev => ({
                      ...prev,
                      security: { ...prev.security, secret: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="authMethod">Método de Auth</Label>
                  <Select
                    value={newEndpoint.security.authMethod}
                    onValueChange={(value: string) => setNewEndpoint(prev => ({
                      ...prev,
                      security: { ...prev.security, authMethod: value as 'hmac' | 'bearer' | 'basic' }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hmac">HMAC Signature</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newEndpoint.active}
                  onCheckedChange={(checked) => setNewEndpoint(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Ativar endpoint imediatamente</Label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEndpoint}>
                  Criar Endpoint
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">
              {endpoints.filter(e => e.active).length} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {endpoints.reduce((sum, e) => sum + e.stats.totalSent, 0)}
            </div>
            <p className="text-xs text-muted-foreground">últimas 24h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {endpoints.reduce((sum, e) => sum + e.stats.totalReceived, 0)}
            </div>
            <p className="text-xs text-muted-foreground">últimas 24h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {endpoints.length > 0 
                ? (endpoints.reduce((sum, e) => sum + e.stats.successRate, 0) / endpoints.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">média geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Configurados</CardTitle>
          <CardDescription>
            Gerencie seus webhooks de entrada e saída
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Direção</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estatísticas</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.events.slice(0, 2).join(', ')}
                        {endpoint.events.length > 2 && ` +${endpoint.events.length - 2}`}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDirectionIcon(endpoint.direction)}
                      {getDirectionBadge(endpoint.direction)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {endpoint.url.length > 30 
                        ? `${endpoint.url.substring(0, 30)}...` 
                        : endpoint.url}
                    </code>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={endpoint.active ? "default" : "secondary"}>
                      {endpoint.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>📤 {endpoint.stats.totalSent} enviados</div>
                      <div>📥 {endpoint.stats.totalReceived} recebidos</div>
                      <div>✅ {endpoint.stats.successRate.toFixed(1)}% sucesso</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {endpoint.lastTriggered 
                        ? new Date(endpoint.lastTriggered).toLocaleString()
                        : "Nunca"}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestEndpoint(endpoint.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      
                      {(endpoint.direction === 'outgoing' || endpoint.direction === 'bidirectional') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendTestWebhook(endpoint.id)}
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {deadLetterQueueSize(endpoint.id) > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => processDeadLetterQueue(endpoint.id)}
                          disabled={isProcessing}
                        >
                          <Badge variant="destructive">
                            {deadLetterQueueSize(endpoint.id)}
                          </Badge>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEndpoint(endpoint.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
