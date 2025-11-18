/**
 * Hook para gerenciar membros de equipes
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TeamMember, TeamRole } from '@/types/subscription';
import type { Database } from '@/types/supabase';

export const useTeamMembers = (teamId?: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formatted = (data || []).map((item): TeamMember => {
        const row = item as unknown as {
          id: string;
          team_id: string;
          user_id: string;
          role: TeamRole;
          can_view_calculations: boolean;
          can_create_calculations: boolean;
          can_edit_calculations: boolean;
          can_delete_calculations: boolean;
          can_export_reports: boolean;
          can_manage_integrations: boolean;
          can_view_analytics: boolean;
          can_manage_team: boolean;
          can_manage_billing: boolean;
          invited_by: string;
          invited_at: string;
          accepted_at?: string;
          created_at: string;
          updated_at: string;
        };

        return {
          id: row.id,
          teamId: row.team_id,
          userId: row.user_id,
          role: row.role,
          permissions: {
            viewCalculations: row.can_view_calculations,
            createCalculations: row.can_create_calculations,
            editCalculations: row.can_edit_calculations,
            deleteCalculations: row.can_delete_calculations,
            exportReports: row.can_export_reports,
            manageIntegrations: row.can_manage_integrations,
            viewAnalytics: row.can_view_analytics,
            manageTeam: row.can_manage_team,
            manageBilling: row.can_manage_billing,
          },
          invitedBy: row.invited_by,
          invitedAt: new Date(row.invited_at),
          acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      });

      setMembers(formatted);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId) {
      fetchMembers();
    }
  }, [teamId, fetchMembers]);

  /**
   * Convida um novo membro para a equipe
   */
  const inviteMember = async (
    userId: string,
    role: TeamRole,
    permissions?: Partial<TeamMember['permissions']>
  ): Promise<boolean> => {
    if (!teamId) {
      return false;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        return false;
      }

      // Permissões padrão por role
      const defaultPermissions = getDefaultPermissionsByRole(role);
      const finalPermissions = { ...defaultPermissions, ...permissions };

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          can_view_calculations: finalPermissions.viewCalculations,
          can_create_calculations: finalPermissions.createCalculations,
          can_edit_calculations: finalPermissions.editCalculations,
          can_delete_calculations: finalPermissions.deleteCalculations,
          can_export_reports: finalPermissions.exportReports,
          can_manage_integrations: finalPermissions.manageIntegrations,
          can_view_analytics: finalPermissions.viewAnalytics,
          can_manage_team: finalPermissions.manageTeam,
          can_manage_billing: finalPermissions.manageBilling,
          invited_by: currentUser.id,
        } as Database['public']['Tables']['team_members']['Insert']);

      if (error) {
        throw error;
      }

      await fetchMembers();

      toast({
        title: 'Membro convidado',
        description: 'O convite foi enviado com sucesso.',
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao convidar',
        description: 'Não foi possível enviar o convite.',
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Atualiza permissões de um membro
   */
  const updateMemberPermissions = async (
    memberId: string,
    updates: {
      role?: TeamRole;
      permissions?: Partial<TeamMember['permissions']>;
    }
  ): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};

      if (updates.role) {
        updateData.role = updates.role;
      }

      if (updates.permissions) {
        if (updates.permissions.viewCalculations !== undefined) {
          updateData.can_view_calculations = updates.permissions.viewCalculations;
        }
        if (updates.permissions.createCalculations !== undefined) {
          updateData.can_create_calculations = updates.permissions.createCalculations;
        }
        if (updates.permissions.editCalculations !== undefined) {
          updateData.can_edit_calculations = updates.permissions.editCalculations;
        }
        if (updates.permissions.deleteCalculations !== undefined) {
          updateData.can_delete_calculations = updates.permissions.deleteCalculations;
        }
        if (updates.permissions.exportReports !== undefined) {
          updateData.can_export_reports = updates.permissions.exportReports;
        }
        if (updates.permissions.manageIntegrations !== undefined) {
          updateData.can_manage_integrations = updates.permissions.manageIntegrations;
        }
        if (updates.permissions.viewAnalytics !== undefined) {
          updateData.can_view_analytics = updates.permissions.viewAnalytics;
        }
        if (updates.permissions.manageTeam !== undefined) {
          updateData.can_manage_team = updates.permissions.manageTeam;
        }
        if (updates.permissions.manageBilling !== undefined) {
          updateData.can_manage_billing = updates.permissions.manageBilling;
        }
      }

      const { error } = await supabase
        .from('team_members')
        .update(updateData as Database['public']['Tables']['team_members']['Update'])
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      await fetchMembers();

      toast({
        title: 'Permissões atualizadas',
        description: 'As alterações foram salvas com sucesso.',
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar as permissões.',
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Remove um membro da equipe
   */
  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      toast({
        title: 'Membro removido',
        description: 'O membro foi removido da equipe.',
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o membro.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    members,
    loading,
    inviteMember,
    updateMemberPermissions,
    removeMember,
    refresh: fetchMembers,
  };
};

/**
 * Retorna permissões padrão baseadas no role
 */
function getDefaultPermissionsByRole(role: TeamRole): TeamMember['permissions'] {
  switch (role) {
    case 'admin':
      return {
        viewCalculations: true,
        createCalculations: true,
        editCalculations: true,
        deleteCalculations: true,
        exportReports: true,
        manageIntegrations: true,
        viewAnalytics: true,
        manageTeam: true,
        manageBilling: true,
      };
    case 'manager':
      return {
        viewCalculations: true,
        createCalculations: true,
        editCalculations: true,
        deleteCalculations: true,
        exportReports: true,
        manageIntegrations: false,
        viewAnalytics: true,
        manageTeam: true,
        manageBilling: false,
      };
    case 'analyst':
      return {
        viewCalculations: true,
        createCalculations: true,
        editCalculations: false,
        deleteCalculations: false,
        exportReports: true,
        manageIntegrations: false,
        viewAnalytics: true,
        manageTeam: false,
        manageBilling: false,
      };
    case 'operator':
      return {
        viewCalculations: true,
        createCalculations: true,
        editCalculations: false,
        deleteCalculations: false,
        exportReports: false,
        manageIntegrations: false,
        viewAnalytics: false,
        manageTeam: false,
        manageBilling: false,
      };
  }
}
