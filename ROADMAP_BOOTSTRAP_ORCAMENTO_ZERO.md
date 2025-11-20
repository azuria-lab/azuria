# 💰 ROADMAP BOOTSTRAP - ORÇAMENTO ZERO

## 🎯 FILOSOFIA

Criar um módulo de licitação **completo e competitivo** utilizando **APENAS ferramentas e APIs gratuitas**, provando que é possível construir um SaaS de alto valor sem investimento inicial.

---

## ✅ PRINCÍPIOS DO ORÇAMENTO ZERO

1. **APIs Gratuitas Oficiais**: Priorizar APIs governamentais e open-source
2. **Free Tiers Generosos**: Gemini, Supabase, Vercel
3. **Open Source**: TensorFlow.js, Recharts, Shadcn UI
4. **Escalabilidade Planejada**: Arquitetura pronta para migração futura

---

## 📊 STACK TECNOLÓGICA (CUSTO: R$ 0)

### **Frontend**
- ✅ **React 18**: MIT License, gratuito
- ✅ **TypeScript**: Apache 2.0, gratuito
- ✅ **Vite**: MIT License, gratuito
- ✅ **Shadcn UI**: MIT License, gratuito
- ✅ **Tailwind CSS**: MIT License, gratuito
- ✅ **Framer Motion**: MIT License, gratuito
- ✅ **Lucide Icons**: ISC License, gratuito
- ✅ **Recharts**: MIT License, gratuito

### **Backend**
- ✅ **Supabase Free Tier**:
  - 500 MB Database
  - 1 GB File Storage
  - 50.000 usuários ativos/mês
  - 2 GB Bandwidth
  - **Custo**: R$ 0

### **IA e ML**
- ✅ **Google Gemini Free Tier**:
  - 15 RPM (requisições/minuto)
  - 1.500 RPD (requisições/dia)
  - Leitura de PDFs incluída
  - **Custo**: R$ 0

- ✅ **TensorFlow.js**: Apache 2.0
  - Roda no navegador
  - Sem custo de servidor
  - **Custo**: R$ 0

### **APIs Governamentais**
- ✅ **PNCP API**: API oficial, sem autenticação
  - Todos os editais públicos do Brasil
  - Atualização em tempo real
  - Sem limites de requisição
  - **Custo**: R$ 0

- ✅ **ReceitaWS**: API pública CNPJ
  - 3 consultas/minuto
  - Dados cadastrais de empresas
  - **Custo**: R$ 0

### **Deploy e Hosting**
- ✅ **Vercel Free Tier**:
  - 100 GB Bandwidth
  - Domínio personalizado
  - CI/CD automático
  - Edge Functions
  - **Custo**: R$ 0

---

## 🚀 FUNCIONALIDADES SEM CUSTO

### **FASE 1: BÁSICO (Semana 1-2)** ✅

#### **1.1 Calculadora de Licitação**
```
Tecnologia: React + TypeScript + Decimal.js
Custo: R$ 0
Status: ✅ CONCLUÍDO
```

**Funcionalidades**:
- ✅ Fórmula por divisor (margem líquida garantida)
- ✅ 3 cenários automáticos
- ✅ Modo leilão invertido
- ✅ Análise de viabilidade
- ✅ Exportação de resultados

#### **1.2 Dashboard de Licitações**
```
Tecnologia: React + Recharts
Custo: R$ 0
Status: ✅ CONCLUÍDO
```

**Funcionalidades**:
- ✅ Estatísticas gerais
- ✅ Ciclo de vida de projetos
- ✅ Projetos recentes
- ✅ Ações rápidas

---

### **FASE 2: DOCUMENTOS (Semana 3-4)** 🟡 40%

#### **2.1 Checklist de Documentos**
```
Tecnologia: Supabase Storage + PostgreSQL
Custo: R$ 0 (dentro do Free Tier)
Status: 🟡 EM ANDAMENTO
```

**Funcionalidades**:
- [x] Upload de arquivos (até 1 GB)
- [x] Organização por categoria
- [ ] Alertas de vencimento (email)
- [ ] Download de documentos
- [ ] Histórico de renovações

**Limites do Free Tier**:
- Storage: 1 GB (suficiente para ~2.000 PDFs)
- Bandwidth: 2 GB/mês (suficiente para ~100 usuários)

