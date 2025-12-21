/**
 * Multimodal Engine - OCR, Vision AI e Document Processing
 *
 * Este engine é responsável por:
 * - Extrair texto de imagens/PDFs (OCR)
 * - Análise visual de documentos (layout, tabelas)
 * - Extração estruturada de dados de editais
 * - Validação visual de documentos
 * - Detecção de assinaturas, carimbos, etc.
 *
 * @module azuria_ai/engines/multimodalEngine
 */

import { eventBus } from '../core/eventBus';
import { structuredLogger } from '../../services/structuredLogger';

// ============================================================================
// Constants
// ============================================================================

/** Formatos de imagem suportados */
const SUPPORTED_IMAGE_FORMATS = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

/** Formatos de documento suportados */
const SUPPORTED_DOC_FORMATS = new Set(['application/pdf']);

/** Tamanho máximo de arquivo (10MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Confiança mínima para extração */
const MIN_CONFIDENCE = 0.7;

// ============================================================================
// Types
// ============================================================================

/** Parsed field from API response */
interface ParsedField {
  name: string;
  value: string;
  confidence?: number;
}

/** Tipo de documento */
export type DocumentType =
  | 'edital' // Edital de licitação
  | 'invoice' // Nota fiscal
  | 'contract' // Contrato
  | 'proposal' // Proposta comercial
  | 'receipt' // Recibo
  | 'table' // Tabela de preços
  | 'form' // Formulário
  | 'other'; // Outros

/** Campo extraído do documento */
export interface ExtractedField {
  /** Nome do campo */
  name: string;
  /** Valor extraído */
  value: string | number | Date;
  /** Confiança da extração (0-1) */
  confidence: number;
  /** Bounding box no documento (se disponível) */
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Página onde foi encontrado */
  page?: number;
}

/** Tabela extraída */
export interface ExtractedTable {
  /** Headers da tabela */
  headers: string[];
  /** Linhas da tabela */
  rows: Array<Record<string, string | number>>;
  /** Confiança da extração */
  confidence: number;
  /** Página onde foi encontrada */
  page?: number;
}

/** Resultado de OCR */
export interface OCRResult {
  /** Texto completo extraído */
  fullText: string;
  /** Campos estruturados extraídos */
  fields: ExtractedField[];
  /** Tabelas extraídas */
  tables: ExtractedTable[];
  /** Tipo de documento detectado */
  documentType: DocumentType;
  /** Confiança geral (0-1) */
  confidence: number;
  /** Idioma detectado */
  language: string;
  /** Número de páginas */
  pages: number;
  /** Metadados adicionais */
  metadata: {
    hasSignature?: boolean;
    hasStamp?: boolean;
    isScanned?: boolean;
    quality?: 'low' | 'medium' | 'high';
  };
}

/** Análise visual de documento */
export interface VisualAnalysis {
  /** Tipo de documento */
  documentType: DocumentType;
  /** Layout detectado */
  layout: {
    hasHeader: boolean;
    hasFooter: boolean;
    columns: number;
    sections: number;
  };
  /** Elementos visuais */
  elements: {
    logos: number;
    signatures: number;
    stamps: number;
    barcodes: number;
    qrCodes: number;
  };
  /** Qualidade da imagem */
  quality: {
    resolution: number;
    brightness: number;
    contrast: number;
    sharpness: number;
  };
  /** Problemas detectados */
  issues: Array<{
    type: 'blur' | 'low_contrast' | 'skew' | 'noise' | 'incomplete';
    severity: 'low' | 'medium' | 'high';
    message: string;
  }>;
}

/** Extração específica de edital */
export interface EditalExtraction {
  /** Número do edital */
  numero?: string;
  /** Órgão licitante */
  orgao?: string;
  /** Modalidade (pregão, concorrência, etc.) */
  modalidade?: string;
  /** Objeto da licitação */
  objeto?: string;
  /** Data de abertura */
  dataAbertura?: Date;
  /** Valor estimado */
  valorEstimado?: number;
  /** Itens/serviços */
  itens?: Array<{
    numero: string;
    descricao: string;
    quantidade?: number;
    unidade?: string;
    valorUnitario?: number;
    valorTotal?: number;
  }>;
  /** Requisitos técnicos */
  requisitos?: string[];
  /** Documentos exigidos */
  documentosExigidos?: string[];
  /** Prazo de execução */
  prazoExecucao?: string;
  /** Local de entrega */
  localEntrega?: string;
  /** Informações de pagamento */
  pagamento?: string;
  /** Confiança da extração */
  confidence: number;
}

