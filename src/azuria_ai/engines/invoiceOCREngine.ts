/**
 * =====================================================
 * AZURIA v2.0 - INVOICE OCR ENGINE
 * =====================================================
 * Engine de OCR/Vision para extração automática de dados de Notas Fiscais
 *
 * Funcionalidades:
 * - Fotografa/upload de nota fiscal
 * - Extração via Gemini Vision
 * - Reconhecimento de produtos, quantidades, valores
 * - Preenchimento automático da calculadora
 *
 * @module invoiceOCREngine
 * @created 13/12/2024
 * =====================================================
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/* eslint-disable no-console */

// =====================================================
// TYPES
// =====================================================

export interface InvoiceItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ncm?: string;
  cfop?: string;
  cst?: string;
  icms?: number;
  ipi?: number;
}

export interface InvoiceData {
  // Emitente
  supplierName: string;
  supplierCnpj: string;
  supplierAddress?: string;

  // Nota Fiscal
  invoiceNumber: string;
  invoiceSeries?: string;
  invoiceDate: string;
  invoiceKey?: string;

  // Valores
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  totalTaxes: number;
  totalAmount: number;

  // Impostos agregados
  totalIcms: number;
  totalIpi: number;
  totalPis: number;
  totalCofins: number;

  // Metadata
  confidence: number; // 0-100
  extractedAt: Date;
}

export interface OCRResult {
  success: boolean;
  data?: InvoiceData;
  error?: string;
  rawText?: string;
  confidence: number;
  processingTime: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// =====================================================
// CLASSE PRINCIPAL
// =====================================================

class InvoiceOCREngine {
  private genAI: GoogleGenerativeAI | null = null;
  private isInitialized = false;

  /**
   * Inicializa o engine - NOTA: Em produção, use Edge Functions
   * Este engine requer que a API key seja passada explicitamente
   */
  initInvoiceOCR(apiKey?: string): void {
    // SEGURANÇA: API key não pode vir de variáveis de ambiente do frontend
    if (!apiKey) {
      // Apenas logar em modo debug (esperado em desenvolvimento)
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('[InvoiceOCR] Engine não inicializado - API key deve ser passada via backend/Edge Function');
      }
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.isInitialized = true;
    console.log('[InvoiceOCR] ✅ Engine inicializado');
  }

  /**
   * Verifica se o engine está inicializado
   */
  private checkInitialized(): void {
    if (!this.isInitialized || !this.genAI) {
      throw new Error(
        'InvoiceOCR engine não inicializado. Chame initInvoiceOCR() primeiro.'
      );
    }
  }

  // =====================================================
  // PROCESSAMENTO DE IMAGEM
  // =====================================================

