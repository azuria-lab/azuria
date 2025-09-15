
import { useCallback, useEffect, useState } from "react";
import { ApiKey } from "@/types/enterprise";
import { toast } from "@/components/ui/use-toast";

export const useApiManagement = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadApiKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simular carregamento das chaves de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockKeys: ApiKey[] = [
        {
          id: "1",
          name: "Produção Principal",
          key: "pk_live_********************",
          permissions: ["calc_create", "calc_edit", "analytics_view"],
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date(2024, 0, 15),
          isActive: true,
          usage: {
            requests: 2547,
            limit: 10000,
            resetDate: new Date(2024, 6, 1)
          }
        },
        {
          id: "2",
          name: "Desenvolvimento",
          key: "pk_test_********************",
          permissions: ["calc_create", "analytics_view"],
          lastUsed: new Date(Date.now() - 30 * 60 * 1000),
          createdAt: new Date(2024, 1, 10),
          isActive: true,
          usage: {
            requests: 423,
            limit: 1000,
            resetDate: new Date(2024, 6, 1)
          }
        },
        {
          id: "3",
          name: "Integração ERP",
          key: "pk_live_********************",
          permissions: ["calc_create", "calc_edit", "analytics_view", "reports_create"],
          createdAt: new Date(2024, 2, 5),
          expiresAt: new Date(2024, 8, 5),
          isActive: false,
          usage: {
            requests: 0,
            limit: 5000,
            resetDate: new Date(2024, 6, 1)
          }
        }
      ];

      setApiKeys(mockKeys);
    } catch (_err: unknown) {
      toast.error("Erro ao carregar chaves de API");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (name: string, permissions: string[], expiresIn?: number) => {
    try {
      setIsLoading(true);
      
      // Simular criação de nova chave
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name,
        key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
        permissions,
        createdAt: new Date(),
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : undefined,
        isActive: true,
        usage: {
          requests: 0,
          limit: 10000,
          resetDate: new Date(2024, 6, 1)
        }
      };

      setApiKeys(prev => [newKey, ...prev]);
      toast.success("Chave de API criada com sucesso");
      
      return newKey;
    } catch (_err: unknown) {
      toast.error("Erro ao criar chave de API");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleApiKey = useCallback(async (keyId: string) => {
    try {
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { ...key, isActive: !key.isActive }
          : key
      ));
      
      const key = apiKeys.find(k => k.id === keyId);
      toast.success(`Chave ${key?.isActive ? 'desativada' : 'ativada'} com sucesso`);
    } catch (_err: unknown) {
      toast.error("Erro ao alterar status da chave");
    }
  }, [apiKeys]);

  const deleteApiKey = useCallback(async (keyId: string) => {
    try {
      setIsLoading(true);
      
      // Simular exclusão
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success("Chave de API removida");
    } catch (_err: unknown) {
      toast.error("Erro ao remover chave de API");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateApiKey = useCallback(async (keyId: string) => {
    try {
      setIsLoading(true);
      
      // Simular regeneração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApiKeys(prev => prev.map(key => 
        key.id === keyId 
          ? { 
              ...key, 
              key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
              usage: { ...key.usage, requests: 0 }
            }
          : key
      ));
      
      toast.success("Chave regenerada com sucesso");
    } catch (_err: unknown) {
      toast.error("Erro ao regenerar chave");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return {
    apiKeys,
    isLoading,
    createApiKey,
    toggleApiKey,
    deleteApiKey,
    regenerateApiKey,
    loadApiKeys
  };
};
