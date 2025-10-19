import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/useDashboardStats";

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: Readonly<NotificationDropdownProps>) {
  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "error":
        return "❌";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-yellow-500";
      case "info":
        return "border-l-blue-500";
      case "error":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {return "Agora";}
    if (minutes < 60) {return `${minutes}min atrás`;}
    if (hours < 24) {return `${hours}h atrás`;}
    if (days < 7) {return `${days}d atrás`;}
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Você está em dia! 🎉
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors border-l-4",
                    getNotificationColor(notification.type),
                    !notification.isRead && "bg-accent/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "text-sm line-clamp-2",
                            !notification.isRead && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(notification.id)}
                              className="h-7 w-7"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Ver todas as notificações
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
