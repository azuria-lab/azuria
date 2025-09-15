import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DisclosureSection {
  id: string;
  title: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  children: React.ReactNode;
  preview?: React.ReactNode;
}

interface ProgressiveDisclosureProps {
  sections: DisclosureSection[];
  title: string;
  description?: string;
}

const levelColors = {
  basic: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

const levelLabels = {
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado'
};

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  sections,
  title,
  description
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic-section']));
  const [showAllLevels, setShowAllLevels] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const filteredSections = showAllLevels 
    ? sections 
    : sections.filter(section => 
        section.level === 'basic' || 
        expandedSections.has('intermediate-unlock') ||
        expandedSections.has('advanced-unlock')
      );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        {description && (
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        )}
        
        <div className="flex justify-center gap-2">
          <Button
            variant={showAllLevels ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllLevels(!showAllLevels)}
            className="flex items-center gap-2"
          >
            {showAllLevels ? "Modo Progressivo" : "Mostrar Tudo"}
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: expandedSections.has(section.id) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {section.title}
                      <Badge 
                        variant="secondary" 
                        className={levelColors[section.level]}
                      >
                        {levelLabels[section.level]}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </div>
              
              {/* Preview quando fechado */}
              {!expandedSections.has(section.id) && section.preview && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  {section.preview}
                </div>
              )}
            </CardHeader>
            
            <AnimatePresence>
              {expandedSections.has(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <CardContent className="border-t">
                    {section.children}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Unlock buttons para níveis avançados */}
      {!showAllLevels && (
        <div className="space-y-3">
          {!expandedSections.has('intermediate-unlock') && (
            <Card className="border-dashed border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="text-center py-6">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Recursos Intermediários
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Desbloqueie funcionalidades mais avançadas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSection('intermediate-unlock')}
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  Mostrar Recursos Intermediários
                </Button>
              </CardContent>
            </Card>
          )}

          {!expandedSections.has('advanced-unlock') && expandedSections.has('intermediate-unlock') && (
            <Card className="border-dashed border-2 border-red-200 bg-red-50">
              <CardContent className="text-center py-6">
                <h3 className="font-semibold text-red-800 mb-2">
                  Recursos Avançados
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Para usuários experientes
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSection('advanced-unlock')}
                  className="border-red-300 text-red-800 hover:bg-red-100"
                >
                  Mostrar Recursos Avançados
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};