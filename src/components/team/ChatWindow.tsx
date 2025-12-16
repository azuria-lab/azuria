import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Info, MoreVertical, Paperclip, Phone, Send, Smile, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";
import { TeamMember } from "@/types/team";
import { MessageDeliveryStatus } from "./MessageStatus";

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

interface ChatWindowProps {
  chatId: string | null;
  chatName: string;
  chatAvatar?: string;
  isGroup: boolean;
  members?: TeamMember[];
  currentUserId: string;
  currentUserName: string;
  onEditName?: (newName: string) => void;
  onEditAvatar?: (avatarFile: File | string) => void;
  userStatus?: UserStatusType;
  onSendMessage?: (content: string) => Promise<void>;
  onLoadMessages?: (roomId: string) => Promise<any[]>;
  onMarkAsRead?: (roomId: string) => Promise<void>;
}

export default function ChatWindow({
  chatId,
  chatName,
  chatAvatar,
  isGroup,
  members = [],
  currentUserId,
  currentUserName,
  onEditName,
  onEditAvatar,
  userStatus,
  onSendMessage,
  onLoadMessages,
  onMarkAsRead,
}: ChatWindowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock messages - em produção viria do backend
  useEffect(() => {
    if (!chatId) {return;}

    const mockMessages: Message[] = [
      {
        id: "1",
        content: "Olá pessoal! Como estão os projetos?",
        senderId: "user-1",
        senderName: "João Silva",
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false,
        status: "read",
      },
      {
        id: "2",
        content: "Tudo certo por aqui! Acabei de finalizar a calculadora tributária.",
        senderId: currentUserId,
        senderName: currentUserName,
        timestamp: new Date(Date.now() - 3300000),
        isOwn: true,
        status: "read",
      },
      {
        id: "3",
        content: "Ótimo trabalho! 🎉",
        senderId: "user-2",
        senderName: "Maria Santos",
        timestamp: new Date(Date.now() - 3000000),
        isOwn: false,
        status: "read",
      },
    ];

    setMessages(mockMessages);
  }, [chatId, currentUserId, currentUserName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !chatId) {return;}

    const messageContent = inputMessage.trim();
    setInputMessage("");
    inputRef.current?.focus();

    // Mensagem otimista (mostra imediatamente)
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date(),
      isOwn: true,
      status: "pending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    if (onSendMessage) {
      // Enviar para o backend
      try {
        await onSendMessage(messageContent);
        // A mensagem será atualizada via real-time ou reload
      } catch (error) {
        console.error("Error sending message:", error);
        // Remover mensagem otimista em caso de erro
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      }
    } else {
      // Fallback para mock (durante desenvolvimento)
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? { ...msg, status: "sent", id: Date.now().toString() } : msg
          )
        );
      }, 500);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Selecione uma conversa para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {isGroup ? (
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chatAvatar} />
                  <AvatarFallback>{chatName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              {onEditAvatar && (
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file && chatId && onEditAvatar) {
                        onEditAvatar(file as any);
                      }
                    };
                    input.click();
                  }}
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
                  title="Alterar foto da sala"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={chatAvatar} />
                <AvatarFallback>{getInitials(chatName)}</AvatarFallback>
              </Avatar>
              {userStatus && (
                <div className="absolute bottom-0 right-0">
                  <UserStatus status={userStatus} size="md" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {isEditingName && onEditName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newName = formData.get("name") as string;
                  if (newName?.trim()) {
                    onEditName(newName.trim());
                    setIsEditingName(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Input
                  name="name"
                  defaultValue={chatName}
                  className="h-7 text-sm"
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsEditingName(false);
                    }
                  }}
                />
              </form>
            ) : (
              <>
                <h3 className="font-semibold text-sm text-foreground truncate">{chatName}</h3>
                {isGroup && (
                  <p className="text-xs text-muted-foreground">
                    {members.length} membro{members.length !== 1 ? "s" : ""}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isGroup && onEditName && (
                <DropdownMenuItem onClick={() => setIsEditingName(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar nome da sala
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Informações
              </DropdownMenuItem>
              <DropdownMenuItem>Silenciar</DropdownMenuItem>
              <DropdownMenuItem>Arquivar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-1">
          <AnimatePresence>
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = isGroup && !message.isOwn;
              const showName =
                isGroup &&
                !message.isOwn &&
                (prevMessage === null || prevMessage.senderId !== message.senderId);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  showName={showName}
                />
              );
            })}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 mb-2"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
              className="pr-10 min-h-[44px]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            size="icon"
            className="h-9 w-9 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

