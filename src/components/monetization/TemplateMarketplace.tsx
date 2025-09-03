
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  DollarSign,
  Download,
  Eye,
  Filter,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function TemplateMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const templates = [
    {
      id: 1,
      title: "Precificação para E-commerce",
      description: "Template completo para lojas online com cálculo de frete e taxas de marketplace",
      price: "R$ 47,00",
      rating: 4.8,
      downloads: 1247,
      author: "Maria Silva",
      category: "ecommerce",
      image: "/placeholder.svg",
      tags: ["E-commerce", "Marketplace", "Frete"],
      featured: true
    },
    {
      id: 2,
      title: "Consultoria Empresarial",
      description: "Modelo para prestadores de serviço com análise de concorrência avançada",
      price: "R$ 37,00",
      rating: 4.9,
      downloads: 892,
      author: "João Santos",
      category: "servicos",
      image: "/placeholder.svg",
      tags: ["Consultoria", "Serviços", "B2B"],
      featured: false
    },
    {
      id: 3,
      title: "Restaurante e Food Service",
      description: "Precificação específica para restaurantes com controle de ingredientes",
      price: "R$ 29,00",
      rating: 4.7,
      downloads: 634,
      author: "Ana Costa",
      category: "alimentacao",
      image: "/placeholder.svg",
      tags: ["Restaurante", "Food", "Ingredientes"],
      featured: true
    },
    {
      id: 4,
      title: "Produtos Artesanais",
      description: "Template para artesãos com cálculo de tempo de produção",
      price: "R$ 23,00",
      rating: 4.6,
      downloads: 445,
      author: "Carlos Oliveira",
      category: "artesanal",
      image: "/placeholder.svg",
      tags: ["Artesanal", "Handmade", "Criativo"],
      featured: false
    },
    {
      id: 5,
      title: "SaaS e Software",
      description: "Modelo para precificação de software e assinaturas digitais",
      price: "R$ 67,00",
      rating: 4.9,
      downloads: 1058,
      author: "Tech Solutions",
      category: "tecnologia",
      image: "/placeholder.svg",
      tags: ["SaaS", "Software", "Tecnologia"],
      featured: true
    },
    {
      id: 6,
      title: "Moda e Vestuário",
      description: "Template especializado em confecção e varejo de moda",
      price: "R$ 33,00",
      rating: 4.5,
      downloads: 729,
      author: "Fashion Pro",
      category: "moda",
      image: "/placeholder.svg",
      tags: ["Moda", "Vestuário", "Varejo"],
      featured: false
    }
  ];

  const categories = [
    { value: "todos", label: "Todos os Templates" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "servicos", label: "Serviços" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "artesanal", label: "Artesanal" },
    { value: "tecnologia", label: "Tecnologia" },
    { value: "moda", label: "Moda" }
  ];

  const marketplaceStats = [
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      title: "Templates Disponíveis",
      value: "247",
      color: "text-blue-600"
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Downloads Totais",
      value: "12.4k",
      color: "text-green-600"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Criadores Ativos",
      value: "89",
      color: "text-purple-600"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Avaliação Média",
      value: "4.8",
      color: "text-yellow-600"
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "todos" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = (template: any) => {
    toast.success(`Comprando template: ${template.title}`);
  };

  const handlePreview = (template: any) => {
    toast.info(`Visualizando template: ${template.title}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Marketplace de Templates</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Templates profissionais criados por especialistas em precificação. 
          Acelere seu negócio com modelos testados e aprovados pelo mercado.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {marketplaceStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <div className={`mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 ${stat.color}`}>
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Templates */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Templates em Destaque
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTemplates.filter(template => template.featured).map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-500">
                    Destaque
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <span className="text-lg font-bold text-green-600">{template.price}</span>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Download className="h-4 w-4" />
                      {template.downloads}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePreview(template)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handlePurchase(template)}
                      size="sm" 
                      className="flex-1"
                    >
                      Comprar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Por {template.author}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Templates */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Todos os Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.filter(template => !template.featured).map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <span className="text-lg font-bold text-green-600">{template.price}</span>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Download className="h-4 w-4" />
                      {template.downloads}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePreview(template)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handlePurchase(template)}
                      size="sm" 
                      className="flex-1"
                    >
                      Comprar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Por {template.author}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action for Creators */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Venda Seus Templates</h3>
            <p className="mb-6 opacity-90">
              Compartilhe seu conhecimento e gere renda passiva. 
              Publique seus templates no marketplace e receba até 70% por venda.
            </p>
            <Button className="bg-white text-purple-600 hover:bg-gray-100">
              Começar a Vender
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