---

### **FASE 3: AUTOMAÇÃO (Semana 5-8)** ⚪ 0%

#### **3.1 Cadastro Manual de Editais**
```
Tecnologia: Supabase PostgreSQL + React Forms
Custo: R$ 0
Status: ⚪ PLANEJADO
```

**Funcionalidades**:
- [ ] Formulário completo de edital
- [ ] Lista com filtros avançados
- [ ] Integração com calculadora
- [ ] Alertas de prazo automáticos
- [ ] Histórico de participações

**Database**:
```sql
CREATE TABLE editais (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  numero VARCHAR(100),
  orgao VARCHAR(255),
  objeto TEXT,
  modalidade VARCHAR(50),
  valor_estimado NUMERIC(15,2),
  data_abertura DATE,
  data_encerramento DATE,
  link_edital TEXT,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Estimativa**: 500 MB suficiente para 50.000 editais

---

#### **3.2 Leitura de Edital com IA**
```
Tecnologia: Google Gemini 1.5 Flash (Free Tier)
Custo: R$ 0
Status: ⚪ PLANEJADO
```

**Capacidades do Free Tier**:
- **15 requisições/minuto**
- **1.500 requisições/dia**
- **32K tokens de contexto**
- **Leitura de PDF nativa**

**Cálculos de Capacidade**:
```
Por Usuário:
- 5 análises/dia = 150/mês
- Suficiente para 95% dos usuários

Total Sistema (100 usuários):
- 500 análises/dia
- Dentro do limite de 1.500/dia ✅

Crescimento:
- Até 300 usuários ativos mantém gratuito
```

**Funcionalidades**:
```typescript
interface AnaliseEdital {
  // Extração Automática
  dados_basicos: {
    numero: string;
    orgao: string;
    objeto: string;
    valor_estimado: number;
  };
  
  // Requisitos
  documentos_exigidos: TipoDocumento[];
  requisitos_tecnicos: string[];
  qualificacao_economica: {
    patrimonio_minimo?: number;
    indices_exigidos?: string[];
  };
  
  // Análise Inteligente
  riscos: RiscoIdentificado[];
  oportunidades: string[];
  score_viabilidade: number; // 0-100
  recomendacoes: string[];
  
  // Extração de Prazos
  cronograma: {
    abertura: Date;
    visita_tecnica?: Date;
    envio_proposta: Date;
    resultado: Date;
  };
}
```

**Prompt Otimizado** (< 1.000 tokens):
```typescript
const prompt = `
Analise este edital e extraia em JSON:

{
  "numero": "string",
  "orgao": "string",
  "objeto": "string (max 200 chars)",
  "valor_estimado": number,
  "data_abertura": "YYYY-MM-DD",
  "data_encerramento": "YYYY-MM-DD",
  "documentos_exigidos": ["string"],
  "requisitos_tecnicos": ["string"],
  "riscos": [{"tipo": "string", "severidade": "baixa|media|alta"}],
  "score_viabilidade": number,
  "recomendacoes": ["string (max 3)"]
}

Seja conciso. Use apenas informações do edital.
`;
```

**Tempo de Resposta**: ~3-5 segundos por edital

---

#### **3.3 Crawler PNCP**
```
Tecnologia: PNCP API + Supabase Edge Functions
Custo: R$ 0
Status: ⚪ PLANEJADO
```

**API PNCP Oficial**:
- **Endpoint**: `https://pncp.gov.br/api/consulta/v1/contratacoes/publicadas`
- **Autenticação**: Não requerida
- **Rate Limit**: Ilimitado
- **Dados**: Todos os editais públicos do Brasil

**Funcionalidades**:
```typescript
interface CrawlerPNCP {
  // Busca Automática
  busca_diaria: true; // Cron às 6h
  filtros_usuario: {
    areas_interesse: string[];
    regioes: string[];
    valor_min: number;
    valor_max: number;
  };
  
  // Score de Compatibilidade
  algoritmo_matching: (edital, perfil) => number;
  
  // Notificações
  email_diario: true;
  resumo_semanal: true;
  push_notifications: true;
  
  // Histórico
  editais_salvos: Edital[];
  editais_ignorados: string[];
}
```

