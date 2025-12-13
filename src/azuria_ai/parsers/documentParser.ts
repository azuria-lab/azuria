/**
 * Document Parser - Parser Especializado de Editais
 *
 * Este parser é responsável por:
 * - Extrair dados estruturados de editais em PDF/DOCX
 * - Identificar seções-chave (objeto, itens, prazos, requisitos)
 * - Normalizar dados extraídos
 * - Validar completude da extração
 * - Enriquecer dados com metadados
 *
 * @module azuria_ai/parsers/documentParser
 */

import { structuredLogger } from '../../services/structuredLogger';
import { EditalExtraction } from '../engines/multimodalEngine';

// ============================================================================
// Types
// ============================================================================

/** Seção de documento identificada */
export interface DocumentSection {
  /** Tipo de seção */
  type: 'header' | 'object' | 'items' | 'requirements' | 'schedule' | 'terms' | 'attachments';
  /** Título da seção */
  title: string;
  /** Conteúdo da seção */
  content: string;
  /** Confiança da identificação */
  confidence: number;
  /** Posição no documento */
  position: {
    start: number;
    end: number;
    page?: number;
  };
}

/** Item de licitação normalizado */
export interface NormalizedItem {
  /** Número do item */
  numero: string;
  /** Descrição */
  descricao: string;
  /** Especificações técnicas */
  especificacoes?: string[];
  /** Quantidade */
  quantidade?: number;
  /** Unidade de medida */
  unidade?: string;
  /** Valor unitário estimado */
  valorUnitario?: number;
  /** Valor total estimado */
  valorTotal?: number;
  /** Categoria */
  categoria?: string;
  /** Marca de referência (se houver) */
  marcaReferencia?: string;
}

/** Requisito técnico extraído */
export interface TechnicalRequirement {
  /** Tipo de requisito */
  type: 'certification' | 'experience' | 'equipment' | 'technical' | 'legal' | 'financial';
  /** Descrição do requisito */
  description: string;
  /** Se é obrigatório */
  mandatory: boolean;
  /** Pontuação (se for critério de julgamento) */
  score?: number;
  /** Prazo para cumprimento */
  deadline?: string;
}

/** Cronograma/Prazo extraído */
export interface Schedule {
  /** Evento */
  event: string;
  /** Data/prazo */
  date?: Date;
  /** Prazo em dias (alternativo à data) */
  days?: number;
  /** Descrição adicional */
  description?: string;
}

/** Resultado do parsing completo */
export interface ParsedDocument {
  /** Dados gerais do edital */
  general: EditalExtraction;
  /** Seções identificadas */
  sections: DocumentSection[];
  /** Itens normalizados */
  items: NormalizedItem[];
  /** Requisitos técnicos */
  requirements: TechnicalRequirement[];
  /** Cronograma */
  schedule: Schedule[];
  /** Documentos exigidos */
  documents: string[];
  /** Critérios de julgamento */
  judgmentCriteria?: {
    type: 'menor_preco' | 'melhor_tecnica' | 'tecnica_preco';
    details: string;
  };
  /** Garantias exigidas */
  guarantees?: {
    type: string;
    percentage: number;
    description: string;
  }[];
  /** Informações de pagamento */
  payment?: {
    method: string;
    terms: string;
    deadline: string;
  };
  /** Score de completude (0-1) */
  completenessScore: number;
  /** Campos faltantes */
  missingFields: string[];
}

// ============================================================================
// Section Identification
// ============================================================================

// Patterns para identificar seções de documentos
const SECTION_PATTERNS: Record<string, RegExp> = {
  object: /^\s*(?:1\.|objeto|do\s+objeto|1\.\s*objeto)/i,
  items: /^\s*(?:anexo|planilha|itens|especificações|tabela)/i,
  requirements: /^\s*(?:requisitos|qualificação|habilitação|documentos)/i,
  schedule: /^\s*(?:cronograma|prazo|calendario|datas)/i,
  terms: /^\s*(?:condições|termos|cláusulas|disposições)/i,
  attachments: /^\s*(?:anexo|apêndice|addendum)/i,
};

/**
 * Determina o tipo de seção baseado na linha
 */
function detectSectionType(line: string): DocumentSection['type'] | null {
  for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(line)) {
      return type as DocumentSection['type'];
    }
  }
  return null;
}

/**
 * Cria uma nova seção
 */
function createSection(
  type: DocumentSection['type'],
  title: string,
  startLine: number
): DocumentSection {
  return {
    type,
    title,
    content: '',
    confidence: 0.8,
    position: { start: startLine, end: startLine },
  };
}

/**
 * Finaliza uma seção e a adiciona à lista
 */
function finalizeSection(
  section: DocumentSection | null,
  content: string[],
  endLine: number,
  sections: DocumentSection[]
): void {
  if (section && content.length > 0) {
    section.content = content.join('\n');
    section.position.end = endLine;
    sections.push(section);
  }
}

/**
 * Identifica seções no texto do edital
 */
