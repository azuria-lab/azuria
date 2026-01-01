/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SIMPLE VOICE - Humanização Simples de Mensagens
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Transforma mensagens técnicas em linguagem mais humana e natural,
 * adaptada ao papel do usuário (USER vs ADMIN).
 * 
 * FASE B: Personalidade Operacional
 */

import type { CognitiveRole, MessageSeverity, SkillLevel } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSTITUIÇÕES DE JARGÃO TÉCNICO
// ═══════════════════════════════════════════════════════════════════════════════

const TECHNICAL_TERMS: Record<string, string> = {
  'margem de lucro': 'margem',
  'custo operacional': 'custos',
  'break-even': 'ponto de equilíbrio',
  'markup': 'diferença entre custo e preço',
  'BDI': 'Bonificação e Despesas Indiretas',
  'ICMS': 'Imposto sobre Circulação de Mercadorias',
  'ST': 'Substituição Tributária',
  'MVA': 'Margem de Valor Agregado',
  'OPEX': 'custos operacionais',
  'lucro líquido': 'lucro',
  'preço de venda': 'preço',
  'custo do produto': 'custo',
};

const TECHNICAL_TERMS_BEGINNER: Record<string, string> = {
  ...TECHNICAL_TERMS,
  'BDI': 'Bonificação e Despesas Indiretas (BDI)',
  'ICMS': 'Imposto sobre Circulação de Mercadorias (ICMS)',
  'ST': 'Substituição Tributária (ST)',
  'MVA': 'Margem de Valor Agregado (MVA)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMOJI POR SEVERIDADE
// ═══════════════════════════════════════════════════════════════════════════════

const EMOJI_BY_SEVERITY: Record<MessageSeverity, string> = {
  critical: '🚨',
  high: '⚠️',
  medium: '💡',
  low: '📊',
  info: 'ℹ️',
};

const EMOJI_BY_KEYWORD: Record<string, string> = {
  'crític': '🚨',
  'risco': '⚠️',
  'atenção': '⚠️',
  'alerta': '⚠️',
  'ótimo': '✅',
  'excelente': '✅',
  'parabéns': '🎉',
  'sucesso': '✅',
  'saudável': '✅',
  'dica': '💡',
  'sugestão': '💡',
  'oportunidade': '💎',
  'erro': '❌',
  'problema': '❌',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE HUMANIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Remove jargão técnico e substitui por termos mais simples
 */
function replaceTechnicalTerms(text: string, skillLevel: SkillLevel): string {
  const terms = skillLevel === 'beginner' ? TECHNICAL_TERMS_BEGINNER : TECHNICAL_TERMS;
  
  let result = text;
  
  for (const [term, replacement] of Object.entries(terms)) {
    // Case-insensitive replacement
    const regex = new RegExp(term, 'gi');
    result = result.replace(regex, replacement);
  }
  
  return result;
}

/**
 * Adiciona emoji baseado em severidade ou palavras-chave
 */
function addEmoji(text: string, severity: MessageSeverity, forUser: boolean): string {
  if (!forUser) {
    // ADMIN não quer emoji
    return text;
  }
  
  // Verificar se já tem emoji
  if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) {
    return text;
  }
  
  // Tentar encontrar emoji por palavra-chave primeiro
  for (const [keyword, emoji] of Object.entries(EMOJI_BY_KEYWORD)) {
    if (text.toLowerCase().includes(keyword)) {
      return `${emoji} ${text}`;
    }
  }
  
  // Usar emoji por severidade
  const emoji = EMOJI_BY_SEVERITY[severity];
  return `${emoji} ${text}`;
}

/**
 * Simplifica frases longas para USER
 */
function simplifyForUser(text: string): string {
  // Remover frases muito técnicas
  let result = text
    .replace(/É importante destacar que/g, '')
    .replace(/Vale ressaltar que/g, '')
    .replace(/É necessário considerar que/g, '')
    .replace(/Deve-se observar que/g, '')
    .replace(/Recomenda-se que/g, 'Recomendamos')
    .replace(/Sugere-se que/g, 'Sugerimos')
    .replace(/É recomendado que/g, 'Recomendamos')
    .replace(/É sugerido que/g, 'Sugerimos');
  
  // Remover espaços duplos
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

/**
 * Adiciona tom de ação para USER
 */
function addActionTone(text: string, severity: MessageSeverity): string {
  // Para mensagens críticas ou altas, adicionar urgência
  if (severity === 'critical' || severity === 'high') {
    if (!text.includes('agora') && !text.includes('urgente')) {
      // Adicionar call-to-action no final se não tiver
      if (!text.includes('?') && !text.match(/\.$/)) {
        return `${text}. Ação recomendada agora.`;
      }
    }
  }
  
  return text;
}

/**
 * Remove emoji e simplifica para ADMIN
 */
function formatAdminMessage(text: string): string {
  // Remover emojis
  let result = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  
  // Remover espaços duplos
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Humaniza mensagem para USER
 */
export function humanizeForUser(
  message: string,
  skillLevel: SkillLevel,
  severity: MessageSeverity
): string {
  // 1. Substituir termos técnicos
  let human = replaceTechnicalTerms(message, skillLevel);
  
  // 2. Simplificar frases
  human = simplifyForUser(human);
  
  // 3. Adicionar emoji
  human = addEmoji(human, severity, true);
  
  // 4. Adicionar tom de ação (se necessário)
  if (severity === 'critical' || severity === 'high') {
    human = addActionTone(human, severity);
  }
  
  return human.trim();
}

/**
 * Formata mensagem para ADMIN (sem emoji, mais técnica)
 */
export function formatForAdmin(message: string): string {
  return formatAdminMessage(message);
}

/**
 * Humaniza título
 */
export function humanizeTitle(
  title: string,
  role: CognitiveRole,
  severity: MessageSeverity
): string {
  if (role === 'ADMIN') {
    return formatAdminMessage(title);
  }
  
  // Para USER, adicionar emoji se não tiver
  if (!/[\u{1F300}-\u{1F9FF}]/u.test(title)) {
    const emoji = EMOJI_BY_SEVERITY[severity];
    return `${emoji} ${title}`;
  }
  
  return title;
}

/**
 * Humaniza mensagem completa baseado em papel
 */
export function humanizeMessage(
  message: string,
  role: CognitiveRole,
  skillLevel: SkillLevel,
  severity: MessageSeverity
): string {
  if (role === 'ADMIN') {
    return formatAdminMessage(message);
  }
  
  return humanizeForUser(message, skillLevel, severity);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const SimpleVoice = {
  humanizeForUser,
  formatForAdmin,
  humanizeTitle,
  humanizeMessage,
};

export default SimpleVoice;

