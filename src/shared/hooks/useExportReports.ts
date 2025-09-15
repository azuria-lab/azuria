
import { useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type CalculationResult = {
  sellingPrice?: number;
  breakdown?: { profit?: number };
};

export interface CalculationRow {
  date: string | number | Date;
  cost: string | number;
  margin: number | string;
  tax?: string | number | null;
  cardFee?: string | number | null;
  shipping?: string | number | null;
  otherCosts?: string | number | null;
  includeShipping?: boolean;
  result?: CalculationResult;
}

interface MarketplaceSummary {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalResults: number;
}

interface ExportData {
  calculations: CalculationRow[];
  marketplaceData?: MarketplaceSummary;
  period?: string;
  filters?: Record<string, unknown>;
  summary?: {
    totalCalculations: number;
    avgMargin: number;
    avgSellingPrice: number;
    totalRevenue: number;
    periodLabel: string;
  };
}

const toNumber = (v: string | number | null | undefined): number => {
  if (typeof v === 'number') { return v; }
  if (typeof v === 'string') { return parseFloat(v.replace(',', '.')) || 0; }
  return 0;
};

const normalizeNumericInput = (v: string | number | null | undefined): string => {
  if (typeof v === 'number') { return v.toString(); }
  if (typeof v === 'string') { return v.replace(',', '.'); }
  return "0";
};

export const useExportReports = () => {

  const exportToPDF = useCallback(async (data: ExportData, fileName: string = "relatorio-precifica") => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 240); // Brand color
      doc.text("Precifica+ - Relatório de Cálculos", 20, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, 20, 35);
      
      // Summary section
      if (data.summary) {
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text("Resumo Executivo", 20, 50);
        
        doc.setFontSize(10);
        doc.text(`Período: ${data.summary.periodLabel}`, 20, 65);
        doc.text(`Total de cálculos: ${data.summary.totalCalculations}`, 20, 75);
        doc.text(`Margem média: ${data.summary.avgMargin.toFixed(1)}%`, 20, 85);
        doc.text(`Preço médio de venda: R$ ${data.summary.avgSellingPrice.toFixed(2)}`, 20, 95);
        doc.text(`Receita potencial total: R$ ${data.summary.totalRevenue.toFixed(2)}`, 20, 105);
      }
      
      // Calculations table
      if (data.calculations.length > 0) {
        const tableData = data.calculations.slice(0, 50).map((calc, index) => {
          const shippingVal = toNumber(calc.shipping);
          return [
          index + 1,
          format(new Date(calc.date), "dd/MM/yyyy", { locale: ptBR }),
          `R$ ${calc.cost}`,
          `${calc.margin}%`,
          calc.tax ? `${calc.tax}%` : "-",
          calc.cardFee ? `${calc.cardFee}%` : "-",
          shippingVal > 0 ? `R$ ${shippingVal.toFixed(2)}` : "-",
          calc.result?.sellingPrice ? `R$ ${calc.result.sellingPrice.toFixed(2)}` : "-"
        ];
        });
        
        autoTable(doc, {
          head: [['#', 'Data', 'Custo', 'Margem', 'Impostos', 'Taxa Cartão', 'Frete', 'Preço Final']],
          body: tableData,
          startY: data.summary ? 120 : 60,
          styles: { fontSize: 7 },
          headStyles: { fillColor: [40, 116, 240] },
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
        
        if (data.calculations.length > 50) {
          const yPos = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?
            ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10) :
            200;
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(`Nota: Mostrando os primeiros 50 registros de ${data.calculations.length} total.`, 20, yPos);
        }
      }
      
      // Marketplace data
      if (data.marketplaceData) {
        const yPos = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?
          ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20) :
          180;
        
        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text("Análise de Mercado", 20, yPos);
        
        doc.setFontSize(10);
        doc.text(`Preço médio do mercado: R$ ${data.marketplaceData.avgPrice}`, 20, yPos + 15);
        doc.text(`Faixa de preços: R$ ${data.marketplaceData.minPrice} - R$ ${data.marketplaceData.maxPrice}`, 20, yPos + 25);
        doc.text(`Produtos analisados: ${data.marketplaceData.totalResults}`, 20, yPos + 35);
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        doc.text("Gerado pelo Precifica+ - Calculadora de Preços", 20, doc.internal.pageSize.getHeight() - 10);
      }
      
      doc.save(`${fileName}.pdf`);
      toast.success("Relatório PDF exportado com sucesso!");
      
    } catch (_error) {
      toast.error("Erro ao exportar relatório em PDF");
    }
  }, []);

  const exportToCSV = useCallback((data: ExportData, fileName: string = "relatorio-precifica") => {
    try {
      const csvContent = generateCSVContent(data);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success("Relatório CSV exportado com sucesso!");
      
    } catch (_error) {
      toast.error("Erro ao exportar relatório em CSV");
    }
  }, []);

  const exportToExcel = useCallback(async (data: ExportData, fileName: string = "relatorio-precifica") => {
    try {
      // Para Excel, usamos CSV com separadores compatíveis
      const csvContent = generateCSVContent(data, true);
      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.xls`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success("Relatório Excel exportado com sucesso!");
      
    } catch (_error) {
      toast.error("Erro ao exportar relatório em Excel");
    }
  }, []);

  return {
    exportToPDF,
    exportToCSV,
    exportToExcel
  };
};

function generateCSVContent(data: ExportData, forExcel: boolean = false): string {
  const separator = forExcel ? ";" : ",";
  
  // BOM para caracteres especiais no Excel
  const bom = forExcel ? "\uFEFF" : "";
  
  // Headers
  const headers = [
    "Data",
    "Custo (R$)",
    "Margem (%)",
    "Impostos (%)",
    "Taxa Cartão (%)",
    "Frete (R$)",
    "Outros Custos (R$)",
    "Preço Final (R$)",
    "Lucro (R$)",
    "Incluir Frete"
  ];
  
  // Data rows
  const rows = data.calculations.map(calc => [
    format(new Date(calc.date), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    normalizeNumericInput(calc.cost),
    normalizeNumericInput(calc.margin),
    normalizeNumericInput(calc.tax),
    normalizeNumericInput(calc.cardFee),
    normalizeNumericInput(calc.shipping),
    normalizeNumericInput(calc.otherCosts),
    calc.result?.sellingPrice?.toFixed(2).replace(".", ",") || "0",
    calc.result?.breakdown?.profit?.toFixed(2).replace(".", ",") || "0",
    calc.includeShipping ? "Sim" : "Não"
  ]);
  
  // Summary section
  if (data.summary) {
    rows.unshift([]);
    rows.unshift([
      "RESUMO EXECUTIVO",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);
    rows.unshift([
      `Período: ${data.summary.periodLabel}`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);
    rows.unshift([
      `Total de cálculos: ${data.summary.totalCalculations}`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);
    rows.unshift([
      `Margem média: ${data.summary.avgMargin.toFixed(1)}%`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);
    rows.unshift([
      `Preço médio: R$ ${data.summary.avgSellingPrice.toFixed(2)}`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]);
    rows.unshift([]);
    rows.unshift([]);
  }
  
  const csvArray = [headers, ...rows];
  return bom + csvArray.map(row => 
    row.map(field => `"${field}"`).join(separator)
  ).join("\n");
}
