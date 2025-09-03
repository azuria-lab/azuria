
import React from "react";
import { Users } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import TeamStats from "./team/TeamStats";
import InviteMemberDialog from "./team/InviteMemberDialog";
import TeamMembersList from "./team/TeamMembersList";

export default function TeamManagement() {
  const { team, members, isLoading, inviteMember, updateMemberRole, removeMember } = useTeamManagement("team-1");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciamento de Equipe
          </h2>
          <p className="text-muted-foreground">
            Gerencie membros da equipe e suas permissões
          </p>
        </div>
        
        <InviteMemberDialog 
          isLoading={isLoading}
          onInvite={inviteMember}
        />
      </div>

      <TeamStats team={team} members={members} />

      <TeamMembersList 
        members={members}
        onUpdateRole={updateMemberRole}
        onRemoveMember={removeMember}
      />
    </div>
  );
}
