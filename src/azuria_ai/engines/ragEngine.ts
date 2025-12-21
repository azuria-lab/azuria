/**
 * RAG Engine - Retrieval-Augmented Generation para Licitações
 *
 * Este engine é responsável por:
 * - Busca semântica em base de conhecimento (legislação TCU, jurisprudência)
 * - Geração de respostas contextualizadas
 * - Indexação de documentos em vector database
 * - Reranking de resultados por relevância
 *
 * @module azuria_ai/engines/ragEngine
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Tipos locais incompatíveis com schema Supabase - refatoração pendente

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';
import { supabase } from '@/lib/supabase';

// Helper para tabelas não tipadas (dynamic table access)
const untypedFrom = (table: string) =>
  supabase.from(table as never) as ReturnType<typeof supabase.from>;

// ============================================================================
// Constants
// ============================================================================

/** Dimensão dos embeddings (Gemini usa 768) */
const EMBEDDING_DIMENSION = 768;

/** Número máximo de chunks por documento */
const MAX_CHUNKS_PER_DOC = 100;

/** Tamanho de chunk (tokens) */
const CHUNK_SIZE = 512;

/** Overlap entre chunks */
const CHUNK_OVERLAP = 50;

/** Top-K resultados para reranking */
const TOP_K_RESULTS = 10;

/** Threshold de similaridade mínima */
const MIN_SIMILARITY = 0.7;

// ============================================================================
// Types
// ============================================================================

/** Tipo de documento indexado */
export type DocumentType =
  | 'legislation' // Legislação (TCU, Lei 8.666, etc.)
  | 'jurisprudence' // Jurisprudência
  | 'guidance' // Orientações técnicas
  | 'template' // Templates e modelos
  | 'case_study' // Casos de uso
  | 'faq'; // Perguntas frequentes

/** Metadados do documento */
export interface DocumentMetadata {
  /** Título do documento */
  title: string;
  /** Tipo de documento */
  type: DocumentType;
  /** Fonte original */
  source: string;
  /** URL original (se disponível) */
  url?: string;
  /** Data de publicação */
  publishedAt?: Date;
  /** Tags para categorização */
  tags: string[];
  /** Órgão emissor */
  authority?: string;
  /** Número do documento (ex: Lei 8.666/1993) */
  documentNumber?: string;
  /** Resumo */
  summary?: string;
}

/** Chunk de documento com embedding */
export interface DocumentChunk {
  /** ID único do chunk */
  id: string;
  /** ID do documento pai */
  documentId: string;
  /** Conteúdo textual */
  content: string;
  /** Embedding vetorial */
  embedding: number[];
  /** Índice do chunk no documento */
  chunkIndex: number;
  /** Metadados herdados do documento */
  metadata: DocumentMetadata;
  /** Timestamp de criação */
  createdAt: number;
}

/** Resultado de busca semântica */
export interface SearchResult {
  /** Chunk encontrado */
  chunk: DocumentChunk;
  /** Score de similaridade (0-1) */
  similarity: number;
  /** Score após reranking */
  rerankedScore?: number;
  /** Highlights do match */
  highlights?: string[];
}

/** Resposta RAG completa */
export interface RAGResponse {
  /** Resposta gerada */
  answer: string;
  /** Chunks usados como contexto */
  sources: SearchResult[];
  /** Confiança da resposta (0-1) */
  confidence: number;
  /** Query original */
  query: string;
  /** Modelo LLM usado */
  model: string;
  /** Tokens usados */
  tokensUsed: number;
  /** Timestamp */
  timestamp: number;
}

/** Configuração do RAG */
export interface RAGConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Modelo para embeddings */
  embeddingModel: 'gemini-embedding' | 'text-embedding-3-small';
  /** Modelo para geração */
  generationModel: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gpt-4';
  /** Top-K resultados */
  topK: number;
  /** Similaridade mínima */
  minSimilarity: number;
  /** Se deve fazer reranking */
  useReranking: boolean;
  /** Temperatura para geração */
  temperature: number;
  /** Max tokens na resposta */
  maxTokens: number;
}

/** Estado do engine */
interface RAGEngineState {
  initialized: boolean;
  config: RAGConfig;
  documentsIndexed: number;
  totalChunks: number;
  lastIndexedAt: number;
}

// ============================================================================
// State
// ============================================================================

