
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

const ERPIntegrations = lazy(() => import("@/components/integrations/ERPIntegrations"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ERPTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Integrações com ERPs
            </CardTitle>
            <Badge variant="outline" className="bg-brand-50 text-brand-700">PRO</Badge>
          </div>
          <CardDescription>
            Sincronize com sistemas ERP como Tiny, Bling, TOTVS e outros para automatizar seu fluxo de trabalho
          </CardDescription>
        </CardHeader>
<CardContent>
          <Suspense fallback={<div className="h-40 rounded-md bg-muted animate-pulse" aria-label="Carregando integrações..." /> }>
            <ERPIntegrations />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}
