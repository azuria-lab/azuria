/**
 * Azuria Bubble
 * 
 * Ícone flutuante da Azuria AI que aparece no canto inferior direito.
 * Mostra badge de notificação quando há insights novos.
 */

import React, { useEffect, useState } from 'react';
import { on } from '../core/eventBus';

export interface AzuriaBubbleProps {
  onOpen?: () => void;
  hasNotifications?: boolean;
  notificationCount?: number;
  status?: 'online' | 'processing' | 'offline';
}

export const AzuriaBubble: React.FC<AzuriaBubbleProps> = ({
  onOpen,
  hasNotifications: initialNotifications = false,
  notificationCount: initialCount = 0,
  status = 'online',
}) => {
  const [hasNotifications, setHasNotifications] = useState(initialNotifications);
  const [notificationCount, setNotificationCount] = useState(initialCount);
  const [isPulsing, setIsPulsing] = useState(false);

  // Escutar eventos de insights gerados
  useEffect(() => {
    const subscriptionId = on('insight:generated', () => {
      setHasNotifications(true);
      setNotificationCount((prev) => prev + 1);
      setIsPulsing(true);
      
      // Parar pulsação após 3 segundos
      setTimeout(() => setIsPulsing(false), 3000);
    });

    return () => {
      // Cleanup subscription
    };
  }, []);

  const handleClick = () => {
    setHasNotifications(false);
    setNotificationCount(0);
    setIsPulsing(false);
    onOpen?.();
  };

  const statusColors = {
    online: 'bg-green-500',
    processing: 'bg-yellow-500 animate-pulse',
    offline: 'bg-gray-400',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className={`
          relative group
          w-16 h-16 rounded-full
          bg-gradient-to-br from-cyan-500 to-blue-600
          shadow-lg hover:shadow-xl
          transition-all duration-300
          hover:scale-110
          ${isPulsing ? 'animate-bounce' : ''}
        `}
        aria-label="Abrir Azuria AI"
      >
        {/* Avatar da Azuria */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* Status indicator */}
        <div
          className={`
            absolute bottom-1 right-1
            w-3 h-3 rounded-full
            border-2 border-white
            ${statusColors[status]}
          `}
        />

        {/* Notification badge */}
        {hasNotifications && notificationCount > 0 && (
          <div
            className="
              absolute -top-1 -right-1
              min-w-[20px] h-5 px-1
              flex items-center justify-center
              bg-red-500 text-white
              text-xs font-bold
              rounded-full
              border-2 border-white
              animate-pulse
            "
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}

        {/* Hover tooltip */}
        <div
          className="
            absolute bottom-full right-0 mb-2
            px-3 py-1
            bg-gray-900 text-white text-sm
            rounded-lg
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            whitespace-nowrap
            pointer-events-none
          "
        >
          Azuria AI
        </div>
      </button>

      {/* Ripple effect on pulse */}
      {isPulsing && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-75 animate-ping" />
        </div>
      )}
    </div>
  );
};

export default AzuriaBubble;