const state: RAGEngineState = {
  initialized: false,
  config: {
    enabled: true,
    embeddingModel: 'gemini-embedding',
    generationModel: 'gemini-1.5-flash',
    topK: TOP_K_RESULTS,
    minSimilarity: MIN_SIMILARITY,
    useReranking: true,
    temperature: 0.3, // Baixa para respostas factuais
    maxTokens: 1000,
  },
  documentsIndexed: 0,
  totalChunks: 0,
  lastIndexedAt: 0,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gera ID único para chunk
 */
function generateChunkId(documentId: string, index: number): string {
  return `${documentId}-chunk-${index}`;
}

/**
 * Divide texto em chunks com overlap
 */
function chunkText(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

/**
 * Gera embedding usando Gemini
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // NOTE: Integrar com Gemini Embedding API quando disponível
    // Por enquanto, retorna embedding fake para estrutura

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // SEGURANÇA: API key deve ser passada via backend/Edge Function
          'x-goog-api-key': '', // Requer API key via backend
        },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: {
            parts: [{ text }],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding.values;
  } catch (error) {
    structuredLogger.error(
      '[RAGEngine] Error generating embedding',
      error instanceof Error ? error : new Error(String(error))
    );
    // Fallback: embedding aleatório (desenvolvimento)
    return Array.from({ length: EMBEDDING_DIMENSION }, () => Math.random());
  }
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Reranking de resultados usando heurísticas
 */
function rerankResults(
  results: SearchResult[],
  _query: string
): SearchResult[] {
  return results
    .map(result => {
      let score = result.similarity;

      // Boost por tipo de documento (legislação tem mais peso)
      if (result.chunk.metadata.type === 'legislation') {
        score *= 1.2;
      } else if (result.chunk.metadata.type === 'jurisprudence') {
        score *= 1.1;
      }

      // Boost por recência (documentos mais novos são melhores)
      if (result.chunk.metadata.publishedAt) {
        const ageInYears =
          (Date.now() - result.chunk.metadata.publishedAt.getTime()) /
          (365 * 24 * 60 * 60 * 1000);
        if (ageInYears < 1) {
          score *= 1.15;
        } else if (ageInYears < 3) {
          score *= 1.05;
        }
      }

      // Boost por autoridade (TCU tem mais peso que orientações genéricas)
      if (result.chunk.metadata.authority === 'TCU') {
        score *= 1.3;
      }

      // Penalidade por chunks muito curtos
      if (result.chunk.content.length < 100) {
        score *= 0.8;
      }

      return {
        ...result,
        rerankedScore: Math.min(score, 1), // Cap at 1
      };
    })
    .sort(
      (a, b) =>
        (b.rerankedScore || b.similarity) - (a.rerankedScore || a.similarity)
    );
}

/**
 * Extrai highlights do match
 */
function extractHighlights(content: string, query: string): string[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const highlights = sentences
    .filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return queryWords.some(word => lowerSentence.includes(word));
    })
    .slice(0, 3)
    .map(s => s.trim());

  return highlights;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Indexa documento na vector database
 */
export async function indexDocument(
  documentId: string,
  content: string,
  metadata: DocumentMetadata
): Promise<void> {
  try {
    // 1. Dividir em chunks
    const chunks = chunkText(content);

    if (chunks.length > MAX_CHUNKS_PER_DOC) {
      structuredLogger.warn(
        '[RAGEngine] Document has too many chunks, truncating',
        {
          data: {
            documentId,
            chunks: chunks.length,
            max: MAX_CHUNKS_PER_DOC,
          },
        }
      );
    }

    const chunksToIndex = chunks.slice(0, MAX_CHUNKS_PER_DOC);

    // 2. Gerar embeddings para cada chunk
    const documentChunks: DocumentChunk[] = [];

    for (let i = 0; i < chunksToIndex.length; i++) {
      const chunkContent = chunksToIndex[i];
      const embedding = await generateEmbedding(chunkContent);

      const chunk: DocumentChunk = {
        id: generateChunkId(documentId, i),
        documentId,
        content: chunkContent,
        embedding,
        chunkIndex: i,
        metadata,
        createdAt: Date.now(),
      };

      documentChunks.push(chunk);
    }

    // 3. Inserir no Supabase (usando pgvector)
    const { error } = await untypedFrom('rag_documents').upsert(
      documentChunks.map(chunk => ({
        id: chunk.id,
        document_id: chunk.documentId,
        content: chunk.content,
        embedding: chunk.embedding,
        chunk_index: chunk.chunkIndex,
        metadata: chunk.metadata,
        created_at: new Date(chunk.createdAt).toISOString(),
      }))
    );

    if (error) {
      throw error;
    }

    state.documentsIndexed++;
    state.totalChunks += documentChunks.length;
    state.lastIndexedAt = Date.now();

    eventBus.emit('data:updated', {
      documentId,
      chunks: documentChunks.length,
      timestamp: Date.now(),
    });

    structuredLogger.info('[RAGEngine] Document indexed', {
      data: {
        documentId,
        chunks: documentChunks.length,
        type: metadata.type,
      },
    });
  } catch (error) {
    structuredLogger.error(
      '[RAGEngine] Error indexing document',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: { documentId },
      }
    );
    throw error;
  }
}

