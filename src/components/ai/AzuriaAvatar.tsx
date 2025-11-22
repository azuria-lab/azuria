/**
 * Azuria Avatar Component
 * 
 * Avatar animado da Azuria AI
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AzuriaAvatarProps {
  size?: 'small' | 'medium' | 'large';
  isThinking?: boolean;
  emotion?: 'neutral' | 'happy' | 'excited' | 'analyzing';
  className?: string;
}

export function AzuriaAvatar({
  size = 'medium',
  isThinking = false,
  emotion = 'neutral',
  className,
}: AzuriaAvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy':
        return 'from-green-400 to-emerald-600';
      case 'excited':
        return 'from-yellow-400 to-orange-600';
      case 'analyzing':
        return 'from-purple-400 to-blue-600';
      default:
        return 'from-blue-400 to-indigo-600';
    }
  };

  const getEmotionIcon = () => {
    switch (emotion) {
      case 'happy':
        return <Sparkles className={iconSizes[size]} />;
      case 'excited':
        return <Zap className={iconSizes[size]} />;
      case 'analyzing':
        return <Brain className={iconSizes[size]} />;
      default:
        return <TrendingUp className={iconSizes[size]} />;
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Avatar principal */}
      <motion.div
        className={cn(
          'rounded-full bg-gradient-to-br shadow-lg flex items-center justify-center text-white',
          sizeClasses[size],
          getEmotionColor()
        )}
        animate={
          isThinking
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: isThinking ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {getEmotionIcon()}
      </motion.div>

      {/* Anel de pensamento */}
      <AnimatePresence>
        {isThinking && (
          <>
            <motion.div
              className={cn(
                'absolute inset-0 rounded-full border-2 border-blue-400',
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
                'absolute inset-0 rounded-full border-2 border-purple-400',
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
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
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
}: AzuriaAvatarWithStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <AzuriaAvatar {...avatarProps} />
      {showStatus && (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">Azuria AI</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <motion.span
              className="w-2 h-2 bg-green-500 rounded-full"
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

