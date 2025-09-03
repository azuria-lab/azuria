
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCircle2, Info, TrendingUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'upgrade';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
}

export default function SmartNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simular notificações baseadas no comportamento do usuário
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Nova funcionalidade disponível',
        message: 'A Calculadora Lote Inteligente + IA já está disponível!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
        action: {
          label: 'Experimentar',
          href: '/calculadora-lotes-inteligente'
        },
        dismissible: true
      },
      {
        id: '2',
        type: 'upgrade',
        title: 'Desbloqueie recursos PRO',
        message: 'Você usou 80% do limite gratuito. Upgrade para continuar.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
        action: {
          label: 'Ver Planos',
          href: '/planos'
        },
        dismissible: true
      },
      {
        id: '3',
        type: 'success',
        title: 'Cálculo salvo com sucesso',
        message: 'Seu último cálculo foi salvo automaticamente.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
        dismissible: true
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.length);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'upgrade':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBorderColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'upgrade':
        return 'border-l-purple-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes}m atrás`;
    } else {
      return `${hours}h atrás`;
    }
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {markAllAsRead();}
        }}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <Card className="shadow-lg border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notificações</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Nenhuma notificação nova
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 border-l-4 ${getBorderColor(notification.type)} hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          {getIcon(notification.type)}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {notification.dismissible && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dismissNotification(notification.id)}
                                  className="h-6 w-6 p-0 hover:bg-gray-200"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              
                              {notification.action && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (notification.action?.onClick) {
                                      notification.action.onClick();
                                    } else if (notification.action?.href) {
                                      window.location.href = notification.action.href;
                                    }
                                    setIsOpen(false);
                                  }}
                                  className="text-xs"
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
