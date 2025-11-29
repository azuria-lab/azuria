
import { motion } from "framer-motion";
import ApiDocumentation from "@/components/api/ApiDocumentation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

export default function ApiPage() {
  return (
    <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-8 px-4"
      >
        <ApiDocumentation />
      </motion.div>
  );
}
