import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Building2, 
  Calculator, 
  Edit, 
  FileText, 
  Package, 
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  Users
} from "lucide-react";
import type { HistoryCategory, ProjectHistoryItem } from "@/hooks/useProjectHistory";

interface ProjectHistoryListProps {
  history: ProjectHistoryItem[];
  loading: boolean;
  selectedCategory?: HistoryCategory | "todos";
}

const categoryConfig: Record<HistoryCategory, { label: string; icon: React.ElementType; color: string; borderColor: string }> = {
  calculos: { label: "Cálculos", icon: Calculator, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", borderColor: "#3b82f6" },
  templates: { label: "Templates", icon: FileText, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", borderColor: "#a855f7" },
  produtos: { label: "Produtos", icon: Package, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", borderColor: "#22c55e" },
  configuracoes: { label: "Configurações", icon: Settings, color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", borderColor: "#f97316" },
  equipes: { label: "Equipes", icon: Users, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300", borderColor: "#6366f1" },
  empresa: { label: "Empresa", icon: Building2, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300", borderColor: "#06b6d4" },
  marketplace: { label: "Marketplace", icon: ShoppingBag, color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300", borderColor: "#ec4899" },
};

const actionIcons: Record<string, React.ElementType> = {
  criado: Plus,
  modificado: Edit,
  calculado: Calculator,
  excluido: Trash2,
};

const actionLabels: Record<string, string> = {
  criado: "Criado",
  modificado: "Modificado",
  calculado: "Calculado",
  excluido: "Excluído",
};

export default function ProjectHistoryList({ history, loading, selectedCategory }: ProjectHistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Cards falsos por categoria
  const getFakeItemsForCategory = (category: HistoryCategory): ProjectHistoryItem[] => {
    const fakeItems: Record<HistoryCategory, ProjectHistoryItem[]> = {
      calculos: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-calc-${i}`,
        category: "calculos" as HistoryCategory,
        action: "calculado" as const,
        title: "Cálculo de Preço",
        description: `Custo: R$ ${(100 + i * 10).toFixed(2)} | Margem: ${(20 + i)}% | Imposto: 10%`,
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
      })),
      templates: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-template-${i}`,
        category: "templates" as HistoryCategory,
        action: i % 3 === 0 ? "modificado" as const : "criado" as const,
        title: `Template ${i + 1}: ${["Produto Físico", "Serviço Avançado", "E-commerce", "Marketplace", "Básico"][i % 5]}`,
        description: `Template para ${["produtos físicos", "serviços", "e-commerce", "marketplace", "cálculos básicos"][i % 5]} com configurações personalizadas`,
        timestamp: new Date(Date.now() - i * 3 * 60 * 60 * 1000),
      })),
      produtos: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-product-${i}`,
        category: "produtos" as HistoryCategory,
        action: i % 4 === 0 ? "modificado" as const : "criado" as const,
        title: `Produto ${i + 1}: ${["Smartphone", "Notebook", "Tablet", "Acessório", "Periférico"][i % 5]}`,
        description: `SKU: PROD-${String(i + 1).padStart(4, "0")} | Preço: R$ ${(500 + i * 50).toFixed(2)}`,
        timestamp: new Date(Date.now() - i * 4 * 60 * 60 * 1000),
      })),
      configuracoes: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-config-${i}`,
        category: "configuracoes" as HistoryCategory,
        action: "modificado" as const,
        title: ["Configurações de Negócio", "Configurações de Taxa", "Configurações de Margem", "Configurações de Imposto", "Configurações Padrão"][i % 5],
        description: "Configurações foram atualizadas",
        timestamp: new Date(Date.now() - i * 5 * 60 * 60 * 1000),
      })),
      equipes: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-team-${i}`,
        category: "equipes" as HistoryCategory,
        action: i % 5 === 0 ? "modificado" as const : "criado" as const,
        title: `Equipe ${i + 1}: ${["Desenvolvimento", "Vendas", "Marketing", "Suporte", "Administração"][i % 5]}`,
        description: "Equipe foi criada ou modificada",
        timestamp: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
      })),
      empresa: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-company-${i}`,
        category: "empresa" as HistoryCategory,
        action: i % 3 === 0 ? "modificado" as const : "criado" as const,
        title: "Dados da Empresa",
        description: ["Dados cadastrais atualizados", "Informações fiscais modificadas", "Configurações de empresa alteradas"][i % 3],
        timestamp: new Date(Date.now() - i * 7 * 60 * 60 * 1000),
      })),
      marketplace: Array.from({ length: 15 }, (_, i) => ({
        id: `fake-marketplace-${i}`,
        category: "marketplace" as HistoryCategory,
        action: i % 4 === 0 ? "modificado" as const : "criado" as const,
        title: `${["Mercado Livre", "Amazon", "Shopee", "Mercado Livre", "Shopee"][i % 5]}`,
        description: `Produto sincronizado | Status: ${["Ativo", "Em sincronização", "Atualizado", "Publicado"][i % 4]}`,
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
      })),
    };
    return fakeItems[category];
  };

  if (history.length === 0 && !loading) {
    // Se uma categoria específica está selecionada, mostrar cards falsos dessa categoria
    if (selectedCategory && selectedCategory !== "todos") {
      const fakeItems = getFakeItemsForCategory(selectedCategory);
      
      // Agrupar por data (mesmo formato do histórico real)
      const groupedByDate = fakeItems.reduce((acc, item) => {
        const dateKey = format(item.timestamp, "yyyy-MM-dd");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
      }, {} as Record<string, ProjectHistoryItem[]>);

      const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

      return (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const items = groupedByDate[dateKey];
            const date = new Date(dateKey);
            const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;
            const isYesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd") === dateKey;

            let dateLabel: string;
            if (isToday) {
              dateLabel = "Hoje";
            } else if (isYesterday) {
              dateLabel = "Ontem";
            } else {
              dateLabel = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
            }

            return (
              <div key={dateKey} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                  {dateLabel}
                </h3>
                {items.map((item) => {
                  const category = categoryConfig[item.category];
                  const CategoryIcon = category.icon;
                  const ActionIcon = actionIcons[item.action] || Edit;

                  return (
                <Card 
                  key={item.id} 
                  className="overflow-hidden border-l-4 hover:shadow-md transition-shadow opacity-60"
                  style={{ borderLeftColor: categoryConfig[item.category].borderColor }}
                >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <Badge 
                                variant="secondary" 
                                className={`${category.color} text-xs font-medium`}
                              >
                                {category.label}
                              </Badge>
                              <ActionIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {actionLabels[item.action]}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm mb-1 truncate">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {format(item.timestamp, "HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }

    // Se "Todos" está selecionado, mostrar cards de todas as categorias
    return (
      <div className="space-y-6">
        {(Object.keys(categoryConfig) as HistoryCategory[]).map((category) => {
          const fakeItems = getFakeItemsForCategory(category);
          const categoryInfo = categoryConfig[category];

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                {categoryInfo.label}
              </h3>
              {fakeItems.slice(0, 5).map((item) => {
                const CategoryIcon = categoryInfo.icon;
                const ActionIcon = actionIcons[item.action] || Edit;

                return (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden border-l-4 hover:shadow-md transition-shadow opacity-60"
                    style={{ borderLeftColor: categoryInfo.borderColor }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Badge 
                              variant="secondary" 
                              className={`${categoryInfo.color} text-xs font-medium`}
                            >
                              {categoryInfo.label}
                            </Badge>
                            <ActionIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {actionLabels[item.action]}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-1 truncate">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // Agrupar por data
  const groupedByDate = history.reduce((acc, item) => {
    const dateKey = format(item.timestamp, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, ProjectHistoryItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const items = groupedByDate[dateKey];
        const date = new Date(dateKey);
        const isToday = format(new Date(), "yyyy-MM-dd") === dateKey;
        const isYesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd") === dateKey;

        let dateLabel: string;
        if (isToday) {
          dateLabel = "Hoje";
        } else if (isYesterday) {
          dateLabel = "Ontem";
        } else {
          dateLabel = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        }

        return (
          <div key={dateKey} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
              {dateLabel}
            </h3>
            {items.map((item) => {
              const category = categoryConfig[item.category];
              const CategoryIcon = category.icon;
              const ActionIcon = actionIcons[item.action] || Edit;

              return (
                <Card 
                  key={item.id} 
                  className="overflow-hidden border-l-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: category.borderColor }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Badge 
                            variant="secondary" 
                            className={`${category.color} text-xs font-medium`}
                          >
                            {category.label}
                          </Badge>
                          <ActionIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {actionLabels[item.action]}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-1 truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {format(item.timestamp, "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
