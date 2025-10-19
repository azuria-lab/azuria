import { logger } from '@/services/logger';
import { supabase } from "@/integrations/supabase/client";

/**
 * Script para atualizar o nome do usuário no perfil
 * Execute esta função no console do navegador ou crie um botão temporário para executá-la
 */
export async function updateUserName() {
  try {
    // Pegar o usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error("❌ Usuário não autenticado");
      return;
    }

    logger.info("👤 Usuário atual:", user.email);

    // Atualizar o perfil com o nome correto
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        name: 'Rômulo Barbosa'
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error("❌ Erro ao atualizar perfil:", error);
      return;
    }

    logger.info("✅ Perfil atualizado com sucesso:", data);
    
    // Recarregar a página para aplicar as mudanças
    setTimeout(() => {
      logger.info("🔄 Recarregando página...");
      globalThis.location.reload();
    }, 1000);
    
  } catch (error) {
    logger.error("❌ Erro:", error);
  }
}

// Exportar para uso no console
if (typeof window !== 'undefined') {
  (window as any).updateUserName = updateUserName;
}
