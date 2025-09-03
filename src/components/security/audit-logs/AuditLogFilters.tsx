
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { AuditLogFilters as FilterType } from "@/types/auditLogs";

interface AuditLogFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onExport: () => void;
}

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por ação, usuário ou IP..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={filters.categoryFilter} onValueChange={(value) => onFiltersChange({ categoryFilter: value })}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="auth">Autenticação</SelectItem>
          <SelectItem value="calculation">Cálculos</SelectItem>
          <SelectItem value="settings">Configurações</SelectItem>
          <SelectItem value="data">Dados</SelectItem>
          <SelectItem value="security">Segurança</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.riskFilter} onValueChange={(value) => onFiltersChange({ riskFilter: value })}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Risco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="low">Baixo</SelectItem>
          <SelectItem value="medium">Médio</SelectItem>
          <SelectItem value="high">Alto</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </Button>
    </div>
  );
};

export default AuditLogFilters;