export function identifySections(fullText: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = fullText.split('\n');

  let currentSection: DocumentSection | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) { continue; }

    const newSectionType = detectSectionType(line);

    if (newSectionType) {
      finalizeSection(currentSection, currentContent, i - 1, sections);
      currentSection = createSection(newSectionType, line, i);
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Adicionar última seção
  finalizeSection(currentSection, currentContent, lines.length - 1, sections);

  structuredLogger.info('[DocumentParser] Sections identified', {
    data: {
      sections: sections.length,
      types: sections.map(s => s.type),
    },
  });

  return sections;
}

// ============================================================================
// Item Parsing
// ============================================================================

/**
 * Extrai valor string de uma propriedade do objeto, com fallbacks
 */
function getRowString(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (typeof val === 'string') { return val; }
    if (typeof val === 'number') { return String(val); }
  }
  return '';
}

/**
 * Extrai valor numérico de uma propriedade do objeto, com fallbacks
 */
function getRowNumber(row: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const val = row[key];
    if (typeof val === 'number') { return val; }
    if (typeof val === 'string') {
      const cleaned = val.replaceAll(/[^\d,]/g, '').replace(',', '.');
      const parsed = Number.parseFloat(cleaned);
      if (!Number.isNaN(parsed)) { return parsed; }
    }
  }
  return undefined;
}

/**
 * Mapeia uma linha da tabela para um item normalizado
 */
function mapRowToItem(row: Record<string, unknown>): NormalizedItem {
  return {
    numero: getRowString(row, 'item', 'numero', 'num'),
    descricao: getRowString(row, 'descricao', 'especificacao', 'produto'),
    quantidade: getRowNumber(row, 'quantidade', 'qtd', 'qtde'),
    unidade: getRowString(row, 'unidade', 'un', 'und'),
    valorUnitario: getRowNumber(row, 'valor_unitario', 'preco_unitario', 'vl_unit'),
    valorTotal: getRowNumber(row, 'valor_total', 'total', 'vl_total'),
  };
}

/**
 * Processa tabelas estruturadas e extrai itens
 */
function processTableRows(tables: Record<string, unknown>[]): NormalizedItem[] {
  const items: NormalizedItem[] = [];
  
  for (const table of tables) {
    const rows = table.rows as Record<string, unknown>[] | undefined;
    if (!rows || rows.length === 0) { continue; }

    for (const row of rows) {
      const item = mapRowToItem(row);
      if (item.descricao) {
        items.push(item);
      }
    }
  }
  
  return items;
}

// Pre-compiled regex for item parsing
const ITEM_LINE_PATTERN = /(\d+)\s*[-–]\s*(.+?)(?:\s*[-–]\s*(\d+))?$/i;

/**
 * Processa texto e extrai itens via parsing
 */
function processTextLines(itemsSection: string): NormalizedItem[] {
  const items: NormalizedItem[] = [];
  const lines = itemsSection.split('\n');
  
  for (const line of lines) {
    const match = ITEM_LINE_PATTERN.exec(line);
    if (!match) { continue; }
    
    const [, numero, descricao, quantidade, unidade, valor] = match;
    
    items.push({
      numero,
      descricao: descricao.trim(),
      quantidade: quantidade ? Number.parseFloat(quantidade.replace(',', '.')) : undefined,
      unidade: unidade?.toUpperCase(),
      valorUnitario: valor ? Number.parseFloat(valor.replaceAll(/[^\d,]/g, '').replace(',', '.')) : undefined,
    });
  }
  
  return items;
}

/**
 * Extrai e normaliza itens de licitação
 */
export function parseItems(itemsSection: string, tables?: Record<string, unknown>[]): NormalizedItem[] {
  const items = (tables && tables.length > 0)
    ? processTableRows(tables)
    : processTextLines(itemsSection);

  structuredLogger.info('[DocumentParser] Items parsed', {
    data: { items: items.length },
  });

  return items;
}

// ============================================================================
// Requirements Parsing
// ============================================================================

/**
 * Extrai requisitos técnicos
 */
export function parseRequirements(requirementsSection: string): TechnicalRequirement[] {
  const requirements: TechnicalRequirement[] = [];
  const lines = requirementsSection.split('\n');

  // Keywords para identificar tipo
  const typeKeywords = {
    certification: ['certificado', 'certificação', 'atestado', 'registro', 'alvará'],
    experience: ['experiência', 'comprovação', 'atestado de capacidade', 'execução anterior'],
    equipment: ['equipamento', 'máquina', 'ferramenta', 'veículo', 'material'],
    technical: ['técnica', 'projeto', 'memorial', 'especificação', 'norma'],
    legal: ['jurídica', 'contrato social', 'cnpj', 'regularidade fiscal'],
    financial: ['financeira', 'balanço', 'patrimônio', 'capital social'],
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.length < 10) {continue;} // Linhas muito curtas
    
    // Determinar tipo
    let type: TechnicalRequirement['type'] = 'technical';
    
    for (const [reqType, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(kw => trimmed.toLowerCase().includes(kw))) {
        type = reqType as TechnicalRequirement['type'];
        break;
      }
    }

    // Verificar se é obrigatório
    const mandatory = /obrigatório|exigido|necessário|imprescindível/i.test(trimmed);

    requirements.push({
      type,
      description: trimmed,
      mandatory,
    });
  }

  structuredLogger.info('[DocumentParser] Requirements parsed', {
    data: {
      requirements: requirements.length,
      mandatory: requirements.filter(r => r.mandatory).length,
    },
  });

  return requirements;
}

