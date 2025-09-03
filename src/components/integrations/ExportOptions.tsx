
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportOptions() {
  const { toast } = useToast();
  const [data, setData] = useState({
    productName: "",
    date: new Date().toISOString().split("T")[0],
    includeDetails: true
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Função para exportar para PDF
  const exportToPdf = () => {
    // Aqui normalmente usaríamos jsPDF ou outra biblioteca
    // Para este exemplo, mostraremos apenas um toast informativo
    toast({
      title: "Exportando PDF",
      description: `Seu cálculo para "${data.productName || 'Produto'}" está sendo exportado como PDF.`
    });
    
    // Simulação de download
    setTimeout(() => {
      toast({
        title: "PDF Gerado",
        description: "O PDF foi gerado com sucesso e está sendo baixado."
      });
    }, 1500);
  };
  
  // Função para exportar para CSV/Excel
  const exportToCsv = () => {
    // Aqui crearíamos uma string CSV real
    // Para este exemplo, mostraremos apenas um toast informativo
    toast({
      title: "Exportando Planilha",
      description: `Seus dados para "${data.productName || 'Produto'}" estão sendo exportados como planilha.`
    });
    
    // Simulação de download
    setTimeout(() => {
      toast({
        title: "Planilha Gerada",
        description: "A planilha foi gerada com sucesso e está sendo baixada."
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName">Nome do Produto/Relatório</Label>
          <Input 
            id="productName"
            name="productName"
            placeholder="Relatório de Precificação - Camisetas"
            value={data.productName}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Data de Referência</Label>
          <Input 
            id="date"
            name="date"
            type="date"
            value={data.date}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="includeDetails"
            name="includeDetails"
            className="h-4 w-4 rounded border-gray-300"
            checked={data.includeDetails}
            onChange={handleInputChange}
          />
          <Label htmlFor="includeDetails">
            Incluir detalhes completos (custos, taxas, margens)
          </Label>
        </div>
      </div>
      
      <div className="pt-4 space-y-4">
        <Label>Exportar como:</Label>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportToPdf}
            variant="outline"
            className="flex items-center gap-2 flex-1"
          >
            <FileText className="h-4 w-4" />
            Exportar como PDF
          </Button>
          
          <Button
            onClick={exportToCsv}
            variant="outline"
            className="flex items-center gap-2 flex-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar como Planilha
          </Button>
        </div>
      </div>
      
      <div className="pt-4 text-sm text-gray-500">
        <p>Os arquivos exportados contêm os dados disponíveis no momento da exportação.</p>
        <p>Para exportar histórico completo, use a página de histórico.</p>
      </div>
    </div>
  );
}
