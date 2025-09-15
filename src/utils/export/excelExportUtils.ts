
import { ExportData } from "@/types/export";
import type { CalculationHistory } from "@/domains/calculator/types/calculator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const generateExcelReport = async (data: ExportData, fileName: string): Promise<void> => {
  const sheets = {
    resumo: generateSummarySheet(data),
    calculos: generateCalculationsSheet(data),
    metricas: generateMetricsSheet(data),
    graficos: generateChartsDataSheet(data)
  };
  
  // Create a zip-like structure by combining all sheets
  let excelContent = "PLANILHA: RESUMO EXECUTIVO\n";
  excelContent += sheets.resumo + "\n\n";
  
  excelContent += "PLANILHA: CÁLCULOS DETALHADOS\n";
  excelContent += sheets.calculos + "\n\n";
  
  excelContent += "PLANILHA: MÉTRICAS\n";
  excelContent += sheets.metricas + "\n\n";
  
  excelContent += "PLANILHA: DADOS DOS GRÁFICOS\n";
  excelContent += sheets.graficos;
  
  const blob = new Blob(["\uFEFF" + excelContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const generateSummarySheet = (data: ExportData): string => {
  if (!data.summary) {return "Sem dados de resumo disponíveis";}
  
  return `Métrica;Valor
Período;${data.summary.periodLabel}
Total de Cálculos;${data.summary.totalCalculations}
Margem Média;${data.summary.avgMargin.toFixed(1)}%
Preço Médio de Venda;R$ ${data.summary.avgSellingPrice.toFixed(2)}
Receita Potencial Total;R$ ${data.summary.totalRevenue.toFixed(2)}`;
};

export const generateCalculationsSheet = (data: ExportData): string => {
  const headers = "Data;Custo;Margem;Impostos;Taxa Cartão;Frete;Preço Final;Lucro";
  
  const rows = data.calculations.map((calc) => {
    const c = calc as CalculationHistory;
    const dateValue = (c.date instanceof Date) ? c.date : new Date(c.date as unknown as string);
    const date = format(dateValue, "dd/MM/yyyy HH:mm", { locale: ptBR });
    const cost = (c.cost ?? "").replace?.(",", ".") || String(c.cost ?? "0");
    const margin = String(c.margin ?? 0);
    const tax = String(c.tax ?? "");
    const cardFee = String(c.cardFee ?? "");
    const shipping = String(c.shipping ?? "");
    const sellingPrice = c.result?.sellingPrice?.toFixed(2).replace(".", ",") || "0";
    const profitNumber = (c.result && 'breakdown' in c.result && (c.result as CalculationHistory['result']).profit)
      ? (c.result as CalculationHistory['result']).profit
      : undefined;
    const profit = typeof profitNumber === 'number' ? profitNumber.toFixed(2).replace(".", ",") : "0";
    return [date, cost, margin, tax, cardFee, shipping, sellingPrice, profit].join(";");
  });
  
  return headers + "\n" + rows.join("\n");
};

export const generateMetricsSheet = (data: ExportData): string => {
  const calculations = data.calculations as CalculationHistory[];
  if (calculations.length === 0) {return "Sem dados para métricas";}
  
  const avgCost = calculations.reduce((acc, calc) => acc + parseFloat(calc.cost || "0"), 0) / calculations.length;
  const avgMargin = calculations.reduce((acc, calc) => acc + (calc.margin || 0), 0) / calculations.length;
  const totalRevenue = calculations.reduce((acc, calc) => acc + (calc.result?.sellingPrice || 0), 0);
  
  return `Métrica;Valor
Custo Médio;R$ ${avgCost.toFixed(2)}
Margem Média;${avgMargin.toFixed(1)}%
Receita Total;R$ ${totalRevenue.toFixed(2)}
Maior Preço;R$ ${Math.max(...(calculations.map(c => c.result?.sellingPrice || 0))).toFixed(2)}
Menor Preço;R$ ${Math.min(...(calculations.map(c => c.result?.sellingPrice || 0))).toFixed(2)}`;
};

export const generateChartsDataSheet = (data: ExportData): string => {
  if (!data.charts) {return "Sem dados de gráficos disponíveis";}
  
  let content = "TENDÊNCIAS\nPeríodo;Valor\n";
  if (data.charts && data.charts.trends) {
    content += data.charts?.trends.labels.map((label, index) => 
      `${label};${data.charts?.trends.datasets[0]?.data[index] || 0}`
    ).join("\n");
  }
  
  content += "\n\nCATEGORIAS\nCategoria;Valor\n";
  if (data.charts && data.charts.categories) {
    content += data.charts?.categories.labels.map((label, index) => 
      `${label};${data.charts?.categories.datasets[0]?.data[index] || 0}`
    ).join("\n");
  }
  
  return content;
};
