# 🚀 ROADMAP - FUNCIONALIDADES DE ALTO VALOR

## 🎯 OBJETIVO

Plano estratégico de desenvolvimento das funcionalidades premium do módulo de licitação do Azuria, focando em features que agregam máximo valor ao usuário e diferenciam a plataforma.

---

## 📊 MATRIZ DE PRIORIZAÇÃO

| Funcionalidade | Valor Cliente | Complexidade | Custo | Prioridade | Status |
|----------------|---------------|--------------|-------|------------|--------|
| Checklist Documentos | ⭐⭐⭐⭐⭐ | 🟢 Baixa | R$ 0 | **P0** | 🟡 40% |
| Cadastro Manual Editais | ⭐⭐⭐⭐⭐ | 🟢 Baixa | R$ 0 | **P1** | ⚪ 0% |
| Leitura Edital IA | ⭐⭐⭐⭐⭐ | 🟡 Média | R$ 0* | **P1** | ⚪ 0% |
| Crawler PNCP | ⭐⭐⭐⭐⭐ | 🟡 Média | R$ 0 | **P2** | ⚪ 0% |
| Análise Preditiva | ⭐⭐⭐⭐ | 🟠 Alta | R$ 0* | **P3** | ⚪ 0% |
| OCR Documentos | ⭐⭐⭐⭐ | 🟡 Média | R$ 50/mês | **P3** | ⚪ 0% |
| Geração Proposta IA | ⭐⭐⭐⭐⭐ | 🟠 Alta | R$ 0* | **P4** | ⚪ 0% |
| Dashboard Executivo | ⭐⭐⭐⭐ | 🟡 Média | R$ 0 | **P4** | ⚪ 0% |

\* Custo com planos gratuitos (Gemini, Hugging Face)

---

## 🏆 FASE 1: FUNCIONALIDADES ESSENCIAIS (Q1 2025)

### **1.1 Checklist de Documentos** ✅ (40% completo)

#### **Valor para o Cliente**:
- ✅ Nunca perder uma licitação por falta de documento
- ✅ Alertas automáticos de vencimento
- ✅ Centralização de todos os documentos

#### **Implementação**:
- [x] Database schema criado
- [x] RLS policies configuradas
- [ ] Upload de arquivos
- [ ] Sistema de alertas
- [ ] Interface de gerenciamento

#### **Tempo Estimado**: 2 semanas  
#### **Custo**: R$ 0

---

### **1.2 Cadastro Manual de Editais** 📋

#### **Valor para o Cliente**:
- Registro organizado de todas as licitações
- Acompanhamento de prazos e etapas
- Histórico completo de participações

#### **Features**:
```typescript
interface Edital {
  numero: string;
  orgao: string;
  objeto: string;
  modalidade: BiddingType;
  valor_estimado: number;
  data_abertura: Date;
  data_encerramento: Date;
  link_edital: string;
  documentos_exigidos: TipoDocumento[];
  status: 'aberto' | 'em_analise' | 'proposta_enviada' | 'encerrado';
  observacoes: string;
}
```

#### **Implementação**:
1. **Criar tabela `editais`** (1 dia)
2. **Formulário de cadastro** (2 dias)
3. **Lista com filtros e busca** (2 dias)
4. **Integração com calculadora** (1 dia)
5. **Alertas de prazo** (1 dia)

#### **Tempo Estimado**: 1,5 semana  
#### **Custo**: R$ 0

---

### **1.3 Leitura de Edital com IA (Gemini Gratuito)** 🤖

#### **Valor para o Cliente**:
- ⚡ Economia de **80% do tempo** de análise de editais
- ✅ Extração automática de requisitos
- 🎯 Identificação de riscos e oportunidades

#### **Capacidades da IA**:
```typescript
interface AnaliseEditalIA {
  // Informações Básicas
  numero_edital: string;
  orgao: string;
  objeto: string;
  modalidade: string;
  
  // Valores
  valor_estimado: number;
  valor_minimo?: number;
  valor_maximo?: number;
  
  // Prazos
  data_publicacao: Date;
  data_abertura: Date;
  data_encerramento: Date;
  prazo_entrega: number; // em dias
  
  // Requisitos Técnicos
  requisitos_tecnicos: string[];
  certificacoes_exigidas: string[];
  atestados_necessarios: number;
  
  // Requisitos de Habilitação
  documentos_exigidos: TipoDocumento[];
  qualificacao_economica: {
    patrimonio_liquido_minimo?: number;
    capital_social_minimo?: number;
    indices_financeiros?: string[];
  };
  
  // Análise de Risco
  riscos_identificados: {
    tipo: string;
    descricao: string;
    severidade: 'baixa' | 'media' | 'alta';
  }[];
  
  // Pontos de Atenção
  clausulas_criticas: string[];
  penalidades: string[];
  garantias_exigidas: {
    tipo: GuaranteeType;
    percentual: number;
  }[];
  
  // Recomendações
  recomendacoes: string[];
  score_viabilidade: number; // 0-100
}
```

