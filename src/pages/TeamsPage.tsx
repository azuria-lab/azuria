import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  AlertCircle, 
  Award, 
  Briefcase, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Clock,
  Crown,
  Filter,
  Github,
  Globe,
  LayoutGrid,
  Linkedin,
  List,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatList from "@/components/team/ChatList";
import ChatWindow from "@/components/team/ChatWindow";
import CreateRoomDialog from "@/components/team/CreateRoomDialog";
import { useChat } from "@/hooks/useChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/domains/auth";
import { Task, TaskPriority, TaskStatus, TeamMember } from "@/types/team";

// Mock data - em produção viria do backend
const mockTasks: Task[] = [
  {
    id: "1",
    teamId: "team-1",
    title: "Implementar calculadora tributária",
    description: "Desenvolver funcionalidade completa de cálculo de impostos",
    status: "in_progress",
    priority: "high",
    assignedTo: ["user-1", "user-2"],
    createdBy: "user-1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    dueDate: new Date("2024-02-01"),
    tags: ["desenvolvimento", "impostos"],
    checklist: [
      { id: "c1", taskId: "1", title: "Criar estrutura de dados", isCompleted: true, order: 1 },
      { id: "c2", taskId: "1", title: "Implementar cálculos básicos", isCompleted: true, order: 2 },
      { id: "c3", taskId: "1", title: "Adicionar testes unitários", isCompleted: false, order: 3 },
      { id: "c4", taskId: "1", title: "Documentar API", isCompleted: false, order: 4 },
    ],
  },
  {
    id: "2",
    teamId: "team-1",
    title: "Revisar precificação de produtos",
    description: "Analisar e ajustar preços dos produtos do catálogo",
    status: "review",
    priority: "medium",
    assignedTo: ["user-2"],
    createdBy: "user-1",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-19"),
    tags: ["análise", "precificação"],
  },
  {
    id: "3",
    teamId: "team-1",
    title: "Atualizar integração com Mercado Livre",
    description: "Implementar novas APIs do Mercado Livre",
    status: "todo",
    priority: "urgent",
    assignedTo: ["user-1"],
    createdBy: "user-2",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
    dueDate: new Date("2024-01-25"),
    tags: ["integração", "api"],
  },
  {
    id: "4",
    teamId: "team-1",
    title: "Criar relatório mensal de vendas",
    description: "Gerar relatório completo de vendas do mês",
    status: "done",
    priority: "low",
    assignedTo: ["user-2"],
    createdBy: "user-1",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    tags: ["relatório", "vendas"],
  },
];

