import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Star, Trophy } from "lucide-react";
import type { UserProfile } from "@/hooks/useDashboardStats";

interface UserLevelBadgeProps {
  profile: UserProfile | null;
}

export function UserLevelBadge({ profile }: UserLevelBadgeProps) {
  if (!profile) {
    return null;
  }

  const getLevelInfo = (level: UserProfile["experienceLevel"]) => {
    switch (level) {
      case "new":
        return {
          label: "Iniciante",
          icon: Star,
          color: "bg-blue-500",
          description: "Começando a jornada",
        };
      case "intermediate":
        return {
          label: "Intermediário",
          icon: Trophy,
          color: "bg-green-500",
          description: "Evoluindo constantemente",
        };
      case "advanced":
        return {
          label: "Avançado",
          icon: Sparkles,
          color: "bg-purple-500",
          description: "Dominando a plataforma",
        };
      case "expert":
        return {
          label: "Especialista",
          icon: Crown,
          color: "bg-yellow-500",
          description: "Mestre da precificação",
        };
      default:
        return {
          label: "Usuário",
          icon: Star,
          color: "bg-gray-500",
          description: "",
        };
    }
  };

  const levelInfo = getLevelInfo(profile.experienceLevel);
  const Icon = levelInfo.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${levelInfo.color} text-white flex items-center gap-1.5 px-3 py-1`}>
        <Icon className="h-3.5 w-3.5" />
        {levelInfo.label}
      </Badge>
      <span className="text-xs text-muted-foreground hidden md:inline">
        {levelInfo.description}
      </span>
    </div>
  );
}
