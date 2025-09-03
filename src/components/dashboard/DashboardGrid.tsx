
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dashboard, DashboardWidget } from '@/types/dashboard';
import DraggableWidget from './DraggableWidget';

interface DashboardGridProps {
  dashboard: Dashboard;
  onUpdateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onRemoveWidget: (widgetId: string) => void;
}

export default function DashboardGrid({ dashboard, onUpdateWidget, onRemoveWidget }: DashboardGridProps) {
  const gridCols = dashboard.settings.gridSize || 12;

  return (
    <div 
      className="grid gap-4 auto-rows-min"
      style={{ 
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        minHeight: '400px'
      }}
    >
      {dashboard.widgets.map(widget => (
        <DraggableWidget
          key={widget.id}
          widget={widget}
          onUpdate={(updates) => onUpdateWidget(widget.id, updates)}
          onRemove={() => onRemoveWidget(widget.id)}
        />
      ))}
    </div>
  );
}
