/**
 * Azuria IA Hub - Módulo Unificado de IA
 * 
 * Design Premium - Estilo Apple
 * Foco em simplicidade, clareza e experiência fluida
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
        {/* Minimalist Header */}
        <motion.div 
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground mb-3">
            Azuria AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl">
            Inteligência artificial para precificação precisa e análise tributária avançada
          </p>
        </motion.div>

        {/* Refined Navigation */}
        <motion.div 
          className="mb-10 md:mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AzuriaAINavigation 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
          />
        </motion.div>

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
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