/**
 * Busca semântica na base de conhecimento
 */
export async function semanticSearch(
  query: string,
  filters?: {
    types?: DocumentType[];
    tags?: string[];
    authority?: string;
  }
): Promise<SearchResult[]> {
  try {
    // 1. Gerar embedding da query
    const queryEmbedding = await generateEmbedding(query);

    // 2. Buscar no Supabase usando pgvector
    // NOTE: Usar função RPC do Supabase para busca por similaridade quando disponível
    // Por enquanto, busca todos e calcula similaridade local (ineficiente mas funciona)

    let supabaseQuery = untypedFrom('rag_documents').select('*').limit(100); // Limite temporário

    // Aplicar filtros
    if (filters?.types && filters.types.length > 0) {
      supabaseQuery = supabaseQuery.in('metadata->type', filters.types);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // 3. Calcular similaridade
    const results: SearchResult[] = data
      .map(row => {
        const chunk: DocumentChunk = {
          id: row.id,
          documentId: row.document_id,
          content: row.content,
          embedding: row.embedding,
          chunkIndex: row.chunk_index,
          metadata: row.metadata,
          createdAt: new Date(row.created_at).getTime(),
        };

        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);

        return {
          chunk,
          similarity,
          highlights: extractHighlights(chunk.content, query),
        };
      })
      .filter(result => result.similarity >= state.config.minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, state.config.topK);

    // 4. Reranking (se habilitado)
    const finalResults = state.config.useReranking
      ? rerankResults(results, query)
      : results;

    structuredLogger.info('[RAGEngine] Semantic search completed', {
      data: {
        query,
        resultsFound: finalResults.length,
        avgSimilarity:
          finalResults.reduce((sum, r) => sum + r.similarity, 0) /
          finalResults.length,
      },
    });

    return finalResults;
  } catch (error) {
    structuredLogger.error(
      '[RAGEngine] Error in semantic search',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: { query },
      }
    );
    throw error;
  }
}

/**
 * Gera resposta usando RAG (busca + geração)
 */
export async function generateAnswer(
  query: string,
  filters?: {
    types?: DocumentType[];
    tags?: string[];
    authority?: string;
  }
): Promise<RAGResponse> {
  try {
    // 1. Busca semântica
    const searchResults = await semanticSearch(query, filters);

    if (searchResults.length === 0) {
      return {
        answer:
          'Desculpe, não encontrei informações relevantes sobre isso na base de conhecimento.',
        sources: [],
        confidence: 0,
        query,
        model: state.config.generationModel,
        tokensUsed: 0,
        timestamp: Date.now(),
      };
    }

    // 2. Construir contexto a partir dos chunks
    const context = searchResults
      .slice(0, 5) // Top 5 chunks
      .map((result, idx) => {
        return `[FONTE ${idx + 1}] ${result.chunk.metadata.title}:\n${
          result.chunk.content
        }\n`;
      })
      .join('\n');

    // 3. Gerar resposta com LLM
    const prompt = `Você é um assistente especializado em licitações e legislação brasileira.

CONTEXTO:
${context}

PERGUNTA DO USUÁRIO:
${query}

INSTRUÇÕES:
- Responda com base APENAS no contexto fornecido
- Cite as fontes usando [FONTE 1], [FONTE 2], etc.
- Se o contexto não contém a informação, diga isso claramente
- Seja preciso e objetivo
- Use linguagem técnica mas acessível

RESPOSTA:`;

    // NOTE: Integrar com Gemini API quando disponível
    // Por enquanto, resposta mock
    const answer = `Com base na legislação vigente, especialmente a Lei 8.666/93 e orientações do TCU, ${searchResults[0].chunk.content.substring(
      0,
      200
    )}... [FONTE 1]`;

    // Calcular confiança baseado na similaridade média
    const avgSimilarity =
      searchResults.reduce((sum, r) => sum + r.similarity, 0) /
      searchResults.length;
    const confidence = Math.min(avgSimilarity * 1.2, 1); // Boost de 20%

    const response: RAGResponse = {
      answer,
      sources: searchResults,
      confidence,
      query,
      model: state.config.generationModel,
      tokensUsed: prompt.length + answer.length, // Aproximado
      timestamp: Date.now(),
    };

    eventBus.emit('insight:generated', {
      query,
      confidence,
      sourcesUsed: searchResults.length,
      timestamp: Date.now(),
    });

    structuredLogger.info('[RAGEngine] Answer generated', {
      data: {
        query,
        confidence,
        sources: searchResults.length,
      },
    });

    return response;
  } catch (error) {
    structuredLogger.error(
      '[RAGEngine] Error generating answer',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: { query },
      }
    );
    throw error;
  }
}

