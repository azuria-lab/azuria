
import { supabase } from "@/integrations/supabase/client";
import { UserProfileWithDisplayData } from "@/types/auth";
import { User } from "@supabase/supabase-js";
import { useCallback } from "react";
import { TablesInsert, TablesUpdate } from "@/types/supabase";

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
      const name = userMetadata?.name || user?.email?.split("@")[0] || "Usuário";

      // Use properly typed insert
      const profileData: TablesInsert<"user_profiles"> = {
        id: userId,
        name,
        is_pro: isPro,
        email: user?.email
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select()
        .single();

      if (error) { throw error; }

      setUserProfile({
        id: userId,
        name,
        email: user?.email ?? "",
        isPro,
        createdAt: data.created_at,
        avatar_url: data.avatar_url
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

      // Definir status PRO com base no perfil ou localStorage como fallback
      const isPro = data?.is_pro ?? localStorage.getItem("isPro") === "true";

      setUserProfile({
        id: data.id,
        name: data.name,
        email: user?.email ?? "",
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
        .update(updates)
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
        .update(updates)
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
