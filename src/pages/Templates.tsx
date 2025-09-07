import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Filter, Search, Star } from "lucide-react";
import { useSimpleCalculator } from "@/hooks/useSimpleCalculator";
import Header from "@/components/layout/Header";
import MobileNavigationBar from "@/components/mobile/MobileNavigationBar";
import { logger } from "@/services/logger";

interface TemplateDefaults {
  cost?: string | number;
  margin?: number;
  tax?: string | number;
  cardFee?: string | number;
  otherCosts?: string | number;
  shipping?: string | number;
  includeShipping?: boolean;
}

interface TemplateSectorConfig {
  [key: string]: unknown;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  default_values: TemplateDefaults | null;
  sector_specific_config: TemplateSectorConfig | null;
  rating: number | null;
  downloads_count: number | null;
  is_premium: boolean | null;
  image_url?: string | null;
}

type DBTemplate = Omit<Template, 'default_values' | 'sector_specific_config'> & {
  default_values: unknown;
  sector_specific_config: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const { toast } = useToast();
  const { setState } = useSimpleCalculator();

  const categories = [
    { value: "todos", label: "Todos os Setores" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "restaurante", label: "Restaurante" },
    { value: "servicos", label: "Serviços" },
    { value: "artesanal", label: "Artesanal" },
    { value: "varejo", label: "Varejo" },
    { value: "saas", label: "SaaS" },
    { value: "industria", label: "Indústria" },
    { value: "consultoria", label: "Consultoria" },
    { value: "outros", label: "Outros" }
  ];

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('calculation_templates')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'published')
        .order('downloads_count', { ascending: false });

      if (error) {throw error;}
      const safe = (data as unknown as DBTemplate[] | null) ?? [];
      const mapped: Template[] = safe.map((row) => ({
        ...row,
        default_values: isObject(row.default_values) ? (row.default_values as TemplateDefaults) : null,
        sector_specific_config: isObject(row.sector_specific_config) ? (row.sector_specific_config as TemplateSectorConfig) : null,
      }));
      setTemplates(mapped);
    } catch (error) {
  logger.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const applyTemplate = async (template: Template) => {
    try {
      // Aplicar valores do template na calculadora
      setState({
  cost: template.default_values?.cost ?? "",
  margin: template.default_values?.margin ?? 30,
  tax: template.default_values?.tax ?? "",
  cardFee: template.default_values?.cardFee ?? "",
  otherCosts: template.default_values?.otherCosts ?? "",
  shipping: template.default_values?.shipping ?? "",
  includeShipping: template.default_values?.includeShipping ?? false,
      });

      // Incrementar contador de downloads
      await supabase
        .from('calculation_templates')
        .update({ downloads_count: (template.downloads_count ?? 0) + 1 })
        .eq('id', template.id);

      toast({
        title: "Template aplicado!",
        description: `Template "${template.name}" foi aplicado na calculadora.`,
      });

      // Redirecionar para a calculadora
      window.location.href = "/";
    } catch (error) {
  logger.error('Erro ao aplicar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o template.",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-20">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando templates...</p>
            </div>
          </div>
        </div>
        <MobileNavigationBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <Header />
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header da página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Templates por Setor
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha um template pré-configurado para seu setor e acelere seus cálculos de precificação
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background text-foreground"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={template.is_premium ? "default" : "secondary"}>
                    {template.category}
                  </Badge>
                  {(template.is_premium ?? false) && (
                    <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">PRO</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads_count ?? 0}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => applyTemplate(template)}
                  className="w-full"
                  variant={(template.is_premium ?? false) ? "default" : "outline"}
                >
                  {(template.is_premium ?? false) ? "Usar Template PRO" : "Usar Template"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum template encontrado para os filtros selecionados.
            </p>
          </div>
        )}
      </div>
      <MobileNavigationBar />
    </div>
  );
};

export default Templates;