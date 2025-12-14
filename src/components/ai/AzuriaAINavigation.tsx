import { Brain, MessageSquare, Package2, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AzuriaAINavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const AzuriaAINavigation = ({ activeSection, onSectionChange }: AzuriaAINavigationProps) => {
  const sections = [
    {
      id: 'assistente',
      label: 'Assistente',
      shortLabel: 'Assistente',
      icon: MessageSquare,
      description: 'Chat inteligente para precificação'
    },
    {
      id: 'lote',
      label: 'Lote IA',
      shortLabel: 'Lote',
      icon: Package2,
      description: 'Calculadora em lote inteligente'
    },
    {
      id: 'precos',
      label: 'IA Preços',
      shortLabel: 'Preços',
      icon: Brain,
      description: 'Sugestões de preços com IA'
    },
    {
      id: 'sugestao',
      label: 'Sugestão',
      shortLabel: 'Sugestão',
      icon: Sparkles,
      description: 'Recomendações automáticas'
    },
    {
      id: 'competitividade',
      label: 'Competitividade',
      shortLabel: 'Competição',
      icon: Target,
      description: 'Análise de concorrência'
    }
  ];

  const activeSectionData = sections.find(s => s.id === activeSection);

  return (
    <div className="w-full">
      {/* Quick Actions Style Navigation */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <motion.button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-md',
                'text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90'
                  : 'text-foreground hover:border-primary/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{section.label}</span>
              <span className="sm:hidden">{section.shortLabel}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Elegant Description */}
      {activeSectionData && (
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-base text-muted-foreground font-light">
            {activeSectionData.description}
          </p>
        </motion.div>
      )}
    </div>
  );
};
