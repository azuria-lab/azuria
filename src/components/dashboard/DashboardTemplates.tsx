
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuthContext } from '@/domains/auth';
import DashboardTemplateSelector from './DashboardTemplateSelector';
import { DashboardTemplate } from '@/types/dashboard';

interface DashboardTemplatesProps {
  onClose: () => void;
}

export default function DashboardTemplates({ onClose }: DashboardTemplatesProps) {
  const { createFromTemplate, isCreating } = useDashboard();
  const { user } = useAuthContext();
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
  const [dashboardName, setDashboardName] = useState('');

  const handleSelectTemplate = (template: DashboardTemplate) => {
    setSelectedTemplate(template);
    setDashboardName(template.name);
  };

  const handleCreateDashboard = () => {
    if (!selectedTemplate || !dashboardName.trim()) {return;}
    
    createFromTemplate(selectedTemplate, dashboardName.trim());
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <DashboardTemplateSelector 
        onSelectTemplate={handleSelectTemplate}
        userPlan={user?.user_metadata?.plan || 'free'}
      />

      {/* Dashboard Name Input */}
      {selectedTemplate && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Nome do Dashboard</label>
          <Input
            placeholder="Digite um nome para seu dashboard..."
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
          />
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Template selecionado:</strong> {selectedTemplate.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedTemplate.widgets.length} widgets incluídos
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleCreateDashboard}
          disabled={!selectedTemplate || !dashboardName.trim() || isCreating}
        >
          {isCreating ? 'Criando...' : 'Criar Dashboard'}
        </Button>
      </div>
    </div>
  );
}
