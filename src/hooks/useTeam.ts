import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, TeamMember } from "@/types/team";
import { useAuthContext } from "@/domains/auth";

interface UseTeamReturn {
  members: TeamMember[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refreshMembers: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  inviteMember: (email: string, role: string) => Promise<boolean>;
}

export function useTeam(teamId: string | null): UseTeamReturn {
  const { user } = useAuthContext();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar membros da equipe
  const loadMembers = useCallback(async () => {
    if (!teamId || !user?.id) {
      setMembers([]);
      return;
    }

    try {
      setError(null);
      
      // Buscar membros da equipe
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          role,
          invited_at,
          accepted_at
        `)
        .eq("team_id", teamId);

      if (membersError) {throw membersError;}

      // Buscar perfis dos usuários
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userIds = (teamMembers || []).map((tm: any) => tm.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, name, email, avatar_url, last_activity_at")
        .in("id", userIds);

      if (profilesError) {throw profilesError;}

      // Criar mapa de perfis por user_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      // Transformar para formato TeamMember
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedMembers: TeamMember[] = (teamMembers || []).map((tm: any) => {
        const profile = profilesMap.get(tm.user_id);
        return {
          id: tm.id,
          userId: tm.user_id,
          name: profile?.name || "Usuário",
          email: profile?.email || "",
          avatar: profile?.avatar_url || undefined,
          role: (tm.role === "analyst" || tm.role === "operator" ? "member" : tm.role) as TeamMember["role"],
          isActive: !!tm.accepted_at,
          joinedAt: new Date(tm.invited_at),
          lastActive: profile?.last_activity_at ? new Date(profile.last_activity_at) : undefined,
        };
      });

      setMembers(formattedMembers);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar membros";
      setError(message);
      // eslint-disable-next-line no-console
      console.error("Erro ao carregar membros:", err);
    }
  }, [teamId, user?.id]);

  // Buscar tarefas da equipe
  const loadTasks = useCallback(async () => {
    if (!teamId || !user?.id) {
      setTasks([]);
      return;
    }

    try {
      setError(null);
      
        
       
      const { data: teamTasks, error: tasksError } = await supabase
        .from("team_tasks")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (tasksError) {throw tasksError;}

      // Transformar para formato Task
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedTasks: Task[] = ((teamTasks || []) as any[]).map((tt: any) => ({
        id: tt.id,
        teamId: tt.team_id,
        title: tt.title,
        description: tt.description || undefined,
        status: tt.status as Task["status"],
        priority: tt.priority as Task["priority"],
        assignedTo: tt.assigned_to || [],
        createdBy: tt.created_by,
        createdAt: new Date(tt.created_at),
        updatedAt: new Date(tt.updated_at),
        dueDate: tt.due_date ? new Date(tt.due_date) : undefined,
        tags: tt.tags || [],
        checklist: tt.checklist || [],
        attachments: tt.attachments || [],
      }));

      setTasks(formattedTasks);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar tarefas";
      setError(message);
      // eslint-disable-next-line no-console
      console.error("Erro ao carregar tarefas:", err);
    }
  }, [teamId, user?.id]);

  // Carregar dados iniciais
  useEffect(() => {
    if (!teamId || !user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([loadMembers(), loadTasks()]).finally(() => {
      setIsLoading(false);
    });
  }, [teamId, user?.id, loadMembers, loadTasks]);

  // Criar tarefa
  const createTask = useCallback(async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!teamId || !user?.id) {return null;}

    try {
        
       
      const { data, error: insertError } = await supabase
        .from("team_tasks" as any)
        .insert({
          team_id: teamId,
          title: task.title,
          description: task.description || null,
          status: task.status,
          priority: task.priority,
          assigned_to: task.assignedTo || [],
          created_by: user.id,
          due_date: task.dueDate ? task.dueDate.toISOString() : null,
          tags: task.tags || [],
          checklist: task.checklist || [],
          attachments: task.attachments || [],
        })
        .select()
        .single() as any;

      if (insertError) {throw insertError;}

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const taskData = data as Record<string, any>;
      const newTask: Task = {
        id: taskData.id,
        teamId: taskData.team_id,
        title: taskData.title,
        description: taskData.description || undefined,
        status: taskData.status as Task["status"],
        priority: taskData.priority as Task["priority"],
        assignedTo: taskData.assigned_to || [],
        createdBy: taskData.created_by,
        createdAt: new Date(taskData.created_at),
        updatedAt: new Date(taskData.updated_at),
        dueDate: taskData.due_date ? new Date(taskData.due_date) : undefined,
        tags: taskData.tags || [],
        checklist: taskData.checklist || [],
        attachments: taskData.attachments || [],
      };

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro ao criar tarefa:", err);
      return null;
    }
  }, [teamId, user?.id]);

  // Atualizar tarefa
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!teamId || !user?.id) {return false;}

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: Record<string, any> = {};
      
      if (updates.title !== undefined) {updateData.title = updates.title;}
      if (updates.description !== undefined) {updateData.description = updates.description;}
      if (updates.status !== undefined) {updateData.status = updates.status;}
      if (updates.priority !== undefined) {updateData.priority = updates.priority;}
      if (updates.assignedTo !== undefined) {updateData.assigned_to = updates.assignedTo;}
      if (updates.dueDate !== undefined) {updateData.due_date = updates.dueDate ? updates.dueDate.toISOString() : null;}
      if (updates.tags !== undefined) {updateData.tags = updates.tags;}
      if (updates.checklist !== undefined) {updateData.checklist = updates.checklist;}

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from("team_tasks" as any) as any)
        .update(updateData)
        .eq("id", taskId)
        .eq("team_id", teamId);

      if (updateError) {throw updateError;}

      // Atualizar estado local
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, ...updates, updatedAt: new Date() }
            : t
        )
      );

      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro ao atualizar tarefa:", err);
      return false;
    }
  }, [teamId, user?.id]);

  // Deletar tarefa
  const deleteTask = useCallback(async (taskId: string) => {
    if (!teamId || !user?.id) {return false;}

    try {
        
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase.from("team_tasks" as any) as any)
        .delete()
        .eq("id", taskId)
        .eq("team_id", teamId);

      if (deleteError) {throw deleteError;}

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro ao deletar tarefa:", err);
      return false;
    }
  }, [teamId, user?.id]);

  // Convidar membro
  const inviteMember = useCallback(async (email: string, role: string) => {
    if (!teamId || !user?.id) {return false;}

    try {
      // Buscar usuário pelo email
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single();

      if (profileError || !profile) {
        // Usuário não encontrado - em produção, enviaria email de convite
        // eslint-disable-next-line no-console
        console.warn("Usuário não encontrado:", email);
        return false;
      }

      // Verificar se já é membro
      const { data: existing } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", profile.id)
        .single();

      if (existing) {
        return false; // Já é membro
      }

      // Adicionar membro
      const { error: insertError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamId,
          user_id: profile.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: role as any,
          invited_by: user.id,
        });

      if (insertError) {throw insertError;}

      await loadMembers();
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Erro ao convidar membro:", err);
      return false;
    }
  }, [teamId, user?.id, loadMembers]);

  return {
    members,
    tasks,
    isLoading,
    error,
    refreshMembers: loadMembers,
    refreshTasks: loadTasks,
    createTask,
    updateTask,
    deleteTask,
    inviteMember,
  };
}
