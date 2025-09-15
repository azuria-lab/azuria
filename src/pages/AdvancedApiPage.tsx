
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedApiDocumentation from "@/components/api/AdvancedApiDocumentation";
import AdvancedRateLimitDashboard from "@/components/api/AdvancedRateLimitDashboard";
import BidirectionalWebhookManager from "@/components/api/BidirectionalWebhookManager";

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

export default function AdvancedApiPage() {
  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-8 px-4"
      >
        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentation">Documentação</TabsTrigger>
            <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="documentation" className="mt-6">
            <AdvancedApiDocumentation />
          </TabsContent>

          <TabsContent value="rate-limiting" className="mt-6">
            <AdvancedRateLimitDashboard />
          </TabsContent>

          <TabsContent value="webhooks" className="mt-6">
            <BidirectionalWebhookManager />
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}
