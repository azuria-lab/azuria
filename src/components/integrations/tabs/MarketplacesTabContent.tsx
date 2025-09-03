
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const MarketplaceIntegrations = lazy(() => import("@/components/integrations/MarketplaceIntegrations"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function MarketplacesTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Integrações com Marketplaces
            </CardTitle>
            <Badge variant="outline" className="bg-brand-50 text-brand-700">PRO</Badge>
          </div>
          <CardDescription>
            Conecte-se com Mercado Livre, Amazon, Shopee e outros para obter e atualizar dados automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-40 rounded-md bg-muted animate-pulse" aria-label="Carregando integrações..." /> }>
            <MarketplaceIntegrations />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}
