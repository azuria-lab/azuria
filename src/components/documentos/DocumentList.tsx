import { FileText, Filter, Search } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { useDocumentos } from '@/hooks/useDocumentos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

export function DocumentList() {
  const { documentos, isLoading } = useDocumentos();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!documentos || documentos.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="Nenhum documento cadastrado"
        description="Comece cadastrando seu primeiro documento para licitações"
      />
    );
  }

  // Filtrar documentos
  const documentosFiltrados = documentos.filter((doc) => {
    const matchSearch =
      doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.numero?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'todos' || doc.status === statusFilter;

    const matchTipo = tipoFilter === 'todos' || doc.tipo === tipoFilter;

    return matchSearch && matchStatus && matchTipo;
  });

  // Tipos únicos nos documentos
  const tiposUnicos = Array.from(
    new Set(documentos.map((d) => d.tipo))
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro de Status */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="valido">Válidos</SelectItem>
            <SelectItem value="proximo_vencimento">
              Próx. Vencimento
            </SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Tipo */}
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposUnicos.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {tipo.replace(/_/g, ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Limpar Filtros */}
        {(searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos') && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('todos');
              setTipoFilter('todos');
            }}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Contador */}
      <div className="text-sm text-muted-foreground">
        Mostrando {documentosFiltrados.length} de {documentos.length}{' '}
        documento{documentos.length !== 1 ? 's' : ''}
      </div>

      {/* Lista de Documentos */}
      {documentosFiltrados.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="Nenhum documento encontrado"
          description="Tente ajustar os filtros de busca"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {documentosFiltrados.map((documento) => (
            <DocumentCard key={documento.id} documento={documento} />
          ))}
        </div>
      )}
    </div>
  );
}

