
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  X
} from "lucide-react";

interface ChatHeaderProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
}

export default function ChatHeader({ isMinimized, onToggleMinimize, onClose }: ChatHeaderProps) {
  return (
    <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          Assistente IA
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="h-8 w-8 p-0 hover:bg-white/20 text-white"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
