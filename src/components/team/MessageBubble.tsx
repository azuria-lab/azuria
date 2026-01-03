import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import MessageStatus, { MessageDeliveryStatus } from "./MessageStatus";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  CheckSquare2, 
  Copy, 
  Forward, 
  Info,
  Pin, 
  PinOff, 
  Plus, 
  Reply, 
  Star,
  Trash2,
  X,
} from "lucide-react";

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
  isStarred?: boolean;
  isPinned?: boolean;
  onReply?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onForward?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  onSelect?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onInfo?: (messageId: string) => void;
}

export default function MessageBubble({ 
  message, 
  showAvatar = false, 
  showName = false,
  isStarred = false,
  isPinned = false,
  onReply,
  onCopy,
  onForward,
  onPin,
  onStar,
  onSelect,
  onDelete,
  onReact,
  onInfo,
}: MessageBubbleProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

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

  const quickReactions = [
    { emoji: "👍", label: "Curtir" },
    { emoji: "❤️", label: "Amar" },
    { emoji: "😂", label: "Rir" },
    { emoji: "😮", label: "Surpreso" },
    { emoji: "😢", label: "Triste" },
    { emoji: "🙏", label: "Obrigado" },
  ];

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji);
      setSelectedReaction(emoji);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
          {isStarred && (
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          )}
          {message.isOwn && message.status && (
            <MessageStatus status={message.status} />
          )}
        </div>
      </div>
    </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Reações Rápidas */}
        <div className="px-2 py-2 border-b border-border">
          <div className="flex items-center gap-1">
            {quickReactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                onClick={() => handleReaction(reaction.emoji)}
                className={cn(
                  "text-lg p-1.5 rounded-md hover:bg-accent transition-colors",
                  selectedReaction === reaction.emoji && "bg-accent"
                )}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
            <button
              type="button"
              className="text-sm p-1.5 rounded-md hover:bg-accent transition-colors flex items-center justify-center"
              title="Mais reações"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Opções do Menu */}
        {onInfo && (
          <ContextMenuItem onClick={() => onInfo(message.id)}>
            <Info className="mr-2 h-4 w-4" />
            Dados da mensagem
          </ContextMenuItem>
        )}
        {onReply && (
          <ContextMenuItem onClick={() => onReply(message.id)}>
            <Reply className="mr-2 h-4 w-4" />
            Responder
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar
        </ContextMenuItem>
        {onSelect && (
          <ContextMenuItem onClick={() => onSelect(message.id)}>
            <CheckSquare2 className="mr-2 h-4 w-4" />
            Selecionar
          </ContextMenuItem>
        )}
        {onForward && (
          <ContextMenuItem onClick={() => onForward(message.id)}>
            <Forward className="mr-2 h-4 w-4" />
            Encaminhar
          </ContextMenuItem>
        )}
        {onPin && (
          <ContextMenuItem onClick={() => onPin(message.id)}>
            {isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Desafixar
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Fixar
              </>
            )}
          </ContextMenuItem>
        )}
         {onStar && (
           <ContextMenuItem onClick={() => onStar(message.id)}>
             {isStarred ? (
               <>
                 <div className="mr-2 h-4 w-4 relative flex items-center justify-center">
                   <Star className="h-4 w-4 absolute opacity-50" />
                   <X className="h-3 w-3 absolute" strokeWidth={3} />
                 </div>
                 Desfavoritar
               </>
             ) : (
               <>
                 <Star className="mr-2 h-4 w-4" />
                 Favoritar
               </>
             )}
           </ContextMenuItem>
         )}
        {onSelect && (
          <ContextMenuItem onClick={() => onSelect(message.id)}>
            <CheckSquare2 className="mr-2 h-4 w-4" />
            Selecionar
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {onDelete && (
          <ContextMenuItem 
            onClick={() => onDelete(message.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Apagar
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

