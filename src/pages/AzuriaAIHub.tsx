/**
 * Azuria IA Hub - Módulo Unificado de IA
 * 
 * Página central que consolida todas as funcionalidades de IA:
 * - Assistente IA (Chat)
 * - Lote IA (Calculadora em Lote Inteligente)
 * - IA Preços (Sugestões e Análises)
 * - Sugestão de Preços
 * - Competitividade (Análise de Concorrência)
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import MainLayout from '@/components/layout/Layout';
import { AzuriaAINavigation } from '@/components/ai/AzuriaAINavigation';
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


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
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
        
        // Check for section parameter in URL
        const sectionParam = searchParams.get('section');
        if (sectionParam && ['assistente', 'lote', 'precos', 'sugestao', 'competitividade'].includes(sectionParam)) {
          setActiveSection(sectionParam);
        }
        
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

  const renderSection = () => {
    switch (activeSection) {
      case 'assistente':
        return <AssistenteSection />;
      case 'lote':
        return <LoteIASection isPro={isPro} />;
      case 'precos':
        return <IAPrecosSection />;
      case 'sugestao':
        return <SugestaoSection />;
      case 'competitividade':
        return <CompetitividadeSection />;
      default:
        return <AssistenteSection />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingState />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        className="container mx-auto px-4 py-8 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Azuria IA
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Central de Inteligência Artificial para precificação, análise de mercado e otimização de negócios
          </p>

          {/* Beta Badge */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Beta
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Powered by AI
            </span>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div variants={itemVariants} className="mb-8">
          <AzuriaAINavigation 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
          />
        </motion.div>

        {/* Content */}
        <motion.div 
          variants={itemVariants}
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p>
            A Azuria IA está em desenvolvimento ativo. Algumas funcionalidades podem sofrer alterações.
          </p>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
