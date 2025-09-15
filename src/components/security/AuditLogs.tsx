
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { exportAuditLogs } from "@/utils/auditLogExport";
import AuditLogFilters from "./audit-logs/AuditLogFilters";
import AuditLogsList from "./audit-logs/AuditLogsList";

const AuditLogs: React.FC = () => {
  const { logs, filters, updateFilters, isLoading } = useAuditLogs();

  const handleExport = () => {
    exportAuditLogs(logs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Logs de Auditoria
        </CardTitle>
        <CardDescription>
          Histórico detalhado de todas as ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AuditLogFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onExport={handleExport}
          />
          <AuditLogsList logs={logs} isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogs;
