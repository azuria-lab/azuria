
import { CalculationHistory } from "@/types/simpleCalculator";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Adicionar a definição de tipos para o jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
  autoTable: (options: unknown) => jsPDF;
  }
}

export const generatePDF = async (
  item: CalculationHistory,
  formatCurrency: (value: number) => string
): Promise<void> => {
  // Criar um novo documento PDF
  const doc = new jsPDF();

  // Configurar fonte
  doc.setFont("helvetica");

  // Adicionar título
  doc.setFontSize(20);
  doc.text("Azuria", 105, 15, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("Relatório de Cálculo de Preço", 105, 25, { align: "center" });

  // Adicionar data e hora do cálculo
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dataFormatada = format(new Date(item.date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  doc.text(`Data do cálculo: ${dataFormatada}`, 20, 35);

  // Adicionar seção de informações do cálculo
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Informações do Cálculo", 20, 45);
  
  // Linha horizontal
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 47, 190, 47);

  // Tabela com informações de entrada
  const inputData = [
    ["Custo do Produto", `R$ ${item.cost.replace(".", ",")}`],
    ["Margem de Lucro", `${item.margin}%`],
  ];

  if (item.tax) {
    inputData.push(["Imposto", `${item.tax}%`]);
  }

  if (item.cardFee) {
    inputData.push(["Taxa de Cartão", `${item.cardFee}%`]);
  }

  if (item.otherCosts) {
    inputData.push(["Outros Custos", `R$ ${item.otherCosts.replace(".", ",")}`]);
  }

  if (item.shipping) {
    inputData.push([
      "Frete", 
      `R$ ${item.shipping.replace(".", ",")}${item.includeShipping ? " (incluído no preço)" : ""}`
    ]);
  }

  doc.autoTable({
    startY: 50,
    head: [["Parâmetro", "Valor"]],
    body: inputData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 245, 255],
    },
    margin: { left: 20, right: 20 },
  });

  // Adicionar seção de resultados
  const resultStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text("Resultado do Cálculo", 20, resultStartY);
  
  // Linha horizontal
  doc.line(20, resultStartY + 2, 190, resultStartY + 2);

  // Tabela com resultados
  const resultData = [
    ["Preço de Venda", `R$ ${formatCurrency(item.result.sellingPrice)}`],
    ["Lucro", `R$ ${formatCurrency(item.result.profit)}`],
    ["Margem Real", `${item.result.breakdown.realMarginPercent.toFixed(1)}%`],
  ];

  doc.autoTable({
    startY: resultStartY + 5,
    body: resultData,
    theme: "striped",
    bodyStyles: {
      fontSize: 12,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [240, 245, 255],
    },
    margin: { left: 20, right: 20 },
  });

  // Adicionar seção de detalhamento
  const breakdownStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text("Detalhamento da Composição do Preço", 20, breakdownStartY);
  
  // Linha horizontal
  doc.line(20, breakdownStartY + 2, 190, breakdownStartY + 2);

  // Tabela com detalhamento
  const breakdownData = [
    ["Custo do Produto", `R$ ${formatCurrency(item.result.breakdown.costValue)}`],
  ];

  if (item.result.breakdown.otherCostsValue > 0) {
    breakdownData.push(["Outros Custos", `R$ ${formatCurrency(item.result.breakdown.otherCostsValue)}`]);
  }

  if (item.result.breakdown.shippingValue > 0) {
    breakdownData.push(["Frete", `R$ ${formatCurrency(item.result.breakdown.shippingValue)}`]);
  }

  if (item.result.breakdown.taxAmount > 0) {
    breakdownData.push(["Imposto", `R$ ${formatCurrency(item.result.breakdown.taxAmount)}`]);
  }

  if (item.result.breakdown.cardFeeAmount > 0) {
    breakdownData.push(["Taxa de Cartão", `R$ ${formatCurrency(item.result.breakdown.cardFeeAmount)}`]);
  }

  breakdownData.push(["Margem de Lucro", `R$ ${formatCurrency(item.result.breakdown.marginAmount)}`]);
  breakdownData.push(["Total (Preço de Venda)", `R$ ${formatCurrency(item.result.sellingPrice)}`]);

  doc.autoTable({
    startY: breakdownStartY + 5,
    body: breakdownData,
    theme: "striped",
    bodyStyles: {
      fontSize: 11,
    },
    columnStyles: {
      0: { fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [240, 245, 255],
    },
    margin: { left: 20, right: 20 },
  });

  // Adicionar rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "© Azuria - Documento gerado automaticamente",
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      190,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
  }

  // Salvar o arquivo com nome personalizado
  const fileName = `Precifica_Calculo_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
  doc.save(fileName);
};
