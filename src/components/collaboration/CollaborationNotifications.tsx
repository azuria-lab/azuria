import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCollaborationNotifications, useMarkNotificationAsRead } from '@/hooks/useCollaboration';
import { Bell, Check, MessageSquare, Share2, UserCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { logger } from "@/services/logger";
import { ptBR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';

export default function CollaborationNotifications() {
  const { data: notifications = [], isLoading } = useCollaborationNotifications();
  const markAsRead = useMarkNotificationAsRead();

  const getNotificationIcon = (notificationType: string | null) => {
    switch (notificationType) {
      case 'calculation_shared':
      case 'share':
        return <Share2 className="h-4 w-4 text-blue-500" />;
      case 'comment_added':
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'approval_requested':
      case 'approval_request':
        return <UserCheck className="h-4 w-4 text-amber-500" />;
      case 'approval_completed':
      case 'approval_response':
        return <Check className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (notificationType: string | null) => {
    switch (notificationType) {
      case 'calculation_shared':
      case 'share':
        return 'bg-blue-50 border-blue-200';
      case 'comment_added':
      case 'comment':
        return 'bg-green-50 border-green-200';
      case 'approval_requested':
      case 'approval_request':
        return 'bg-amber-50 border-amber-200';
      case 'approval_completed':
      case 'approval_response':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
  logger.error('Erro ao marcar notificação como lida:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
          {notifications.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Nenhuma notificação nova</p>
                <p className="text-sm">Você está em dia com suas colaborações!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.notification_type)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.created_at
                                ? formatDistanceToNow(new Date(notification.created_at), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })
                                : ''}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {notification.notification_type === 'calculation_shared' && 'Compartilhamento'}
                              {notification.notification_type === 'comment_added' && 'Comentário'}
                              {notification.notification_type === 'approval_requested' && 'Aprovação'}
                              {notification.notification_type === 'approval_completed' && 'Aprovado'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Ações rápidas baseadas no tipo */}
                      <div className="flex gap-2 mt-3">
                        {notification.notification_type === 'calculation_shared' && (
                          <Button size="sm" variant="outline">
                            Ver Cálculo
                          </Button>
                        )}
                        {notification.notification_type === 'approval_requested' && (
                          <>
                            <Button size="sm" variant="outline">
                              Revisar
                            </Button>
                            <Button size="sm">
                              Aprovar
                            </Button>
                          </>
                        )}
                        {notification.notification_type === 'comment_added' && (
                          <Button size="sm" variant="outline">
                            Responder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                notifications.forEach(n => handleMarkAsRead(n.id));
              }}
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}