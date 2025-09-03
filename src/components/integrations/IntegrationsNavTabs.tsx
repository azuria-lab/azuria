
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Database, ExternalLink, FileSpreadsheet, Share2, Store, Zap } from "lucide-react";

export default function IntegrationsNavTabs() {
  return (
    <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-8">
      <TabsTrigger value="ecommerce" className="flex items-center gap-1">
        <Store className="h-4 w-4" />
        <span className="hidden sm:inline">E-commerce</span>
      </TabsTrigger>
      <TabsTrigger value="marketplaces" className="flex items-center gap-1">
        <ExternalLink className="h-4 w-4" />
        <span className="hidden sm:inline">Marketplaces</span>
      </TabsTrigger>
      <TabsTrigger value="erp" className="flex items-center gap-1">
        <Building2 className="h-4 w-4" />
        <span className="hidden sm:inline">ERPs</span>
      </TabsTrigger>
      <TabsTrigger value="spreadsheets" className="flex items-center gap-1">
        <FileSpreadsheet className="h-4 w-4" />
        <span className="hidden sm:inline">Planilhas</span>
      </TabsTrigger>
      <TabsTrigger value="automation" className="flex items-center gap-1">
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Automação</span>
      </TabsTrigger>
      <TabsTrigger value="webhooks" className="flex items-center gap-1">
        <Database className="h-4 w-4" />
        <span className="hidden sm:inline">Webhooks</span>
      </TabsTrigger>
      <TabsTrigger value="share" className="flex items-center gap-1">
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Compartilhar</span>
      </TabsTrigger>
    </TabsList>
  );
}