/** Configuração do engine */
export interface MultimodalConfig {
  /** Se está habilitado */
  enabled: boolean;
  /** Provider de OCR */
  ocrProvider: 'gemini-vision' | 'google-vision' | 'tesseract';
  /** Idioma padrão */
  defaultLanguage: string;
  /** Se deve fazer pré-processamento */
  preprocessImages: boolean;
  /** Se deve fazer validação */
  validateExtraction: boolean;
  /** Timeout para processamento (ms) */
  timeout: number;
}

/** Estado do engine */
interface MultimodalEngineState {
  initialized: boolean;
  config: MultimodalConfig;
  documentsProcessed: number;
  lastProcessedAt: number;
}

// ============================================================================
// State
// ============================================================================

const state: MultimodalEngineState = {
  initialized: false,
  config: {
    enabled: true,
    ocrProvider: 'gemini-vision',
    defaultLanguage: 'pt-BR',
    preprocessImages: true,
    validateExtraction: true,
    timeout: 30000, // 30s
  },
  documentsProcessed: 0,
  lastProcessedAt: 0,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Valida formato de arquivo
 */
function validateFileFormat(mimeType: string): boolean {
  return (
    SUPPORTED_IMAGE_FORMATS.has(mimeType) || SUPPORTED_DOC_FORMATS.has(mimeType)
  );
}

/**
 * Valida tamanho de arquivo
 */
function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * Converte imagem para base64
 */
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Pré-processamento de imagem
 */
async function preprocessImage(imageData: string): Promise<string> {
  // NOTE: Implement real image preprocessing when ready
  // Features to implement:
  // - Brightness/contrast adjustment
  // - Noise removal
  // - Perspective correction
  // - Binarization

  // Currently returns image without modification
  return imageData;
}

/**
 * Detecta tipo de documento pela estrutura
 */
function detectDocumentType(
  text: string,
  fields: ExtractedField[]
): DocumentType {
  const lowerText = text.toLowerCase();

  // Palavras-chave para cada tipo
  if (
    lowerText.includes('edital') &&
    (lowerText.includes('licitação') || lowerText.includes('pregão'))
  ) {
    return 'edital';
  }

  if (lowerText.includes('nota fiscal') || lowerText.includes('nf-e')) {
    return 'invoice';
  }

  if (lowerText.includes('contrato') && lowerText.includes('partes')) {
    return 'contract';
  }

  if (lowerText.includes('proposta') && lowerText.includes('comercial')) {
    return 'proposal';
  }

  // Verifica campos estruturados
  const fieldNames = fields.map(f => f.name.toLowerCase());
  if (fieldNames.some(name => name.includes('cnpj') || name.includes('ie'))) {
    return 'invoice';
  }

  return 'other';
}

/**
 * Valida campos extraídos
 */
function validateExtractedFields(fields: ExtractedField[]): boolean {
  // Verifica se há campos com confiança mínima
  const validFields = fields.filter(f => f.confidence >= MIN_CONFIDENCE);
  return validFields.length >= Math.ceil(fields.length * 0.6); // 60% devem ser válidos
}

/**
 * Normaliza valores extraídos
 */
function normalizeValue(
  value: string,
  type: 'text' | 'number' | 'date' | 'currency'
): string | number | Date {
  if (type === 'number') {
    // Remove pontos de milhar, substitui vírgula por ponto
    const cleaned = value.replaceAll('.', '').replace(',', '.');
    return Number.parseFloat(cleaned) || 0;
  }

  if (type === 'currency') {
    // Remove R$, espaços, pontos de milhar
    const cleaned = value
      .replaceAll(/R\$\s?/g, '')
      .replaceAll('.', '')
      .replace(',', '.');
    return Number.parseFloat(cleaned) || 0;
  }

  if (type === 'date') {
    // Tenta parsear data no formato brasileiro
    const match = /(\d{2})\/(\d{2})\/(\d{4})/.exec(value);
    if (match) {
      const [, day, month, year] = match;
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(value);
  }

  return value.trim();
}

// ============================================================================
// Core OCR Functions
// ============================================================================

/**
 * OCR usando Gemini Vision
 */
async function performGeminiVisionOCR(
  imageData: string,
  apiKey?: string
): Promise<OCRResult> {
  try {
    // SEGURANÇA: API key deve vir explicitamente, não de variáveis de ambiente do frontend
    if (!apiKey) {
      throw new Error(
        'Gemini API key must be provided via backend/Edge Function'
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extraia TODO o texto deste documento de forma estruturada. 
                
INSTRUÇÕES:
1. Extraia o texto completo preservando a estrutura
2. Identifique campos importantes (números, datas, valores, nomes)
3. Identifique tabelas e mantenha seu formato
4. Indique o tipo de documento (edital, nota fiscal, contrato, etc.)
5. Para cada campo, indique a confiança da extração

Responda em JSON com esta estrutura:
{
  "fullText": "texto completo aqui",
  "documentType": "tipo do documento",
  "fields": [
    {"name": "campo", "value": "valor", "confidence": 0.95}
  ],
  "tables": [
    {
      "headers": ["col1", "col2"],
      "rows": [{"col1": "val1", "col2": "val2"}],
      "confidence": 0.9
    }
  ],
  "language": "pt-BR",
  "metadata": {
    "hasSignature": true/false,
    "hasStamp": true/false
  }
}`,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageData,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1, // Baixa para precisão
            topK: 1,
            topP: 1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    // Parse resposta do Gemini
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Tenta extrair JSON da resposta
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Normaliza valores
      const normalizedFields =
        parsed.fields?.map((f: ParsedField) => ({
          name: f.name,
          value: normalizeValue(f.value, 'text'),
          confidence: f.confidence || 0.8,
        })) || [];

      const result: OCRResult = {
        fullText: parsed.fullText || textContent,
        fields: normalizedFields,
        tables: parsed.tables || [],
        documentType: detectDocumentType(
          parsed.fullText || textContent,
          normalizedFields
        ),
        confidence:
          parsed.fields?.reduce(
            (sum: number, f: ParsedField) => sum + (f.confidence || 0.8),
            0
          ) / (parsed.fields?.length || 1),
        language: parsed.language || 'pt-BR',
        pages: 1,
        metadata: parsed.metadata || {},
      };

      return result;
    }

    // Fallback: resposta em texto simples
    return {
      fullText: textContent,
      fields: [],
      tables: [],
      documentType: 'other',
      confidence: 0.5,
      language: 'pt-BR',
      pages: 1,
      metadata: {},
    };
  } catch (error) {
    structuredLogger.error(
      '[MultimodalEngine] Gemini Vision OCR error',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Processa documento completo (imagem ou PDF)
 */
export async function processDocument(file: File): Promise<OCRResult> {
  try {
    // 1. Validações
    if (!validateFileFormat(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}`);
    }

    if (!validateFileSize(file.size)) {
      throw new Error(
        `File too large: ${file.size} bytes (max ${MAX_FILE_SIZE})`
      );
    }

    // 2. Converter para base64
    const imageData = await imageToBase64(file);

    // 3. Pré-processamento (se habilitado)
    const processedData = state.config.preprocessImages
      ? await preprocessImage(imageData)
      : imageData;

    // 4. OCR
    let result: OCRResult;

    switch (state.config.ocrProvider) {
      case 'gemini-vision':
        result = await performGeminiVisionOCR(processedData);
        break;

      // NOTE: Implement other OCR providers when ready
      case 'google-vision':
      case 'tesseract':
        throw new Error(
          `OCR provider ${state.config.ocrProvider} not implemented yet`
        );

      default:
        throw new Error(`Unknown OCR provider: ${state.config.ocrProvider}`);
    }

    // 5. Validação (se habilitada)
    if (
      state.config.validateExtraction &&
      !validateExtractedFields(result.fields)
    ) {
      structuredLogger.warn('[MultimodalEngine] Extraction validation failed', {
        data: {
          fileName: file.name,
          fieldsCount: result.fields.length,
          avgConfidence: result.confidence,
        },
      });
    }

    state.documentsProcessed++;
    state.lastProcessedAt = Date.now();

    eventBus.emit('data:updated', {
      source: 'multimodal-engine',
      operation: 'document-processed',
      data: {
        fileName: file.name,
        documentType: result.documentType,
        confidence: result.confidence,
        fieldsExtracted: result.fields.length,
        tablesExtracted: result.tables.length,
      },
      timestamp: Date.now(),
    });

    structuredLogger.info('[MultimodalEngine] Document processed', {
      data: {
        fileName: file.name,
        type: result.documentType,
        confidence: result.confidence,
        fields: result.fields.length,
        tables: result.tables.length,
      },
    });

    return result;
  } catch (error) {
    structuredLogger.error(
      '[MultimodalEngine] Error processing document',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: {
          fileName: file.name,
        },
      }
    );
    throw error;
  }
}

/**
 * Extração especializada de edital
 */
export async function extractEdital(file: File): Promise<EditalExtraction> {
  try {
    // 1. OCR completo
    const ocrResult = await processDocument(file);

    // 2. Extrair campos específicos de edital
    const text = ocrResult.fullText.toLowerCase();

    // Regex patterns para campos comuns
    const numeroMatch = /edital\s+n[º°]?\s*(\d+\/\d+)/i.exec(text);
    const orgaoMatch = /órgão[:\s]+([^\n]+)/i.exec(text);
    const modalidadeMatch =
      /(pregão|concorrência|tomada de preço|convite|leilão)/i.exec(text);
    const dataAberturaMatch = /abertura[:\s]+(\d{2}\/\d{2}\/\d{4})/i.exec(text);
    const valorMatch = /valor\s+estimado[:\s]+r\$\s*([\d.,]+)/i.exec(text);

    // Extrair objeto (geralmente após "objeto:" ou "1. objeto")
    const objetoMatch = /(?:objeto|1\.\s*objeto)[:\s]+([^\n.]+)/i.exec(text);

    // Construir resultado
    const extraction: EditalExtraction = {
      numero: numeroMatch?.[1],
      orgao: orgaoMatch?.[1]?.trim(),
      modalidade: modalidadeMatch?.[1]?.toLowerCase(),
      objeto: objetoMatch?.[1]?.trim(),
      dataAbertura: dataAberturaMatch
        ? new Date(dataAberturaMatch[1].split('/').reverse().join('-'))
        : undefined,
      valorEstimado: valorMatch
        ? Number.parseFloat(valorMatch[1].replaceAll('.', '').replace(',', '.'))
        : undefined,
      itens:
        ocrResult.tables.length > 0
          ? ocrResult.tables[0].rows.map((row, idx) => ({
              numero: String(idx + 1),
              descricao: String(
                row.descricao || row.item || row.especificacao || ''
              ),
              quantidade: Number(row.quantidade || row.qtd) || undefined,
              unidade: String(row.unidade || row.un) || undefined,
              valorUnitario:
                Number(row.valor_unitario || row.preco_unitario) || undefined,
              valorTotal: Number(row.valor_total || row.total) || undefined,
            }))
          : [],
      confidence: ocrResult.confidence,
    };

    structuredLogger.info('[MultimodalEngine] Edital extracted', {
      data: {
        numero: extraction.numero,
        orgao: extraction.orgao,
        itens: extraction.itens?.length,
        confidence: extraction.confidence,
      },
    });

    return extraction;
  } catch (error) {
    structuredLogger.error(
      '[MultimodalEngine] Error extracting edital',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: {
          fileName: file.name,
        },
      }
    );
    throw error;
  }
}

