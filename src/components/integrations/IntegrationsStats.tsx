
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { History, Store, Zap } from "lucide-react";
import { EcommerceConnection, PriceSync } from "@/types/ecommerce";

interface IntegrationsStatsProps {
  connections: EcommerceConnection[];
  syncHistory: PriceSync[];
  totalProducts: number;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function IntegrationsStats({ 
  connections, 
  syncHistory, 
  totalProducts 
}: IntegrationsStatsProps) {
  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const recentSyncs = syncHistory.slice(0, 5);

  return (
    <motion.div 
      variants={itemVariants}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plataformas Conectadas</p>
              <p className="text-2xl font-bold text-brand-600">{connectedCount}</p>
            </div>
            <Store className="h-8 w-8 text-brand-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produtos Sincronizados</p>
              <p className="text-2xl font-bold text-brand-600">{totalProducts}</p>
            </div>
            <Zap className="h-8 w-8 text-brand-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sincronizações Recentes</p>
              <p className="text-2xl font-bold text-brand-600">{recentSyncs.length}</p>
            </div>
            <History className="h-8 w-8 text-brand-600" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