**Cron Job Diário** (Supabase):
```sql
SELECT cron.schedule(
  'buscar-editais-pncp',
  '0 6 * * *', -- Todos os dias às 6h
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/buscar-editais',
    headers:='{"Authorization": "Bearer ANON_KEY"}'::jsonb
  );
  $$
);
```

**Edge Function**:
```typescript
// supabase/functions/buscar-editais/index.ts
serve(async (req) => {
  // 1. Buscar usuários ativos
  const usuarios = await supabase
    .from('users')
    .select('id, perfil_interesse');
  
  // 2. Para cada usuário, buscar editais compatíveis
  for (const usuario of usuarios) {
    const editais = await buscarPNCP(usuario.perfil_interesse);
    
    // 3. Calcular score de compatibilidade
    const editaisFiltrados = editais
      .map(e => ({ ...e, score: calcularScore(e, usuario.perfil_interesse) }))
      .filter(e => e.score >= 50)
      .sort((a, b) => b.score - a.score);
    
    // 4. Salvar no banco
    await salvarEditais(editaisFiltrados, usuario.id);
    
    // 5. Enviar notificação se houver novos editais
    if (editaisFiltrados.length > 0) {
      await enviarEmail(usuario.id, editaisFiltrados);
    }
  }
  
  return new Response(JSON.stringify({ success: true }));
});
```

**Capacidade**:
- 100 usuários × 10 editais/dia = 1.000 editais processados
- Dentro do Free Tier do Supabase ✅

---

### **FASE 4: INTELIGÊNCIA AVANÇADA (Semana 9-12)** ⚪ 0%

#### **4.1 Análise Preditiva**
```
Tecnologia: TensorFlow.js (client-side)
Custo: R$ 0 (roda no navegador do usuário)
Status: ⚪ PLANEJADO
```

**Modelo de ML**:
```typescript
// Treinamento com dados históricos
const model = tf.sequential({
  layers: [
    tf.layers.dense({ units: 64, activation: 'relu', inputShape: [9] }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dense({ units: 1, activation: 'sigmoid' })
  ]
});

// Features
interface ModelInput {
  valor_relativo: number; // proposta / estimado
  margem_liquida: number;
  completude_docs: number;
  historico_orgao: number;
  numero_concorrentes: number;
  score_tecnico: number;
  prazo_entrega: number;
  tipo_licitacao: number; // encoded
  regiao: number; // encoded
}

// Output
interface ModelOutput {
  probabilidade_vitoria: number; // 0-1
  confianca: number; // 0-1
}
```

**Dados de Treinamento**:
- Fonte 1: Dados públicos PNCP (milhões de licitações)
- Fonte 2: Histórico do próprio usuário
- Fonte 3: Benchmarks de mercado

**Vantagens do Client-Side**:
- Sem custo de servidor
- Privacidade dos dados
- Resposta instantânea
- Funciona offline

---

#### **4.2 Geração de Proposta com IA**
```
Tecnologia: Gemini 1.5 Flash (Free Tier)
Custo: R$ 0
Status: ⚪ PLANEJADO
```

**Funcionalidades**:
```typescript
export async function gerarProposta(params: {
  edital: Edital;
  empresa: DadosEmpresa;
  analise: BiddingCalculationResult;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const proposta = await model.generateContent(`
    Gere uma proposta técnica profissional para:
    
    EDITAL: ${params.edital.objeto}
    ÓRGÃO: ${params.edital.orgao}
    VALOR: ${formatCurrency(params.analise.suggestedPrice)}
    
    EMPRESA: ${params.empresa.razao_social}
    CNPJ: ${params.empresa.cnpj}
    EXPERIÊNCIA: ${params.empresa.anos_mercado} anos
    
    Estrutura:
    1. Apresentação da Empresa (150 palavras)
    2. Compreensão do Objeto (200 palavras)
    3. Metodologia de Execução (300 palavras)
    4. Cronograma
    5. Equipe Técnica
    6. Diferenciais
    7. Conclusão (100 palavras)
    
    Tom: Profissional, técnico, persuasivo.
  `);
  
  return proposta.response.text();
}
```

**Uso Estimado**:
- 1 proposta = 1 requisição
- Usuário médio: 3 propostas/semana = 12/mês
- 100 usuários = 1.200 requisições/mês
- Limite: 45.000/mês ✅

