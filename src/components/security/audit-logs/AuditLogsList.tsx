
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AuditLog } from "@/types/auditLogs";
import { getCategoryIcon, getRiskBadge } from "@/utils/auditLogUtils";

interface AuditLogsListProps {
  logs: AuditLog[];
  isLoading: boolean;
}

const AuditLogsList: React.FC<AuditLogsListProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <ScrollArea className="h-[600px]">
        <div className="text-center py-8">Carregando logs...</div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {getCategoryIcon(log.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{log.action}</span>
                    {getRiskBadge(log.riskLevel)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      {format(log.timestamp, "dd 'de' MMMM 'às' HH:mm:ss", { locale: ptBR })}
                    </div>
                    <div>
                      <span className="font-medium">{log.userName}</span> • IP: {log.ipAddress}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum log encontrado com os filtros aplicados.
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default AuditLogsList;
