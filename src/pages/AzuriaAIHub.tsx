/**
 * Azuria IA Hub - Módulo Unificado de IA
 * 
 * Design Premium - Estilo Apple (igual à página /equipe)
 * Foco em simplicidade, clareza e experiência fluida
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Brain, MessageSquare, Package2, Sparkles, Target } from 'lucide-react';
import {
  AssistenteSection,
  CompetitividadeSection,
  IAPrecosSection,
  LoteIASection,
  SugestaoSection
} from '@/components/ai/AzuriaAISections';
import { supabase } from '@/integrations/supabase/client';
import LoadingState from '@/components/calculators/LoadingState';
import { logger } from '@/services/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const contentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function AzuriaAIHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>('assistente');
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Verificação de assinatura PRO
        const userIsPro = localStorage.getItem('isPro') === 'true';
        setIsPro(userIsPro);
        
        setIsLoading(false);
      } catch (error) {
        logger.error('Erro ao verificar sessão:', error);
        setIsLoading(false);
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate, searchParams]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  // Sincronizar activeSection com searchParams
  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam && ['assistente', 'lote', 'precos', 'sugestao', 'competitividade'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Azuria AI - Azuria</title>
        <meta name="description" content="Inteligência artificial para precificação precisa e análise tributária avançada" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header igual à página /equipe */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold tracking-tight leading-tight pb-1 -mt-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Azuria AI
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Inteligência artificial para precificação precisa e análise tributária avançada
            </p>
          </div>

          {/* Tabs igual à página /equipe */}
          <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto gap-3 mb-6">
              <TabsTrigger 
                value="assistente" 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Assistente
              </TabsTrigger>
              <TabsTrigger 
                value="lote" 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm gap-2"
              >
                <Package2 className="h-4 w-4" />
                Lote IA
              </TabsTrigger>
              <TabsTrigger 
                value="precos" 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm gap-2"
              >
                <Brain className="h-4 w-4" />
                IA Preços
              </TabsTrigger>
              <TabsTrigger 
                value="sugestao" 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Sugestão
              </TabsTrigger>
              <TabsTrigger 
                value="competitividade" 
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm gap-2"
              >
                <Target className="h-4 w-4" />
                Competitividade
              </TabsTrigger>
            </TabsList>

            {/* Content with smooth transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                <TabsContent value="assistente" className="mt-0">
                  <AssistenteSection />
                </TabsContent>
                <TabsContent value="lote" className="mt-0">
                  <LoteIASection isPro={isPro} />
                </TabsContent>
                <TabsContent value="precos" className="mt-0">
                  <IAPrecosSection />
                </TabsContent>
                <TabsContent value="sugestao" className="mt-0">
                  <SugestaoSection />
                </TabsContent>
                <TabsContent value="competitividade" className="mt-0">
                  <CompetitividadeSection />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </>
  );
}