**Templates Customizáveis**:
- Por tipo de licitação
- Por área de atuação
- Por porte de empresa

**Editor Integrado**:
- WYSIWYG (TinyMCE ou Draft.js - ambos open-source)
- Exportação PDF (jsPDF - MIT License)
- Versionamento (sem custo adicional)

---

### **FASE 5: ANALYTICS EXECUTIVO (Semana 13-14)** ⚪ 0%

#### **5.1 Dashboard Executivo**
```
Tecnologia: Recharts + React Query
Custo: R$ 0
Status: ⚪ PLANEJADO
```

**Métricas Avançadas**:
```typescript
interface MetricasExecutivas {
  // Performance
  taxa_conversao: number;
  valor_pipeline: number;
  roi_medio: number;
  
  // Temporal
  tendencia_12_meses: DataPoint[];
  sazonalidade: {
    mes: number;
    media_participacoes: number;
    media_vitorias: number;
  }[];
  
  // Segmentação
  por_modalidade: {
    tipo: BiddingType;
    taxa_sucesso: number;
    margem_media: number;
  }[];
  
  por_regiao: {
    uf: string;
    participacoes: number;
    vitorias: number;
  }[];
  
  por_orgao: {
    nome: string;
    historico: number;
    taxa_sucesso: number;
  }[];
  
  // Previsões
  previsao_faturamento_trimestre: number;
  metas_vs_realizado: {
    meta: number;
    realizado: number;
    percentual: number;
  };
}
```

**Gráficos** (Recharts - MIT License):
- Line Chart: Tendência temporal
- Bar Chart: Performance por tipo
- Pie Chart: Distribuição de margens
- Area Chart: Pipeline acumulado
- Scatter Plot: Valor vs Taxa de Sucesso
- Heatmap: Mapa de oportunidades

**Exportação**:
- PDF executivo (jsPDF)
- Excel (SheetJS - Apache 2.0)
- PNG/SVG dos gráficos

---

## 📊 LIMITES E CAPACIDADES

### **Supabase Free Tier**

| Recurso | Limite | Uso Estimado | Margem |
|---------|--------|--------------|---------|
| Database | 500 MB | 200 MB | 60% ✅ |
| Storage | 1 GB | 400 MB | 60% ✅ |
| Bandwidth | 2 GB/mês | 1 GB/mês | 50% ✅ |
| Usuários Ativos | 50.000/mês | 100/mês | 99% ✅ |
| Edge Functions | 500K/mês | 50K/mês | 90% ✅ |

**Capacidade Total**: **100-300 usuários ativos**

### **Gemini Free Tier**

| Modelo | RPM | RPD | Uso Estimado | OK? |
|--------|-----|-----|--------------|-----|
| Flash | 15 | 1.500 | 500/dia | ✅ |
| Pro | 2 | 50 | 10/dia | ✅ |

**Capacidade Total**: **300 usuários × 5 análises/dia**

### **PNCP API**

| Recurso | Limite | Nota |
|---------|--------|------|
| Rate Limit | Ilimitado | API oficial |
| Autenticação | Não requerida | Público |
| Dados | Completos | Todos os editais |

**Capacidade**: Ilimitada ✅

---

## 💰 ANÁLISE FINANCEIRA

### **Custos Mensais (100 usuários)**

| Serviço | Custo | Observação |
|---------|-------|------------|
| Supabase | R$ 0 | Free Tier |
| Gemini AI | R$ 0 | Free Tier |
| Vercel | R$ 0 | Free Tier |
| PNCP API | R$ 0 | API oficial |
| TensorFlow.js | R$ 0 | Client-side |
| Recharts | R$ 0 | Open-source |
| **TOTAL** | **R$ 0** | 🎉 |

### **Receita Potencial**

| Plano | Preço | Usuários | MRR |
|-------|-------|----------|-----|
| Grátis | R$ 0 | 50 | R$ 0 |
| Básico | R$ 49 | 30 | R$ 1.470 |
| Pro | R$ 99 | 15 | R$ 1.485 |
| Enterprise | R$ 299 | 5 | R$ 1.495 |
| **TOTAL** | - | **100** | **R$ 4.450** |

**Margem Bruta**: 100% (sem COGS)

