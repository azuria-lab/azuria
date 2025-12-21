import { useCallback, useMemo, useState } from 'react';
import {
  Background,
  ConnectionMode,
  type Edge,
  type Node,
  type NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowBlockNode from './FlowBlockNode';
import SidePanel from './SidePanel';
import { FlowBlock } from '@/types/resources';

// Tipo para os dados do node customizado
interface FlowBlockNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  icon: string;
  highlight?: boolean;
  size?: 'normal' | 'large';
  onNodeClick?: (id: string) => void;
}

// Tipo do node customizado
type FlowBlockNodeType = Node<FlowBlockNodeData, 'flowBlock'>;

// NodeTypes tipado corretamente
const nodeTypes: NodeTypes = {
  flowBlock: FlowBlockNode,
};

interface ResourceFlowProps {
  blocks: FlowBlock[];
  title: string;
  description: string;
  headerContent?: React.ReactNode;
}

export default function ResourceFlow({ blocks, title, description, headerContent }: ResourceFlowProps) {
  const [selectedBlock, setSelectedBlock] = useState<FlowBlock | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleNodeClick = useCallback((nodeId: string) => {
    const block = blocks.find((b) => b.id === nodeId);
    if (block) {
      setSelectedBlock(block);
      setIsPanelOpen(true);
    }
  }, [blocks]);

  const initialNodes: FlowBlockNodeType[] = useMemo(
    () =>
      blocks.map((block) => ({
        id: block.id,
        type: 'flowBlock' as const,
        position: block.position,
        data: {
          label: block.label,
          description: block.description,
          icon: block.icon,
          highlight: block.highlight,
          size: block.size || 'normal',
          onNodeClick: handleNodeClick,
        },
      })),
    [blocks, handleNodeClick]
  );

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (let i = 0; i < blocks.length - 1; i++) {
      edges.push({
        id: `e${i}-${i + 1}`,
        source: blocks[i].id,
        target: blocks[i + 1].id,
      });
    }
    return edges;
  }, [blocks]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedBlock(null), 300);
  }, []);

  return (
    <>
      <div className="space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
          {headerContent && (
            <div className="pt-8 flex justify-center">
              {headerContent}
            </div>
          )}
        </div>

        <div className="w-full h-[600px] bg-muted/30 dark:bg-muted/20 rounded-xl border border-border/50 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
            defaultViewport={{ x: -200, y: 100, zoom: 0.8 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            className="bg-transparent"
          >
            <Background 
              color="hsl(var(--muted-foreground) / 0.1)" 
              gap={32} 
              size={0.5} 
            />
          </ReactFlow>
        </div>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={selectedBlock?.label || ''}
        content={selectedBlock?.tooltip || ''}
      />
    </>
  );
}

