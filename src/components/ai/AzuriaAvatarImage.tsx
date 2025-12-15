/**
 * Azuria Avatar Image Component
 * 
 * Componente otimizado para exibir o avatar da Azuria
 * com suporte a diferentes formatos e tamanhos
 */

import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AzuriaAvatarImageProps extends Readonly<Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>> {
  size?: 'tiny' | 'small' | 'medium' | 'large';
  className?: string;
}

export function AzuriaAvatarImage({ 
  size = 'medium', 
  className,
  ...props 
}: Readonly<AzuriaAvatarImageProps>) {
  const sizeMap = {
    tiny: 'w-4 h-4',    // 16px
    small: 'w-8 h-8',   // 32px
    medium: 'w-12 h-12', // 48px
    large: 'w-16 h-16'  // 64px
  };

  const pixelSizes = {
    tiny: 16,
    small: 32,
    medium: 48,
    large: 64
  };

  return (
      <img
        src="/halo-ai-chat-avatar-v2.jpg"
        alt="Azuria AI"
        className={cn(
          'rounded-full',
          sizeMap[size],
          className
        )}
        width={pixelSizes[size] * 2}
        height={pixelSizes[size] * 2}
        style={{
          imageRendering: 'auto',
        }}
        loading="eager"
        decoding="async"
        {...props}
      />
  );
}
