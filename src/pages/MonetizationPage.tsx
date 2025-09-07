
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Award,
  DollarSign,
  GraduationCap,
  ShoppingBag,
  Star,
  Target,
  Users,
  Zap
} from "lucide-react";
import AffiliateSystem from "@/components/monetization/AffiliateSystem";
import TemplateMarketplace from "@/components/monetization/TemplateMarketplace";
import ConsultingServices from "@/components/monetization/ConsultingServices";
import TrainingCertification from "@/components/monetization/TrainingCertification";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function MonetizationPage() {
  const [activeTab, setActiveTab] = useState("afiliados");

  const monetizationStats = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Receita Mensal",
      value: "R$ 287.450",
      growth: "+24%",
      color: "text-green-600"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Afiliados Ativos",
      value: "1.247",
      growth: "+18%",
      color: "text-blue-600"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Templates Vendidos",
      value: "3.891",
      growth: "+45%",
      color: "text-purple-600"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Consultorias Ativas",
      value: "89",
      growth: "+67%",
      color: "text-orange-600"
    }
  ];

  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header />
      
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Monetização & Crescimento
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Transforme seu conhecimento em receita. Sistema completo de monetização 
              com afiliados, templates premium e consultoria especializada.
            </p>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {monetizationStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className={`mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <Badge variant="outline" className={`${stat.color} border-current`}>
                    {stat.growth} este mês
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="afiliados">
                  <Users className="h-4 w-4 mr-2" />
                  Afiliados
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="consultoria">
                  <Target className="h-4 w-4 mr-2" />
                  Consultoria
                </TabsTrigger>
                <TabsTrigger value="certificacao">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Certificação
                </TabsTrigger>
              </TabsList>

              <TabsContent value="afiliados" className="mt-8">
                <AffiliateSystem />
              </TabsContent>

              <TabsContent value="templates" className="mt-8">
                <TemplateMarketplace />
              </TabsContent>

              <TabsContent value="consultoria" className="mt-8">
                <ConsultingServices />
              </TabsContent>

              <TabsContent value="certificacao" className="mt-8">
                <TrainingCertification />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Growth Opportunities */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Acelere seu Crescimento
                  </h2>
                  <p className="text-blue-100 mb-6">
                    Junte-se aos nossos programas de crescimento e multiplique 
                    sua receita com estratégias comprovadas de monetização.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-yellow-300" />
                      <span>Comissões de até 40% para afiliados</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-300" />
                      <span>Templates premium com alta conversão</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-300" />
                      <span>Certificação reconhecida no mercado</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Começar Agora
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
}
