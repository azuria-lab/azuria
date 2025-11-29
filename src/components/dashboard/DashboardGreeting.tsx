import React from 'react';
import { useAuthContext } from '@/domains/auth';

/**
 * Retorna a saudação apropriada baseada no horário
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

/**
 * Retorna uma mensagem motivacional aleatória
 */
function getMotivationalMessage(): string {
  const messages = [
    'Pronto para otimizar seus preços hoje?',
    'Vamos aumentar sua margem de lucro!',
    'Hora de tomar decisões estratégicas.',
    'Seus dados estão esperando por você.',
    'Vamos impulsionar seu negócio!',
    'Que tal algumas análises hoje?',
    'Preparado para maximizar resultados?',
    'Sucesso começa com boas decisões.'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

interface DashboardGreetingProps {
  showMotivation?: boolean;
}

export default function DashboardGreeting({ showMotivation = true }: Readonly<DashboardGreetingProps>) {
  const auth = useAuthContext();
  const userProfile = auth?.userProfile;
  const isLoading = auth?.isLoading;
  
  // Extrair primeiro nome do usuário
  const firstName = userProfile?.name?.split(' ')[0];
  const greeting = getGreeting();
  const motivation = getMotivationalMessage();

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          {isLoading || !firstName ? (
            // Skeleton enquanto carrega
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-64"></div>
              {showMotivation && (
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-48"></div>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                {greeting}, {firstName}!
                <span className="inline-block animate-wave text-3xl">👋</span>
              </h1>
              {showMotivation && (
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {motivation}
                </p>
              )}
            </>
          )}
        </div>
        
        {userProfile?.isPro && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <span className="text-white font-semibold text-sm">✨ Membro PRO</span>
          </div>
        )}
      </div>
      
      {/* Adicionar animação de onda para o emoji */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
