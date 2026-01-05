
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/domains/auth";
import { type HistoryCategory, useProjectHistory } from "@/hooks/useProjectHistory";
import ProjectHistoryList from "@/components/history/ProjectHistoryList";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DateFilter } from "@/components/ui/date-filter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user: _user, isAuthenticated } = useAuthContext();
  const { 
    history, 
    allHistory,
    isLoading, 
    error, 
    selectedCategory, 
    setSelectedCategory,
    dateFilter,
    setDateFilter
  } = useProjectHistory();

  // Verificar se o usuário está logado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Contar itens por categoria (incluindo cards falsos quando não há histórico real)
  const getCategoryCount = (category: HistoryCategory | "todos"): number => {
    if (allHistory.length > 0) {
      // Se há histórico real, usar a contagem real
      if (category === "todos") {
        return allHistory.length;
      }
      return allHistory.filter(h => h.category === category).length;
    } else {
      // Se não há histórico real, mostrar contagem dos cards falsos
      if (category === "todos") {
        // Para "Todos", mostrar soma de todas as categorias (5 cada)
        return 5 * 7; // 7 categorias × 5 cards cada
      }
      // Para categorias específicas, mostrar 15 cards falsos
      return 15;
    }
  };

  const categoryCounts = {
    todos: getCategoryCount("todos"),
    calculos: getCategoryCount("calculos"),
    templates: getCategoryCount("templates"),
    produtos: getCategoryCount("produtos"),
    configuracoes: getCategoryCount("configuracoes"),
    equipes: getCategoryCount("equipes"),
    empresa: getCategoryCount("empresa"),
    marketplace: getCategoryCount("marketplace"),
  };

  const categories: Array<{ value: HistoryCategory | "todos"; label: string }> = [
    { value: "todos", label: "Todos" },
    { value: "produtos", label: "Produtos" },
    { value: "templates", label: "Templates" },
    { value: "calculos", label: "Cálculos" },
    { value: "marketplace", label: "Marketplace" },
    { value: "equipes", label: "Equipes" },
    { value: "empresa", label: "Empresa" },
    { value: "configuracoes", label: "Configurações" },
  ];

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div 
            variants={itemVariants}
            className="mb-6"
          >
            <div className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold text-foreground leading-tight pb-1">
                  Histórico do Projeto
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Tudo que foi calculado, cadastrado ou modificado
                </p>
              </div>
              
              {allHistory.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {allHistory.length} {allHistory.length === 1 ? "item" : "itens"}
                </Badge>
              )}
            </div>
          </motion.div>
          
          {error && (
            <motion.div variants={itemVariants} className="mb-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Filtros */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-2.5 flex-nowrap">
              {/* Filtros por Categoria */}
              <Tabs 
                value={selectedCategory} 
                onValueChange={(value) => setSelectedCategory(value as HistoryCategory | "todos")}
                className="flex-1 min-w-0"
              >
                <TabsList className="h-auto p-0 gap-2 bg-transparent items-center flex-nowrap">
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat.value} 
                      value={cat.value}
                      className="relative h-9 px-2.5 text-xs font-medium rounded-md bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm whitespace-nowrap flex-shrink-0"
                    >
                      {cat.label}
                      <Badge 
                        variant="secondary" 
                        className="ml-1.5 h-4.5 px-1.5 text-[11px]"
                      >
                        {categoryCounts[cat.value]}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Filtro de Data */}
              <DateFilter
                value={dateFilter ? { from: dateFilter.from, to: dateFilter.to } : undefined}
                onChange={(value) => setDateFilter(value ? { from: value.from, to: value.to } : null)}
                label="Filtrar por período"
                placeholder="Filtrar por data"
                iconOnly={true}
                className="flex-shrink-0 h-9 w-9"
              />
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ProjectHistoryList 
              history={history}
              loading={isLoading}
              selectedCategory={selectedCategory}
            />
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
