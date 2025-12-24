
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollaborationNotifications, useMarkNotificationAsRead } from '@/hooks/useCollaboration';
import { AtSign, CheckCircle, MessageCircle, Share2, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function NotificationsCenter() {
  const { data: notifications = [] } = useCollaborationNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const getNotificationIcon = (notificationType: string | null) => {
    switch (notificationType) {
      case 'share':
      case 'calculation_shared':
        return <Share2 className="h-4 w-4 text-blue-600" />;
      case 'comment':
      case 'comment_added':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'approval_request':
      case 'approval_requested':
        return <UserCheck className="h-4 w-4 text-orange-600" />;
      case 'approval_response':
      case 'approval_completed':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-red-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhuma notificação</p>
        <p className="text-sm">Você está em dia!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 border rounded-lg transition-colors ${
              notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getNotificationIcon(notification.notification_type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {!notification.is_read && (
                      <Badge variant="destructive" className="h-4 w-4 rounded-full p-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {notification.created_at
                      ? format(new Date(notification.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : ''}
                  </p>
                </div>
              </div>
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-xs"
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
