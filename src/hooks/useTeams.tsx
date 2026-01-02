/**
 * Hook para gerenciar equipes (Teams)
 * Disponível apenas para planos Pro e Enterprise
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from './useSubscription';
import type { Team } from '@/types/subscription';
import type { Database } from '@/types/supabase';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscription } = useSubscription();
  const { toast } = useToast();

  const fetchTeams = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Usando Record para evitar any até types do Supabase serem regenerados
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formatted = (data || []).map((item): Team => {
        const row = item as unknown as {
          id: string;
          name: string;
          owner_id: string;
          subscription_id: string;
          require_approval?: boolean;
          allow_comments?: boolean;
          audit_log_enabled?: boolean;
          created_at: string;
          updated_at: string;
        };
        
        return {
          id: row.id,
          name: row.name,
          ownerId: row.owner_id,
          subscriptionId: row.subscription_id,
          settings: {
            requireApproval: row.require_approval ?? false,
            allowComments: row.allow_comments ?? true,
            auditLogEnabled: row.audit_log_enabled ?? true,
          },
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      });

      setTeams(formatted);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subscription) {
      fetchTeams();
    }
  }, [subscription, fetchTeams]);

  /**
   * Cria uma nova equipe
   */
  const createTeam = async (
    name: string,
    options?: {
      requireApproval?: boolean;
      allowComments?: boolean;
      auditLogEnabled?: boolean;
    }
  ): Promise<Team | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !subscription) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar autenticado.',
          variant: 'destructive',
        });
        return null;
      }

      // Verificar se tem permissão (Pro ou Enterprise)
      if (!['pro', 'enterprise'].includes(subscription.planId)) {
        toast({
          title: 'Recurso Indisponível',
          description: 'Equipes estão disponíveis apenas nos planos Premium e Enterprise.',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          owner_id: user.id,
          subscription_id: subscription.id,
          require_approval: options?.requireApproval ?? false,
          allow_comments: options?.allowComments ?? true,
          audit_log_enabled: options?.auditLogEnabled ?? true,
        } as Database['public']['Tables']['teams']['Insert'])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const row = data as unknown as {
        id: string;
        name: string;
        owner_id: string;
        subscription_id: string;
        require_approval?: boolean;
        allow_comments?: boolean;
        audit_log_enabled?: boolean;
        created_at: string;
        updated_at: string;
      };

      const newTeam: Team = {
        id: row.id,
        name: row.name,
        ownerId: row.owner_id,
        subscriptionId: row.subscription_id,
        settings: {
          requireApproval: row.require_approval ?? false,
          allowComments: row.allow_comments ?? true,
          auditLogEnabled: row.audit_log_enabled ?? true,
        },
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };

      setTeams((prev) => [newTeam, ...prev]);

      toast({
        title: 'Equipe criada',
        description: `Equipe "${name}" criada com sucesso.`,
      });

      return newTeam;
    } catch {
      toast({
        title: 'Erro ao criar equipe',
        description: 'Não foi possível criar a equipe. Tente novamente.',
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Atualiza configurações da equipe
   */
  const updateTeam = async (
    teamId: string,
    updates: {
      name?: string;
      settings?: {
        requireApproval?: boolean;
        allowComments?: boolean;
        auditLogEnabled?: boolean;
      };
    }
  ): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name) {
        updateData.name = updates.name;
      }
      
      if (updates.settings) {
        if (updates.settings.requireApproval !== undefined) {
          updateData.require_approval = updates.settings.requireApproval;
        }
        if (updates.settings.allowComments !== undefined) {
          updateData.allow_comments = updates.settings.allowComments;
        }
        if (updates.settings.auditLogEnabled !== undefined) {
          updateData.audit_log_enabled = updates.settings.auditLogEnabled;
        }
      }

      const { error } = await supabase
        .from('teams')
        .update(updateData as Database['public']['Tables']['teams']['Update'])
        .eq('id', teamId);

      if (error) {
        throw error;
      }

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? {
                ...team,
                ...(updates.name && { name: updates.name }),
                ...(updates.settings && {
                  settings: {
                    ...team.settings,
                    ...updates.settings,
                  },
                }),
                updatedAt: new Date(),
              }
            : team
        )
      );

      toast({
        title: 'Equipe atualizada',
        description: 'As configurações foram salvas com sucesso.',
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar a equipe.',
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Deleta uma equipe
   */
  const deleteTeam = async (teamId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        throw error;
      }

      setTeams((prev) => prev.filter((team) => team.id !== teamId));

      toast({
        title: 'Equipe excluída',
        description: 'A equipe foi removida com sucesso.',
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a equipe.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    teams,
    loading,
    createTeam,
    updateTeam,
    deleteTeam,
    refresh: fetchTeams,
  };
};
