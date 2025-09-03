import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalculationHistory } from '@/types/simpleCalculator';
import { useCollaborationNotifications, useSharedCalculations } from '@/hooks/useCollaboration';
import ShareCalculationDialog from './ShareCalculationDialog';
import CommentsSection from './CommentsSection';
import ApprovalsSection from './ApprovalsSection';
import NotificationsCenter from './NotificationsCenter';
import { Bell, CheckCircle, MessageCircle, Share2 } from 'lucide-react';

interface CollaborationPanelProps {
  calculation: CalculationHistory;
}

export default function CollaborationPanel({ calculation }: CollaborationPanelProps) {
  const { data: sharedCalculations = [] } = useSharedCalculations();
  const { data: notifications = [] } = useCollaborationNotifications();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header com ações rápidas */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Colaboração</h3>
        <div className="flex items-center gap-2">
          <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Notificações</DialogTitle>
              </DialogHeader>
              <NotificationsCenter />
            </DialogContent>
          </Dialog>

          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartilhar Cálculo</DialogTitle>
              </DialogHeader>
              <ShareCalculationDialog 
                calculationId={calculation.id!}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs de colaboração */}
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comentários
          </TabsTrigger>
          <TabsTrigger value="shares" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhamentos
            {sharedCalculations.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {sharedCalculations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprovações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments">
          <Card>
            <CardContent className="pt-6">
              <CommentsSection calculationId={calculation.id!} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shares">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compartilhamentos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {sharedCalculations.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Este cálculo ainda não foi compartilhado
                </p>
              ) : (
                <div className="space-y-3">
                  {sharedCalculations.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{share.shared_with}</p>
                        <p className="text-sm text-gray-500">
                          Permissão: {share.permission_level}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(share.created_at || '').toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardContent className="pt-6">
              <ApprovalsSection calculationId={calculation.id!} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}