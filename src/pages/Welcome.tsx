
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroLandingSection from "@/components/landing/HeroLandingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CaseStudiesSection from "@/components/landing/CaseStudiesSection";
import TrialBanner from "@/components/landing/TrialBanner";
import { ArrowRight, BarChart, Calculator, Check, DollarSign, Layers, LineChart, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function Welcome() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section Otimizada */}
        <HeroLandingSection />
        
        {/* Features */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tudo que você precisa com Inteligência Artificial</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ferramentas inteligentes para diferentes tipos de negócio e níveis de complexidade.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Calculadora Básica</h3>
                <p className="text-gray-600 mb-4">
                  Calcule rapidamente o preço de venda ideal com base no custo e margem de lucro desejada.
                </p>
                <Link to="/calculadora-simples">
                  <Button variant="outline" size="sm" className="w-full">
                    Usar Grátis
                  </Button>
                </Link>
              </div>
              
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 p-6 rounded-lg shadow-md border border-brand-200">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Calculadora PRO</h3>
                <p className="text-gray-600 mb-4">
                  Considere impostos, taxas de marketplace e frete grátis para um cálculo preciso e lucrativo.
                </p>
                <Link to="/planos">
                  <Button className="w-full bg-brand-600 hover:bg-brand-700">
                    Trial 7 Dias
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">IA Precificação</h3>
                <p className="text-gray-600 mb-4">
                  Inteligência artificial analisa mercado e sugere preços otimizados automaticamente.
                </p>
                <Link to="/planos">
                  <Button variant="outline" size="sm" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Ver Planos
                  </Button>
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics Avançado</h3>
                <p className="text-gray-600 mb-4">
                  Análise de rentabilidade, projeções de vendas e métricas detalhadas em tempo real.
                </p>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Em Breve
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <TestimonialsSection />

        {/* Cases de Sucesso */}
        <CaseStudiesSection />

        {/* Trial Banner */}
        <TrialBanner />
        
        {/* CTA Final */}
        <section className="bg-gray-50 py-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para aumentar seus lucros com IA?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 1.000 lojistas que já transformaram sua precificação.
              Comece grátis agora mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/calculadora-simples">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                  Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/planos">
                <Button size="lg" variant="outline">
                  Ver Trial PRO <DollarSign className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Desenvolvedor */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Quem desenvolveu a Azuria</h2>
            </div>
            
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold">
                  RB
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Rômulo Barbosa</h3>
                  <p className="text-gray-600 mb-4">
                    Desenvolvedor e especialista em soluções para e-commerce. Criou a Azuria para
                    ajudar lojistas a maximizarem seus lucros com estratégias inteligentes de precificação.
                  </p>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="font-bold text-brand-600">5+ anos</div>
                      <div className="text-sm text-gray-500">E-commerce</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-brand-600">1.000+</div>
                      <div className="text-sm text-gray-500">Usuários</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-brand-600">R$ 2M+</div>
                      <div className="text-sm text-gray-500">Em vendas processadas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
