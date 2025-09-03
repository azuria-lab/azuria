
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAIChatbot } from "@/hooks/useAIChatbot";
import ChatHeader from "./chat/ChatHeader";
import ChatMessage from "./chat/ChatMessage";
import ChatInput from "./chat/ChatInput";
import TypingIndicator from "./chat/TypingIndicator";
import ChatFloatingButton from "./chat/ChatFloatingButton";
import { logger } from "@/services/logger";

interface AIChatbotProps {
  userId?: string;
  className?: string;
}

export default function AIChatbot({ userId, className = "" }: AIChatbotProps) {
  // Hooks must be called unconditionally
  const { session, isTyping, isOpen, startSession, sendMessage, closeSession, toggleChat } = useAIChatbot(userId);

  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      logger.warn('AIChatbot: scroll error', { error });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isTyping]);

  const handleSendMessage = () => {
    try {
      if (inputMessage.trim() && session) {
        sendMessage(inputMessage);
        setInputMessage("");
      }
    } catch (error) {
      logger.warn('AIChatbot: send message error', { error });
    }
  };

  const handleSuggestedAction = (action: string) => {
    try {
      if (session) {
        sendMessage(action);
      }
    } catch (error) {
      logger.warn('AIChatbot: suggested action error', { error });
    }
  };

  // Ensure a session exists when opening
  useEffect(() => {
    if (isOpen && !session) {
      startSession();
    }
  }, [isOpen, session, startSession]);

  if (!isOpen) {
    return (
      <ChatFloatingButton 
        onClick={toggleChat}
        className={className}
      />
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-96 shadow-xl border-2 border-blue-200 ${isMinimized ? 'h-16' : 'h-[600px]'} transition-all duration-300`}>
        <ChatHeader
          isMinimized={isMinimized}
          onToggleMinimize={() => setIsMinimized(!isMinimized)}
          onClose={closeSession}
        />

        {!isMinimized && (
          <CardContent className="flex flex-col h-[calc(600px-80px)] p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session?.messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onSuggestedAction={handleSuggestedAction}
                />
              ))}

              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput
              value={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              disabled={isTyping}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