#### **Implementação com Gemini**:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analisarEditalComIA(pdfUrl: string): Promise<AnaliseEditalIA> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Analise este edital de licitação e extraia as seguintes informações:
    1. Dados básicos (número, órgão, objeto)
    2. Valores e prazos
    3. Requisitos técnicos e habilitação
    4. Documentos exigidos
    5. Riscos e pontos de atenção
    6. Recomendações estratégicas
    
    Retorne em formato JSON estruturado.
  `;
  
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: await fetch(pdfUrl).then(r => r.arrayBuffer()).then(b => Buffer.from(b).toString('base64'))
      }
    },
    prompt
  ]);
  
  const response = await result.response;
  const analise = JSON.parse(response.text());
  
  return analise;
}
```

#### **Edge Function: Processar Edital**
```typescript
// supabase/functions/processar-edital-ia/index.ts
serve(async (req) => {
  const { pdfUrl, userId } = await req.json();
  
  // 1. Baixar PDF do edital
  // 2. Enviar para Gemini API
  // 3. Processar resposta
  // 4. Salvar no banco
  // 5. Criar alerta para o usuário
  
  return new Response(JSON.stringify({ analise }));
});
```

#### **Limites do Plano Gratuito**:
- **Gemini 1.5 Flash**: 15 requisições/minuto
- **Gemini 1.5 Pro**: 2 requisições/minuto
- **Total**: 1.500 requisições/dia

**Estratégia**: Adequado para até 50 análises/dia por usuário.

#### **Tempo Estimado**: 2 semanas  
#### **Custo**: R$ 0 (plano gratuito)

---

## 🚀 FASE 2: AUTOMAÇÃO E INTELIGÊNCIA (Q2 2025)

### **2.1 Crawler PNCP (Portal Nacional de Contratações Públicas)** 🕷️

#### **Valor para o Cliente**:
- 🔍 Busca automática de oportunidades
- 📬 Notificações de editais relevantes
- 📊 Histórico e estatísticas do mercado

#### **API Oficial PNCP**:
```typescript
// API gratuita e oficial do governo
const PNCP_API_BASE = 'https://pncp.gov.br/api/consulta/v1';

interface FiltrosPNCP {
  dataInicial: string;
  dataFinal: string;
  orgaoSuperior?: string;
  orgaoSubordinado?: string;
  municipio?: string;
  uf?: string;
  modalidade?: string;
  valor_min?: number;
  valor_max?: number;
}

export async function buscarEditaisPNCP(filtros: FiltrosPNCP) {
  const params = new URLSearchParams(filtros as any);
  const response = await fetch(`${PNCP_API_BASE}/contratacoes/publicadas?${params}`);
  const editais = await response.json();
  
  return editais;
}
```

#### **Features do Crawler**:
1. **Busca Diária Automática**
   - Cron job às 6h da manhã
   - Busca editais novos ou atualizados
   - Filtra por perfil do usuário

2. **Perfil de Interesse**
   ```typescript
   interface PerfilInteresse {
     areas_atuacao: string[]; // Ex: TI, Construção, Serviços
     regioes: string[]; // UF ou municípios
     valor_minimo: number;
     valor_maximo: number;
     modalidades: BiddingType[];
   }
   ```

3. **Sistema de Notificações**
   - Email diário com novos editais
   - Push notifications no app
   - Resumo semanal

4. **Score de Compatibilidade**
   ```typescript
   function calcularScore(edital: Edital, perfil: PerfilInteresse): number {
     let score = 0;
     
     // Área de atuação (40 pontos)
     if (perfil.areas_atuacao.some(area => edital.objeto.includes(area))) {
       score += 40;
     }
     
     // Região (30 pontos)
     if (perfil.regioes.includes(edital.uf)) {
       score += 30;
     }
     
     // Valor (20 pontos)
     if (edital.valor >= perfil.valor_minimo && edital.valor <= perfil.valor_maximo) {
       score += 20;
     }
     
     // Modalidade (10 pontos)
     if (perfil.modalidades.includes(edital.modalidade)) {
       score += 10;
     }
     
     return score;
   }
   ```

