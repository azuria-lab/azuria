import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import type { Notification } from "@/hooks/useDashboardStats";

interface NotificationToastProviderProps {
  children: React.ReactNode;
  latestNotification?: Notification;
}

export function NotificationToastProvider({
  children,
  latestNotification,
}: NotificationToastProviderProps) {
  useEffect(() => {
    if (latestNotification) {
      const icon = getToastIcon(latestNotification.type);
      const toastFn = getToastFunction(latestNotification.type);

      toastFn(latestNotification.title, {
        description: latestNotification.message,
        icon,
        duration: 5000,
      });
    }
  }, [latestNotification?.id]); // Apenas quando o ID muda (nova notificação)

  return (
    <>
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
        toastOptions={{
          className: "font-sans",
          style: {
            padding: "16px",
          },
        }}
      />
      {children}
    </>
  );
}

function getToastIcon(type: string) {
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
}

function getToastFunction(type: string) {
  switch (type) {
    case "success":
      return toast.success;
    case "warning":
      return toast.warning;
    case "info":
      return toast.info;
    case "error":
      return toast.error;
    default:
      return toast;
  }
}
