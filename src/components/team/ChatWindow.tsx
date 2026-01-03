import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, BellOff, Briefcase, Calendar, ChevronDown, ChevronUp, Crown, Edit2, Forward, Info, Mail, MapPin, MessageCircle, MessageSquare, MoreVertical, Paperclip, Phone, Pin, Reply, Search, Send, Smile, Trash2, UserPlus, Users, Video, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";
import { TeamMember } from "@/types/team";
import { MessageDeliveryStatus } from "./MessageStatus";
import UserStatus, { type UserStatus as UserStatusType } from "./UserStatus";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwn: boolean;
  status?: MessageDeliveryStatus;
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  isGroup: boolean;
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
  onLoadMessages?: (roomId: string) => Promise<Message[]>;
  onMarkAsRead?: (roomId: string) => Promise<void>;
  onAddMember?: (memberId: string) => Promise<void>;
  onRemoveMember?: (memberId: string) => Promise<void>;
  availableMembers?: TeamMember[];
  tasks?: Array<{ assignedTo?: string[]; status: string }>;
  availableChats?: Chat[];
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
  onLoadMessages: _onLoadMessages,
  onMarkAsRead: _onMarkAsRead,
  onAddMember,
  onRemoveMember,
  availableMembers = [],
  tasks = [],
  availableChats = [],
}: ChatWindowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, _setIsTyping] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);
  const [forwardSearchQuery, setForwardSearchQuery] = useState("");
  const [selectedForwardChats, setSelectedForwardChats] = useState<Set<string>>(new Set());
  const [pinnedMessages, setPinnedMessages] = useState<Map<string, { expiresAt: Date }>>(new Map());
  const [starredMessages, setStarredMessages] = useState<Set<string>>(new Set());
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
  const [isMessageInfoOpen, setIsMessageInfoOpen] = useState(false);
  const [selectedMessageInfo, setSelectedMessageInfo] = useState<Message | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [messageToPin, setMessageToPin] = useState<string | null>(null);
  const [pinDuration, setPinDuration] = useState<"24h" | "7d" | "30d">("7d");
  const [isPinnedSectionOpen, setIsPinnedSectionOpen] = useState(true);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video" | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    const messageContent = replyToMessage 
      ? `↪ ${replyToMessage.senderName}: ${replyToMessage.content}\n\n${inputMessage.trim()}`
      : inputMessage.trim();
    
    setInputMessage("");
    setReplyToMessage(null);
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
        // eslint-disable-next-line no-console
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

  const handleReply = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyToMessage(message);
      inputRef.current?.focus();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  const handleForward = (messageId?: string) => {
    // Sempre entrar em modo de seleção quando clicar em "Encaminhar"
    setIsSelectionMode(true);
    
    // Se um messageId específico foi passado, selecionar essa mensagem
    if (messageId) {
      setSelectedMessages(new Set([messageId]));
    }
  };

  const handleForwardSelected = () => {
    // Abrir o diálogo de encaminhar apenas quando há mensagens selecionadas
    if (selectedMessages.size > 0) {
      setIsForwardDialogOpen(true);
    }
  };

  const handleConfirmForward = () => {
    if (selectedMessages.size === 0 || selectedForwardChats.size === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma mensagem e um destinatário.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Mensagens encaminhadas",
      description: `${selectedMessages.size} mensagem(ns) encaminhada(s) para ${selectedForwardChats.size} conversa(s).`,
    });

    // Limpar seleções
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
    setSelectedForwardChats(new Set());
    setIsForwardDialogOpen(false);
  };

  const handleCancelSelection = () => {
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  const handlePin = (messageId: string) => {
    // Se já está fixada, desafixar diretamente
    if (pinnedMessages.has(messageId)) {
      setPinnedMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(messageId);
        return newMap;
      });
      toast({
        title: "Mensagem desfixada",
        description: "A mensagem foi removida dos fixados.",
        duration: 1500,
      });
    } else {
      // Abrir diálogo para escolher duração
      setMessageToPin(messageId);
      setIsPinDialogOpen(true);
    }
  };

  const handleConfirmPin = () => {
    if (!messageToPin) {return;}

    const now = new Date();
    const expiresAt = new Date();

    switch (pinDuration) {
      case "24h":
        expiresAt.setHours(now.getHours() + 24);
        break;
      case "7d":
        expiresAt.setDate(now.getDate() + 7);
        break;
      case "30d":
        expiresAt.setDate(now.getDate() + 30);
        break;
    }

    setPinnedMessages((prev) => {
      const newMap = new Map(prev);
      newMap.set(messageToPin, { expiresAt });
      return newMap;
    });

    toast({
      title: "Mensagem fixada",
      description: `A mensagem foi fixada por ${pinDuration === "24h" ? "24 horas" : pinDuration === "7d" ? "7 dias" : "30 dias"}.`,
    });

    setIsPinDialogOpen(false);
    setMessageToPin(null);
    setPinDuration("7d"); // Reset para padrão
  };

  // Verificar e remover mensagens fixadas expiradas
  useEffect(() => {
    const checkExpiredPins = () => {
      const now = new Date();
      setPinnedMessages((prev) => {
        const newMap = new Map(prev);

        prev.forEach((value, messageId) => {
          if (value.expiresAt <= now) {
            newMap.delete(messageId);
          }
        });

        return newMap;
      });
    };

    // Verificar a cada minuto
    const interval = setInterval(checkExpiredPins, 60000);
    checkExpiredPins(); // Verificar imediatamente

    return () => clearInterval(interval);
  }, []);

  const handleStar = (messageId: string) => {
    setStarredMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        toast({
          title: "Favorito removido",
          description: "A mensagem foi removida dos favoritos.",
        });
      } else {
        newSet.add(messageId);
        toast({
          title: "Mensagem favoritada",
          description: "A mensagem foi adicionada aos favoritos.",
        });
      }
      return newSet;
    });
  };

  const handleSelect = (messageId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
    setSelectedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        // Se não há mais mensagens selecionadas, sair do modo de seleção
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    toast({
      title: "Mensagem excluída",
      description: "A mensagem foi removida.",
    });
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessageReactions((prev) => {
      const current = prev[messageId] || [];
      const newReactions = current.includes(emoji)
        ? current.filter((e) => e !== emoji)
        : [...current, emoji];
      
      return {
        ...prev,
        [messageId]: newReactions,
      };
    });
  };

  const handleMessageInfo = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setSelectedMessageInfo(message);
      setIsMessageInfoOpen(true);
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

  // Separar mensagens fixadas das não fixadas
  const { pinnedMessagesList, regularMessagesList } = useMemo(() => {
    const pinned: Message[] = [];
    const regular: Message[] = [];
    
    messages.forEach((message) => {
      if (pinnedMessages.has(message.id)) {
        pinned.push(message);
      } else {
        regular.push(message);
      }
    });
    
    // Ordenar fixadas por timestamp (mais antigas primeiro)
    pinned.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Ordenar regulares por timestamp (mais antigas primeiro)
    regular.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return {
      pinnedMessagesList: pinned,
      regularMessagesList: regular,
    };
  }, [messages, pinnedMessages]);

  const formatDateSeparator = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    
    if (messageDate.getTime() === today.getTime()) {
      return "Hoje";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Ontem";
    } else {
      const formatted = messageDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: messageDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
      // Capitalizar primeira letra
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  };

  const shouldShowDateSeparator = (currentMessage: Message, prevMessage: Message | null): boolean => {
    if (!prevMessage) {return true;}
    
    const currentDate = new Date(currentMessage.timestamp);
    const prevDate = new Date(prevMessage.timestamp);
    
    currentDate.setHours(0, 0, 0, 0);
    prevDate.setHours(0, 0, 0, 0);
    
    return currentDate.getTime() !== prevDate.getTime();
  };

  const handleAddMember = async (memberId: string) => {
    if (!onAddMember || !chatId) {return;}
    
    try {
      await onAddMember(memberId);
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado à conversa com sucesso.",
      });
      setIsAddMemberOpen(false);
      setSearchMemberQuery("");
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!onRemoveMember || !chatId) {return;}
    
    try {
      await onRemoveMember(memberId);
      toast({
        title: "Membro removido",
        description: "O membro foi removido da conversa.",
      });
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
    }
  };

  // Filtrar membros disponíveis (que não estão na conversa)
  const filteredAvailableMembers = availableMembers.filter(
    (member) => !members.some((m) => m.id === member.id) && member.id !== currentUserId
  ).filter((member) =>
    member.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

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
              {onEditAvatar && isEditingName && (
                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0];
                      if (file && chatId && onEditAvatar) {
                        onEditAvatar(file);
                      }
                    };
                    input.click();
                  }}
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors shadow-sm"
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
                <h3 
                  className="font-semibold text-sm text-foreground truncate cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsInfoOpen(true)}
                >
                  {chatName}
                </h3>
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => {
              setCallType("voice");
              setIsCallDialogOpen(true);
            }}
            title="Ligar"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => {
              setCallType("video");
              setIsCallDialogOpen(true);
            }}
            title="Chamada de vídeo"
          >
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
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsInfoOpen(true)}>
                <Info className="h-4 w-4 mr-2" />
                Informações
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setIsMuted(!isMuted);
                  toast({
                    title: isMuted ? "Notificações ativadas" : "Conversa silenciada",
                    description: isMuted 
                      ? "Você voltará a receber notificações desta conversa."
                      : "Você não receberá mais notificações desta conversa.",
                  });
                }}
              >
                <BellOff className="h-4 w-4 mr-2" />
                {isMuted ? "Ativar notificações" : "Silenciar"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setIsArchived(true);
                  toast({
                    title: "Conversa arquivada",
                    description: "Esta conversa foi arquivada. Você pode desarquivar a qualquer momento.",
                  });
                }}
                disabled={isArchived}
              >
                <Archive className="h-4 w-4 mr-2" />
                {isArchived ? "Arquivada" : "Arquivar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-1">
          {/* Seção de Mensagens Fixadas */}
          {pinnedMessagesList.length > 0 && (
            <div className="mb-4 pb-2 border-b border-border">
              <Button
                variant="ghost"
                onClick={() => setIsPinnedSectionOpen(!isPinnedSectionOpen)}
                className="w-full justify-start h-auto p-2 hover:bg-accent/50"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Pin className="h-3 w-3" />
                  <span>Mensagens fixadas</span>
                  <span className="text-xs text-muted-foreground/70">
                    ({pinnedMessagesList.length})
                  </span>
                  {isPinnedSectionOpen ? (
                    <ChevronUp className="h-3 w-3 ml-auto" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  )}
                </div>
              </Button>
              {isPinnedSectionOpen && (
                <AnimatePresence>
                  {pinnedMessagesList.map((message, index) => {
                    const prevMessage = index > 0 ? pinnedMessagesList[index - 1] : null;
                    const showAvatar = isGroup && !message.isOwn;
                    const showName =
                      isGroup &&
                      !message.isOwn &&
                      (prevMessage === null || prevMessage.senderId !== message.senderId);
                    const showDateSeparator = shouldShowDateSeparator(message, prevMessage);

                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <div className="px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground font-medium">
                              {formatDateSeparator(message.timestamp)}
                            </div>
                          </div>
                        )}
                        <div
                          className={cn(
                            "relative",
                            isSelectionMode && "cursor-pointer",
                            selectedMessages.has(message.id) && "ring-2 ring-primary rounded-lg"
                          )}
                          onClick={() => {
                            if (isSelectionMode) {
                              handleSelect(message.id);
                            }
                          }}
                        >
                          {isSelectionMode && (
                            <div className="absolute left-2 top-2 z-10">
                              <Checkbox
                                checked={selectedMessages.has(message.id)}
                                onCheckedChange={() => handleSelect(message.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                          <MessageBubble
                            message={message}
                            showAvatar={showAvatar}
                            showName={showName}
                            isStarred={starredMessages.has(message.id)}
                            isPinned={true}
                            onReply={handleReply}
                            onCopy={handleCopy}
                            onForward={handleForward}
                            onPin={handlePin}
                            onStar={handleStar}
                            onSelect={handleSelect}
                            onDelete={message.isOwn ? handleDelete : undefined}
                            onReact={handleReact}
                            onInfo={handleMessageInfo}
                          />
                        </div>
                      </div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          )}
          
          {/* Mensagens Regulares */}
          <AnimatePresence>
            {regularMessagesList.map((message, index) => {
              const prevMessage = index > 0 ? regularMessagesList[index - 1] : null;
              const showAvatar = isGroup && !message.isOwn;
              const showName =
                isGroup &&
                !message.isOwn &&
                (prevMessage === null || prevMessage.senderId !== message.senderId);
              const showDateSeparator = shouldShowDateSeparator(message, prevMessage);

              return (
                <div key={message.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground font-medium">
                        {formatDateSeparator(message.timestamp)}
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "relative",
                      isSelectionMode && "cursor-pointer",
                      selectedMessages.has(message.id) && "ring-2 ring-primary rounded-lg"
                    )}
                    onClick={() => {
                      if (isSelectionMode) {
                        handleSelect(message.id);
                      }
                    }}
                  >
                    {isSelectionMode && (
                      <div className="absolute left-2 top-2 z-10">
                        <Checkbox
                          checked={selectedMessages.has(message.id)}
                          onCheckedChange={() => handleSelect(message.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                    <MessageBubble
                      message={message}
                      showAvatar={showAvatar}
                      showName={showName}
                      isStarred={starredMessages.has(message.id)}
                      isPinned={pinnedMessages.has(message.id)}
                      onReply={handleReply}
                      onCopy={handleCopy}
                      onForward={handleForward}
                      onPin={handlePin}
                      onStar={handleStar}
                      onSelect={handleSelect}
                      onDelete={message.isOwn ? handleDelete : undefined}
                      onReact={handleReact}
                      onInfo={handleMessageInfo}
                    />
                  </div>
                </div>
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
        {replyToMessage && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {replyToMessage.isOwn ? "Você" : replyToMessage.senderName}
                </span>
              </div>
              <p className="text-xs text-foreground truncate">{replyToMessage.content}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => setReplyToMessage(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        {isSelectionMode && selectedMessages.size > 0 ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              onClick={handleCancelSelection}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-sm text-muted-foreground text-center">
              {selectedMessages.size} {selectedMessages.size === 1 ? "mensagem selecionada" : "mensagens selecionadas"}
            </div>
            <Button
              onClick={handleForwardSelected}
              disabled={selectedMessages.size === 0}
              size="icon"
              className="h-9 w-9 flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
            >
              <Forward className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0 text-destructive hover:text-destructive"
              onClick={() => {
                const selected = Array.from(selectedMessages);
                selected.forEach((id) => handleDelete(id));
                handleCancelSelection();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
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
                placeholder={replyToMessage ? "Digite uma resposta..." : "Digite uma mensagem..."}
                className="pr-10 min-h-[44px]"
              />
              <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <EmojiPicker
                    onSelect={(emoji) => {
                      setInputMessage((prev) => prev + emoji);
                      setIsEmojiPickerOpen(false);
                      inputRef.current?.focus();
                    }}
                  />
                </PopoverContent>
              </Popover>
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
        )}
      </div>

      {/* Dialog de Informações */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações da Conversa
            </DialogTitle>
            <DialogDescription>
              Detalhes sobre esta conversa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nome e Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={chatAvatar} />
                <AvatarFallback className="text-lg">
                  {chatName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{chatName}</h3>
                <p className="text-sm text-muted-foreground">
                  {isGroup ? "Grupo" : "Conversa privada"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Mensagens</span>
                </div>
                <p className="text-2xl font-semibold">{messages.length}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Membros</span>
                </div>
                <p className="text-2xl font-semibold">
                  {isGroup ? (members?.length || 0) : 2}
                </p>
              </div>
            </div>

            {isGroup && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Membros</h4>
                    {onAddMember && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddMemberOpen(true)}
                        className="h-8 text-xs"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                  {members && members.length > 0 ? (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div 
                          key={member.id} 
                          className="flex items-center gap-3 group cursor-pointer hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-colors"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          {onRemoveMember && member.id !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(member.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum membro na conversa</p>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Informações adicionais */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">
                  {isMuted ? "Silenciada" : "Ativa"}
                  {isArchived && " • Arquivada"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Criada em</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Adicionar Membro */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Adicionar Membro
            </DialogTitle>
            <DialogDescription>
              Selecione um membro da equipe para adicionar à conversa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="relative">
              <Input
                placeholder="Buscar membro..."
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                className="pl-9"
              />
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredAvailableMembers.length > 0 ? (
                filteredAvailableMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleAddMember(member.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchMemberQuery
                      ? "Nenhum membro encontrado"
                      : "Nenhum membro disponível para adicionar"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Informações do Membro */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {selectedMember && (
            <>
              {/* Header com foto de capa e perfil */}
              <div className="relative">
                {/* Banner/Cover */}
                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
                
                {/* Foto de perfil e informações principais */}
                <div className="relative px-6 pb-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-12">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      <AvatarImage src={selectedMember.avatar} />
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {getInitials(selectedMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 pt-2">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-foreground">
                              {selectedMember.name}
                            </h2>
                            {selectedMember.role === "admin" && (
                              <Crown className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {selectedMember.role === "admin" ? "Administrador" : 
                             selectedMember.role === "manager" ? "Gerente de Projetos" : 
                             selectedMember.role === "member" ? "Membro do Time" : "Visualizador"}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              <span>São Paulo, Brasil</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              <span>{selectedMember.email}</span>
                            </div>
                            {selectedMember.joinedAt && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>Membro desde {new Date(selectedMember.joinedAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Mensagem
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estatísticas */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {tasks.filter(t => t.assignedTo?.includes(selectedMember.userId)).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Tarefas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {tasks.filter(t => t.assignedTo?.includes(selectedMember.userId) && t.status === "done").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Concluídas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {tasks.filter(t => t.assignedTo?.includes(selectedMember.userId)).length > 0
                        ? Math.round((tasks.filter(t => t.assignedTo?.includes(selectedMember.userId) && t.status === "done").length / tasks.filter(t => t.assignedTo?.includes(selectedMember.userId)).length) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa de conclusão</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Conteúdo */}
              <div className="px-6 py-4 space-y-6">
                {/* Sobre */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sobre</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedMember.role === "admin" 
                      ? "Administrador responsável pela gestão estratégica do time e definição de diretrizes. Focado em resultados e crescimento da equipe."
                      : selectedMember.role === "manager"
                      ? "Gerente de projetos com experiência em coordenação de equipes e entrega de resultados. Especialista em metodologias ágeis."
                      : "Membro dedicado do time, comprometido com a excelência e colaboração. Sempre em busca de aprender e contribuir."}
                  </p>
                </div>

                {/* Experiência */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Experiência</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">
                          {selectedMember.role === "admin" ? "Diretor de Operações" : 
                           selectedMember.role === "manager" ? "Gerente de Projetos" : 
                           "Desenvolvedor"}
                        </p>
                        <p className="text-xs text-muted-foreground">Azuria</p>
                        {selectedMember.joinedAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedMember.joinedAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} - Presente
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Habilidades */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.role === "admin" 
                      ? ["Gestão de Equipes", "Estratégia", "Liderança", "Planejamento"].map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))
                      : selectedMember.role === "manager"
                      ? ["Scrum", "Gestão de Projetos", "Comunicação", "Agile"].map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))
                      : ["Desenvolvimento", "Colaboração", "Resolução de Problemas"].map((skill) => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Informações da Mensagem */}
      <Dialog open={isMessageInfoOpen} onOpenChange={setIsMessageInfoOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Dados da Mensagem
            </DialogTitle>
          </DialogHeader>

          {selectedMessageInfo && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{selectedMessageInfo.content}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enviada em</span>
                  <span className="font-medium">
                    {selectedMessageInfo.timestamp.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enviada por</span>
                  <span className="font-medium">{selectedMessageInfo.senderName}</span>
                </div>
                {selectedMessageInfo.status && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">
                      {selectedMessageInfo.status === "read" ? "Lida" :
                       selectedMessageInfo.status === "delivered" ? "Entregue" :
                       selectedMessageInfo.status === "sent" ? "Enviada" : "Pendente"}
                    </span>
                  </div>
                )}
                {messageReactions[selectedMessageInfo.id] && messageReactions[selectedMessageInfo.id].length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reações</span>
                    <div className="flex items-center gap-1">
                      {messageReactions[selectedMessageInfo.id].map((emoji, index) => (
                        <span key={index} className="text-lg">{emoji}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Fixar Mensagem */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Defina por quanto tempo a mensagem ficará fixada</DialogTitle>
            <DialogDescription>
              Você pode desafixar a mensagem a qualquer momento.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={pinDuration} onValueChange={(value) => setPinDuration(value as "24h" | "7d" | "30d")}>
              <div className="flex items-center space-x-2 py-3">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h" className="flex-1 cursor-pointer font-normal">
                  24 horas
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-3">
                <RadioGroupItem value="7d" id="7d" />
                <Label htmlFor="7d" className="flex-1 cursor-pointer font-normal">
                  7 dias
                </Label>
              </div>
              <div className="flex items-center space-x-2 py-3">
                <RadioGroupItem value="30d" id="30d" />
                <Label htmlFor="30d" className="flex-1 cursor-pointer font-normal">
                  30 dias
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsPinDialogOpen(false);
                setMessageToPin(null);
                setPinDuration("7d");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmPin} className="bg-green-600 hover:bg-green-700 text-white">
              Fixar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Encaminhar Mensagens */}
      <Dialog open={isForwardDialogOpen} onOpenChange={setIsForwardDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Encaminhar mensagens para</DialogTitle>
            <DialogDescription>
              Selecione as conversas para onde deseja encaminhar {selectedMessages.size} {selectedMessages.size === 1 ? "mensagem" : "mensagens"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Barra de pesquisa */}
            <div className="relative">
              <Input
                placeholder="Pesquisar nome ou número"
                value={forwardSearchQuery}
                onChange={(e) => setForwardSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Lista de conversas */}
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-2">
                Conversas recentes
              </div>
              {availableChats
                .filter((chat) => 
                  chat.id !== chatId && // Excluir a conversa atual
                  (chat.name.toLowerCase().includes(forwardSearchQuery.toLowerCase()) ||
                   (chat.isGroup && "grupo".includes(forwardSearchQuery.toLowerCase())))
                )
                .map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => {
                      setSelectedForwardChats((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(chat.id)) {
                          newSet.delete(chat.id);
                        } else {
                          newSet.add(chat.id);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Checkbox
                      checked={selectedForwardChats.has(chat.id)}
                      onCheckedChange={() => {
                        setSelectedForwardChats((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(chat.id)) {
                            newSet.delete(chat.id);
                          } else {
                            newSet.add(chat.id);
                          }
                          return newSet;
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>
                        {chat.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {chat.isGroup ? "Grupo" : "Conversa direta"}
                      </p>
                    </div>
                  </div>
                ))}
              {availableChats.filter((chat) => chat.id !== chatId).length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma conversa disponível
                </div>
              )}
            </div>
          </div>

          {/* Barra de seleção */}
          {selectedForwardChats.size > 0 && (
            <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedForwardChats.size} {selectedForwardChats.size === 1 ? "item selecionado" : "itens selecionados"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedForwardChats(new Set())}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsForwardDialogOpen(false);
                setSelectedForwardChats(new Set());
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmForward}
              disabled={selectedForwardChats.size === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Encaminhar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Chamada */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {callType === "video" ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <Phone className="h-5 w-5 text-primary" />
              )}
              {callType === "video" ? "Chamada de Vídeo" : "Chamada de Voz"}
            </DialogTitle>
            <DialogDescription>
              {isGroup 
                ? `Iniciar ${callType === "video" ? "chamada de vídeo" : "chamada de voz"} com ${chatName}?`
                : `Ligar para ${chatName}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={chatAvatar} />
                  <AvatarFallback className="text-2xl">
                    {chatName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isCalling && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{
                      scale: [1, 1.5, 1.5],
                      opacity: [0.5, 0, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{chatName}</h3>
                {isGroup && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {members.length} {members.length === 1 ? "membro" : "membros"}
                  </p>
                )}
                {isCalling && (
                  <p className="text-sm text-muted-foreground mt-2 animate-pulse">
                    Chamando...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCallDialogOpen(false);
                setIsCalling(false);
                setCallType(null);
              }}
              disabled={isCalling}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsCalling(true);
                // Simular início de chamada
                setTimeout(() => {
                  toast({
                    title: callType === "video" ? "Chamada de vídeo iniciada" : "Chamada iniciada",
                    description: isGroup 
                      ? `Conectando com ${members.length} ${members.length === 1 ? "membro" : "membros"}...`
                      : `Conectando com ${chatName}...`,
                  });
                  setIsCallDialogOpen(false);
                  setIsCalling(false);
                  setCallType(null);
                }, 1500);
              }}
              disabled={isCalling}
              className={callType === "video" 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-primary hover:bg-primary/90"}
            >
              {isCalling ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full bg-white mr-2"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  Conectando...
                </>
              ) : (
                <>
                  {callType === "video" ? (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Iniciar Vídeo
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de seletor de emojis
function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const emojiCategories = [
    {
      name: "Frequentes",
      emojis: ["😀", "😂", "❤️", "👍", "👎", "😊", "😍", "🤔", "😅", "🙏", "🎉", "🔥"],
    },
    {
      name: "Emoções",
      emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐"],
    },
    {
      name: "Gestos",
      emojis: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    },
    {
      name: "Objetos",
      emojis: ["💼", "📁", "📂", "📅", "📆", "📈", "📉", "📊", "📋", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🗑️", "🔒", "🔓", "🔑", "🗝️", "🔨", "🪓", "⚒️", "🛠️", "🗡️", "⚔️", "🔫", "🏹", "🛡️", "🔧", "🪛", "🔩", "⚙️", "⚖️", "🔗", "⛓️", "🧰", "🧲"],
    },
    {
      name: "Símbolos",
      emojis: ["✅", "❌", "✔️", "✖️", "➕", "➖", "➗", "✳️", "❇️", "❓", "❔", "❕", "❗", "💯", "🔟", "🔢", "#️⃣", "*️⃣", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔠", "🔡", "🔤", "🆕", "🆓", "🆒", "🆗", "🆙", "🆚", "🈁", "🈂️", "🈷️", "🈶", "🈯", "🉐", "🈹", "🈲", "🉑", "🈸", "🈴", "🈳", "㊗️", "㊙️", "🈺", "🈵"],
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-foreground mb-2">Emojis</h4>
      </div>
      <div className="max-h-[300px] overflow-y-auto space-y-4">
        {emojiCategories.map((category) => (
          <div key={category.name}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{category.name}</p>
            <div className="grid grid-cols-8 gap-1">
              {category.emojis.map((emoji, index) => (
                <button
                  key={`${category.name}-${index}`}
                  type="button"
                  onClick={() => onSelect(emoji)}
                  className="text-xl p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
