
import { supabase } from "@/integrations/supabase/client";
import { UserProfileWithDisplayData } from "@/types/auth";
import { User } from "@supabase/supabase-js";
import { useCallback } from "react";
import { TablesInsert, TablesUpdate } from "@/types/supabase";
import { logger } from "@/services/logger";

/**
 * Hook para gerenciar o perfil do usuário
 */
export const useUserProfile = (
  user: User | null,
  setUserProfile: (profile: UserProfileWithDisplayData | null) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  // Criar perfil para usuários novos
  const createUserProfile = useCallback(async (userId: string) => {
    try {
      const isPro = localStorage.getItem("isPro") === "true";

      const userMetadata = user?.user_metadata;
      // Obter nome do Google OAuth metadata (pode vir de user_metadata ou raw_user_meta_data)
      const name = userMetadata?.full_name || 
                   userMetadata?.name || 
                   user?.email?.split("@")[0] || 
                   "Usuário";
      
      // Obter avatar do Google OAuth
      const avatarUrl = userMetadata?.avatar_url || 
                        userMetadata?.picture || 
                        null;

      // Use properly typed insert
      const profileData: TablesInsert<"user_profiles"> = {
        id: userId,
        name,
        is_pro: isPro,
        email: user?.email ?? "",
        avatar_url: avatarUrl
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .insert(profileData satisfies TablesInsert<"user_profiles">)
        .select()
        .single();

      if (error) { throw error; }

      if (!data) { return null; }
      
      setUserProfile({
        id: userId,
        name,
        email: user?.email ?? "",
        isPro,
        createdAt: data.created_at,
        avatar_url: data.avatar_url ?? avatarUrl
      });

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar perfil";
      setError(message);
      return null;
    }
  }, [user, setUserProfile, setError]);

  // Buscar perfil do usuário no banco de dados
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Verificar se existe um perfil para o usuário
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Se não houver perfil, criar um
        if (error.code === "PGRST116") {
          return await createUserProfile(userId);
        }
        throw error;
      }

      if (!data) { return null; }
      
      // Sincronizar dados do OAuth se disponíveis e mais recentes
      const userMetadata = user?.user_metadata;
      const needsUpdate = userMetadata && (
        (userMetadata.full_name || userMetadata.name) !== data.name ||
        (userMetadata.avatar_url || userMetadata.picture) !== data.avatar_url ||
        user?.email !== data.email
      );
      
      if (needsUpdate) {
        // Atualizar perfil com dados mais recentes do OAuth
        const updates: TablesUpdate<"user_profiles"> = {
          updated_at: new Date().toISOString()
        };
        
        if (userMetadata?.full_name || userMetadata?.name) {
          updates.name = userMetadata.full_name || userMetadata.name || data.name;
        }
        
        if (userMetadata?.avatar_url || userMetadata?.picture) {
          updates.avatar_url = userMetadata.avatar_url || userMetadata.picture || data.avatar_url;
        }
        
        if (user?.email && user.email !== data.email) {
          updates.email = user.email;
        }
        
        // Atualizar no banco de dados (silenciosamente, sem mostrar erro se falhar)
        await supabase
          .from("user_profiles")
          .update(updates)
          .eq("id", userId)
          .then((result) => {
            if (result.error) {
              logger.warn("Erro ao sincronizar dados OAuth no perfil:", result.error);
            }
          });
        
        // Usar dados atualizados
        data.name = updates.name as string || data.name;
        data.avatar_url = updates.avatar_url as string || data.avatar_url;
        data.email = updates.email as string || data.email;
      }
      
      // Definir status PRO com base no perfil ou localStorage como fallback
      const isPro = data.is_pro ?? localStorage.getItem("isPro") === "true";

      setUserProfile({
        id: data.id,
        name: data.name ?? "",
        email: (data.email || user?.email) ?? "",
        isPro,
        createdAt: data.created_at,
        avatar_url: data.avatar_url,
        phone: (data as { phone?: string | null }).phone,
        company: (data as { company?: string | null }).company
      });

      // Atualizar localStorage para compatibilidade
      localStorage.setItem("isPro", isPro ? "true" : "false");
      localStorage.setItem("isLoggedIn", "true");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao buscar perfil";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user, setUserProfile, setError, createUserProfile, setIsLoading]);

  // Atualizar perfil
  const updateProfile = async (profileData: Partial<UserProfileWithDisplayData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {throw new Error("Usuário não autenticado");}
      
      // Use properly typed update - incluir todos os campos enviados
      const updates: TablesUpdate<"user_profiles"> = {
        updated_at: new Date().toISOString()
      };
      
      // Adicionar apenas os campos que foram enviados
      if (profileData.name !== undefined) {
        updates.name = profileData.name;
      }
      if (profileData.avatar_url !== undefined) {
        updates.avatar_url = profileData.avatar_url;
      }
      if (profileData.email !== undefined) {
        updates.email = profileData.email;
      }
      if (profileData.phone !== undefined) {
        (updates as { phone?: string | null }).phone = profileData.phone;
      }
      if (profileData.company !== undefined) {
        (updates as { company?: string | null }).company = profileData.company;
      }
      
      const { error } = await supabase
        .from("user_profiles")
        .update(updates satisfies TablesUpdate<"user_profiles">)
        .eq("id", user.id);
      
      if (error) {throw error;}
      
      // Buscar o perfil atualizado para ter todos os dados
      await fetchUserProfile(user.id);
      
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar status PRO
  const updateProStatus = async (isPro: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {throw new Error("Usuário não autenticado");}
      
      // Use properly typed update
      const updates: TablesUpdate<"user_profiles"> = {
        is_pro: isPro
      };
      
      const { error } = await supabase
        .from("user_profiles")
        .update(updates satisfies TablesUpdate<"user_profiles">)
        .eq("id", user.id);
      
      if (error) {throw error;}
      
      // Atualizar estado local e localStorage
      localStorage.setItem("isPro", isPro ? "true" : "false");
      
      // Buscar o perfil atualizado para ter todos os dados
      await fetchUserProfile(user.id);
      
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar status PRO";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUserProfile,
    createUserProfile,
    updateProfile,
    updateProStatus
  };
};
