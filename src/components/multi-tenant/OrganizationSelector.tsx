
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, Store } from 'lucide-react';
import { useMultiTenant } from '@/contexts/MultiTenantContext';

export default function OrganizationSelector() {
  const { 
    currentOrganization, 
    currentStore, 
    organizations, 
    stores, 
    switchOrganization, 
    switchStore,
    userRole 
  } = useMultiTenant();

  return (
    <div className="flex items-center gap-4 p-4 border-b bg-white">
      {/* Seletor de Organização */}
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-blue-600" />
        <Select 
          value={currentOrganization?.id} 
          onValueChange={switchOrganization}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecionar organização" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{org.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {org.plan}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Separador */}
      <div className="h-6 border-l border-gray-300" />

      {/* Seletor de Loja */}
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-green-600" />
        <Select 
          value={currentStore?.id} 
          onValueChange={switchStore}
          disabled={!currentOrganization || stores.length === 0}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecionar loja" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{store.name}</span>
                  {!store.isActive && (
                    <Badge variant="secondary" className="ml-2">
                      Inativa
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Informações do usuário */}
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="outline">
          {userRole === 'owner' ? 'Proprietário' :
           userRole === 'admin' ? 'Administrador' :
           userRole === 'manager' ? 'Gerente' : 'Membro'}
        </Badge>
        
        {currentOrganization && (
          <div className="text-sm text-gray-600">
            {currentOrganization.name}
            {currentStore && ` • ${currentStore.name}`}
          </div>
        )}
      </div>
    </div>
  );
}
