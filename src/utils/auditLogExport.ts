
import { format } from "date-fns";
import { AuditLog } from "@/types/auditLogs";

export const exportAuditLogs = (logs: AuditLog[]) => {
  const csvContent = [
    "Timestamp,Ação,Categoria,Usuário,IP,Risco",
    ...logs.map(log => 
      `${format(log.timestamp, 'dd/MM/yyyy HH:mm:ss')},${log.action},${log.category},${log.userName},${log.ipAddress},${log.riskLevel}`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