/**
 * Análise visual de documento
 * NOTA: Em produção, use via Edge Function
 */
export async function analyzeDocumentVisually(
  file: File,
  apiKey?: string
): Promise<VisualAnalysis> {
  // SEGURANÇA: API key deve vir explicitamente, não de variáveis de ambiente
  if (!apiKey) {
    structuredLogger.warn(
      '[MultimodalEngine] analyzeDocumentVisually requires API key via Edge Function'
    );
    // Retorna fallback quando não há API key
    return {
      documentType: 'other',
      layout: { hasHeader: false, hasFooter: false, columns: 1, sections: 1 },
      elements: { logos: 0, signatures: 0, stamps: 0, barcodes: 0, qrCodes: 0 },
      quality: { resolution: 150, brightness: 50, contrast: 50, sharpness: 50 },
      issues: [
        {
          type: 'incomplete',
          severity: 'high',
          message: 'API key not configured',
        },
      ],
    };
  }

  try {
    const imageData = await imageToBase64(file);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analise visualmente este documento e responda em JSON:

{
  "documentType": "tipo do documento",
  "layout": {
    "hasHeader": true/false,
    "hasFooter": true/false,
    "columns": número de colunas,
    "sections": número de seções
  },
  "elements": {
    "logos": quantidade,
    "signatures": quantidade,
    "stamps": quantidade,
    "barcodes": quantidade,
    "qrCodes": quantidade
  },
  "quality": {
    "resolution": número (dpi estimado),
    "brightness": 0-100,
    "contrast": 0-100,
    "sharpness": 0-100
  },
  "issues": [
    {"type": "blur|low_contrast|skew|noise|incomplete", "severity": "low|medium|high", "message": "descrição"}
  ]
}`,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageData,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const jsonMatch = /\{[\s\S]*\}/.exec(textContent);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return {
      documentType: 'other',
      layout: { hasHeader: false, hasFooter: false, columns: 1, sections: 1 },
      elements: { logos: 0, signatures: 0, stamps: 0, barcodes: 0, qrCodes: 0 },
      quality: { resolution: 150, brightness: 50, contrast: 50, sharpness: 50 },
      issues: [],
    };
  } catch (error) {
    structuredLogger.error(
      '[MultimodalEngine] Error in visual analysis',
      error instanceof Error ? error : new Error(String(error)),
      {
        data: {
          fileName: file.name,
        },
      }
    );
    throw error;
  }
}

/**
 * Extrai apenas tabelas de um documento
 */
export async function extractTables(file: File): Promise<ExtractedTable[]> {
  const ocrResult = await processDocument(file);
  return ocrResult.tables;
}

/**
 * Extrai texto simples (OCR básico)
 */
export async function extractText(file: File): Promise<string> {
  const ocrResult = await processDocument(file);
  return ocrResult.fullText;
}

// ============================================================================
// Engine Management
// ============================================================================

/**
 * Inicializa o Multimodal Engine
 */
export function initMultimodalEngine(config?: Partial<MultimodalConfig>): void {
  if (state.initialized) {
    structuredLogger.debug('[MultimodalEngine] Already initialized, skipping');
    return;
  }

  if (config) {
    state.config = { ...state.config, ...config };
  }

  // NOTA: API key deve ser passada via Edge Function em produção
  structuredLogger.info(
    '[MultimodalEngine] Engine initialized - use Edge Functions for API calls'
  );

  state.initialized = true;

  eventBus.emit('system:init', {
    source: 'multimodal-engine',
    data: {
      config: state.config,
    },
    timestamp: Date.now(),
  });

  structuredLogger.info('[MultimodalEngine] Initialized', {
    data: {
      provider: state.config.ocrProvider,
    },
  });
}

/**
 * Estatísticas
 */
export function getMultimodalStats(): {
  documentsProcessed: number;
  lastProcessedAt: number;
  config: MultimodalConfig;
} {
  return {
    documentsProcessed: state.documentsProcessed,
    lastProcessedAt: state.lastProcessedAt,
    config: state.config,
  };
}

/**
 * Shutdown
 */
export function shutdownMultimodalEngine(): void {
  state.initialized = false;

  eventBus.emit('system:shutdown', {
    source: 'multimodal-engine',
    timestamp: Date.now(),
  });

  structuredLogger.info('[MultimodalEngine] Shut down');
}

// ============================================================================
// Export
// ============================================================================

export default {
  initMultimodalEngine,
  processDocument,
  extractEdital,
  analyzeDocumentVisually,
  extractTables,
  extractText,
  getMultimodalStats,
  shutdownMultimodalEngine,
};
