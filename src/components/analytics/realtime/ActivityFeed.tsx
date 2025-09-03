import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

interface RealTimeActivity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  value?: number;
  type: "calculation" | "signup" | "upgrade" | "export";
}

interface ActivityFeedProps {
  activities: RealTimeActivity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "calculation": return "🧮";
      case "signup": return "👤";
      case "upgrade": return "⭐";
      case "export": return "📄";
      default: return "📊";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "calculation": return "bg-blue-100 text-blue-800";
      case "signup": return "bg-green-100 text-green-800";
      case "upgrade": return "bg-purple-100 text-purple-800";
      case "export": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) {return `${seconds}s atrás`;}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)}min atrás`;}
    return `${Math.floor(seconds / 3600)}h atrás`;
  };

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-600" />
          Atividade em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-xl">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{activity.user}</span>
                  <Badge className={`text-xs ${getActivityColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                {activity.value && (
                  <p className="text-xs text-green-600 font-medium">
                    R$ {activity.value.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTimeAgo(activity.timestamp)}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}