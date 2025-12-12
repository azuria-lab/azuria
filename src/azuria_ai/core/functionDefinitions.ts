/**
 * Function Definitions
 *
 * Registra todas as funções disponíveis para a IA chamar.
 * Mapeia cada função para seu respectivo agente interno.
 */

import { type FunctionDefinition, registerFunction } from './functionRegistry';

/**
 * Inicializa e registra todas as funções disponíveis
 */
export function initializeFunctions(): void {
  // ===== FUNÇÕES DE CÁLCULO =====

  registerFunction({
    name: 'calcularPrecoIdeal',
    description:
      'Calcula o preço ideal de venda baseado em custos, margem desejada e impostos',
    category: 'calculation',
    agentId: 'calculoAgent',
    parameters: [
      {
        name: 'custoProduto',
        type: 'number',
        description: 'Custo do produto',
        required: true,
      },
      {
        name: 'margemDesejada',
        type: 'number',
        description: 'Margem de lucro desejada em percentual',
        required: true,
      },
      {
        name: 'custoOperacional',
        type: 'number',
        description: 'Custo operacional',
        required: false,
        default: 0,
      },
      {
        name: 'impostos',
        type: 'number',
        description: 'Impostos em percentual',
        required: false,
        default: 0,
      },
    ],
    handler: async params => {
      // TODO: Chamar agente de cálculo via backend
      const response = await fetch('/api/agents/calculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularPrecoIdeal',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'calcularMargem',
    description:
      'Calcula a margem de lucro real baseado no preço de venda e custos',
    category: 'calculation',
    agentId: 'calculoAgent',
    parameters: [
      {
        name: 'precoVenda',
        type: 'number',
        description: 'Preço de venda',
        required: true,
      },
      {
        name: 'custoProduto',
        type: 'number',
        description: 'Custo do produto',
        required: true,
      },
      {
        name: 'custoOperacional',
        type: 'number',
        description: 'Custo operacional',
        required: false,
        default: 0,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/calculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularMargem',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'calcularPrecoMinimo',
    description: 'Calcula o preço mínimo de venda para não ter prejuízo',
    category: 'calculation',
    agentId: 'calculoAgent',
    parameters: [
      {
        name: 'custoProduto',
        type: 'number',
        description: 'Custo do produto',
        required: true,
      },
      {
        name: 'custoOperacional',
        type: 'number',
        description: 'Custo operacional',
        required: false,
        default: 0,
      },
      {
        name: 'impostos',
        type: 'number',
        description: 'Impostos em percentual',
        required: false,
        default: 0,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/calculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularPrecoMinimo',
          params,
        }),
      });
      return response.json();
    },
  });

  // ===== FUNÇÕES FISCAIS =====

  registerFunction({
    name: 'calcularICMS',
    description: 'Calcula o valor do ICMS baseado no preço e alíquota',
    category: 'fiscal',
    agentId: 'fiscalAgent',
    parameters: [
      {
        name: 'preco',
        type: 'number',
        description: 'Preço do produto',
        required: true,
      },
      {
        name: 'aliquota',
        type: 'number',
        description: 'Alíquota do ICMS em percentual',
        required: true,
      },
      {
        name: 'ufOrigem',
        type: 'string',
        description: 'UF de origem',
        required: false,
      },
      {
        name: 'ufDestino',
        type: 'string',
        description: 'UF de destino',
        required: false,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularICMS',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'calcularST',
    description: 'Calcula a Substituição Tributária (ICMS-ST)',
    category: 'fiscal',
    agentId: 'fiscalAgent',
    parameters: [
      {
        name: 'preco',
        type: 'number',
        description: 'Preço do produto',
        required: true,
      },
      {
        name: 'mva',
        type: 'number',
        description: 'MVA (Margem de Valor Agregado) em percentual',
        required: true,
      },
      {
        name: 'aliquotaInterna',
        type: 'number',
        description: 'Alíquota interna do ICMS',
        required: true,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularST',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'calcularMVA',
    description: 'Calcula a MVA (Margem de Valor Agregado) para um produto',
    category: 'fiscal',
    agentId: 'fiscalAgent',
    parameters: [
      {
        name: 'ncm',
        type: 'string',
        description: 'Código NCM do produto',
        required: true,
      },
      {
        name: 'uf',
        type: 'string',
        description: 'UF de destino',
        required: true,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularMVA',
          params,
        }),
      });
      return response.json();
    },
  });

  // ===== FUNÇÕES DE MARKETPLACE =====

  registerFunction({
    name: 'getTaxasMarketplace',
    description: 'Obtém as taxas de um marketplace específico',
    category: 'marketplace',
    agentId: 'marketplaceAgent',
    parameters: [
      {
        name: 'marketplace',
        type: 'string',
        description: 'Nome do marketplace (mercadolivre, shopee, amazon, etc)',
        required: true,
      },
      {
        name: 'categoria',
        type: 'string',
        description: 'Categoria do produto',
        required: false,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getTaxasMarketplace',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'calcularComissao',
    description: 'Calcula a comissão do marketplace sobre uma venda',
    category: 'marketplace',
    agentId: 'marketplaceAgent',
    parameters: [
      {
        name: 'marketplace',
        type: 'string',
        description: 'Nome do marketplace',
        required: true,
      },
      {
        name: 'precoVenda',
        type: 'number',
        description: 'Preço de venda',
        required: true,
      },
      {
        name: 'categoria',
        type: 'string',
        description: 'Categoria do produto',
        required: false,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularComissao',
          params,
        }),
      });
      return response.json();
    },
  });

  // ===== FUNÇÕES DE LICITAÇÃO =====

  registerFunction({
    name: 'calcularLance',
    description: 'Calcula um lance competitivo para licitação',
    category: 'bidding',
    agentId: 'licitacaoAgent',
    parameters: [
      {
        name: 'precoReferencia',
        type: 'number',
        description: 'Preço de referência do edital',
        required: true,
      },
      {
        name: 'custoTotal',
        type: 'number',
        description: 'Custo total do produto/serviço',
        required: true,
      },
      {
        name: 'margemDesejada',
        type: 'number',
        description: 'Margem de lucro desejada em percentual',
        required: false,
        default: 10,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/licitacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calcularLance',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'avaliarRisco',
    description: 'Avalia o risco de participar de uma licitação',
    category: 'bidding',
    agentId: 'licitacaoAgent',
    parameters: [
      {
        name: 'precoReferencia',
        type: 'number',
        description: 'Preço de referência',
        required: true,
      },
      {
        name: 'custoTotal',
        type: 'number',
        description: 'Custo total',
        required: true,
      },
      {
        name: 'prazoEntrega',
        type: 'number',
        description: 'Prazo de entrega em dias',
        required: false,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/licitacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'avaliarRisco',
          params,
        }),
      });
      return response.json();
    },
  });

  // ===== FUNÇÕES DE UI =====

  registerFunction({
    name: 'setInputValue',
    description: 'Define o valor de um campo de input na interface',
    category: 'ui',
    agentId: 'uiAgent',
    parameters: [
      {
        name: 'campoId',
        type: 'string',
        description: 'ID do campo',
        required: true,
      },
      {
        name: 'valor',
        type: 'string',
        description: 'Valor a ser definido',
        required: true,
      },
      {
        name: 'destacar',
        type: 'boolean',
        description: 'Se deve destacar o campo',
        required: false,
        default: false,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setInputValue',
          params,
        }),
      });
      return response.json();
    },
  });

  registerFunction({
    name: 'aplicarSugestaoNaTela',
    description: 'Aplica uma sugestão da IA diretamente na tela',
    category: 'ui',
    agentId: 'uiAgent',
    parameters: [
      {
        name: 'tipo',
        type: 'string',
        description: 'Tipo de sugestão (preco, margem, campo)',
        required: true,
      },
      {
        name: 'valores',
        type: 'object',
        description: 'Valores a serem aplicados',
        required: true,
      },
      {
        name: 'confirmarAntes',
        type: 'boolean',
        description: 'Se deve pedir confirmação do usuário',
        required: false,
        default: true,
      },
    ],
    handler: async params => {
      const response = await fetch('/api/agents/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'aplicarSugestaoNaTela',
          params,
        }),
      });
      return response.json();
    },
  });
}

/**
 * Obtém todas as funções registradas agrupadas por categoria
 */
export function getFunctionsByCategory() {
  return {
    calculation: [
      'calcularPrecoIdeal',
      'calcularMargem',
      'calcularPrecoMinimo',
    ],
    fiscal: ['calcularICMS', 'calcularST', 'calcularMVA'],
    marketplace: ['getTaxasMarketplace', 'calcularComissao'],
    bidding: ['calcularLance', 'avaliarRisco'],
    ui: ['setInputValue', 'aplicarSugestaoNaTela'],
  };
}
