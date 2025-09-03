
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Team, TeamMember } from "@/types/enterprise";

interface TeamStatsProps {
  team: Team | null;
  members: TeamMember[];
}

export default function TeamStats({ team, members }: TeamStatsProps) {
  const activeMembers = members.filter(m => 
    m.lastActive && new Date().getTime() - m.lastActive.getTime() < 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{members.length}</div>
          <p className="text-xs text-muted-foreground">
            de {team?.settings.maxMembers} máximo
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeMembers}</div>
          <p className="text-xs text-muted-foreground">nas últimas 24h</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{team?.plan}</div>
          <p className="text-xs text-muted-foreground">com recursos completos</p>
        </CardContent>
      </Card>
    </div>
  );
}
