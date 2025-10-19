import { useMemo } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { NotificationDropdown } from "./NotificationDropdown";

export default function SmartNotificationCenter() {
  const { notifications, markNotificationAsRead, refresh } = useDashboardStats();

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    refresh();
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unreadNotifications.map((notification) =>
        markNotificationAsRead(notification.id)
      )
    );
    refresh();
  };

  return (
    <NotificationDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}
