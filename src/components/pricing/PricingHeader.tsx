
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function PricingHeader() {
  return (
    <motion.div variants={itemVariants} className="text-center mb-12">
      <Badge className="bg-brand-100 text-brand-800 border-brand-200 mb-4">
        Planos e Preços
      </Badge>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
        Escolha o plano ideal para seu negócio
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Comece grátis e evolua conforme sua necessidade. Todos os planos incluem 7 dias de trial gratuito.
      </p>
    </motion.div>
  );
}
