import { useCallback, useEffect, useState } from "react";
import { Permission, Team, TeamMember } from "@/types/enterprise";
import { useAuthContext } from "@/domains/auth";
import { toast } from "@/components/ui/use-toast";

export const useTeamManagement = (teamId?: string) => {
  const { user } = useAuthContext();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Permissões disponíveis no sistema
  const availablePermissions: Permission[] = [
    { id: 'calc_create', name: 'Criar Cálculos', description: 'Criar novos cálculos de preço', category: 'calculators' },
    { id: 'calc_edit', name: 'Editar Cálculos', description: 'Modificar cálculos existentes', category: 'calculators' },
    { id: 'calc_delete', name: 'Deletar Cálculos', description: 'Remover cálculos do sistema', category: 'calculators' },
    { id: 'analytics_view', name: 'Ver Analytics', description: 'Acessar relatórios e análises', category: 'analytics' },
    { id: 'analytics_export', name: 'Exportar Analytics', description: 'Baixar relatórios em PDF/Excel', category: 'analytics' },
    { id: 'team_manage', name: 'Gerenciar Equipe', description: 'Adicionar/remover membros da equipe', category: 'settings' },
    { id: 'api_access', name: 'Acesso API', description: 'Usar a API do Precifica+', category: 'api' },
    { id: 'api_manage', name: 'Gerenciar API Keys', description: 'Criar e gerenciar chaves de API', category: 'api' },
    { id: 'reports_create', name: 'Criar Relatórios', description: 'Gerar relatórios personalizados', category: 'reports' },
    { id: 'reports_schedule', name: 'Agendar Relatórios', description: 'Configurar relatórios automáticos', category: 'reports' }
  ];

  const getRolePermissions = (role: TeamMember['role']): string[] => {
    switch (role) {
      case 'owner':
        return availablePermissions.map(p => p.id);
      case 'admin':
        return [
          'calc_create', 'calc_edit', 'calc_delete',
          'analytics_view', 'analytics_export',
          'team_manage', 'reports_create', 'reports_schedule'
        ];
      case 'editor':
        return [
          'calc_create', 'calc_edit',
          'analytics_view', 'reports_create'
        ];
      case 'viewer':
        return ['analytics_view'];
      default:
        return [];
    }
  };

  const loadTeam = useCallback(async () => {
    if (!teamId || !user) {return;}
    
    setIsLoading(true);
    try {
      // Simular carregamento de dados da equipe
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Membros mockados
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          userId: user.id,
          teamId: teamId,
          role: 'owner',
          name: user.email?.split('@')[0] || 'Owner',
          email: user.email || '',
          joinedAt: new Date(),
          permissions: availablePermissions.filter(p => getRolePermissions('owner').includes(p.id))
        },
        {
          id: '2',
          userId: 'user2',
          teamId: teamId,
          role: 'admin',
          name: 'João Silva',
          email: 'joao@empresa.com',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          permissions: availablePermissions.filter(p => getRolePermissions('admin').includes(p.id))
        },
        {
          id: '3',
          userId: 'user3',
          teamId: teamId,
          role: 'editor',
          name: 'Maria Santos',
          email: 'maria@empresa.com',
          joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          permissions: availablePermissions.filter(p => getRolePermissions('editor').includes(p.id))
        }
      ];

      // Dados mockados da equipe - agora incluindo a propriedade members
      const mockTeam: Team = {
        id: teamId,
        name: "Equipe Precifica+",
        plan: "enterprise",
        ownerId: user.id,
        members: mockMembers, // Adding the missing members property
        settings: {
          allowInvites: true,
          requireApproval: false,
          defaultRole: "editor",
          maxMembers: 50,
          features: ['advanced_analytics', 'api_access', 'white_label']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setTeam(mockTeam);
      setMembers(mockMembers);
      setPermissions(availablePermissions);
    } catch (error: any) {
      console.error('Erro ao carregar dados da equipe:', error);
      toast.error("Erro ao carregar dados da equipe");
    } finally {
      setIsLoading(false);
    }
  }, [teamId, user]);

  const inviteMember = useCallback(async (email: string, role: TeamMember['role']) => {
    if (!teamId || !user) {return;}

    try {
      setIsLoading(true);
      
      // Simular convite
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o email já está na equipe
      const existingMember = members.find(m => m.email === email);
      if (existingMember) {
        toast.error('Este email já está na equipe');
        return;
      }

      const newMember: TeamMember = {
        id: Math.random().toString(36).substr(2, 9),
        userId: Math.random().toString(36).substr(2, 9),
        teamId,
        role,
        name: email.split('@')[0],
        email,
        joinedAt: new Date(),
        permissions: availablePermissions.filter(p => getRolePermissions(role).includes(p.id))
      };

      setMembers(prev => [...prev, newMember]);
      toast.success(`Membro adicionado como ${role}`);
    } catch (error: any) {
      console.error('Erro ao convidar membro:', error);
      toast.error("Erro ao convidar membro");
    } finally {
      setIsLoading(false);
    }
  }, [teamId, user, members, availablePermissions]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: TeamMember['role']) => {
    try {
      setIsLoading(true);
      
      // Simular atualização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              role: newRole,
              permissions: availablePermissions.filter(p => getRolePermissions(newRole).includes(p.id))
            }
          : member
      ));
      
      toast.success("Permissões atualizadas com sucesso");
    } catch (error: any) {
      console.error('Erro ao atualizar permissões:', error);
      toast.error("Erro ao atualizar permissões");
    } finally {
      setIsLoading(false);
    }
  }, [availablePermissions]);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      setIsLoading(true);
      
      // Simular remoção
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success("Membro removido da equipe");
    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      toast.error("Erro ao remover membro");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (teamId && user) {
      loadTeam();
    }
  }, [teamId, user, loadTeam]);

  return {
    team,
    members,
    permissions: availablePermissions,
    isLoading,
    inviteMember,
    updateMemberRole,
    removeMember,
    loadTeam,
    getRolePermissions
  };
};
