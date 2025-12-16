import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import MessageStatus, { MessageDeliveryStatus } from "./MessageStatus";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwn: boolean;
  status?: MessageDeliveryStatus;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showName?: boolean;
}

export default function MessageBubble({ message, showAvatar = false, showName = false }: MessageBubbleProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 mb-2 group",
        message.isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showAvatar && !message.isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="text-xs">
            {getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col max-w-[70%]", message.isOwn ? "items-end" : "items-start")}>
        {showName && !message.isOwn && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {message.senderName}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 break-words",
            message.isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {message.isOwn && message.status && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