---

## 🚀 ESTRATÉGIA DE CRESCIMENTO

### **Até 300 usuários**: Orçamento Zero Completo
- Todos os serviços gratuitos
- Margem: 100%
- Foco: PMF (Product-Market Fit)

### **300-1.000 usuários**: Migração Seletiva
```
Custos Estimados:
- Supabase Pro: $25/mês = R$ 125
- Gemini API (paid): ~R$ 50/mês
- TOTAL: R$ 175/mês

Receita (assumindo 30% pagantes):
- 300 × 0.30 × R$ 79 (média) = R$ 7.110/mês

Margem: 97.5%
```

### **1.000+ usuários**: Plano Empresarial
```
Custos:
- Supabase Pro: R$ 250/mês
- Gemini API: R$ 200/mês
- CDN: R$ 100/mês
- TOTAL: R$ 550/mês

Receita (assumindo 40% pagantes):
- 1.000 × 0.40 × R$ 89 = R$ 35.600/mês

Margem: 98.5%
```

---

## ✅ CHECKLIST DE EXECUÇÃO

### **Semana 1-2: Básico** ✅
- [x] Calculadora de Licitação
- [x] Dashboard básico
- [x] Navegação e rotas

### **Semana 3-4: Documentos** 🟡
- [x] Database schema
- [x] Types e interfaces
- [ ] Upload de arquivos
- [ ] Sistema de alertas

### **Semana 5-6: IA - Leitura** ⚪
- [ ] Integração Gemini
- [ ] Extração de dados
- [ ] Interface de análise
- [ ] Testes com editais reais

### **Semana 7-8: Crawler PNCP** ⚪
- [ ] Integração API PNCP
- [ ] Perfil de interesse
- [ ] Cron job diário
- [ ] Sistema de notificações

### **Semana 9-10: ML Preditivo** ⚪
- [ ] Modelo TensorFlow.js
- [ ] Treinamento com dados PNCP
- [ ] Interface de predição
- [ ] Validação de acurácia

### **Semana 11-12: Geração de Proposta** ⚪
- [ ] Integração Gemini (proposta)
- [ ] Templates customizáveis
- [ ] Editor WYSIWYG
- [ ] Exportação PDF

### **Semana 13-14: Dashboard Executivo** ⚪
- [ ] Métricas avançadas
- [ ] Gráficos interativos
- [ ] Exportação de relatórios
- [ ] Mobile responsivo

---

## 🎯 MÉTRICAS DE SUCESSO

| Métrica | Meta Q1 | Meta Q2 | Meta Q3 |
|---------|---------|---------|---------|
| Usuários Ativos | 50 | 150 | 300 |
| MRR | R$ 2K | R$ 7K | R$ 15K |
| Churn Rate | < 10% | < 8% | < 5% |
| NPS | > 50 | > 60 | > 70 |
| Análises IA/dia | 100 | 500 | 1.500 |

---

## 🏆 DIFERENCIAIS COMPETITIVOS

### **vs. Planilhas Excel**
- ✅ Automação completa
- ✅ IA integrada
- ✅ Alertas automáticos
- ✅ Histórico centralizado

### **vs. Softwares Pagos**
- ✅ **Custo inicial zero**
- ✅ Mesmas funcionalidades
- ✅ Interface moderna
- ✅ Cloud e mobile

### **vs. Consultores**
- ✅ Disponível 24/7
- ✅ Custo 100x menor
- ✅ Resultado instantâneo
- ✅ Sem viés humano

---

## 📝 CONCLUSÃO

É **100% possível** criar um módulo de licitação completo e competitivo com **ORÇAMENTO ZERO**, utilizando:

1. ✅ **APIs gratuitas oficiais** (PNCP, ReceitaWS)
2. ✅ **Free tiers generosos** (Supabase, Gemini, Vercel)
3. ✅ **Open-source** (React, TensorFlow.js, Recharts)

**Capacidade**: Suporta até **300 usuários ativos** sem custo algum.

**Escalabilidade**: Migração gradual e planejada conforme crescimento.

**Margem**: 98%+ em todos os estágios de crescimento.

---

**Versão**: 1.0  
**Status**: 🚀 Em Execução (Fase 1-2 concluídas)  
**Última Atualização**: Janeiro 2025

