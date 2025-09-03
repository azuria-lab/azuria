
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Trash2 } from "lucide-react";
import { TeamMember } from "@/types/enterprise";

interface TeamMembersListProps {
  members: TeamMember[];
  onUpdateRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export default function TeamMembersList({ members, onUpdateRole, onRemoveMember }: TeamMembersListProps) {
  const getRoleBadgeColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActive = (date?: Date) => {
    if (!date) {return "Nunca";}
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {return "Agora";}
    if (hours < 24) {return `${hours}h atrás`;}
    return `${Math.floor(hours / 24)}d atrás`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros da Equipe</CardTitle>
        <CardDescription>
          Gerencie as funções e permissões dos membros da sua equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={getRoleBadgeColor(member.role)}>
                    {member.role === 'owner' ? 'Proprietário' :
                     member.role === 'admin' ? 'Administrador' :
                     member.role === 'editor' ? 'Editor' : 'Visualizador'}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {formatLastActive(member.lastActive)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {member.permissions.length} permissões
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    {member.role !== 'owner' && (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(value) => onUpdateRole(member.id, value as TeamMember['role'])}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
