
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DashboardWidget } from '@/types/dashboard';
import WidgetRenderer from './WidgetRenderer';
import WidgetConfigDialog from './WidgetConfigDialog';
import { GripVertical, Settings, X } from 'lucide-react';

interface DraggableWidgetProps {
  widget: DashboardWidget;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onRemove: () => void;
}

export default function DraggableWidget({ widget, onUpdate, onRemove }: DraggableWidgetProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.size.w}`,
    gridRow: `span ${widget.size.h}`,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`relative ${isDragging ? 'z-50' : ''} transition-all duration-200 hover:shadow-md`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Widget Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{widget.title}</CardTitle>
            
            {/* Widget Controls */}
            <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowConfig(true)}
              >
                <Settings className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={onRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Widget Content */}
        <CardContent className="pt-0">
          <WidgetRenderer widget={widget} />
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Widget</DialogTitle>
          </DialogHeader>
          <WidgetConfigDialog
            widget={widget}
            onSave={(config) => {
              onUpdate({ config });
              setShowConfig(false);
            }}
            onCancel={() => setShowConfig(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