  /**
   * Processa imagem/PDF de nota fiscal e extrai dados
   */
  async processInvoice(file: File): Promise<OCRResult> {
    this.checkInitialized();
    const startTime = Date.now();

    try {
      console.log(`[InvoiceOCR] 📄 Processando nota fiscal: ${file.name}`);

      // Validar tipo de arquivo
      if (!this.isValidFileType(file)) {
        return {
          success: false,
          error: 'Tipo de arquivo inválido. Use PNG, JPG, JPEG ou PDF.',
          confidence: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: 'Arquivo muito grande. Máximo: 10MB.',
          confidence: 0,
          processingTime: Date.now() - startTime,
        };
      }

      // Converter arquivo para base64
      const base64Data = await this.fileToBase64(file);

      // Extrair dados usando Gemini Vision
      const invoiceData = await this.extractInvoiceData(base64Data, file.type);

      // Validar dados extraídos
      const validation = this.validateInvoiceData(invoiceData);

      if (!validation.isValid) {
        console.warn(
          '[InvoiceOCR] ⚠️ Dados extraídos contêm erros:',
          validation.errors
        );
      }

      const processingTime = Date.now() - startTime;
      console.log(
        `[InvoiceOCR] ✅ Nota fiscal processada em ${processingTime}ms`
      );

      return {
        success: true,
        data: invoiceData,
        confidence: invoiceData.confidence,
        processingTime,
      };
    } catch (error) {
      console.error('[InvoiceOCR] ❌ Erro ao processar nota fiscal:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro desconhecido ao processar nota fiscal',
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Extrai dados da nota fiscal usando Gemini Vision
   */
  private async extractInvoiceData(
    base64Data: string,
    mimeType: string
  ): Promise<InvoiceData> {
    this.checkInitialized();

    if (!this.genAI) {
      throw new Error('GenAI not initialized');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Você é um assistente especializado em extração de dados de Notas Fiscais brasileiras (NF-e).

Analise a imagem da nota fiscal e extraia TODOS os dados estruturados no formato JSON abaixo.
Seja PRECISO e extraia valores EXATOS conforme aparecem no documento.

Retorne APENAS o JSON (sem markdown, sem explicações), no formato:

{
  "supplierName": "Nome do Fornecedor/Emitente",
  "supplierCnpj": "00.000.000/0000-00",
  "supplierAddress": "Endereço completo",
  "invoiceNumber": "000123",
  "invoiceSeries": "1",
  "invoiceDate": "2024-12-13",
  "invoiceKey": "35241200000000000001550010000001231000001234",
  "items": [
    {
      "itemNumber": 1,
      "description": "Produto XYZ",
      "quantity": 10,
      "unitPrice": 50.00,
      "totalPrice": 500.00,
      "ncm": "12345678",
      "cfop": "5102",
      "cst": "00",
      "icms": 18.0,
      "ipi": 5.0
    }
  ],
  "subtotal": 500.00,
  "discount": 0.00,
  "shipping": 15.00,
  "totalTaxes": 115.00,
  "totalAmount": 515.00,
  "totalIcms": 90.00,
  "totalIpi": 25.00,
  "totalPis": 0.00,
  "totalCofins": 0.00,
  "confidence": 95
}

IMPORTANTE:
- Extraia TODOS os itens da nota fiscal
- Valores devem ser números (sem R$, sem vírgulas)
- Datas no formato YYYY-MM-DD
- CNPJ com pontuação
- Confidence: sua confiança na extração (0-100)
    `.trim();

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text().trim();

    // Extrair JSON da resposta
    const jsonMatch = /\{[\s\S]*\}/.exec(text);
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Converter para InvoiceData com tipos corretos
    return {
      supplierName: parsedData.supplierName || '',
      supplierCnpj: parsedData.supplierCnpj || '',
      supplierAddress: parsedData.supplierAddress,
      invoiceNumber: parsedData.invoiceNumber || '',
      invoiceSeries: parsedData.invoiceSeries,
      invoiceDate:
        parsedData.invoiceDate || new Date().toISOString().split('T')[0],
      invoiceKey: parsedData.invoiceKey,
      items: parsedData.items || [],
      subtotal: Number.parseFloat(parsedData.subtotal) || 0,
      discount: Number.parseFloat(parsedData.discount) || 0,
      shipping: Number.parseFloat(parsedData.shipping) || 0,
      totalTaxes: Number.parseFloat(parsedData.totalTaxes) || 0,
      totalAmount: Number.parseFloat(parsedData.totalAmount) || 0,
      totalIcms: Number.parseFloat(parsedData.totalIcms) || 0,
      totalIpi: Number.parseFloat(parsedData.totalIpi) || 0,
      totalPis: Number.parseFloat(parsedData.totalPis) || 0,
      totalCofins: Number.parseFloat(parsedData.totalCofins) || 0,
      confidence: Number.parseInt(parsedData.confidence, 10) || 50,
      extractedAt: new Date(),
    };
  }

  // =====================================================
  // VALIDAÇÃO
  // =====================================================

  /**
   * Valida dados extraídos da nota fiscal
   */
  private validateInvoiceData(data: InvoiceData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validações obrigatórias
    if (!data.supplierName) {
      errors.push('Nome do fornecedor não identificado');
    }

    if (!data.supplierCnpj || !this.isValidCnpj(data.supplierCnpj)) {
      errors.push('CNPJ do fornecedor inválido ou ausente');
    }

    if (!data.invoiceNumber) {
      errors.push('Número da nota fiscal não identificado');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Nenhum item identificado na nota fiscal');
    }

    // Validações de valores
    if (data.totalAmount <= 0) {
      errors.push('Valor total da nota inválido');
    }

    // Validações de consistência
    const calculatedSubtotal = data.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const diff = Math.abs(calculatedSubtotal - data.subtotal);

    if (diff > 0.1) {
      // Tolerância de R$ 0,10
      warnings.push(
        `Subtotal calculado (R$ ${calculatedSubtotal.toFixed(
          2
        )}) difere do extraído (R$ ${data.subtotal.toFixed(2)})`
      );
    }

    // Avisos de confiança
    if (data.confidence < 70) {
      warnings.push(
        'Confiança baixa na extração. Revise os dados manualmente.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida CNPJ (algoritmo simplificado)
   */
  private isValidCnpj(cnpj: string): boolean {
    // Remove caracteres não numéricos
    const cleaned = cnpj.replaceAll(/\D/g, '');

    // CNPJ deve ter 14 dígitos
    if (cleaned.length !== 14) {
      return false;
    }

    // Verifica se não é sequência repetida (ex: 00000000000000)
    if (/^(\d)\1{13}$/.test(cleaned)) {
      return false;
    }

    return true; // Validação completa seria mais complexa
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  /**
   * Verifica se o tipo de arquivo é válido
   */
  private isValidFileType(file: File): boolean {
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];
    return validTypes.includes(file.type);
  }

  /**
   * Converte arquivo para base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo "data:image/png;base64," ou similar
        const base64 = result.split(',')[1];
        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Formata dados para preenchimento da calculadora
   */
  formatForCalculator(invoiceData: InvoiceData): {
    supplier: string;
    invoiceNumber: string;
    invoiceDate: string;
    items: Array<{
      description: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
    }>;
    totalCost: number;
    taxes: {
      icms: number;
      ipi: number;
      pis: number;
      cofins: number;
    };
  } {
    return {
      supplier: invoiceData.supplierName,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      items: invoiceData.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitCost: item.unitPrice,
        totalCost: item.totalPrice,
      })),
      totalCost: invoiceData.totalAmount,
      taxes: {
        icms: invoiceData.totalIcms,
        ipi: invoiceData.totalIpi,
        pis: invoiceData.totalPis,
        cofins: invoiceData.totalCofins,
      },
    };
  }

  /**
   * Extrai apenas texto da imagem (OCR simples)
   */
  async extractText(file: File): Promise<string> {
    this.checkInitialized();

    try {
      const base64Data = await this.fileToBase64(file);

      if (!this.genAI) {
        throw new Error('GenAI not initialized');
      }

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const prompt =
        'Extraia todo o texto visível nesta imagem, preservando a formatação.';

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text();
    } catch (error) {
      console.error('[InvoiceOCR] Erro ao extrair texto:', error);
      throw error;
    }
  }

  /**
   * Processa múltiplas notas fiscais em lote
   */
  async processBatch(files: File[]): Promise<OCRResult[]> {
    console.log(
      `[InvoiceOCR] 📦 Processando ${files.length} notas fiscais em lote...`
    );

    const results: OCRResult[] = [];

    for (const file of files) {
      const result = await this.processInvoice(file);
      results.push(result);

      // Delay entre requisições para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(
      `[InvoiceOCR] ✅ ${successCount}/${files.length} notas fiscais processadas com sucesso`
    );

    return results;
  }

  /**
   * Calcula custos totais com impostos
   */
  calculateTotalCosts(invoiceData: InvoiceData): {
    productsCost: number;
    shippingCost: number;
    taxesCost: number;
    totalCost: number;
    avgUnitCost: number;
    itemsCount: number;
  } {
    const productsCost = invoiceData.subtotal - invoiceData.discount;
    const shippingCost = invoiceData.shipping;
    const taxesCost = invoiceData.totalTaxes;
    const totalCost = invoiceData.totalAmount;
    const itemsCount = invoiceData.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const avgUnitCost = itemsCount > 0 ? totalCost / itemsCount : 0;

    return {
      productsCost,
      shippingCost,
      taxesCost,
      totalCost,
      avgUnitCost,
      itemsCount,
    };
  }

  /**
   * Gera sugestão de markup baseado nos custos
   */
  suggestMarkup(
    invoiceData: InvoiceData,
    targetMargin: number = 30
  ): {
    costPerUnit: number;
    suggestedPrice: number;
    markup: number;
    margin: number;
  }[] {
    return invoiceData.items.map(item => {
      const costPerUnit = item.unitPrice;
      const markup = (100 + targetMargin) / (100 - targetMargin);
      const suggestedPrice = costPerUnit * (1 + targetMargin / 100);
      const margin = ((suggestedPrice - costPerUnit) / suggestedPrice) * 100;

      return {
        costPerUnit,
        suggestedPrice,
        markup,
        margin,
      };
    });
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

const invoiceOCREngine = new InvoiceOCREngine();
export default invoiceOCREngine;
