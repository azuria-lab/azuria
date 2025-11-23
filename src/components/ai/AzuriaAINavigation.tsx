import { Brain, MessageSquare, Package2, Sparkles, Target } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AzuriaAINavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const AzuriaAINavigation = ({ activeSection, onSectionChange }: AzuriaAINavigationProps) => {
  const sections = [
    {
      id: 'assistente',
      label: 'Assistente IA',
      icon: MessageSquare,
      description: 'Chat inteligente para precificação'
    },
    {
      id: 'lote',
      label: 'Lote IA',
      icon: Package2,
      description: 'Calculadora em lote inteligente'
    },
    {
      id: 'precos',
      label: 'IA Preços',
      icon: Brain,
      description: 'Sugestões de preços com IA'
    },
    {
      id: 'sugestao',
      label: 'Sugestão de Preços',
      icon: Sparkles,
      description: 'Recomendações automáticas'
    },
    {
      id: 'competitividade',
      label: 'Competitividade',
      icon: Target,
      description: 'Análise de concorrência'
    }
  ];

  return (
    <div className="w-full">
      {/* Desktop Navigation - Tabs */}
      <div className="hidden md:block">
        <Tabs value={activeSection} onValueChange={onSectionChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-[#EAF6FF] border border-[#112B4A]/20">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={`flex flex-col items-center gap-1 py-3 transition-all ${
                    isActive
                      ? 'bg-[#0A1930] border border-[#00C2FF] text-[#00C2FF] shadow-[0_0_15px_rgba(0,194,255,0.3)]'
                      : 'hover:bg-[#005BFF]/10 hover:text-[#005BFF] text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{section.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Navigation - Scrollable Tabs */}
      <div className="md:hidden">
        <Tabs value={activeSection} onValueChange={onSectionChange} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-[#EAF6FF] border border-[#112B4A]/20 flex overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={`flex flex-col items-center gap-1 py-2 px-4 min-w-[80px] transition-all ${
                    isActive
                      ? 'bg-[#0A1930] border border-[#00C2FF] text-[#00C2FF] shadow-[0_0_15px_rgba(0,194,255,0.3)]'
                      : 'hover:bg-[#005BFF]/10 hover:text-[#005BFF] text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{section.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Section Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {sections.find(s => s.id === activeSection)?.description}
        </p>
      </div>
    </div>
  );
};
