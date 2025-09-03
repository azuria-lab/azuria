
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Shield, UserPlus, X } from 'lucide-react';
import { AppRole, useGrantRole, useRevokeRole, useUserRoles } from '@/hooks/useUserRoles';
import { toast } from '@/components/ui/use-toast';

interface RoleManagerProps {
  userId?: string;
  organizationId?: string;
  teamId?: string;
}

const RoleManager: React.FC<RoleManagerProps> = ({ userId, organizationId, teamId }) => {
  const { data: userRoles, isLoading } = useUserRoles();
  const grantRole = useGrantRole();
  const revokeRole = useRevokeRole();

  const roleColors = {
    owner: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    member: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
  };

  const handleGrantRole = async (role: AppRole) => {
    try {
      await grantRole.mutateAsync({
        userId: userId || '',
        role,
        organizationId,
        teamId
      });
      toast.success(`Role ${role} concedido com sucesso`);
    } catch (error) {
      toast.error('Erro ao conceder role');
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    try {
      await revokeRole.mutateAsync(roleId);
      toast.success('Role revogado com sucesso');
    } catch (error) {
      toast.error('Erro ao revogar role');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Carregando roles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciamento de Roles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Roles Ativos */}
        <div>
          <h4 className="font-medium mb-3">Roles Ativos</h4>
          <div className="space-y-2">
            {userRoles?.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={roleColors[role.role as AppRole]}>
                    {role.role}
                  </Badge>
                  {role.organization_id && (
                    <span className="text-sm text-gray-500">Organização</span>
                  )}
                  {role.team_id && (
                    <span className="text-sm text-gray-500">Equipe</span>
                  )}
                  {role.expires_at && (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Clock className="h-3 w-3" />
                      Expira em {new Date(role.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeRole(role.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!userRoles || userRoles.length === 0) && (
              <p className="text-gray-500 text-sm">Nenhum role ativo encontrado</p>
            )}
          </div>
        </div>

        {/* Conceder Novo Role */}
        <div>
          <h4 className="font-medium mb-3">Conceder Novo Role</h4>
          <div className="flex gap-2">
            <Select onValueChange={(value) => handleGrantRole(value as AppRole)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizador</SelectItem>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="owner">Proprietário</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total de Roles:</span>
              <span className="ml-2 font-medium">{userRoles?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Roles Ativos:</span>
              <span className="ml-2 font-medium">
                {userRoles?.filter(role => role.is_active).length || 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManager;
