import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CalculationResult } from '@/types/simpleCalculator';

interface PdfData {
  calculation: {
    cost: string;
    margin: number;
    tax: string;
    cardFee: string;
    otherCosts: string;
    shipping: string;
    includeShipping: boolean;
  };
  result: CalculationResult;
  companyName?: string;
  productName?: string;
  date?: string;
}

export const generateCalculationPDF = (data: PdfData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(41, 84, 209); // Brand blue
  doc.text('PRECIFICA+', margin, yPosition);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Relatório de Precificação', margin, yPosition + 10);

  // Company/Product info
  yPosition += 30;
  doc.setFontSize(12);
  if (data.companyName) {
    doc.text(`Empresa: ${data.companyName}`, margin, yPosition);
    yPosition += 8;
  }
  if (data.productName) {
    doc.text(`Produto: ${data.productName}`, margin, yPosition);
    yPosition += 8;
  }
  
  doc.text(`Data: ${data.date || new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += 20;

  // Input Data Table
  doc.setFontSize(14);
  doc.setTextColor(41, 84, 209);
  doc.text('Dados de Entrada', margin, yPosition);
  yPosition += 10;

  const inputData = [
    ['Custo do Produto', `R$ ${data.calculation.cost || '0,00'}`],
    ['Margem de Lucro', `${data.calculation.margin}%`],
    ['Impostos/Taxas', data.calculation.tax ? `R$ ${data.calculation.tax}` : 'N/A'],
    ['Taxa do Cartão', data.calculation.cardFee ? `R$ ${data.calculation.cardFee}` : 'N/A'],
    ['Outros Custos', data.calculation.otherCosts ? `R$ ${data.calculation.otherCosts}` : 'N/A'],
    ['Frete', data.calculation.shipping ? `R$ ${data.calculation.shipping}` : 'N/A'],
    ['Incluir Frete no Cálculo', data.calculation.includeShipping ? 'Sim' : 'Não']
  ];

  (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
    startY: yPosition,
    head: [['Item', 'Valor']],
    body: inputData,
    theme: 'grid',
    headStyles: { fillColor: [41, 84, 209] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' }
    }
  });

  // Results section
  yPosition = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  
  doc.setFontSize(14);
  doc.setTextColor(41, 84, 209);
  doc.text('Resultados do Cálculo', margin, yPosition);
  yPosition += 10;

  // Highlight main results
  doc.setFillColor(240, 248, 255);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Preço de Venda: R$ ${data.result.sellingPrice.toFixed(2).replace('.', ',')}`, margin + 10, yPosition + 15);
  doc.text(`Lucro Líquido: R$ ${data.result.profit.toFixed(2).replace('.', ',')}`, margin + 10, yPosition + 30);

  yPosition += 50;

  // Detailed breakdown
  const resultsData = [
    ['Custo Total', `R$ ${data.result.breakdown.totalCost.toFixed(2).replace('.', ',')}`],
    ['Margem de Lucro', `R$ ${data.result.breakdown.marginAmount.toFixed(2).replace('.', ',')}`],
    ['Impostos/Taxas', `R$ ${data.result.breakdown.taxAmount.toFixed(2).replace('.', ',')}`],
    ['Taxa do Cartão', `R$ ${data.result.breakdown.cardFeeAmount.toFixed(2).replace('.', ',')}`],
    ['Outros Custos', `R$ ${data.result.breakdown.otherCostsValue.toFixed(2).replace('.', ',')}`],
    ['Frete', `R$ ${data.result.breakdown.shippingValue.toFixed(2).replace('.', ',')}`],
    ['Preço de Venda', `R$ ${data.result.sellingPrice.toFixed(2).replace('.', ',')}`],
    ['Lucro Líquido', `R$ ${data.result.profit.toFixed(2).replace('.', ',')}`],
    ['Margem Líquida', `${data.result.breakdown.realMarginPercent.toFixed(2)}%`]
  ];

  (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
    startY: yPosition,
    head: [['Descrição', 'Valor']],
    body: resultsData,
    theme: 'grid',
    headStyles: { fillColor: [41, 84, 209] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 60, halign: 'right' }
    }
  });

  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Gerado por Precifica+ - Sua ferramenta de precificação inteligente', margin, footerY);
  doc.text(`${new Date().toLocaleString('pt-BR')}`, margin, footerY + 10);

  // Add page border
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin - 5, 15, pageWidth - 2 * margin + 10, doc.internal.pageSize.height - 35, 'S');

  // Generate filename and save
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Precificacao_${data.productName || 'Produto'}_${timestamp}.pdf`;
  
  doc.save(filename);
};

export const generateBatchPDF = (calculations: Array<PdfData>): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(41, 84, 209);
  doc.text('PRECIFICA+', margin, yPosition);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Relatório de Precificação em Lote', margin, yPosition + 10);
  
  yPosition += 30;
  doc.setFontSize(12);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  doc.text(`Total de Produtos: ${calculations.length}`, margin, yPosition + 8);
  
  yPosition += 25;

  // Summary table
  const summaryData = calculations.map((calc, index) => [
    calc.productName || `Produto ${index + 1}`,
    `R$ ${calc.calculation.cost || '0,00'}`,
    `${calc.calculation.margin}%`,
    `R$ ${calc.result.sellingPrice.toFixed(2).replace('.', ',')}`,
    `R$ ${calc.result.profit.toFixed(2).replace('.', ',')}`
  ]);

  (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
    startY: yPosition,
    head: [['Produto', 'Custo', 'Margem', 'Preço Final', 'Lucro']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [41, 84, 209] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });

  // Calculate totals
  const totalCost = calculations.reduce((sum, calc) => sum + parseFloat(calc.calculation.cost || '0'), 0);
  const totalRevenue = calculations.reduce((sum, calc) => sum + calc.result.sellingPrice, 0);
  const totalProfit = calculations.reduce((sum, calc) => sum + calc.result.profit, 0);

  yPosition = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  // Totals section
  doc.setFillColor(240, 248, 255);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Custo Total: R$ ${totalCost.toFixed(2).replace('.', ',')}`, margin + 10, yPosition + 12);
  doc.text(`Receita Total: R$ ${totalRevenue.toFixed(2).replace('.', ',')}`, margin + 10, yPosition + 24);
  doc.text(`Lucro Total: R$ ${totalProfit.toFixed(2).replace('.', ',')}`, margin + 100, yPosition + 12);
  doc.text(`Margem Média: ${((totalProfit / totalRevenue) * 100).toFixed(2)}%`, margin + 100, yPosition + 24);

  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Gerado por Precifica+ - Sua ferramenta de precificação inteligente', margin, footerY);
  doc.text(`${new Date().toLocaleString('pt-BR')}`, margin, footerY + 10);

  // Generate filename and save
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Precificacao_Lote_${timestamp}.pdf`;
  
  doc.save(filename);
};