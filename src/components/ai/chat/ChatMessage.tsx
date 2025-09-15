
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/types/ai";
import { formatTime } from "@/utils/formatTime";

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestedAction?: (action: string) => void;
}

export default function ChatMessage({ message, onSuggestedAction }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div className={`p-3 rounded-lg ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${
          message.role === 'user' ? 'text-right' : 'text-left'
        }`}>
          {formatTime(message.timestamp)}
        </div>

        {/* Suggested Actions */}
        {message.role === 'assistant' && message.metadata?.suggestedActions && onSuggestedAction && (
          <div className="mt-2 space-y-1">
            {message.metadata.suggestedActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestedAction(action)}
                className="text-xs mr-1 mb-1"
              >
                {action}
              </Button>
            ))}
          </div>
        )}

        {/* Confidence Badge */}
        {message.role === 'assistant' && message.metadata?.confidence && (
          <div className="mt-1">
            <Badge variant="outline" className="text-xs">
              {message.metadata.confidence}% confiança
            </Badge>
          </div>
        )}
      </div>
      
      {/* Avatar */}
      <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );
}
