/**
 * Notification Center
 * 
 * Central de notificações em tempo real
 */

import { Bell, Check, CheckCheck, Filter, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { notificationService } from '@/services/notification.service';
import type { Notification, NotificationFilter, NotificationStats } from '@/types/notification-system';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
} as const;

const TYPE_LABELS = {
  price_alert: 'Preço',
  stock_alert: 'Estoque',
  competitor_price: 'Concorrente',
  sale_completed: 'Venda',
  sync_error: 'Erro',
  review_received: 'Avaliação',
  order_pending: 'Pedido',
  system: 'Sistema',
  webhook: 'Webhook'
} as const;

function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Agora';
  }
  if (diffMins < 60) {
    return `${diffMins}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  return `${diffDays}d`;
}

function NotificationItem({ notification, onMarkAsRead, onArchive }: Readonly<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}>) {
  const isUnread = notification.status === 'unread';

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent/50 transition-colors border-b last:border-b-0',
        isUnread && 'bg-accent/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={PRIORITY_COLORS[notification.priority]}>
              {TYPE_LABELS[notification.type]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <h4 className={cn(
            'text-sm mb-1',
            isUnread ? 'font-semibold' : 'font-medium'
          )}>
            {notification.title}
          </h4>

          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>

          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {notification.actions.map(action => (
                <Button
                  key={action.id}
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  size="sm"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isUnread && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              title="Marcar como lida"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onArchive(notification.id)}
            title="Arquivar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<NotificationFilter>({
    status: ['unread'],
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    async function loadData(): Promise<void> {
      setLoading(true);
      try {
        const result = await notificationService.listNotifications(filters);
        setNotifications(result.notifications);
      } catch {
        toast({
          title: 'Erro ao carregar notificações',
          description: 'Tente novamente mais tarde',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
    loadStats();
  }, [filters, toast]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (stats) {
        setStats({
          ...stats,
          total: stats.total + 1,
          unread: stats.unread + 1
        });
      }

      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000
      });
    });

    return unsubscribe;
  }, [stats, toast]);

  async function loadStats(): Promise<void> {
    try {
      const data = await notificationService.getStats();
      setStats(data);
    } catch {
      // Silently fail
    }
  }

  async function handleMarkAsRead(id: string): Promise<void> {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, status: 'read' as const, readAt: new Date().toISOString() } : n
      ));
      if (stats) {
        setStats({ ...stats, unread: Math.max(0, stats.unread - 1) });
      }
    } catch {
      toast({
        title: 'Erro ao marcar como lida',
        variant: 'destructive'
      });
    }
  }

  async function handleMarkAllAsRead(): Promise<void> {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({
        ...n,
        status: 'read' as const,
        readAt: new Date().toISOString()
      })));
      if (stats) {
        setStats({ ...stats, unread: 0 });
      }
      toast({ title: 'Todas notificações marcadas como lidas' });
    } catch {
      toast({
        title: 'Erro ao marcar todas como lidas',
        variant: 'destructive'
      });
    }
  }

  async function handleArchive(id: string): Promise<void> {
    try {
      await notificationService.archiveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (stats) {
        setStats({ ...stats, total: stats.total - 1 });
      }
      toast({ title: 'Notificação arquivada' });
    } catch {
      toast({
        title: 'Erro ao arquivar notificação',
        variant: 'destructive'
      });
    }
  }

  function toggleFilter(type: 'status' | 'priority', value: string): void {
    setFilters(prev => {
      const currentArray = prev[type] || [];
      const typedArray = currentArray as string[];
      const newArray = typedArray.includes(value)
        ? typedArray.filter(item => item !== value)
        : [...typedArray, value];
      return { ...prev, [type]: newArray };
    });
  }

  const unreadCount = stats?.unread || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[420px] p-0">
        <Card className="border-0 shadow-none">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filters.status?.includes('unread')}
                      onCheckedChange={() => toggleFilter('status', 'unread')}
                    >
                      Não lidas
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.status?.includes('read')}
                      onCheckedChange={() => toggleFilter('status', 'read')}
                    >
                      Lidas
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filters.priority?.includes('critical')}
                      onCheckedChange={() => toggleFilter('priority', 'critical')}
                    >
                      Crítica
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.priority?.includes('high')}
                      onCheckedChange={() => toggleFilter('priority', 'high')}
                    >
                      Alta
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.priority?.includes('medium')}
                      onCheckedChange={() => toggleFilter('priority', 'medium')}
                    >
                      Média
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
            </div>

            {stats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{stats.total} total</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{stats.unread} não lidas</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{stats.todayCount} hoje</span>
              </div>
            )}
          </div>

          <ScrollArea className="h-[500px]">
            {loading && (
              <div className="p-8 text-center text-muted-foreground">
                Carregando...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhuma notificação</p>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <>
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onArchive={handleArchive}
                  />
                ))}
              </>
            )}
          </ScrollArea>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
