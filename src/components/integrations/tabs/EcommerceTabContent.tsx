
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "lucide-react";

const EcommerceIntegrations = lazy(() => import("@/components/integrations/EcommerceIntegrations"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function EcommerceTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Integrações E-commerce
            </CardTitle>
            <Badge variant="outline" className="bg-brand-50 text-brand-700">PRO</Badge>
          </div>
          <CardDescription>
            Conecte-se com Shopify, WooCommerce, Mercado Livre e sincronize preços automaticamente
          </CardDescription>
        </CardHeader>
<CardContent>
          <Suspense fallback={<div className="h-40 rounded-md bg-muted animate-pulse" aria-label="Carregando integrações..." /> }>
            <EcommerceIntegrations />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}
