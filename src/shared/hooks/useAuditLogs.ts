
import { useEffect, useState } from "react";
import { AuditLog, AuditLogFilters } from "@/types/auditLogs";

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>({
    searchTerm: "",
    categoryFilter: "all",
    riskFilter: "all"
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulação de dados de auditoria
  useEffect(() => {
    const generateMockLogs = (): AuditLog[] => {
      const actions = [
        { action: "Login realizado", category: 'auth' as const, risk: 'low' as const },
        { action: "Logout realizado", category: 'auth' as const, risk: 'low' as const },
        { action: "Tentativa de login falhada", category: 'auth' as const, risk: 'medium' as const },
        { action: "Senha alterada", category: 'security' as const, risk: 'medium' as const },
        { action: "2FA ativado", category: 'security' as const, risk: 'low' as const },
        { action: "Cálculo de preço realizado", category: 'calculation' as const, risk: 'low' as const },
        { action: "Configurações atualizadas", category: 'settings' as const, risk: 'low' as const },
        { action: "Dados exportados", category: 'data' as const, risk: 'medium' as const },
        { action: "API key gerada", category: 'security' as const, risk: 'high' as const },
        { action: "Múltiplas tentativas de login", category: 'auth' as const, risk: 'high' as const },
      ];

      return Array.from({ length: 50 }, (_, i) => {
        const actionData = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 168)); // Últimas 7 dias
        
        return {
          id: `log-${i + 1}`,
          timestamp,
          action: actionData.action,
          category: actionData.category,
          userId: `user-${Math.floor(Math.random() * 10) + 1}`,
          userName: `Usuário ${Math.floor(Math.random() * 10) + 1}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          details: {
            module: actionData.category,
            result: Math.random() > 0.1 ? "success" : "failed"
          },
          riskLevel: actionData.risk
        };
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setTimeout(() => {
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrar logs
  useEffect(() => {
    let filtered = logs;

    if (filters.searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.ipAddress.includes(filters.searchTerm)
      );
    }

    if (filters.categoryFilter !== "all") {
      filtered = filtered.filter(log => log.category === filters.categoryFilter);
    }

    if (filters.riskFilter !== "all") {
      filtered = filtered.filter(log => log.riskLevel === filters.riskFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

  const updateFilters = (newFilters: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    logs: filteredLogs,
    filters,
    updateFilters,
    isLoading
  };
};