#### **Implementação**:
1. **Criar tabela `perfis_interesse`** (1 dia)
2. **Edge function de busca PNCP** (2 dias)
3. **Cron job diário** (1 dia)
4. **Sistema de notificações** (2 dias)
5. **Interface de configuração de perfil** (2 dias)

#### **Tempo Estimado**: 2 semanas  
#### **Custo**: R$ 0 (API oficial gratuita)

---

### **2.2 Análise Preditiva de Sucesso** 📈

#### **Valor para o Cliente**:
- 🎯 Predição de chance de vitória
- 📊 Recomendações baseadas em histórico
- 🏆 Estratégias de melhoria

#### **Machine Learning com TensorFlow.js**:
```typescript
import * as tf from '@tensorflow/tfjs';

interface FeaturesLicitacao {
  valor_proposta: number;
  margem_liquida: number;
  numero_concorrentes: number;
  distancia_media_mercado: number;
  completude_documentos: number; // 0-100%
  historico_com_orgao: number; // Nº de licitações anteriores
  score_tecnico: number; // 0-100
  prazo_entrega: number;
  garantia_oferecida: number;
}

export async function preverChanceVitoria(features: FeaturesLicitacao): Promise<number> {
  // Modelo treinado com histórico de licitações
  const model = await tf.loadLayersModel('/models/predicao-licitacao/model.json');
  
  const input = tf.tensor2d([Object.values(features)]);
  const prediction = model.predict(input) as tf.Tensor;
  const chance = (await prediction.data())[0] * 100;
  
  return Math.round(chance);
}
```

#### **Dados de Treinamento**:
- Histórico de licitações do usuário
- Dados públicos do PNCP (milhões de licitações)
- Features engineered:
  - Valor relativo ao estimado
  - Perfil do órgão comprador
  - Sazonalidade
  - Complexidade técnica

#### **Tempo Estimado**: 3 semanas  
#### **Custo**: R$ 0 (TensorFlow.js open-source)

---

## 💎 FASE 3: FEATURES PREMIUM (Q3 2025)

### **3.1 OCR para Documentos** 📄

#### **Valor para o Cliente**:
- ⚡ Digitalização automática de certidões
- ✅ Extração automática de datas de validade
- 🔔 Alertas precisos de vencimento

#### **Implementação com Google Cloud Vision**:
```typescript
import vision from '@google-cloud/vision';

export async function extrairDadosDocumento(imagemUrl: string) {
  const client = new vision.ImageAnnotatorClient();
  
  const [result] = await client.documentTextDetection(imagemUrl);
  const fullText = result.fullTextAnnotation?.text || '';
  
  // Expressões regulares para dados específicos
  const patterns = {
    numero: /N[°º\s]+(\d{2,}\.?\d{3,}\.?\d{3,}\/?\d{4}-?\d{2})/i,
    data_emissao: /EMISS[ÃĀA]O[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    data_validade: /VALIDADE[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    cnpj: /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/,
  };
  
  const dados = {
    numero: fullText.match(patterns.numero)?.[1],
    data_emissao: fullText.match(patterns.data_emissao)?.[1],
    data_validade: fullText.match(patterns.data_validade)?.[1],
    cnpj: fullText.match(patterns.cnpj)?.[1],
  };
  
  return dados;
}
```

#### **Custo Google Cloud Vision**:
- **0-1.000 unidades/mês**: Grátis
- **1.001-5.000.000**: US$ 1,50/1.000
- **Estimativa**: R$ 50/mês para 10.000 documentos

#### **Tempo Estimado**: 1 semana  
#### **Custo**: R$ 50/mês

---

### **3.2 Geração de Proposta com IA** 📝

#### **Valor para o Cliente**:
- 🚀 Geração automática de proposta técnica
- ✍️ Redação profissional e persuasiva
- ⏱️ Economia de **90% do tempo** de elaboração

