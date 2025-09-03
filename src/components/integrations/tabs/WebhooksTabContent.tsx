
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const WebhookIntegration = lazy(() => import("@/components/integrations/WebhookIntegration"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function WebhooksTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integração via Webhook
          </CardTitle>
          <CardDescription>
            Conecte o Precifica+ com outras ferramentas via webhooks manuais
          </CardDescription>
        </CardHeader>
<CardContent>
          <Suspense fallback={<div className="h-40 rounded-md bg-muted animate-pulse" aria-label="Carregando webhooks..." /> }>
            <WebhookIntegration />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}
