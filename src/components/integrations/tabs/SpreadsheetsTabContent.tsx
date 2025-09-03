
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet } from "lucide-react";

const SpreadsheetSync = lazy(() => import("@/components/integrations/SpreadsheetSync"));

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function SpreadsheetsTabContent() {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Sincronização com Planilhas
            </CardTitle>
            <Badge variant="outline" className="bg-brand-50 text-brand-700">PRO</Badge>
          </div>
          <CardDescription>
            Mantenha suas planilhas do Google Sheets e Excel sempre atualizadas automaticamente
          </CardDescription>
        </CardHeader>
<CardContent>
          <Suspense fallback={<div className="h-40 rounded-md bg-muted animate-pulse" aria-label="Carregando planilhas..." /> }>
            <SpreadsheetSync />
          </Suspense>
        </CardContent>
      </Card>
    </motion.div>
  );
}
