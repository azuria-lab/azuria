
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SecurityDashboard from "@/components/security/SecurityDashboard";

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

export default function SecurityDashboardPage() {
  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-8 px-4"
      >
        <SecurityDashboard />
      </motion.div>
    </Layout>
  );
}
