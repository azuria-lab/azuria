
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function IntegrationsBenefits() {
  return (
    <motion.div variants={itemVariants} className="mt-12">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              🚀 Maximize sua Produtividade com Integrações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">+80%</div>
                <p className="text-blue-700">Redução no tempo de gestão de preços</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">100+</div>
                <p className="text-blue-700">Ferramentas compatíveis</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">24/7</div>
                <p className="text-blue-700">Sincronização automática</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