// ============================================================================
// Schedule Parsing
// ============================================================================

// Pre-compiled regex patterns for schedule parsing
const DATE_PATTERN = /([^:]+):\s*(\d{2}\/\d{2}\/\d{4})/;
const DAYS_PATTERN = /([^:]+):\s*(\d+)\s*dias?/i;

/**
 * Extrai cronograma e prazos
 */
export function parseSchedule(scheduleSection: string): Schedule[] {
  const schedule: Schedule[] = [];
  const lines = scheduleSection.split('\n');

  for (const line of lines) {
    // Pattern: "Evento: dd/mm/aaaa" ou "Evento: X dias"
    const dateMatch = DATE_PATTERN.exec(line);
    const daysMatch = DAYS_PATTERN.exec(line);

    if (dateMatch) {
      const [, event, dateStr] = dateMatch;
      const [day, month, year] = dateStr.split('/').map(Number);
      
      schedule.push({
        event: event.trim(),
        date: new Date(year, month - 1, day),
      });
    } else if (daysMatch) {
      const [, event, days] = daysMatch;
      
      schedule.push({
        event: event.trim(),
        days: Number(days),
      });
    }
  }

  structuredLogger.info('[DocumentParser] Schedule parsed', {
    data: { events: schedule.length },
  });

  return schedule;
}

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Parse completo de edital
 */
export async function parseEdital(
  fullText: string,
  extractedTables?: Record<string, unknown>[],
  ocrExtraction?: EditalExtraction
): Promise<ParsedDocument> {
  
  structuredLogger.info('[DocumentParser] Starting full edital parse');

  // 1. Identificar seções
  const sections = identifySections(fullText);

  // 2. Extrair dados gerais (usar OCR se disponível)
  const general: EditalExtraction = ocrExtraction || {
    confidence: 0.5,
  };

  // 3. Parse itens
  const itemsSection = sections.find(s => s.type === 'items');
  const items = itemsSection ? parseItems(itemsSection.content, extractedTables) : [];

  // 4. Parse requisitos
  const requirementsSection = sections.find(s => s.type === 'requirements');
  const requirements = requirementsSection ? parseRequirements(requirementsSection.content) : [];

  // 5. Parse cronograma
  const scheduleSection = sections.find(s => s.type === 'schedule');
  const schedule = scheduleSection ? parseSchedule(scheduleSection.content) : [];

  // 6. Extrair documentos exigidos
  const documents: string[] = [];
  const docPattern = /(?:documento|certidão|atestado|comprovante)[^.!?]*[.!?]/gi;
  const docMatches = fullText.match(docPattern);
  if (docMatches) {
    documents.push(...docMatches.map(d => d.trim()));
  }

  // 7. Calcular completude
  const requiredFields = [
    'numero',
    'orgao',
    'objeto',
    'modalidade',
    'dataAbertura',
  ];
  
  const presentFields = requiredFields.filter(field => 
    general[field as keyof EditalExtraction] !== undefined
  );

  const missingFields = requiredFields.filter(field => 
    general[field as keyof EditalExtraction] === undefined
  );

  const completenessScore = 
    (presentFields.length / requiredFields.length) * 0.4 + // 40% dados gerais
    (items.length > 0 ? 0.3 : 0) + // 30% itens
    (requirements.length > 0 ? 0.15 : 0) + // 15% requisitos
    (schedule.length > 0 ? 0.15 : 0); // 15% cronograma

  const result: ParsedDocument = {
    general,
    sections,
    items,
    requirements,
    schedule,
    documents,
    completenessScore,
    missingFields,
  };

  structuredLogger.info('[DocumentParser] Parse completed', {
    data: {
      completeness: completenessScore,
      sections: sections.length,
      items: items.length,
      requirements: requirements.length,
    },
  });

  return result;
}

/**
 * Valida resultado do parsing
 */
export function validateParsing(parsed: ParsedDocument): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Erros críticos
  if (!parsed.general.numero) {
    errors.push('Número do edital não encontrado');
  }

  if (!parsed.general.orgao) {
    errors.push('Órgão licitante não encontrado');
  }

  if (!parsed.general.objeto) {
    errors.push('Objeto da licitação não encontrado');
  }

  if (parsed.items.length === 0) {
    errors.push('Nenhum item foi extraído');
  }

  // Avisos
  if (parsed.completenessScore < 0.7) {
    warnings.push(`Completude baixa (${(parsed.completenessScore * 100).toFixed(0)}%)`);
  }

  if (!parsed.general.valorEstimado) {
    warnings.push('Valor estimado não encontrado');
  }

  if (parsed.requirements.length === 0) {
    warnings.push('Nenhum requisito técnico identificado');
  }

  if (parsed.schedule.length === 0) {
    warnings.push('Cronograma não identificado');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  identifySections,
  parseItems,
  parseRequirements,
  parseSchedule,
  parseEdital,
  validateParsing,
};
