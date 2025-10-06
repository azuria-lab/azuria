import React from 'react';
import { cn } from '@/lib/utils';

interface AzuriaAIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isTyping?: boolean;
  className?: string;
}

export const AzuriaAIAvatar: React.FC<AzuriaAIAvatarProps> = ({
  size = 'md',
  isTyping = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg',
      sizeClasses[size],
      className
    )}>
      {/* Logo/Ícone da Azuria AI */}
      <div className="text-white font-bold text-xs">
        {(() => {
          if (size === 'sm') {return 'A';}
          if (size === 'md') {return 'AI';}
          return 'AZR';
        })()}
      </div>
      
      {/* Indicador de digitação */}
      {isTyping && (
        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 bg-green-500 rounded-full">
          <div className="flex space-x-0.5">
            <div className={cn(
              'bg-white rounded-full animate-bounce',
              dotSize[size]
            )} style={{ animationDelay: '0ms' }} />
            <div className={cn(
              'bg-white rounded-full animate-bounce',
              dotSize[size]
            )} style={{ animationDelay: '150ms' }} />
            <div className={cn(
              'bg-white rounded-full animate-bounce',
              dotSize[size]
            )} style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      
      {/* Pulse effect quando online */}
      {!isTyping && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse opacity-20" />
      )}
    </div>
  );
};

export default AzuriaAIAvatar;