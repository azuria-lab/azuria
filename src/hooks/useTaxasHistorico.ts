import { useEffect, useState } from 'react';

export interface TaxaHistorico {
  id: string;
  tipo: 'maquininha' | 'impostos';
  valor_venda: number;
  taxa_aplicada: number;
  valor_recebido: number;
  detalhes: Record<string, unknown>;
  created_at: string;
}

const STORAGE_KEY = 'azuria_taxas_historico';
const MAX_HISTORICO = 50;

export function useTaxasHistorico() {
  const [historico, setHistorico] = useState<TaxaHistorico[]>([]);

  // Carregar histórico do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistorico(JSON.parse(stored));
      }
    } catch {
      // Falha ao carregar histórico
    }
  }, []);

  // Salvar histórico no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
    } catch {
      // Falha ao salvar histórico
    }
  }, [historico]);

  const adicionarRegistro = (registro: Omit<TaxaHistorico, 'id' | 'created_at'>) => {
    const novoRegistro: TaxaHistorico = {
      ...registro,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    setHistorico((prev) => {
      const atualizado = [novoRegistro, ...prev].slice(0, MAX_HISTORICO);
      return atualizado;
    });

    return novoRegistro;
  };

  const limparHistorico = () => {
    setHistorico([]);
  };

  const getUltimasAplicacoes = (tipo?: 'maquininha' | 'impostos', limite = 10) => {
    let resultado = historico;
    if (tipo) {
      resultado = resultado.filter((h) => h.tipo === tipo);
    }
    return resultado.slice(0, limite);
  };

  const getTotalTaxasPagas = (periodo?: 'dia' | 'semana' | 'mes') => {
    let filtrado = historico;

    if (periodo) {
      const agora = new Date();
      let dataLimite: Date;

      switch (periodo) {
        case 'dia':
          dataLimite = new Date(agora.setHours(0, 0, 0, 0));
          break;
        case 'semana':
          dataLimite = new Date(agora.setDate(agora.getDate() - 7));
          break;
        case 'mes':
          dataLimite = new Date(agora.setMonth(agora.getMonth() - 1));
          break;
      }

      filtrado = historico.filter((h) => new Date(h.created_at) >= dataLimite);
    }

    return filtrado.reduce((total, h) => {
      const taxaReais = h.valor_venda - h.valor_recebido;
      return total + taxaReais;
    }, 0);
  };

  const getEstatisticas = () => {
    if (historico.length === 0) {
      return {
        totalRegistros: 0,
        mediaTaxa: 0,
        totalTaxasPagas: 0,
        totalVendas: 0,
        mediaTaxaMaquininha: 0,
        mediaTaxaImpostos: 0,
      };
    }

    const taxasMaquininha = historico.filter((h) => h.tipo === 'maquininha');
    const taxasImpostos = historico.filter((h) => h.tipo === 'impostos');

    const totalTaxasPagas = historico.reduce(
      (total, h) => total + (h.valor_venda - h.valor_recebido),
      0
    );
    const totalVendas = historico.reduce((total, h) => total + h.valor_venda, 0);

    return {
      totalRegistros: historico.length,
      mediaTaxa:
        historico.length > 0
          ? historico.reduce((sum, h) => sum + h.taxa_aplicada, 0) / historico.length
          : 0,
      totalTaxasPagas,
      totalVendas,
      mediaTaxaMaquininha:
        taxasMaquininha.length > 0
          ? taxasMaquininha.reduce((sum, h) => sum + h.taxa_aplicada, 0) / taxasMaquininha.length
          : 0,
      mediaTaxaImpostos:
        taxasImpostos.length > 0
          ? taxasImpostos.reduce((sum, h) => sum + h.taxa_aplicada, 0) / taxasImpostos.length
          : 0,
    };
  };

  return {
    historico,
    adicionarRegistro,
    limparHistorico,
    getUltimasAplicacoes,
    getTotalTaxasPagas,
    getEstatisticas,
  };
}
