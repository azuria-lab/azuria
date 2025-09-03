
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

const WebhookAutomation = lazy(() => import("@/components/integrations/WebhookAutomation"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function AutomationTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automação Inteligente
            </CardTitle>
            <Badge variant="outline" className="bg-brand-50 text-brand-700">PRO</Badge>
          </div>
          <CardDescription>
            Configure regras de automação para disparar ações baseadas em eventos específicos
          </CardDescription>
        </CardHeader>
<CardContent>
          <Suspense fallback={<div className="h-40 rounded-md bg-muted animate-pulse" aria-label="Carregando automações..." /> }>
            <WebhookAutomation />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}
