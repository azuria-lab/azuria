
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Copy, Eye, EyeOff, Key, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useApiManagement } from "@/hooks/useApiManagement";
import { toast } from "@/components/ui/use-toast";

export default function ApiManagement() {
  const { apiKeys, isLoading, createApiKey, toggleApiKey, deleteApiKey, regenerateApiKey } = useApiManagement();
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const availablePermissions = [
    { id: 'calc_create', name: 'Criar Cálculos', description: 'Permite criar novos cálculos de preço' },
    { id: 'calc_edit', name: 'Editar Cálculos', description: 'Permite modificar cálculos existentes' },
    { id: 'analytics_view', name: 'Ver Analytics', description: 'Acesso aos dados de análise' },
    { id: 'reports_create', name: 'Criar Relatórios', description: 'Gerar relatórios personalizados' }
  ];

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Digite um nome para a chave");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Selecione pelo menos uma permissão");
      return;
    }

    await createApiKey(newKeyName, selectedPermissions);
    setNewKeyName("");
    setSelectedPermissions([]);
    setIsCreateOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Chave copiada para a área de transferência");
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const formatUsage = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    return { percentage, used, limit };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            Gerenciamento de API
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas chaves de API e monitore o uso
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Chave API
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Chave de API</DialogTitle>
              <DialogDescription>
                Configure uma nova chave de API com permissões específicas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">Nome da Chave</Label>
                <Input
                  id="keyName"
                  placeholder="Ex: Produção, Desenvolvimento, ERP Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Permissões</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions(prev => [...prev, permission.id]);
                          } else {
                            setSelectedPermissions(prev => prev.filter(id => id !== permission.id));
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateKey} disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Chave"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chaves Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.filter(key => key.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {apiKeys.length} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requests Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.reduce((sum, key) => sum + key.usage.requests, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">total de requests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Limite Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.reduce((sum, key) => sum + key.usage.limit, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">requests disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas Chaves de API</CardTitle>
          <CardDescription>
            Monitore e gerencie suas chaves de API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Última Utilização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => {
                const { percentage, used, limit } = formatUsage(apiKey.usage.requests, apiKey.usage.limit);
                return (
                  <TableRow key={apiKey.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{apiKey.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {apiKey.permissions.length} permissões
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {showKeys[apiKey.id] ? apiKey.key : apiKey.key.replace(/(.{8}).*(.{4})/, '$1****$2')}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                        {apiKey.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                      {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
                        <Badge variant="destructive" className="ml-1">
                          Expirada
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{used.toLocaleString()}</span>
                          <span>{limit.toLocaleString()}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        {percentage > 80 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Próximo do limite</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Nunca"}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKey(apiKey.id)}
                        >
                          {apiKey.isActive ? "Desativar" : "Ativar"}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => regenerateApiKey(apiKey.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