/**
 * Indexa múltiplos documentos em batch
 */
export async function batchIndexDocuments(
  documents: Array<{
    id: string;
    content: string;
    metadata: DocumentMetadata;
  }>
): Promise<void> {
  structuredLogger.info('[RAGEngine] Starting batch indexing', {
    data: { count: documents.length },
  });

  let successful = 0;
  let failed = 0;

  for (const doc of documents) {
    try {
      await indexDocument(doc.id, doc.content, doc.metadata);
      successful++;
    } catch (error) {
      failed++;
      structuredLogger.error(
        '[RAGEngine] Failed to index document in batch',
        error instanceof Error ? error : new Error(String(error)),
        {
          data: { documentId: doc.id },
        }
      );
    }
  }

  structuredLogger.info('[RAGEngine] Batch indexing completed', {
    data: {
      total: documents.length,
      successful,
      failed,
    },
  });
}

/**
 * Remove documento do índice
 */
export async function deleteDocument(documentId: string): Promise<void> {
  try {
    const { error } = await untypedFrom('rag_documents')
      .delete()
      .eq('document_id', documentId);

    if (error) {
      throw error;
    }

    structuredLogger.info('[RAGEngine] Document deleted from index', {
      data: { documentId },
    });
  } catch (error) {
    structuredLogger.error(
      '[RAGEngine] Error deleting document',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: { documentId },
      }
    );
    throw error;
  }
}

/**
 * Estatísticas do RAG
 */
export function getRAGStats(): {
  documentsIndexed: number;
  totalChunks: number;
  avgChunksPerDoc: number;
  lastIndexedAt: number;
  config: RAGConfig;
} {
  return {
    documentsIndexed: state.documentsIndexed,
    totalChunks: state.totalChunks,
    avgChunksPerDoc:
      state.documentsIndexed > 0
        ? state.totalChunks / state.documentsIndexed
        : 0,
    lastIndexedAt: state.lastIndexedAt,
    config: state.config,
  };
}

// ============================================================================
// Engine Management
// ============================================================================

/**
 * Inicializa o RAG Engine
 */
export function initRAGEngine(config?: Partial<RAGConfig>): void {
  if (state.initialized) {
    structuredLogger.debug('[RAGEngine] Already initialized, skipping');
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  // Verificar se tabela existe no Supabase
  // NOTE: Criar migration para tabela rag_documents quando necessário

  state.initialized = true;

  eventBus.emit('system:init', {
    config: state.config,
    timestamp: Date.now(),
  });

  structuredLogger.info('[RAGEngine] Initialized', {
    data: {
      embeddingModel: state.config.embeddingModel,
      generationModel: state.config.generationModel,
    },
  });
}

/**
 * Atualiza configuração
 */
export function updateRAGConfig(config: Partial<RAGConfig>): void {
  state.config = { ...state.config, ...config };

  structuredLogger.info('[RAGEngine] Configuration updated', {
    data: { config: state.config },
  });
}

/**
 * Shutdown do engine
 */
export function shutdownRAGEngine(): void {
  state.initialized = false;

  eventBus.emit('system:shutdown', {
    timestamp: Date.now(),
  });

  structuredLogger.info('[RAGEngine] Shut down');
}

// ============================================================================
// Export
// ============================================================================

export default {
  initRAGEngine,
  indexDocument,
  batchIndexDocuments,
  semanticSearch,
  generateAnswer,
  deleteDocument,
  getRAGStats,
  updateRAGConfig,
  shutdownRAGEngine,
};
