import { type ReactNode, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Activity, 
  AlertCircle, 
  ArrowRight, 
  Bell, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Clock,
  Crown,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatList from "@/components/team/ChatList";
import ChatWindow, { type Message } from "@/components/team/ChatWindow";
import CreateRoomDialog from "@/components/team/CreateRoomDialog";
import CreateDirectChatDialog from "@/components/team/CreateDirectChatDialog";
import { useChat } from "@/hooks/useChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useConsciousnessContext } from "@/azuria_ai/consciousness/ConsciousnessProvider";
import { Task, TaskPriority, TaskStatus, TeamMember } from "@/types/team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useTeam } from "@/hooks/useTeam";

// Mock data - mantido como fallback
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

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: typeof CheckCircle2; accentColor: string; lightAccent: string }> = {
  todo: { 
    label: "Em aberto", 
    color: "text-gray-600 dark:text-gray-400", 
    icon: Circle,
    accentColor: "#8E8E93",
    lightAccent: "rgba(142, 142, 147, 0.1)",
  },
  in_progress: { 
    label: "Em progresso", 
    color: "text-blue-600 dark:text-blue-400", 
    icon: Clock,
    accentColor: "#007AFF",
    lightAccent: "rgba(0, 122, 255, 0.1)",
  },
  review: { 
    label: "Revisão", 
    color: "text-orange-600 dark:text-orange-400", 
    icon: AlertCircle,
    accentColor: "#FF9500",
    lightAccent: "rgba(255, 149, 0, 0.1)",
  },
  done: { 
    label: "Concluído", 
    color: "text-green-600 dark:text-green-400", 
    icon: CheckCircle2,
    accentColor: "#34C759",
    lightAccent: "rgba(52, 199, 89, 0.1)",
  },
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

// Helper functions for role labels
const getRoleLabel = (role: string): string => {
  if (role === "admin") {return "Administrador";}
  if (role === "manager") {return "Gerente";}
  if (role === "member") {return "Membro";}
  return "Visualizador";
};

const getMemberRoleTitle = (role: string): string => {
  if (role === "admin") {return "Administrador";}
  if (role === "manager") {return "Gerente de Projetos";}
  if (role === "member") {return "Membro do Time";}
  return "Visualizador";
};

const getMemberJobTitle = (role: string): string => {
  if (role === "admin") {return "Diretor de Operações";}
  if (role === "manager") {return "Gerente de Projetos";}
  return "Desenvolvedor";
};

const getMemberDescription = (role: string): string => {
  if (role === "admin") {
    return "Administrador responsável pela gestão estratégica do time e definição de diretrizes. Focado em resultados e crescimento da equipe.";
  }
  if (role === "manager") {
    return "Gerente de projetos com experiência em coordenação de equipes e entrega de resultados. Especialista em metodologias ágeis.";
  }
  return "Membro dedicado do time, comprometido com a excelência e colaboração. Sempre em busca de aprender e contribuir.";
};

const getMemberSkills = (role: string): string[] => {
  if (role === "admin") {
    return ["Liderança", "Estratégia", "Tomada de Decisão", "Gestão"];
  }
  if (role === "manager") {
    return ["Scrum", "Gestão de Projetos", "Comunicação", "Agile"];
  }
  return ["Desenvolvimento", "Colaboração", "Resolução de Problemas"];
};

// Componente de coluna droppable - extraído para evitar nested component
interface DroppableColumnProps {
  status: TaskStatus;
  children: ReactNode;
}

const DroppableColumn = ({ status, children }: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const config = statusConfig[status];

  return (
    <motion.div
      ref={setNodeRef}
      initial={false}
      animate={{
        scale: isOver ? 1.01 : 1,
        borderColor: isOver ? config.accentColor : undefined,
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex flex-col rounded-2xl border transition-all duration-300 min-h-[450px]",
        "bg-background/50 backdrop-blur-sm",
        "border-border/60 shadow-sm hover:shadow-md",
        isOver && "shadow-xl border-2"
      )}
      style={{
        borderColor: isOver ? config.accentColor : undefined,
      }}
    >
      {children}
    </motion.div>
  );
};

// Componente de card de tarefa - extraído para evitar nested component
interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  getInitials: (name: string) => string;
  getPriorityColor: (priority: TaskPriority) => string;
}

