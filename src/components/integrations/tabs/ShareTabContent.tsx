
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

const SharingOptions = lazy(() => import("@/components/integrations/SharingOptions"));
const ExportOptions = lazy(() => import("@/components/integrations/ExportOptions"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ShareTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhamento e Exportação
          </CardTitle>
          <CardDescription>
            Compartilhe suas análises de preço via WhatsApp, e-mail ou exporte para PDF
          </CardDescription>
        </CardHeader>
<CardContent>
          <Suspense fallback={<div className="h-24 rounded-md bg-muted animate-pulse" aria-label="Carregando opções de compartilhamento..." /> }>
            <SharingOptions />
          </Suspense>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Opções de Exportação</h3>
            <Suspense fallback={<div className="h-24 rounded-md bg-muted animate-pulse" aria-label="Carregando opções de exportação..." /> }>
              <ExportOptions />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
