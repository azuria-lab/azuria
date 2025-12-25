import { supabase } from '@/integrations/supabase/client';
import type { MaquininhaPreset } from '@/hooks/useMaquininhaPresets';
import type { ImpostosPreset } from '@/hooks/useImpostosPresets';
import type { TaxaHistorico } from '@/hooks/useTaxasHistorico';

/**
 * Serviço de sincronização de presets com o Supabase
 */
export class PresetsSyncService {
  static isAvailable(): boolean {
    return !!supabase;
  }

  // ==================== MAQUININHA PRESETS ====================

  static async getMaquininhaPresets(userId: string): Promise<MaquininhaPreset[]> {
    if (!userId) {return [];}

    const { data, error } = await supabase
      .from('maquininha_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar presets de maquininha: ${error.message}`);
    }

    return (data || []).map((item) => ({
      id: item.id,
      nome: item.nome,
      maquininha_fornecedor: item.maquininha_fornecedor,
      bandeira: item.bandeira,
      parcelas_default: item.parcelas_default,
      taxas_por_parcela: item.taxas_por_parcela as Record<number, number>,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  static async saveMaquininhaPreset(
    userId: string,
    preset: MaquininhaPreset
  ): Promise<MaquininhaPreset> {
    const payload = {
      id: preset.id.includes('-') ? preset.id : undefined, // Apenas UUID válido
      user_id: userId,
      nome: preset.nome,
      maquininha_fornecedor: preset.maquininha_fornecedor,
      bandeira: preset.bandeira,
      parcelas_default: preset.parcelas_default,
      taxas_por_parcela: preset.taxas_por_parcela,
    };
    
     
    const { data, error } = await (supabase
      .from('maquininha_presets')
      .upsert(payload as any)
      .select()
      .single() as any);

    if (error) {
      throw new Error(`Erro ao salvar preset de maquininha: ${error.message}`);
    }

    return {
      id: data.id,
      nome: data.nome,
      maquininha_fornecedor: data.maquininha_fornecedor,
      bandeira: data.bandeira,
      parcelas_default: data.parcelas_default,
      taxas_por_parcela: data.taxas_por_parcela as Record<number, number>,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  static async deleteMaquininhaPreset(presetId: string): Promise<void> {
    const { error } = await supabase
      .from('maquininha_presets')
      .update({ is_active: false })
      .eq('id', presetId);

    if (error) {
      throw new Error(`Erro ao deletar preset de maquininha: ${error.message}`);
    }
  }

  // ==================== IMPOSTOS PRESETS ====================

  static async getImpostosPresets(userId: string): Promise<ImpostosPreset[]> {
    if (!userId) {return [];}

    const { data, error } = await supabase
      .from('impostos_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar presets de impostos: ${error.message}`);
    }

    return (data || []).map((item) => ({
      id: item.id,
      nome: item.nome,
      origemUF: item.origem_uf,
      destinoUF: item.destino_uf || '',
      tipoOperacao: item.tipo_operacao as 'interna' | 'interestadual',
      icms: Number(item.icms),
      pis: Number(item.pis),
      cofins: Number(item.cofins),
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  static async saveImpostosPreset(
    userId: string,
    preset: ImpostosPreset
  ): Promise<ImpostosPreset> {
    const { data, error } = await supabase
      .from('impostos_presets')
      .upsert({
        id: preset.id.includes('-') ? preset.id : undefined,
        user_id: userId,
        nome: preset.nome,
        origem_uf: preset.origemUF,
        destino_uf: preset.destinoUF,
        tipo_operacao: preset.tipoOperacao,
        icms: preset.icms,
        pis: preset.pis,
        cofins: preset.cofins,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao salvar preset de impostos: ${error.message}`);
    }

    return {
      id: data.id,
      nome: data.nome,
      origemUF: data.origem_uf,
      destinoUF: data.destino_uf || '',
      tipoOperacao: data.tipo_operacao as 'interna' | 'interestadual',
      icms: Number(data.icms),
      pis: Number(data.pis),
      cofins: Number(data.cofins),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  static async deleteImpostosPreset(presetId: string): Promise<void> {
    const { error } = await supabase
      .from('impostos_presets')
      .update({ is_active: false })
      .eq('id', presetId);

    if (error) {
      throw new Error(`Erro ao deletar preset de impostos: ${error.message}`);
    }
  }

  // ==================== TAXAS HISTÓRICO ====================

  static async getTaxasHistorico(
    userId: string,
    limit = 50
  ): Promise<TaxaHistorico[]> {
    if (!userId) {return [];}

    const { data, error } = await supabase
      .from('taxas_historico')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar histórico de taxas: ${error.message}`);
    }

    return (data || []).map((item) => ({
      id: item.id,
      tipo: item.tipo as 'maquininha' | 'impostos',
      valor_venda: Number(item.valor_venda),
      taxa_aplicada: Number(item.taxa_aplicada),
      valor_recebido: Number(item.valor_recebido),
      detalhes: item.detalhes as Record<string, unknown>,
      created_at: item.created_at,
    }));
  }

  static async addTaxaHistorico(
    userId: string,
    registro: Omit<TaxaHistorico, 'id' | 'created_at'>
  ): Promise<TaxaHistorico> {
    const payload = {
      user_id: userId,
      tipo: registro.tipo,
      valor_venda: registro.valor_venda,
      taxa_aplicada: registro.taxa_aplicada,
      valor_recebido: registro.valor_recebido,
      detalhes: registro.detalhes,
    };
    
     
    const { data, error } = await (supabase
      .from('taxas_historico')
      .insert(payload as any)
      .select()
      .single() as any);

    if (error) {
      throw new Error(`Erro ao adicionar histórico de taxa: ${error.message}`);
    }

    return {
      id: data.id,
      tipo: data.tipo as 'maquininha' | 'impostos',
      valor_venda: Number(data.valor_venda),
      taxa_aplicada: Number(data.taxa_aplicada),
      valor_recebido: Number(data.valor_recebido),
      detalhes: data.detalhes as Record<string, unknown>,
      created_at: data.created_at,
    };
  }

  static async clearTaxasHistorico(userId: string): Promise<void> {
    const { error } = await supabase
      .from('taxas_historico')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erro ao limpar histórico de taxas: ${error.message}`);
    }
  }

  // ==================== SYNC HELPERS ====================

  /**
   * Sincroniza presets locais com o servidor
   */
  static async syncAll(
    userId: string,
    localMaquininhaPresets: MaquininhaPreset[],
    localImpostosPresets: ImpostosPreset[]
  ): Promise<{
    maquininhaPresets: MaquininhaPreset[];
    impostosPresets: ImpostosPreset[];
  }> {
    // Buscar presets do servidor
    const [serverMaquininha, serverImpostos] = await Promise.all([
      this.getMaquininhaPresets(userId),
      this.getImpostosPresets(userId),
    ]);

    // Merge: presets locais que não existem no servidor são enviados
    const maquininhaToSync = localMaquininhaPresets.filter(
      (local) => !serverMaquininha.some((server) => server.id === local.id)
    );

    const impostosToSync = localImpostosPresets.filter(
      (local) => !serverImpostos.some((server) => server.id === local.id)
    );

    // Enviar presets locais para o servidor
    await Promise.all([
      ...maquininhaToSync.map((preset) => this.saveMaquininhaPreset(userId, preset)),
      ...impostosToSync.map((preset) => this.saveImpostosPreset(userId, preset)),
    ]);

    // Retornar lista unificada
    return {
      maquininhaPresets: [...serverMaquininha, ...maquininhaToSync],
      impostosPresets: [...serverImpostos, ...impostosToSync],
    };
  }
}