const mockMembers: TeamMember[] = [
  {
    id: "m1",
    userId: "user-1",
    name: "João Silva",
    email: "joao@azuria.com.br",
    role: "admin",
    isActive: true,
    joinedAt: new Date("2024-01-01"),
  },
  {
    id: "m2",
    userId: "user-2",
    name: "Maria Santos",
    email: "maria@azuria.com.br",
    role: "manager",
    isActive: true,
    joinedAt: new Date("2024-01-05"),
  },
  {
    id: "m3",
    userId: "user-3",
    name: "Pedro Costa",
    email: "pedro@azuria.com.br",
    role: "member",
    isActive: true,
    joinedAt: new Date("2024-01-10"),
  },
];

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  todo: { label: "A fazer", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: Circle },
  in_progress: { label: "Em progresso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
  review: { label: "Revisão", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: AlertCircle },
  done: { label: "Concluído", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle2 },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  medium: { label: "Média", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

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
}

export default function TeamsPage() {
  const { userProfile } = useAuthContext();
  const reduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  
  // Hook de chat do backend
  const {
    rooms: backendRooms,
    loading: chatLoading,
    createRoom: backendCreateRoom,
    updateRoomName: backendUpdateRoomName,
    updateRoomAvatar: backendUpdateRoomAvatar,
    sendMessage: backendSendMessage,
    loadMessages: backendLoadMessages,
    markAsRead: backendMarkAsRead,
    updateUserStatus,
  } = useChat();

  // Atualizar status do usuário para online ao carregar
  useEffect(() => {
    if (userProfile?.id) {
      updateUserStatus("online");
    }
  }, [userProfile?.id, updateUserStatus]);

  // Converter rooms do backend para formato do ChatList
  const chats: Chat[] = useMemo(() => {
    if (!backendRooms || backendRooms.length === 0) {return [];}

    return backendRooms.map((room) => {
      // Buscar membros da sala (em produção, buscar do backend)
      const roomMembers = mockMembers.filter((m) =>
        room.members_count ? true : false // Simplificado - em produção buscar do backend
      );

      // Buscar status do usuário se for conversa privada
      let userStatus: "online" | "away" | "offline" | undefined;
      if (!room.is_group && room.members_count === 1) {
        // Em produção, buscar status do outro usuário
        userStatus = "online"; // Mock por enquanto
      }

      return {
        id: room.id,
        name: room.name,
        avatar: room.avatar_url,
        isGroup: room.is_group,
        members: roomMembers,
        lastMessage: room.last_message_text || undefined,
        lastMessageTime: room.last_message_at ? new Date(room.last_message_at) : undefined,
        unreadCount: room.unread_count || 0,
        userStatus,
      };
    });
  }, [backendRooms]);

  // Criar sala padrão "Chat do Time" se não existir
  useEffect(() => {
    if (!chatLoading && backendRooms.length === 0 && userProfile?.id) {
      backendCreateRoom("Chat do Time", "Sala principal do time", true).then((room) => {
        if (room) {
          setSelectedChatId(room.id);
        }
      });
    } else if (backendRooms.length > 0 && !selectedChatId) {
      // Selecionar primeira sala por padrão
      setSelectedChatId(backendRooms[0].id);
    }
  }, [chatLoading, backendRooms, userProfile?.id, selectedChatId, backendCreateRoom]);

  const handleCreateRoom = async (name: string, description?: string) => {
    const room = await backendCreateRoom(name, description, true);
    if (room) {
      setSelectedChatId(room.id);
    }
  };

  const handleEditRoomName = async (chatId: string, newName: string) => {
    await backendUpdateRoomName(chatId, newName);
  };

  const handleEditRoomAvatar = async (chatId: string, avatarFile: File | string) => {
    await backendUpdateRoomAvatar(chatId, avatarFile);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) {return;}
    await backendSendMessage(selectedChatId, content);
  };

  const handleLoadMessages = async (roomId: string) => {
    return await backendLoadMessages(roomId);
  };

  const handleMarkAsRead = async (roomId: string) => {
    await backendMarkAsRead(roomId);
  };

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, statusFilter, priorityFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    filteredTasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: TaskStatus) => {
    return statusConfig[status].color;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    return priorityConfig[priority].color;
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const currentUserId = userProfile?.id || "user-1";
  const currentUserName = userProfile?.name || "Você";

  const TaskCard = ({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status].icon;
    const completedChecklist = task.checklist?.filter((item) => item.isCompleted).length || 0;
    const totalChecklist = task.checklist?.length || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.checklist && totalChecklist > 0 && (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            <span>{completedChecklist}/{totalChecklist} concluído</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {task.assignedTo?.slice(0, 3).map((userId) => {
              const member = mockMembers.find((m) => m.userId === userId);
              return member ? (
                <Avatar key={userId} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ) : null;
            })}
            {task.assignedTo && task.assignedTo.length > 3 && (
              <span className="text-xs text-muted-foreground">+{task.assignedTo.length - 3}</span>
            )}
          </div>
          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
            {priorityConfig[task.priority].label}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Times | Azuria</title>
        <meta name="description" content="Gerencie seus times e tarefas de forma colaborativa" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Times</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus times e tarefas de forma colaborativa
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar membro
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova tarefa
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="todo">A fazer</SelectItem>
                    <SelectItem value="in_progress">Em progresso</SelectItem>
                    <SelectItem value="review">Revisão</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "board" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("board")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Membros do Time
                    </CardTitle>
                    <CardDescription>
                      {mockMembers.length} membro{mockMembers.length !== 1 ? "s" : ""} ativo{mockMembers.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {mockMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setSelectedChatId(`chat-${member.userId}`);
                      }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground truncate">{member.name}</p>
                          {member.role === "admin" && <Crown className="h-3 w-3 text-yellow-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {member.role === "admin" ? "Administrador" : 
                          member.role === "manager" ? "Gerente" : 
                          member.role === "member" ? "Membro" : "Visualizador"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          {/* Chat Premium - WhatsApp Style */}
          <Card className="h-[600px]">
            <div className="flex h-full">
              {/* Chat List */}
              <div className="w-full md:w-80 border-r border-border flex-shrink-0">
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  currentUserId={currentUserId}
                  onCreateRoom={() => setIsCreateRoomOpen(true)}
                />
              </div>

              {/* Chat Window */}
              <div className="flex-1 min-w-0">
                <ChatWindow
                  chatId={selectedChatId}
                  chatName={selectedChat?.name || ""}
                  chatAvatar={selectedChat?.avatar}
                  isGroup={selectedChat?.isGroup || false}
                  members={selectedChat?.members}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onEditName={
                    selectedChatId
                      ? (newName) => handleEditRoomName(selectedChatId, newName)
                      : undefined
                  }
                  onEditAvatar={
                    selectedChatId && selectedChat?.isGroup
                      ? (avatarUrl) => handleEditRoomAvatar(selectedChatId, avatarUrl)
                      : undefined
                  }
                  userStatus={selectedChat?.userStatus}
                  onSendMessage={handleSendMessage}
                  onLoadMessages={handleLoadMessages}
                  onMarkAsRead={handleMarkAsRead}
                />
              </div>
            </div>
          </Card>

          {/* Create Room Dialog */}
          <CreateRoomDialog
            open={isCreateRoomOpen}
            onOpenChange={setIsCreateRoomOpen}
            onCreateRoom={handleCreateRoom}
          />

          {/* Tasks View */}
          {viewMode === "board" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(statusConfig).map(([status, config]) => {
                const StatusIcon = config.icon;
                const tasks = tasksByStatus[status as TaskStatus];
                
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("h-4 w-4", config.color)} />
                        <h3 className="font-semibold text-sm text-foreground">{config.label}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {tasks.length}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                          Nenhuma tarefa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {filteredTasks.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        {/* Member Profile Modal - LinkedIn Style */}
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
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>Membro desde {new Date(selectedMember.joinedAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Mensagem
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
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
                        {mockTasks.filter(t => t.assignedTo?.includes(selectedMember.userId)).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Tarefas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {mockTasks.filter(t => t.assignedTo?.includes(selectedMember.userId) && t.status === "done").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Concluídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round((mockTasks.filter(t => t.assignedTo?.includes(selectedMember.userId) && t.status === "done").length / Math.max(mockTasks.filter(t => t.assignedTo?.includes(selectedMember.userId)).length, 1)) * 100)}%
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
                          <p className="text-xs text-muted-foreground">
                            {new Date(selectedMember.joinedAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} - Presente
                          </p>
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

                  {/* Contato */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Contato</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedMember.email}`} className="text-primary hover:underline">
                          {selectedMember.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>+55 (11) 99999-9999</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

