
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Clock,
  DollarSign,
  Link,
  Share2,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function AffiliateSystem() {
  const [referralCode, setReferralCode] = useState("PRECIFICA-USER123");
  const [isGenerating, setIsGenerating] = useState(false);

  const affiliateStats = [
    {
      title: "Comissão Atual",
      value: "25%",
      description: "Por cada venda realizada",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600"
    },
    {
      title: "Indicações",
      value: "47",
      description: "Total de usuários indicados",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600"
    },
    {
      title: "Receita Gerada",
      value: "R$ 3.470",
      description: "Ganhos acumulados",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-600"
    },
    {
      title: "Taxa Conversão",
      value: "12.3%",
      description: "Visitantes que assinaram",
      icon: <Target className="h-5 w-5" />,
      color: "text-orange-600"
    }
  ];

  const commissionTiers = [
    {
      tier: "Bronze",
      referrals: "1-10",
      commission: "25%",
      bonus: "R$ 50",
      active: true
    },
    {
      tier: "Prata",
      referrals: "11-25",
      commission: "30%",
      bonus: "R$ 150",
      active: false
    },
    {
      tier: "Ouro",
      referrals: "26-50",
      commission: "35%",
      bonus: "R$ 300",
      active: false
    },
    {
      tier: "Diamante",
      referrals: "51+",
      commission: "40%",
      bonus: "R$ 500",
      active: false
    }
  ];

  const recentReferrals = [
    {
      user: "Maria Silva",
      date: "Hoje",
      plan: "PRO Mensal",
      commission: "R$ 7,48",
      status: "Pago"
    },
    {
      user: "João Santos",
      date: "Ontem",
      plan: "PRO Anual",
      commission: "R$ 74,25",
      status: "Pago"
    },
    {
      user: "Ana Costa",
      date: "2 dias",
      plan: "PRO Mensal",
      commission: "R$ 7,48",
      status: "Pendente"
    }
  ];

  const generateNewCode = async () => {
    setIsGenerating(true);
    // Simular geração de código
    setTimeout(() => {
      const newCode = `PRECIFICA-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      setReferralCode(newCode);
      setIsGenerating(false);
      toast.success("Novo código gerado com sucesso!");
    }, 1000);
  };

  const copyReferralLink = () => {
    const link = `https://precifica.app/planos?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Sistema de Afiliados</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ganhe dinheiro indicando o Azuria para outros empreendedores. 
          Sistema transparente com pagamentos automáticos e comissões progressivas.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {affiliateStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-full bg-gray-100 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="referrals">Indicações</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Referral Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Seu Código de Indicação
              </CardTitle>
              <CardDescription>
                Use este código para rastrear suas indicações e receber comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <Input value={referralCode} readOnly className="font-mono" />
                <Button onClick={generateNewCode} disabled={isGenerating}>
                  {isGenerating ? "Gerando..." : "Novo Código"}
                </Button>
                <Button onClick={copyReferralLink} variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Commission Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Níveis de Comissão
              </CardTitle>
              <CardDescription>
                Sua comissão aumenta conforme você indica mais usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissionTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      tier.active
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={tier.active ? "default" : "outline"}>
                          {tier.tier}
                        </Badge>
                        <div>
                          <p className="font-medium">{tier.referrals} indicações</p>
                          <p className="text-sm text-gray-600">
                            Comissão: {tier.commission} + Bônus: {tier.bonus}
                          </p>
                        </div>
                      </div>
                      {tier.active && (
                        <Badge className="bg-green-100 text-green-800">
                          Nível Atual
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso para Prata</span>
                  <span>8/11 indicações</span>
                </div>
                <Progress value={73} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Materiais de Marketing</CardTitle>
              <CardDescription>
                Recursos para ajudar você a promover o Azuria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Banners para Redes Sociais</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Pacote completo com banners para Instagram, Facebook e LinkedIn
                  </p>
                  <Button variant="outline" size="sm">
                    Download Pack
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Vídeos Explicativos</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Vídeos prontos para compartilhar em suas redes
                  </p>
                  <Button variant="outline" size="sm">
                    Acessar Vídeos
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Templates de Email</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Modelos de email para sua lista de contatos
                  </p>
                  <Button variant="outline" size="sm">
                    Ver Templates
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Apresentações</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Slides para apresentar o Azuria em eventos
                  </p>
                  <Button variant="outline" size="sm">
                    Download PPT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicações Recentes</CardTitle>
              <CardDescription>
                Acompanhe suas indicações e comissões em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReferrals.map((referral, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.user}</p>
                        <p className="text-sm text-gray-600">
                          {referral.plan} - {referral.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{referral.commission}</p>
                      <Badge
                        variant={referral.status === "Pago" ? "default" : "outline"}
                        className={
                          referral.status === "Pago"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                Todos os pagamentos são processados automaticamente no dia 5 de cada mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dezembro 2024</p>
                      <p className="text-sm text-gray-600">15 indicações convertidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ 1.247,50</p>
                    <Badge className="bg-green-100 text-green-800">Pago</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Janeiro 2025</p>
                      <p className="text-sm text-gray-600">Em processamento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ 892,75</p>
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
