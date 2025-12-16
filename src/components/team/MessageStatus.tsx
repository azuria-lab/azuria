import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageDeliveryStatus = "pending" | "sent" | "delivered" | "read";

interface MessageStatusProps {
  status: MessageDeliveryStatus;
  className?: string;
}

export default function MessageStatus({ status, className }: MessageStatusProps) {
  return (
    <span className={cn("inline-flex items-center ml-1", className)}>
      {status === "pending" && (
        <Check className="h-3 w-3 text-muted-foreground/50" />
      )}
      {status === "sent" && (
        <Check className="h-3 w-3 text-muted-foreground/70" />
      )}
      {status === "delivered" && (
        <CheckCheck className="h-3 w-3 text-muted-foreground/70" />
      )}
      {status === "read" && (
        <CheckCheck className="h-3 w-3 text-primary" />
      )}
    </span>
  );
}

