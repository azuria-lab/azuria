
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, MapPin, Plus, Settings, Store } from 'lucide-react';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { toast } from '@/components/ui/use-toast';

interface StoreFormData {
  name: string;
  slug: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  settings: {
    defaultMargin: number;
    defaultTax: number;
    defaultCardFee: number;
    defaultShipping: number;
    includeShippingDefault: boolean;
  };
}

export default function StoreManager() {
  const { currentOrganization, stores, hasPermission } = useMultiTenant();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    slug: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    settings: {
      defaultMargin: 30,
      defaultTax: 10,
      defaultCardFee: 3.5,
      defaultShipping: 15,
      includeShippingDefault: false
    }
  });

  const canManageStores = hasPermission('store_manage');

  const handleCreateStore = async () => {
    if (!currentOrganization || !canManageStores) {return;}

    setIsLoading(true);
    try {
      // Simular criação da loja
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Loja criada com sucesso!');
      setIsCreateOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao criar loja:', error);
      toast.error('Erro ao criar loja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!editingStore || !canManageStores) {return;}

    setIsLoading(true);
    try {
      // Simular atualização da loja
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Loja atualizada com sucesso!');
      setEditingStore(null);
      resetForm();
    } catch (error: any) {
      console.error('Erro ao atualizar loja:', error);
      toast.error('Erro ao atualizar loja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStore = async (storeId: string, isActive: boolean) => {
    if (!canManageStores) {return;}

    try {
      // Simular toggle do status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Loja ${!isActive ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao atualizar status da loja:', error);
      toast.error('Erro ao atualizar status da loja');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil'
      },
      settings: {
        defaultMargin: 30,
        defaultTax: 10,
        defaultCardFee: 3.5,
        defaultShipping: 15,
        includeShippingDefault: false
      }
    });
  };

  const openEditDialog = (store: any) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      slug: store.slug,
      address: store.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil'
      },
      settings: store.settings || {
        defaultMargin: 30,
        defaultTax: 10,
        defaultCardFee: 3.5,
        defaultShipping: 15,
        includeShippingDefault: false
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Gerenciamento de Lojas
          </h2>
          <p className="text-muted-foreground">
            Gerencie as lojas da sua organização
          </p>
        </div>
        
        {canManageStores && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Loja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Loja</DialogTitle>
                <DialogDescription>
                  Adicione uma nova loja à sua organização
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Loja</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Loja Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="loja-centro"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Endereço</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input
                      placeholder="Rua"
                      value={formData.address.street}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {...formData.address, street: e.target.value}
                      })}
                    />
                    <Input
                      placeholder="Cidade"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {...formData.address, city: e.target.value}
                      })}
                    />
                    <Input
                      placeholder="Estado"
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {...formData.address, state: e.target.value}
                      })}
                    />
                    <Input
                      placeholder="CEP"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: {...formData.address, zipCode: e.target.value}
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Configurações Padrão</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="margin">Margem (%)</Label>
                      <Input
                        id="margin"
                        type="number"
                        value={formData.settings.defaultMargin}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {...formData.settings, defaultMargin: parseFloat(e.target.value)}
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax">Taxa (%)</Label>
                      <Input
                        id="tax"
                        type="number"
                        value={formData.settings.defaultTax}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {...formData.settings, defaultTax: parseFloat(e.target.value)}
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateStore} disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Loja'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de Lojas */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas da Organização</CardTitle>
          <CardDescription>
            {stores.length} lojas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma loja cadastrada</p>
              <p className="text-sm text-muted-foreground">
                Crie sua primeira loja para começar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cálculos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-muted-foreground">
                          /{store.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {store.address ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {store.address.city}, {store.address.state}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Não informado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? 'default' : 'secondary'}>
                        {store.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">0</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canManageStores && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(store)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Switch
                              checked={store.isActive}
                              onCheckedChange={() => handleToggleStore(store.id, store.isActive)}
                            />
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={!!editingStore} onOpenChange={() => setEditingStore(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Loja</DialogTitle>
            <DialogDescription>
              Atualize as informações da loja
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome da Loja</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug (URL)</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingStore(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStore} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