#### **Implementação com Gemini**:
```typescript
export async function gerarPropostaTecnica(params: {
  edital: Edital;
  empresa: DadosEmpresa;
  analise_calculadora: BiddingCalculationResult;
}): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Você é um especialista em licitações públicas. Gere uma proposta técnica profissional:
    
    EDITAL: ${JSON.stringify(params.edital)}
    EMPRESA: ${JSON.stringify(params.empresa)}
    ANÁLISE FINANCEIRA: ${JSON.stringify(params.analise_calculadora)}
    
    A proposta deve incluir:
    1. Apresentação da empresa (2 parágrafos)
    2. Compreensão do objeto (3 parágrafos)
    3. Metodologia de execução (5 parágrafos)
    4. Cronograma de entrega
    5. Equipe técnica
    6. Diferenciais competitivos
    7. Conclusão
    
    Use linguagem formal e técnica. Destaque os pontos fortes da empresa.
  `;
  
  const result = await model.generateContent(prompt);
  const proposta = result.response.text();
  
  return proposta;
}
```

#### **Funcionalidades Adicionais**:
- Editor WYSIWYG para ajustes
- Templates customizáveis
- Exportação em PDF profissional
- Versionamento de propostas

#### **Tempo Estimado**: 2 semanas  
#### **Custo**: R$ 0 (Gemini Free Tier)

---

### **3.3 Dashboard Executivo** 📊

#### **Valor para o Cliente**:
- 📈 Visão estratégica do negócio
- 💰 ROI de licitações
- 🎯 KPIs e métricas avançadas

#### **Métricas Avançadas**:
```typescript
interface DashboardExecutivo {
  // Performance Geral
  taxa_sucesso: number; // % licitações ganhas
  valor_total_vencido: number;
  roi_medio: number; // Retorno sobre investimento
  tempo_medio_preparacao: number; // em horas
  
  // Análise Temporal
  tendencia_mensal: {
    mes: string;
    participacoes: number;
    vitorias: number;
    valor_total: number;
  }[];
  
  // Análise por Tipo
  performance_por_modalidade: {
    modalidade: BiddingType;
    taxa_sucesso: number;
    valor_medio: number;
  }[];
  
  // Análise de Órgãos
  orgaos_mais_vencidos: {
    orgao: string;
    vitorias: number;
    valor_total: number;
  }[];
  
  // Custos e Margens
  margem_media_vitorias: number;
  margem_media_derrotas: number;
  custo_medio_proposta: number;
  
  // Previsões
  pipeline_valor: number; // Valor em análise
  previsao_faturamento_trimestre: number;
  score_saude: number; // 0-100
}
```

#### **Gráficos Interativos** (Recharts):
- Funil de conversão
- Evolução temporal de vitórias
- Mapa de calor por região
- Comparativo de margens
- Tendências de mercado

#### **Tempo Estimado**: 2 semanas  
#### **Custo**: R$ 0

---

## 📊 CRONOGRAMA GERAL

```
Q1 2025 (Jan-Mar)
├── ✅ Semana 1-2: Finalizar Checklist Documentos
├── 📋 Semana 3-4: Cadastro Manual de Editais
└── 🤖 Semana 5-8: Leitura de Edital com IA

Q2 2025 (Abr-Jun)
├── 🕷️ Semana 1-2: Crawler PNCP
└── 📈 Semana 3-5: Análise Preditiva

Q3 2025 (Jul-Set)
├── 📄 Semana 1: OCR Documentos
├── 📝 Semana 2-3: Geração de Proposta IA
└── 📊 Semana 4-5: Dashboard Executivo
```

---

## 💰 ANÁLISE DE CUSTO-BENEFÍCIO

| Funcionalidade | Custo Mensal | Valor Gerado | ROI |
|----------------|--------------|--------------|-----|
| Checklist Docs | R$ 0 | Alto | ∞ |
| Cadastro Editais | R$ 0 | Médio | ∞ |
| Leitura IA | R$ 0 | Muito Alto | ∞ |
| Crawler PNCP | R$ 0 | Muito Alto | ∞ |
| Análise Preditiva | R$ 0 | Alto | ∞ |
| OCR | R$ 50 | Médio | 10x |
| Geração Proposta IA | R$ 0 | Muito Alto | ∞ |
| Dashboard Executivo | R$ 0 | Médio | ∞ |

**Custo Total Mensal**: ~R$ 50  
**Valor Agregado ao Cliente**: Inestimável

---

## 🎯 METAS DE IMPACTO

- ⏱️ **Reduzir em 80%** o tempo de análise de editais
- 📈 **Aumentar em 50%** a taxa de participação em licitações
- 🏆 **Melhorar em 30%** a taxa de vitória
- 💰 **Aumentar em 25%** a margem média de lucro
- 📊 **Proporcionar visibilidade 100% do pipeline**

---

**Status**: 📋 Planejamento Completo  
**Última Atualização**: Janeiro 2025  
**Responsável**: Equipe Produto Azuria

