import { memo } from 'react';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface FlowBlockNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  icon: string;
  highlight?: boolean;
  size?: 'normal' | 'large';
  onNodeClick?: (id: string) => void;
}

type FlowBlockNodeType = Node<FlowBlockNodeData, 'flowBlock'>;

function FlowBlockNode({ data, id }: NodeProps<FlowBlockNodeType>) {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[data.icon] || Icons.Circle;

  const handleClick = () => {
    if (data.onNodeClick) {
      data.onNodeClick(id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
        "hover:border-foreground/20",
        data.highlight && "border-primary/30 bg-primary/5",
        data.size === 'large' ? "min-w-[200px] p-6" : "min-w-[180px] p-5"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-border !border-2 !border-card"
      />
      
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={cn(
          "p-3 rounded-lg bg-muted/50 transition-colors",
          data.highlight && "bg-primary/10"
        )}>
          <IconComponent className={cn(
            "h-6 w-6 text-foreground/70",
            data.highlight && "text-primary"
          )} />
        </div>
        
        <div className="space-y-1">
          <h3 className={cn(
            "font-semibold text-foreground",
            data.size === 'large' ? "text-lg" : "text-base"
          )}>
            {data.label}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-border !border-2 !border-card"
      />
    </div>
  );
}

export default memo(FlowBlockNode);

