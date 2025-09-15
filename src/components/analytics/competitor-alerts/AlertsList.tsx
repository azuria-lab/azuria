
import React from "react";
import { Bell } from "lucide-react";
import { CompetitorAlert } from "@/types/competitorAlerts";
import AlertItem from "./AlertItem";

interface AlertsListProps {
  alerts: CompetitorAlert[];
  onRemoveAlert: (id: string) => void;
}

export default function AlertsList({ alerts, onRemoveAlert }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Nenhum alerta no momento
        </h3>
        <p className="text-gray-500 text-sm">
          Os alertas aparecerão aqui quando detectarmos mudanças na concorrência
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onRemove={onRemoveAlert}
        />
      ))}
    </div>
  );
}
