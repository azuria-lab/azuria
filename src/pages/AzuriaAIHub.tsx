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
import MainLayout from '@/components/layout/Layout';
import { AzuriaAINavigation } from '@/components/ai/AzuriaAINavigation';
import { AzuriaAvatarImage } from '@/components/ai/AzuriaAvatarImage';
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
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Azuria Character Avatar */}
            <div className="relative">
              <AzuriaAvatarImage 
                size="large"
                className="ring-4 ring-[#00C2FF] ring-opacity-50 shadow-lg shadow-[#00C2FF]/20"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00C2FF] rounded-full border-2 border-white"></div>
            </div>
            
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#00C2FF] via-[#005BFF] to-[#00C2FF] bg-clip-text text-transparent">
                Azuria AI
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Assistente inteligente de precificação e análise tributária
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0A1930] text-[#00C2FF] border border-[#00C2FF]/30 shadow-[0_0_10px_rgba(0,194,255,0.2)]">
              Beta
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0A1930] text-[#005BFF] border border-[#005BFF]/30">
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
