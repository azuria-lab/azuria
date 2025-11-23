/**
 * Azuria Avatar Component
 * 
 * Avatar com foto da personagem Azuria AI
 */

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AzuriaAvatarImage } from './AzuriaAvatarImage';

interface AzuriaAvatarProps {
  size?: 'tiny' | 'small' | 'medium' | 'large';
  isThinking?: boolean;
  emotion?: 'neutral' | 'happy' | 'excited' | 'analyzing';
  className?: string;
}

export function AzuriaAvatar({
  size = 'medium',
  isThinking = false,
  emotion = 'neutral',
  className,
}: Readonly<AzuriaAvatarProps>) {
  const sizeClasses = {
    tiny: 'w-4 h-4',
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', className)}>
      {/* Avatar principal com foto da personagem */}
      <motion.div
        className={cn(
          'rounded-full overflow-hidden shadow-lg flex items-center justify-center ring-2',
          sizeClasses[size],
          emotion === 'analyzing' ? 'ring-[#00C2FF]' : 'ring-[#005BFF]'
        )}
        animate={
          isThinking
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: isThinking ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <AzuriaAvatarImage 
          size={size}
          className="ring-0"
        />
      </motion.div>

      {/* Anel de pensamento */}
      <AnimatePresence>
        {isThinking && (
          <>
            <motion.div
              className={cn(
                'absolute inset-0 rounded-full border-2 border-[#00C2FF]',
                sizeClasses[size]
              )}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className={cn(
                'absolute inset-0 rounded-full border-2 border-[#005BFF]',
                sizeClasses[size]
              )}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.3,
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Partículas de energia */}
      <AnimatePresence>
        {emotion === 'excited' && (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={`energy-particle-${i}`}
                className="absolute w-1 h-1 bg-[#00C2FF] rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: [0, Math.random() * 20 - 10],
                  y: [0, -20 - Math.random() * 10],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Azuria Avatar com status text
 */
interface AzuriaAvatarWithStatusProps extends AzuriaAvatarProps {
  status?: string;
  showStatus?: boolean;
}

export function AzuriaAvatarWithStatus({
  status = 'Online',
  showStatus = true,
  ...avatarProps
}: Readonly<AzuriaAvatarWithStatusProps>) {
  return (
    <div className="flex items-center gap-3">
      <AzuriaAvatar {...avatarProps} />
      {showStatus && (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Azuria AI</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <motion.span
              className="w-2 h-2 bg-[#00C2FF] rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
