import { useState } from "react";
import { motion } from "framer-motion";
import { Circle, MessageCircle, Plus, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TeamMember } from "@/types/team";
import UserStatus, { UserStatus as UserStatusType } from "./UserStatus";

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isGroup: boolean;
  members?: TeamMember[];
  isOnline?: boolean;
  userStatus?: UserStatusType;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUserId: string;
  onCreateRoom?: () => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat, currentUserId, onCreateRoom }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatTime = (date?: Date) => {
    if (!date) {return "";}
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {return "Agora";}
    if (minutes < 60) {return `${minutes}m`;}
    if (minutes < 1440) {return `${Math.floor(minutes / 60)}h`;}
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
          {onCreateRoom && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onCreateRoom}
              title="Criar nova sala"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const isSelected = selectedChatId === chat.id;
          
          return (
            <motion.div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/50",
                isSelected ? "bg-accent" : "hover:bg-accent/50"
              )}
              whileHover={{ backgroundColor: "hsl(var(--accent) / 0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative flex-shrink-0">
                {chat.isGroup ? (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                ) : (
                  <>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
                    </Avatar>
                    {chat.userStatus && (
                      <div className="absolute bottom-0 right-0">
                        <UserStatus status={chat.userStatus} size="md" />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm text-foreground truncate">
                    {chat.name}
                  </h3>
                  {chat.lastMessageTime && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage || "Nenhuma mensagem"}
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center px-1.5 bg-primary text-primary-foreground">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

