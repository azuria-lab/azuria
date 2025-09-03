
import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Download, FileText, FileUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ProductImport {
  id: string;
  name: string;
  cost: number;
  margin: number;
  tax: number;
  sellingPrice: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ImportPage() {
  const [products, setProducts] = useState<ProductImport[]>([]);
  const [csvText, setCsvText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculatePrice = (cost: number, margin: number, tax: number) => {
    const priceWithMargin = cost * (1 + margin / 100);
    const finalPrice = priceWithMargin * (1 + tax / 100);
    return finalPrice;
  };

  const processCsvData = async () => {
    if (!csvText.trim()) {
      toast.error("Cole os dados CSV para importar");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const lines = csvText.trim().split('\n');
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validar cabeçalhos obrigatórios
      const requiredHeaders = ['nome', 'custo', 'margem', 'impostos'];
      const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
      
      if (missingHeaders.length > 0) {
        toast.error(`Cabeçalhos obrigatórios faltando: ${missingHeaders.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      const newProducts: ProductImport[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length < 4) {continue;}
        
        const nameIndex = header.indexOf('nome');
        const costIndex = header.indexOf('custo');
        const marginIndex = header.indexOf('margem');
        const taxIndex = header.indexOf('impostos');
        
        try {
          const name = values[nameIndex];
          const cost = parseFloat(values[costIndex]);
          const margin = parseFloat(values[marginIndex]);
          const tax = parseFloat(values[taxIndex]);
          
          if (isNaN(cost) || isNaN(margin) || isNaN(tax)) {
            throw new Error("Valores numéricos inválidos");
          }
          
          const sellingPrice = calculatePrice(cost, margin, tax);
          
          newProducts.push({
            id: `import-${Date.now()}-${i}`,
            name,
            cost,
            margin,
            tax,
            sellingPrice,
            status: 'success'
          });
        } catch (error) {
          newProducts.push({
            id: `import-${Date.now()}-${i}`,
            name: values[nameIndex] || `Produto ${i}`,
            cost: 0,
            margin: 0,
            tax: 0,
            sellingPrice: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
        
        // Atualizar progresso
        setProgress((i / (lines.length - 1)) * 100);
        
        // Simular delay para mostrar progresso
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setProducts(newProducts);
      
      const successCount = newProducts.filter(p => p.status === 'success').length;
      const errorCount = newProducts.filter(p => p.status === 'error').length;
      
      if (errorCount === 0) {
        toast.success(`${successCount} produtos importados com sucesso!`);
      } else {
        toast.warning(`${successCount} produtos importados, ${errorCount} com erro`);
      }
      
    } catch (error) {
      toast.error("Erro ao processar dados CSV");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = "nome,custo,margem,impostos\nProduto Exemplo,100,30,10\nOutro Produto,50,25,12";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-importacao.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template baixado com sucesso!");
  };

  const exportResults = () => {
    if (products.length === 0) {
      toast.error("Nenhum produto para exportar");
      return;
    }

    const csvContent = [
      "nome,custo,margem,impostos,preco_venda,status,erro",
      ...products.map(p => `${p.name},${p.cost},${p.margin},${p.tax},${p.sellingPrice.toFixed(2)},${p.status},${p.error || ''}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultados-importacao.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Resultados exportados com sucesso!");
  };

  const clearData = () => {
    setProducts([]);
    setCsvText("");
    toast.success("Dados limpos");
  };

  return (
    <Layout>
      <motion.div 
        className="container mx-auto py-8 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Importação em Massa</h1>
          <p className="text-gray-600">
            Importe múltiplos produtos via CSV e calcule preços de venda automaticamente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Área de Importação */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5 text-brand-600" />
                  Importar Dados
                </CardTitle>
                <CardDescription>
                  Cole os dados CSV ou baixe nosso template para começar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Template
                  </Button>
                </div>

                <div>
                  <Label htmlFor="csv-data">Dados CSV</Label>
                  <Textarea
                    id="csv-data"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="nome,custo,margem,impostos&#10;Produto A,100,30,10&#10;Produto B,50,25,12"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Formato esperado:</strong></p>
                  <p>• Primeira linha: cabeçalhos (nome,custo,margem,impostos)</p>
                  <p>• Demais linhas: dados dos produtos</p>
                  <p>• Separador: vírgula (,)</p>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Label>Processando... {Math.round(progress)}%</Label>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={processCsvData} 
                    disabled={isProcessing || !csvText.trim()}
                    className="flex-1"
                  >
                    {isProcessing ? "Processando..." : "Processar Dados"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearData}
                    disabled={isProcessing}
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Resultados */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-600" />
                  Resultados ({products.length})
                </CardTitle>
                <CardDescription>
                  Produtos processados e preços calculados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum produto importado ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="default">
                          {products.filter(p => p.status === 'success').length} Sucesso
                        </Badge>
                        <Badge variant="destructive">
                          {products.filter(p => p.status === 'error').length} Erro
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={exportResults}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg ${
                            product.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{product.name}</h4>
                                {product.status === 'success' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              
                              {product.status === 'success' ? (
                                <div className="text-sm text-gray-600 mt-1">
                                  <p>Custo: R$ {product.cost} | Margem: {product.margin}%</p>
                                  <p className="font-semibold text-brand-600">
                                    Preço: R$ {product.sellingPrice.toFixed(2)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-red-600 mt-1">{product.error}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}