const TaskCard = ({ task, members, getInitials, getPriorityColor }: TaskCardProps) => {
  const _StatusIcon = statusConfig[task.status].icon;
  const completedChecklist = task.checklist?.filter((item) => item.isCompleted).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
      status: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-card border border-border rounded-lg p-4 opacity-40"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1">
              {task.title}
            </h4>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-lg p-4 hover:bg-white dark:hover:bg-gray-900 hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md"
      {...attributes}
      {...listeners}
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
            const member = members.find((m) => m.userId === userId);
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

export default function TeamsPage() {
  const { userProfile, user } = useAuthContext();
  const consciousness = useConsciousnessContext();
  const _reduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isCreateDirectChatOpen, setIsCreateDirectChatOpen] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "tasks" | "chat">("overview");
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  
  // Hook para buscar dados reais da equipe
  const {
    members: realMembers,
    tasks: realTasks,
    isLoading: _isLoadingTeam,
    createTask: createTaskReal,
    updateTask: updateTaskReal,
    inviteMember: inviteMemberReal,
  } = useTeam(currentTeamId);

  // Usar dados reais ou fallback para mock
  const members = realMembers.length > 0 ? realMembers : mockMembers;
  const tasks = realTasks.length > 0 ? realTasks : mockTasks;
  const [tasksState, setTasksState] = useState<Task[]>(tasks);
  
  // Sincronizar tasksState com tasks reais
  useEffect(() => {
    setTasksState(tasks);
  }, [tasks]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Buscar ou criar equipe padrão do usuário
  useEffect(() => {
    const loadOrCreateTeam = async () => {
      if (!user?.id) {return;}

      try {
        // Buscar primeira equipe do usuário
        const { data: userTeams, error: teamsError } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (!teamsError && userTeams) {
          setCurrentTeamId(userTeams.team_id);
          return;
        }

        // Se não encontrou, buscar equipes onde é owner
        const { data: ownedTeams, error: ownedError } = await supabase
          .from("teams")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1)
          .single();

        if (!ownedError && ownedTeams) {
          setCurrentTeamId(ownedTeams.id);
          return;
        }

        // Se não encontrou nenhuma, criar uma equipe padrão
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (subscription) {
          const { data: newTeam, error: createError } = await supabase
            .from("teams")
            .insert({
              name: "Minha Equipe",
              owner_id: user.id,
              subscription_id: subscription.id,
            })
            .select()
            .single();

          if (!createError && newTeam) {
            setCurrentTeamId(newTeam.id);
            
            // Adicionar o próprio usuário como membro admin
            await supabase.from("team_members").insert({
              team_id: newTeam.id,
              user_id: user.id,
              role: "admin",
              invited_by: user.id,
              accepted_at: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Erro ao carregar/criar equipe:", err);
      }
    };

    loadOrCreateTeam();
  }, [user?.id]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [customRoles, setCustomRoles] = useState<string[]>(() => {
    // Carregar funções customizadas do localStorage
    const saved = localStorage.getItem('team_custom_roles');
    return saved ? JSON.parse(saved) : [];
  });
  const [newRoleName, setNewRoleName] = useState("");
  const [showAddRole, setShowAddRole] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskTags, setNewTaskTags] = useState("");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState<string[]>([]);
  const { toast } = useToast();

  // Estados para configurações
  const [onlyAdminsCanInvite, setOnlyAdminsCanInvite] = useState(true);
  const [allMembersCanCreateTasks, setAllMembersCanCreateTasks] = useState(true);
  const [onlyManagersCanEditTasks, setOnlyManagersCanEditTasks] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);

  // Salvar funções customizadas no localStorage
  useEffect(() => {
    localStorage.setItem('team_custom_roles', JSON.stringify(customRoles));
  }, [customRoles]);

  const handleAddCustomRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a função.",
        variant: "destructive",
      });
      return;
    }

    const roleKey = newRoleName.trim().toLowerCase().replaceAll(/\s+/g, '_');
    
    // Verificar se já existe
    if (customRoles.includes(roleKey) || ['member', 'manager', 'admin'].includes(roleKey)) {
      toast({
        title: "Erro",
        description: "Esta função já existe.",
        variant: "destructive",
      });
      return;
    }

    setCustomRoles([...customRoles, roleKey]);
    setNewRoleName("");
    setShowAddRole(false);
    toast({
      title: "Função criada",
      description: `A função "${newRoleName.trim()}" foi adicionada.`,
    });
  };

  const handleDeleteCustomRole = (roleKey: string) => {
    setCustomRoles(customRoles.filter(r => r !== roleKey));
    if (inviteRole === roleKey) {
      setInviteRole("member");
    }
    toast({
      title: "Função excluída",
      description: "A função foi removida com sucesso.",
    });
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      member: "Membro",
      manager: "Gerente",
      admin: "Administrador",
    };
    return roleLabels[role] || role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
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
    refreshRooms,
  } = useChat();

  // Atualizar status do usuário para online ao carregar
  useEffect(() => {
    if (userProfile?.id) {
      updateUserStatus("online");
    }
  }, [userProfile?.id, updateUserStatus]);

  // Estado local para controlar conversas excluídas (otimista)
  const [deletedChatIds, setDeletedChatIds] = useState<Set<string>>(new Set());

  // Limpar IDs deletados que não estão mais no backend (sincronização)
  useEffect(() => {
    if (!backendRooms || backendRooms.length === 0) {
      // Se não há salas no backend, limpar todos os IDs deletados
      if (deletedChatIds.size > 0) {
        setDeletedChatIds(new Set());
      }
      return;
    }

    // Limpar IDs deletados que não estão mais no backend
    const currentRoomIds = new Set(backendRooms.map((r) => r.id));
    const idsToRemove: string[] = [];
    deletedChatIds.forEach((id) => {
      if (!currentRoomIds.has(id)) {
        // Sala não está mais no backend, pode remover do Set
        idsToRemove.push(id);
      }
    });

    if (idsToRemove.length > 0) {
      setDeletedChatIds((prev) => {
        const newSet = new Set(prev);
        idsToRemove.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  }, [backendRooms, deletedChatIds]);

  // Converter rooms do backend para formato do ChatList
  const chats: Chat[] = useMemo(() => {
    if (!backendRooms || backendRooms.length === 0) {return [];}

    // Filtrar salas excluídas
    const filteredRooms = backendRooms.filter((room) => !deletedChatIds.has(room.id));

    return filteredRooms.map((room) => {
      // Buscar membros da sala (em produção, buscar do backend)
      const roomMembers = members.filter((_m) =>
        Boolean(room.members_count) // Simplificado - em produção buscar do backend
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
        isArchived: false, // Em produção, buscar do backend (chat_room_members.is_archived)
      };
    });
  }, [backendRooms, deletedChatIds]);

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

  const handleCreateDirectChat = async (memberId: string) => {
    try {
      const member = members.find((m) => m.userId === memberId);
      if (!member) {
        toast({
          title: "Erro",
          description: "Membro não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se já existe uma conversa direta com este membro
      const existingChat = chats.find(
        (chat) => !chat.isGroup && chat.members?.some((m) => m.userId === memberId)
      );

      if (existingChat) {
        // Se já existe, apenas selecionar
        setSelectedChatId(existingChat.id);
        toast({
          title: "Conversa encontrada",
          description: `Abrindo conversa com ${member.name}.`,
        });
        return;
      }

      // Criar nova conversa direta (isGroup = false)
      const room = await backendCreateRoom(member.name, undefined, false);
      if (room) {
        // Adicionar o membro à conversa
        const { error } = await supabase
          .from("chat_room_members")
          .insert({
            room_id: room.id,
            user_id: memberId,
            role: "member",
          });

        if (error) {
          // eslint-disable-next-line no-console
          console.error("Error adding member to direct chat:", error);
        }

        setSelectedChatId(room.id);
        toast({
          title: "Conversa criada",
          description: `Conversa direta com ${member.name} criada.`,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error creating direct chat:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa direta.",
        variant: "destructive",
      });
    }
  };

  const handleEditRoomName = async (chatId: string, newName: string) => {
    await backendUpdateRoomName(chatId, newName);
  };

  const handleEditRoomAvatar = async (chatId: string, avatarFile: File | string) => {
    await backendUpdateRoomAvatar(chatId, avatarFile);
  };

  const handleAddMember = async (memberId: string) => {
    if (!selectedChatId || !userProfile?.id) {return;}
    
    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        throw new Error("Membro não encontrado");
      }

      // Buscar user_id do membro (em produção, usar o userId real)
      const { error } = await supabase
        .from("chat_room_members")
        .insert({
          room_id: selectedChatId,
          user_id: member.userId,
          role: "member",
        });

      if (error) {throw error;}

      // Recarregar salas para atualizar a lista de membros
      await refreshRooms();

      toast({
        title: "Membro adicionado",
        description: `${member.name} foi adicionado à conversa.`,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error adding member:", error);
      throw error;
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedChatId || !userProfile?.id) {return;}
    
    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        throw new Error("Membro não encontrado");
      }

      const { error } = await supabase
        .from("chat_room_members")
        .delete()
        .eq("room_id", selectedChatId)
        .eq("user_id", member.userId);

      if (error) {throw error;}

      // Recarregar salas para atualizar a lista de membros
      await refreshRooms();

      toast({
        title: "Membro removido",
        description: `${member.name} foi removido da conversa.`,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error removing member:", error);
      throw error;
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      // Atualização otimista - remover da lista imediatamente
      setDeletedChatIds((prev) => new Set(prev).add(chatId));

      // Se a conversa selecionada foi deletada, limpar a seleção imediatamente
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }

      // Remover o usuário da sala (em produção, isso arquivaria ou removeria completamente)
      const { error } = await supabase
        .from("chat_room_members")
        .delete()
        .eq("room_id", chatId)
        .eq("user_id", currentUserId);

      if (error) {
        // eslint-disable-next-line no-console
        console.error("Error deleting chat member:", error);
        // Reverter atualização otimista em caso de erro
        setDeletedChatIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
        throw error;
      }

      // Aguardar um pouco para garantir que o banco processou
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Recarregar salas para sincronizar com o backend
      await refreshRooms();

      // Verificar se a sala ainda está na lista após recarregar
      // Se não estiver mais, podemos remover do deletedChatIds
      // Mas vamos manter no deletedChatIds permanentemente para garantir que não reapareça
      // O deletedChatIds só será limpo se a sala realmente não aparecer mais no backendRooms

      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida da sua lista.",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting chat:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  // Função para detectar menções no texto
  const detectMentions = (text: string, userId: string): boolean => {
    const user = members.find((m) => m.userId === userId);
    if (!user) {return false;}

    // Detectar @nome ou @email
    const mentionPattern = new RegExp(
      `@(${user.name.split(' ').map(n => n.toLowerCase()).join('|')}|${user.email.split('@')[0]})`,
      'i'
    );
    return mentionPattern.test(text);
  };

  // Função para enviar notificação da IA
  const sendAINotification = (message: string, type: 'chat' | 'task') => {
    if (!consciousness) {return;}

    // Verificar se as notificações estão ativadas
    if (type === 'chat' && !chatNotifications) {return;}
    if (type === 'task' && !taskNotifications) {return;}

    // Enviar mensagem através do sistema de consciousness
    consciousness.send('ai:notification', {
      message,
      type,
      timestamp: Date.now(),
      source: 'team-mention',
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) {return;}
    
    // Enviar mensagem
    await backendSendMessage(selectedChatId, content);

    // Verificar se o usuário atual foi mencionado
    if (detectMentions(content, currentUserId)) {
      const user = members.find((m) => m.userId === currentUserId);
      if (user) {
        const notificationMessage = `👋 Você foi mencionado em uma conversa! "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`;
        sendAINotification(notificationMessage, 'chat');
      }
    }

    // Verificar menções de outros usuários
    members.forEach((member) => {
      if (member.userId !== currentUserId && detectMentions(content, member.userId)) {
        // Em produção, isso seria enviado apenas para o usuário mencionado
        // Por enquanto, apenas logamos
        // eslint-disable-next-line no-console
        console.log(`Usuário ${member.name} foi mencionado`);
      }
    });
  };

  const handleLoadMessages = async (roomId: string): Promise<Message[]> => {
    const chatMessages = await backendLoadMessages(roomId);
    // Converter ChatMessage[] para Message[]
    return chatMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || 'Usuário',
      senderAvatar: msg.sender?.avatar_url,
      timestamp: new Date(msg.created_at),
      isOwn: msg.sender_id === currentUserId,
      status: msg.status,
    }));
  };

  const handleMarkAsRead = async (roomId: string) => {
    await backendMarkAsRead(roomId);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast({
        title: "Erro",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o email já está na equipe
    const existingMember = members.find((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase());
    if (existingMember) {
      toast({
        title: "Erro",
        description: "Este email já está na equipe.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTeamId) {
      toast({
        title: "Erro",
        description: "Nenhuma equipe selecionada.",
        variant: "destructive",
      });
      return;
    }

    // Usar função real do hook
    const success = await inviteMemberReal(inviteEmail.trim(), inviteRole);
    
    if (success) {
      toast({
        title: "Convite enviado",
        description: `Um convite foi enviado para ${inviteEmail.trim()}.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite. Verifique se o email existe no sistema.",
        variant: "destructive",
      });
      return;
    }

    // Limpar formulário
    setInviteEmail("");
    setInviteRole("member");
    setIsInviteMemberOpen(false);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título da tarefa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!currentTeamId || !user?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma equipe selecionada.",
        variant: "destructive",
      });
      return;
    }

    const newTaskData: Omit<Task, "id" | "createdAt" | "updatedAt"> = {
      teamId: currentTeamId,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      status: newTaskStatus,
      priority: newTaskPriority,
      assignedTo: newTaskAssignedTo.length > 0 ? newTaskAssignedTo : undefined,
      createdBy: user.id,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      tags: newTaskTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    };

    const createdTask = await createTaskReal(newTaskData);
    
    if (createdTask) {
      toast({
        title: "Tarefa criada",
        description: `A tarefa "${newTaskTitle.trim()}" foi criada com sucesso.`,
      });

      // Verificar se o usuário atual foi atribuído à tarefa
      if (newTaskAssignedTo.includes(user.id)) {
        const notificationMessage = `📋 Você foi atribuído à tarefa "${newTaskTitle.trim()}"`;
        sendAINotification(notificationMessage, 'task');
      }

      // Verificar se outros usuários foram atribuídos
      newTaskAssignedTo.forEach((userId) => {
        if (userId !== user.id) {
          const member = members.find((m) => m.userId === userId);
          if (member) {
            // Em produção, isso seria enviado apenas para o usuário atribuído
            // eslint-disable-next-line no-console
            console.log(`Usuário ${member.name} foi atribuído à tarefa`);
          }
        }
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa.",
        variant: "destructive",
      });
      return;
    }

    // Limpar formulário
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setNewTaskStatus("todo");
    setNewTaskDueDate("");
    setNewTaskTags("");
    setNewTaskAssignedTo([]);
    setIsCreateTaskOpen(false);
    
    // Mudar para a aba de tarefas
    setActiveTab("tasks");
  };

  const handleExportMembers = () => {
    // Criar CSV com lista de membros
    const headers = ["Nome", "Email", "Função", "Status", "Data de Entrada"];
    const rows = members.map((member) => [
      member.name,
      member.email,
      getRoleLabel(member.role),
      member.isActive ? "Ativo" : "Inativo",
      new Date(member.joinedAt).toLocaleDateString("pt-BR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Criar blob e fazer download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `membros-equipe-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast({
      title: "Exportação concluída",
      description: "A lista de membros foi exportada com sucesso.",
    });
  };

  const handleExportTasks = () => {
    // Criar CSV com relatório de tarefas
    const headers = [
      "Título",
      "Descrição",
      "Status",
      "Prioridade",
      "Atribuído a",
      "Criado por",
      "Data de Criação",
      "Data de Atualização",
      "Data de Vencimento",
      "Tags",
      "Checklist Completo",
      "Total de Itens",
    ];

    const rows = tasksState.map((task) => {
      const assignedMembers = task.assignedTo
        ? task.assignedTo.map(getMemberNameFromId).join("; ")
        : "Não atribuído";

      const createdByMember = members.find((m) => m.userId === task.createdBy);
      const createdByName = createdByMember ? createdByMember.name : task.createdBy;

      const completedChecklist = task.checklist?.filter((item) => item.isCompleted).length || 0;
      const totalChecklist = task.checklist?.length || 0;

      return [
        task.title,
        task.description || "",
        statusConfig[task.status].label,
        priorityConfig[task.priority].label,
        assignedMembers,
        createdByName,
        new Date(task.createdAt).toLocaleDateString("pt-BR"),
        new Date(task.updatedAt).toLocaleDateString("pt-BR"),
        task.dueDate ? new Date(task.dueDate).toLocaleDateString("pt-BR") : "",
        task.tags.join("; "),
        `${completedChecklist}/${totalChecklist}`,
        totalChecklist.toString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")),
    ].join("\n");

    // Criar blob e fazer download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-tarefas-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast({
      title: "Exportação concluída",
      description: `O relatório com ${tasks.length} tarefa${tasks.length === 1 ? "" : "s"} foi exportado com sucesso.`,
    });
  };

  const handleDeleteTeam = () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "EXCLUIR") {
      toast({
        title: "Confirmação inválida",
        description: "Digite 'EXCLUIR' para confirmar a exclusão da equipe.",
        variant: "destructive",
      });
      return;
    }

    // Simular exclusão da equipe (em produção, chamaria a API)
    // Limpar dados locais
    setTasksState([]);
    // mockMembers seria limpo em produção
    
    toast({
      title: "Equipe excluída",
      description: "A equipe foi excluída permanentemente.",
      variant: "destructive",
    });

    // Fechar diálogos
    setIsDeleteTeamOpen(false);
    setIsSettingsOpen(false);
    setDeleteConfirmationText("");
    
    // Redirecionar para dashboard ou página inicial
    // Em produção, usar navigate do react-router
  };

  const filteredTasks = useMemo(() => {
    return tasksState.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasksState, searchQuery, statusFilter, priorityFilter]);

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

  // Handlers para drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {return;}

    const taskId = active.id as string;
    let newStatus: TaskStatus | null = null;

    // Verificar se o over.id é um status válido (coluna)
    if (Object.keys(statusConfig).includes(over.id as string)) {
      newStatus = over.id as TaskStatus;
    } else {
      // Se não for uma coluna, pode ser uma tarefa - buscar o status da tarefa
      const overTask = tasksState.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
      
      // Tentar encontrar pela coluna pai através do data
      if (!newStatus && over.data.current) {
        const columnStatus = over.data.current.status as TaskStatus | undefined;
        if (columnStatus && Object.keys(statusConfig).includes(columnStatus)) {
          newStatus = columnStatus;
        }
      }
    }

    // Se não encontrou um status válido, não fazer nada
    if (!newStatus) {
      // eslint-disable-next-line no-console
      console.log('Status não encontrado para:', over.id);
      return;
    }

    // Verificar se o status realmente mudou
    const currentTask = tasksState.find((t) => t.id === taskId);
    if (!currentTask) {
      // eslint-disable-next-line no-console
      console.log('Tarefa não encontrada:', taskId);
      return;
    }
    
    if (currentTask.status === newStatus) {
      // eslint-disable-next-line no-console
      console.log('Status não mudou:', newStatus);
      return;
    }

    // Atualizar no backend
    updateTaskReal(taskId, { status: newStatus });
    
    // Atualizar estado local (otimista)
    setTasksState((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId && newStatus
          ? { ...task, status: newStatus, updatedAt: new Date() }
          : task
      )
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getPriorityColor = (priority: TaskPriority) => {
    return priorityConfig[priority].color;
  };

  // Helper para mapear membros atribuídos - evita nested function
  const getMemberNameFromId = (userId: string): string => {
    const member = members.find((m) => m.userId === userId);
    return member ? member.name : userId;
  };

  // Helper para toggle de seleção de membro - evita nested function
  const toggleMemberSelection = (userId: string) => {
    setNewTaskAssignedTo((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const currentUserId = userProfile?.id || "user-1";
  const currentUserName = userProfile?.name || "Você";

  return (
    <>
      <Helmet>
        <title>Equipe | Azuria</title>
        <meta name="description" content="Gerencie sua equipe e tarefas de forma colaborativa" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Moderno */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent -mt-8 leading-tight pb-1">
                  Equipe
                </h1>
                <p className="text-muted-foreground text-lg mt-3">
                  Colabore, gerencie e cresça junto com sua equipe
              </p>
            </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="default" 
                  className="gap-2"
                  onClick={() => setIsInviteMemberOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                Convidar membro
              </Button>
                <Button 
                  variant="default"
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsCreateTaskOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                Nova tarefa
              </Button>
            </div>
          </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
              <TabsList className="inline-flex items-center gap-3 bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="overview" 
                  className="gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
                >
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Membros</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Tarefas</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total de Membros</p>
                          <p className="text-2xl font-bold">{members.length}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-gray-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Conversas Ativas</p>
                          <p className="text-2xl font-bold">{chats.length}</p>
                        </div>
                        <MessageCircle className="h-8 w-8 opacity-50 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Em Progresso</p>
                          <p className="text-2xl font-bold">{tasksState.filter(t => t.status === "in_progress").length}</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                          <p className="text-2xl font-bold">{tasksState.filter(t => t.status === "done").length}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Membros Recentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Membros Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {members.slice(0, 3).map((member) => (
                          <motion.button
                            key={member.id}
                            whileHover={{ scale: 1.02, x: 4 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => {
                              setSelectedMember(member);
                              setActiveTab("members");
                            }}
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border hover:bg-white dark:hover:bg-gray-900 transition-colors cursor-pointer min-h-[60px] w-full text-left"
                            >
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium text-sm sm:text-base">{member.name}</h4>
                                  {member.role === "admin" && (
                                    <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{member.email}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full mt-4"
                        onClick={() => setActiveTab("members")}
                      >
                        Ver todos os membros
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Tarefas Recentes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Tarefas Recentes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {tasksState.slice(0, 3).map((task) => {
                          const StatusIcon = statusConfig[task.status].icon;
                          const getStatusColor = (status: TaskStatus) => {
                            switch (status) {
                              case "done": return "bg-green-500";
                              case "in_progress": return "bg-blue-500";
                              case "review": return "bg-yellow-500";
                              default: return "bg-gray-500";
                            }
                          };
                          return (
                            <motion.button
                              key={task.id}
                              whileHover={{ scale: 1.02, x: 4 }}
                              transition={{ duration: 0.2 }}
                              onClick={() => setActiveTab("tasks")}
                              className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border hover:bg-white dark:hover:bg-gray-900 transition-colors cursor-pointer min-h-[60px] w-full text-left"
                              >
                                <div className={`p-2 rounded-lg ${getStatusColor(task.status)} flex-shrink-0`}>
                                  <StatusIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-sm sm:text-base">{task.title}</h4>
                                    <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                                      {priorityConfig[task.priority].label}
                                    </Badge>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    {task.dueDate 
                                      ? new Date(task.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                                      : statusConfig[task.status].label}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </motion.button>
                          );
                        })}
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full mt-4"
                        onClick={() => setActiveTab("tasks")}
                      >
                        Ver todas as tarefas
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Membros do Time
                        </CardTitle>
                        <CardDescription>
                          {members.length} membro{members.length === 1 ? "" : "s"} ativo{members.length === 1 ? "" : "s"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => setIsSettingsOpen(true)}
                        >
                          <Settings className="h-4 w-4" />
                          Configurações
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => setIsInviteMemberOpen(true)}
                        >
                          <UserPlus className="h-4 w-4" />
                          Convidar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedMember(member)}
                          className="flex flex-col items-center p-6 rounded-xl border border-border bg-card hover:bg-white dark:hover:bg-gray-900 hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <Avatar className="h-20 w-20 mb-4 ring-4 ring-background group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xl">{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div className="text-center w-full">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <h3 className="font-semibold text-base text-foreground">{member.name}</h3>
                              {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{member.email}</p>
                            <Badge variant="secondary" className="mb-3">
                              {getRoleLabel(member.role)}
                            </Badge>
                            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                              <div className="text-center">
                                <p className="text-lg font-bold">{tasksState.filter(t => t.assignedTo?.includes(member.userId)).length}</p>
                                <p className="text-xs text-muted-foreground">Tarefas</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold">{tasksState.filter(t => t.assignedTo?.includes(member.userId) && t.status === "done").length}</p>
                                <p className="text-xs text-muted-foreground">Concluídas</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="mt-6 space-y-6">
                {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
                    <SelectItem value="todo">Em aberto</SelectItem>
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
                          className="gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                          <span className="hidden sm:inline">Quadro</span>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                          className="gap-2"
                  >
                    <List className="h-4 w-4" />
                          <span className="hidden sm:inline">Lista</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

                {/* Tasks View */}
                {viewMode === "board" ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const StatusIcon = config.icon;
                        const columnTasks = tasksByStatus[status as TaskStatus];
                        
                        return (
                          <DroppableColumn key={status} status={status as TaskStatus}>
                            {/* Header Apple Style */}
                            <div 
                              className="px-6 py-5 border-b border-border/40"
                              style={{
                                background: `linear-gradient(to bottom, ${config.lightAccent}, transparent)`,
                              }}
                            >
                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3.5">
                                  <div 
                                    className="p-2.5 rounded-xl"
                                    style={{
                                      backgroundColor: config.lightAccent,
                                    }}
                                  >
                                    <StatusIcon 
                                      className="h-5 w-5" 
                                      style={{ color: config.accentColor }}
                                    />
                                  </div>
                  <div>
                                    <h3 
                                      className="font-semibold text-[15px] tracking-tight"
                                      style={{ color: config.accentColor }}
                                    >
                                      {config.label}
                                    </h3>
                                    <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium">
                                      {columnTasks.length} {columnTasks.length === 1 ? "tarefa" : "tarefas"}
                                    </p>
                  </div>
                </div>
                                <div 
                                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: config.lightAccent,
                                    color: config.accentColor,
                                  }}
                                >
                                  {columnTasks.length}
                                </div>
                              </div>
                            </div>
                            
                            {/* Tasks Container */}
                            <div className="flex-1 p-5 space-y-3 overflow-y-auto">
                              <SortableContext
                                items={columnTasks.map((t) => t.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {columnTasks.map((task) => (
                                  <TaskCard key={task.id} task={task} members={members} getInitials={getInitials} getPriorityColor={getPriorityColor} />
                                ))}
                              </SortableContext>
                              {columnTasks.length === 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className="flex flex-col items-center justify-center py-16 text-center"
                                >
                                  <div 
                                    className="p-4 rounded-2xl mb-4"
                                    style={{
                                      backgroundColor: config.lightAccent,
                                    }}
                                  >
                                    <StatusIcon 
                                      className="h-7 w-7 opacity-40" 
                                      style={{ color: config.accentColor }}
                                    />
                                  </div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1.5">
                                    Nenhuma tarefa
                                  </p>
                                  <p className="text-xs text-muted-foreground/60 font-normal">
                                    Arraste uma tarefa aqui
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </DroppableColumn>
                        );
                      })}
                    </div>
                    <DragOverlay dropAnimation={null}>
                      {activeId ? (
                        (() => {
                          const activeTask = tasks.find((t) => t.id === activeId);
                          if (!activeTask) {return null;}
                          
                          const completedChecklist = activeTask.checklist?.filter((item) => item.isCompleted).length || 0;
                          const totalChecklist = activeTask.checklist?.length || 0;
                          
                          return (
                            <div className="bg-card border border-border rounded-lg p-4 shadow-2xl rotate-2 w-64">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm text-foreground mb-1">
                                    {activeTask.title}
                                  </h4>
                                  {activeTask.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                      {activeTask.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {activeTask.checklist && totalChecklist > 0 && (
                                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>{completedChecklist}/{totalChecklist} concluído</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1">
                                  {activeTask.assignedTo?.slice(0, 3).map((userId) => {
                                    const member = members.find((m) => m.userId === userId);
                                    return member ? (
                                      <Avatar key={userId} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className="text-[10px]">
                                          {getInitials(member.name)}
                                        </AvatarFallback>
                      </Avatar>
                                    ) : null;
                                  })}
                        </div>
                                <Badge className={cn("text-xs", getPriorityColor(activeTask.priority))}>
                                  {priorityConfig[activeTask.priority].label}
                        </Badge>
                      </div>
                    </div>
                          );
                        })()
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} members={members} getInitials={getInitials} getPriorityColor={getPriorityColor} />
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
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-6">
                <Card className="h-[700px] overflow-hidden">
                  {chatLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Carregando conversas...</p>
                      </div>
                    </div>
                  ) : (
            <div className="flex h-full">
              {/* Chat List */}
                      <div className="w-full md:w-80 border-r border-border flex-shrink-0 overflow-hidden">
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  currentUserId={currentUserId}
                  onCreateRoom={() => setIsCreateRoomOpen(true)}
                  onCreateDirectChat={() => setIsCreateDirectChatOpen(true)}
                  onViewArchived={() => setShowArchivedChats(!showArchivedChats)}
                  onDeleteChat={handleDeleteChat}
                  showArchived={showArchivedChats}
                />
              </div>

              {/* Chat Window */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {selectedChatId ? (
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
                  userStatus={undefined}
                  onSendMessage={handleSendMessage}
                  onLoadMessages={handleLoadMessages}
                  onMarkAsRead={handleMarkAsRead}
                  onAddMember={selectedChat?.isGroup ? handleAddMember : undefined}
                  onRemoveMember={selectedChat?.isGroup ? handleRemoveMember : undefined}
                  availableMembers={members}
                  tasks={tasks}
                  availableChats={chats.map((chat) => ({
                    id: chat.id,
                    name: chat.name,
                    avatar: chat.avatar,
                    isGroup: chat.isGroup,
                  }))}
                />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted/30">
                            <div className="text-center space-y-2 p-6">
                              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                              <p className="text-sm font-medium text-foreground">Selecione uma conversa</p>
                              <p className="text-xs text-muted-foreground">
                                Escolha uma conversa da lista ou crie uma nova sala
                              </p>
              </div>
            </div>
                        )}
                      </div>
                    </div>
                  )}
          </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

          {/* Create Room Dialog */}
          <CreateRoomDialog
            open={isCreateRoomOpen}
            onOpenChange={setIsCreateRoomOpen}
            onCreateRoom={handleCreateRoom}
          />

        {/* Create Direct Chat Dialog */}
        <CreateDirectChatDialog
          open={isCreateDirectChatOpen}
          onOpenChange={setIsCreateDirectChatOpen}
          onCreateChat={handleCreateDirectChat}
          availableMembers={mockMembers}
          currentUserId={currentUserId}
        />

        {/* Invite Member Dialog */}
        <Dialog open={isInviteMemberOpen} onOpenChange={setIsInviteMemberOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Convidar Novo Membro
              </DialogTitle>
              <DialogDescription>
                Envie um convite para adicionar um novo membro à sua equipe
              </DialogDescription>
            </DialogHeader>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleInviteMember();
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                    <div className="flex items-center justify-between">
                  <Label htmlFor="invite-role">Função</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowAddRole(!showAddRole)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {showAddRole ? "Cancelar" : "Nova função"}
                  </Button>
                      </div>
                
                {showAddRole && (
                  <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                    <Input
                      placeholder="Nome da função"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomRole();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomRole}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    </div>
                )}

                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value)}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    {customRoles.length > 0 && (
                      <>
                        <Separator className="my-1" />
                        {customRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleLabel(role)}
                          </SelectItem>
                      ))}
                      </>
                    )}
                  </SelectContent>
                </Select>

                {customRoles.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs text-muted-foreground">Funções Customizadas</Label>
                    <div className="flex flex-wrap gap-2">
                      {customRoles.map((role) => (
                        <div
                          key={role}
                          className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                        >
                          <span>{getRoleLabel(role)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteCustomRole(role)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                        </div>
                      )}
                    </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setInviteEmail("");
                    setInviteRole("member");
                    setIsInviteMemberOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enviar Convite
                </Button>
                  </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Create Task Dialog */}
        <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Tarefa
              </DialogTitle>
              <DialogDescription>
                Crie uma nova tarefa para sua equipe
              </DialogDescription>
            </DialogHeader>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTask();
              }} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="task-title">Título *</Label>
                <Input
                  id="task-title"
                  placeholder="Ex: Implementar nova funcionalidade"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  autoFocus
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {newTaskTitle.length}/100 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Descrição</Label>
                <Textarea
                  id="task-description"
                  placeholder="Descreva os detalhes da tarefa..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {newTaskDescription.length}/500 caracteres
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-status">Status</Label>
                  <Select value={newTaskStatus} onValueChange={(value) => setNewTaskStatus(value as TaskStatus)}>
                    <SelectTrigger id="task-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Em aberto</SelectItem>
                      <SelectItem value="in_progress">Em progresso</SelectItem>
                      <SelectItem value="review">Revisão</SelectItem>
                      <SelectItem value="done">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority">Prioridade</Label>
                  <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as TaskPriority)}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-due-date">Data de Vencimento</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="task-tags"
                  placeholder="Ex: desenvolvimento, urgente, frontend"
                  value={newTaskTags}
                  onChange={(e) => setNewTaskTags(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Atribuir a</Label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const isSelected = newTaskAssignedTo.includes(member.userId);
                    return (
                      <motion.div
                        key={member.id}
                        onClick={() => toggleMemberSelection(member.userId)}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          scale: isSelected ? 1.05 : 1,
                          borderColor: isSelected ? "#22c55e" : "hsl(var(--border))",
                        }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-colors bg-background hover:bg-white dark:hover:bg-gray-900",
                          isSelected && "border-green-500"
                        )}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </motion.div>
                        )}
                      </motion.div>
                );
              })}
            </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewTaskTitle("");
                    setNewTaskDescription("");
                    setNewTaskPriority("medium");
                    setNewTaskStatus("todo");
                    setNewTaskDueDate("");
                    setNewTaskTags("");
                    setNewTaskAssignedTo([]);
                    setIsCreateTaskOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da Equipe
              </DialogTitle>
              <DialogDescription>
                Gerencie as configurações e preferências da sua equipe
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Permissões */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Permissões</h3>
                    <p className="text-xs text-muted-foreground">
                      Controle quem pode criar tarefas e convidar membros
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Apenas administradores podem convidar membros</span>
                    </div>
                    <Switch
                      checked={onlyAdminsCanInvite}
                      onCheckedChange={setOnlyAdminsCanInvite}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Todos os membros podem criar tarefas</span>
                    </div>
                    <Switch
                      checked={allMembersCanCreateTasks}
                      onCheckedChange={setAllMembersCanCreateTasks}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Apenas gerentes podem editar tarefas</span>
                    </div>
                    <Switch
                      checked={onlyManagersCanEditTasks}
                      onCheckedChange={setOnlyManagersCanEditTasks}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notificações */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Notificações</h3>
                    <p className="text-xs text-muted-foreground">
                      Configure como você recebe notificações da equipe
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-border">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Notificações por email</span>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Notificações de chat</span>
                    </div>
                    <Switch
                      checked={chatNotifications}
                      onCheckedChange={setChatNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Notificações de tarefas</span>
                    </div>
                    <Switch
                      checked={taskNotifications}
                      onCheckedChange={setTaskNotifications}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informações da Equipe */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">Informações da Equipe</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Detalhes sobre sua equipe
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Total de Membros</Label>
                    <p className="text-lg font-semibold">{members.length}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tarefas Ativas</Label>
                    <p className="text-lg font-semibold">{tasks.filter(t => t.status !== "done").length}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Conversas Ativas</Label>
                    <p className="text-lg font-semibold">{chats.length}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Taxa de Conclusão</Label>
                    <p className="text-lg font-semibold">
                      {tasks.length > 0 
                        ? Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ações */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">Ações</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Gerenciar equipe e exportar dados
                  </p>
                </div>
            <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={handleExportMembers}
                  >
                    <Users className="h-4 w-4" />
                    Exportar lista de membros
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={handleExportTasks}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Exportar relatório de tarefas
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={() => setIsDeleteTeamOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir equipe
                  </Button>
            </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
              >
                Fechar
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Configurações salvas",
                  description: "As configurações da equipe foram atualizadas.",
                });
                setIsSettingsOpen(false);
              }}>
                Salvar alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Team Confirmation Dialog */}
        <Dialog open={isDeleteTeamOpen} onOpenChange={(open) => {
          setIsDeleteTeamOpen(open);
          if (!open) {
            setDeleteConfirmationText("");
          }
        }}>
          <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
            {/* Header Premium */}
            <div className="relative bg-gradient-to-b from-destructive/10 via-destructive/5 to-transparent px-6 pt-8 pb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
                  <div className="relative bg-destructive/10 p-4 rounded-full border border-destructive/20">
                    <Trash2 className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <DialogTitle className="text-2xl font-semibold tracking-tight">
                    Excluir Equipe
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground max-w-sm">
                    Esta ação não pode ser desfeita
                  </DialogDescription>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Warning Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl bg-muted/50 border border-border/50 p-5 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      Todos os dados da equipe serão permanentemente excluídos:
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { icon: Users, text: "Todos os membros serão removidos" },
                        { icon: CheckCircle2, text: "Todas as tarefas serão excluídas" },
                        { icon: MessageCircle, text: "Todas as conversas serão perdidas" },
                        { icon: AlertCircle, text: "Histórico e dados não poderão ser recuperados" },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.text}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + idx * 0.05 }}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span>{item.text}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                    Para confirmar, digite{" "}
                    <span className="font-mono font-semibold text-destructive">EXCLUIR</span>
                  </Label>
                  <Input
                    id="delete-confirmation"
                    placeholder="Digite EXCLUIR"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className="h-11 font-mono text-center tracking-wider text-lg"
                    autoFocus
                  />
                </div>
              </motion.div>
            </div>

            {/* Footer Premium */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsDeleteTeamOpen(false);
                    setDeleteConfirmationText("");
                  }}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteTeam}
                  disabled={deleteConfirmationText.trim().toUpperCase() !== "EXCLUIR"}
                  className="px-6 shadow-lg shadow-destructive/20"
                >
                  Excluir Equipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                              {getMemberRoleTitle(selectedMember.role)}
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
                        {tasksState.filter(t => t.assignedTo?.includes(selectedMember.userId)).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Tarefas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {tasksState.filter(t => t.assignedTo?.includes(selectedMember.userId) && t.status === "done").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Concluídas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round((tasksState.filter(t => t.assignedTo?.includes(selectedMember.userId) && t.status === "done").length / Math.max(tasksState.filter(t => t.assignedTo?.includes(selectedMember.userId)).length, 1)) * 100)}%
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
                      {getMemberDescription(selectedMember.role)}
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
                            {getMemberJobTitle(selectedMember.role)}
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
                      {getMemberSkills(selectedMember.role).map((skill) => (
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
