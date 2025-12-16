import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Resource } from '@/types/resources';
import { cn } from '@/lib/utils';

interface ResourceSelectorProps {
  resources: Resource[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ResourceSelector({ resources, selectedId, onSelect }: ResourceSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {resources.map((resource, index) => {
        const IconComponent = (Icons as Record<string, LucideIcon>)[resource.icon] || Icons.Circle;
        const isSelected = selectedId === resource.id;

        return (
          <motion.button
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => onSelect(resource.id)}
            className={cn(
              "group relative text-left p-6 rounded-xl border transition-all duration-200",
              "bg-background hover:bg-accent/50",
              "border-border hover:border-foreground/20",
              "hover:shadow-md",
              isSelected && "border-primary/50 bg-primary/5 shadow-md"
            )}
          >
            <div className="flex flex-col space-y-4">
              <div className={cn(
                "p-3 rounded-lg bg-muted/50 w-fit transition-colors",
                isSelected && "bg-primary/10"
              )}>
                <IconComponent className={cn(
                  "h-6 w-6 text-foreground/70 transition-colors",
                  isSelected && "text-primary"
                )} />
              </div>
              
              <div className="space-y-1">
                <h3 className={cn(
                  "font-semibold text-foreground transition-colors",
                  isSelected && "text-primary"
                )}>
                  {resource.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              </div>

              <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explorar fluxo
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

