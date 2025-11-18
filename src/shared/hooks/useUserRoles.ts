
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/domains/auth';

export type AppRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  organization_id?: string;
  team_id?: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export function useUserRoles() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) {return [];}
      
      // Simular roles baseado no perfil do usuário
      const roles: UserRole[] = [];
      
      // Verificar se é admin usando a função otimizada do banco
      const { data: isAdmin } = await supabase.rpc('is_admin_user');
      
      if (isAdmin) {
        roles.push({
          id: `admin-${user.id}`,
          user_id: user.id,
          role: 'admin',
          granted_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        });
      } else {
        roles.push({
          id: `member-${user.id}`,
          user_id: user.id,
          role: 'member',
          granted_at: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        });
      }
      
      return roles;
    },
    enabled: !!user?.id
  });
}

export function useHasRole(role: AppRole, organizationId?: string, teamId?: string) {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['has-role', user?.id, role, organizationId, teamId],
    queryFn: async () => {
      if (!user?.id) {return false;}
      
      if (organizationId) {
        const { data, error } = await supabase.rpc('has_organization_role', {
          _user_id: user.id,
          _organization_id: organizationId,
          _role: role
        });
        if (error) {throw error;}
        return data;
      }
      
      if (teamId) {
        const { data, error } = await supabase.rpc('has_team_role', {
          _user_id: user.id,
          _team_id: teamId,
          _role: role
        });
        if (error) {throw error;}
        return data;
      }
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: role
      });
      if (error) {throw error;}
      return data;
    },
    enabled: !!user?.id
  });
}

export function useIsAdminOrOwner() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['is-admin-or-owner', user?.id],
    queryFn: async () => {
      if (!user?.id) {return false;}
      
      const { data, error } = await supabase.rpc('is_admin_or_owner', {
        _user_id: user.id
      });
      if (error) {throw error;}
      return data;
    },
    enabled: !!user?.id
  });
}

export function useGrantRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
      organizationId: _organizationId,
      teamId: _teamId,
      expiresAt: _expiresAt
    }: {
      userId: string;
      role: AppRole;
      organizationId?: string;
      teamId?: string;
      expiresAt?: Date;
    }) => {
      // Por enquanto, simular a concessão de role
  // simulated grant
      
      // Quando a tabela user_roles existir, usar o código comentado abaixo
      return { id: `role-${Date.now()}`, user_id: userId, role };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['has-role'] });
      queryClient.invalidateQueries({ queryKey: ['is-admin-or-owner'] });
    }
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_roleId: string) => {
      // Por enquanto, simular a revogação de role
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['has-role'] });
      queryClient.invalidateQueries({ queryKey: ['is-admin-or-owner'] });
    }
  });
}
