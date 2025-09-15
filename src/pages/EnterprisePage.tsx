import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Building2, FileText, Key, Palette, Store, Users } from "lucide-react";
import TeamManagement from "@/components/enterprise/TeamManagement";
import ApiManagement from "@/components/enterprise/ApiManagement";
import AdvancedReports from "@/components/enterprise/AdvancedReports";
import WhiteLabelSettings from "@/components/enterprise/WhiteLabelSettings";
import OrganizationSelector from "@/components/multi-tenant/OrganizationSelector";
import ConsolidatedDashboard from "@/components/multi-tenant/ConsolidatedDashboard";
import StoreManager from "@/components/multi-tenant/StoreManager";

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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function EnterprisePage() {
  return (
    <Layout>
      <OrganizationSelector />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto py-8 px-4 max-w-7xl"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recursos Empresariais</h1>
              <p className="text-muted-foreground max-w-3xl">
                Funcionalidades avançadas para equipes e empresas: multi-tenant, gestão de lojas, relatórios consolidados e controle centralizado.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:block">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="stores" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden sm:block">Lojas</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:block">Equipe</span>
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="hidden sm:block">API</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:block">Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="whitelabel" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:block">White-Label</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <ConsolidatedDashboard />
            </TabsContent>

            <TabsContent value="stores" className="space-y-6">
              <StoreManager />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <TeamManagement />
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <ApiManagement />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <AdvancedReports />
            </TabsContent>

            <TabsContent value="whitelabel" className="space-y-6">
              <WhiteLabelSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
