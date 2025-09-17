
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExportCalculationItem, ExportData } from "@/types/export";
import type { CalculationHistory } from "@/domains/calculator/types/calculator";
import { BRANDING, buildPdfFileName } from '@/config/branding';

export const generatePDFReport = async (data: ExportData, fileName: string): Promise<void> => {
  const doc = new jsPDF();
  let yPosition = 25;
  
  // Header with brand colors
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Brand blue
  doc.text(`${BRANDING.productName} - Relatório Avançado`, 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 20, yPosition);
  yPosition += 20;
  
  // Executive Summary
  if (data.summary) {
    yPosition = addExecutiveSummary(doc, data.summary, yPosition);
  }
  
  // Charts section
  if (data.charts) {
    yPosition = addChartsSection(doc, data.charts, yPosition);
  }
  
  // Detailed calculations table
  if (data.calculations.length > 0) {
    addCalculationsTable(doc, data.calculations, yPosition);
  }
  
  // Add footer with page numbers
  addFooter(doc);
  
  const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(buildPdfFileName(finalFileName));
};

const addExecutiveSummary = (
  doc: jsPDF,
  summary: NonNullable<ExportData["summary"]>,
  yPosition: number
): number => {
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text("📊 Resumo Executivo", 20, yPosition);
  yPosition += 10;
  
  const summaryData = [
    ["Período Analisado", summary.periodLabel],
    ["Total de Cálculos", summary.totalCalculations.toString()],
    ["Margem Média", `${summary.avgMargin.toFixed(1)}%`],
    ["Preço Médio de Venda", `R$ ${summary.avgSellingPrice.toFixed(2)}`],
    ["Receita Potencial Total", `R$ ${summary.totalRevenue.toFixed(2)}`]
  ];
  
  autoTable(doc, {
    body: summaryData,
    startY: yPosition,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 60 }
    }
  });
  
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
};

const addChartsSection = (
  doc: jsPDF,
  charts: NonNullable<ExportData["charts"]>,
  yPosition: number
): number => {
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text("📈 Análise Visual", 20, yPosition);
  yPosition += 15;
  
  // Add chart data as tables
  if (charts.trends && charts.trends.datasets.length > 0) {
    doc.setFontSize(10);
    doc.text("Dados do Gráfico de Tendências:", 20, yPosition);
    yPosition += 10;
    
    const chartTableData = charts.trends.labels.map((label: string, index: number) => [
      label,
      charts.trends.datasets[0].data[index]?.toString() || "0"
    ]);
    
    autoTable(doc, {
      head: [["Período", "Valor"]],
      body: chartTableData,
      startY: yPosition,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 }
      }
    });
    
  yPosition = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  }
  
  return yPosition;
};

type CalcRow = ExportCalculationItem | CalculationHistory;

const addCalculationsTable = (
  doc: jsPDF,
  calculations: Array<CalcRow>,
  yPosition: number
): void => {
  // Check if we need a new page
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text("📋 Detalhamento dos Cálculos", 20, yPosition);
  yPosition += 10;
  
  const tableData = calculations.slice(0, 100).map((calc, index) => {
    const date = 'date' in calc ? calc.date : new Date();
    const cost = 'cost' in calc && calc.cost ? calc.cost : '0';
    const margin = 'margin' in calc && typeof calc.margin === 'number' ? `${calc.margin}` : '-';
    const tax = 'tax' in calc && calc.tax ? `${calc.tax}%` : '-';
    const cardFee = 'cardFee' in calc && calc.cardFee ? `${calc.cardFee}%` : '-';
    const shippingStr = 'shipping' in calc && calc.shipping ? calc.shipping : '0';
    const shipping = parseFloat(shippingStr);
    const selling = 'result' in calc && calc.result?.sellingPrice !== null && calc.result?.sellingPrice !== undefined
      ? `R$ ${calc.result.sellingPrice.toFixed(2)}`
      : '-';

    return [
      (index + 1).toString(),
      format(new Date(date), "dd/MM/yyyy", { locale: ptBR }),
      `R$ ${cost}`,
      `${margin}%`,
      tax,
      cardFee,
      shipping > 0 ? `R$ ${shipping.toFixed(2)}` : "-",
      selling
    ];
  });
  
  autoTable(doc, {
    head: [['#', 'Data', 'Custo', 'Margem', 'Impostos', 'Taxa Cartão', 'Frete', 'Preço Final']],
    body: tableData,
    startY: yPosition,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 18 },
      6: { cellWidth: 15 },
      7: { cellWidth: 22 }
    }
  });
  
  if (calculations.length > 100) {
  const lat = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const finalY = (lat ? lat.finalY + 10 : 200);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Nota: Mostrando os primeiros 100 registros de ${calculations.length} total.`, 20, finalY);
  }
};

const addFooter = (doc: jsPDF): void => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
    doc.text(BRANDING.attributionFooter, 20, doc.internal.pageSize.getHeight() - 10);
  }
};
