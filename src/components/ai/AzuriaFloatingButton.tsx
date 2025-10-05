import { Brain, X } from "lucide-react";
import { AzuriaAIChat } from "@/components/ai/AzuriaAIChat";
import { useAzuriaAI } from "@/hooks/useAzuriaAI";

interface AzuriaFloatingButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showLabel?: boolean;
}

export const AzuriaFloatingButton: React.FC<AzuriaFloatingButtonProps> = ({
  className = '',
  position = 'bottom-right',
  showLabel = true
}) => {
  const { isOpen, openChat, closeChat, hasActiveSession } = useAzuriaAI();

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  const getButtonTitle = () => {
    if (isOpen) {return 'Fechar Azuria AI';}
    if (hasActiveSession) {return 'Continuar conversa';}
    return 'Abrir Azuria AI';
  };

  return (
    <>
      {/* Botão Flutuante */}
      <div className={`fixed ${positionClasses[position]} z-40 ${className}`}>
        {showLabel && !isOpen && (
          <div className="mb-2 animate-bounce">
            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium relative">
              💡 Precisa de ajuda com preços ou impostos?
              <div className="absolute -bottom-1 left-6 w-3 h-3 bg-purple-600 transform rotate-45"></div>
            </div>
          </div>
        )}
        
        <button
          onClick={isOpen ? closeChat : openChat}
          className={`
            w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
            ${isOpen ? 
              'bg-red-500 hover:bg-red-600 text-white' : 
              'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
            }
            ${hasActiveSession && !isOpen ? 'ring-4 ring-green-200 ring-opacity-50' : ''}
          `}
          title={getButtonTitle()}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <Brain className="h-6 w-6" />
              {hasActiveSession && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Modal do Chat */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6" />
                <div>
                  <h3 className="text-lg font-semibold">Azuria AI</h3>
                  <p className="text-sm opacity-90">Sua assistente inteligente para negócios</p>
                </div>
                {hasActiveSession && (
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    💚 Sessão ativa
                  </span>
                )}
              </div>
              <button
                onClick={closeChat}
                className="text-white hover:bg-white hover:bg-opacity-20 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                title="Fechar chat"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <AzuriaAIChat />
            </div>
            
            <div className="p-3 bg-gray-50 border-t text-center text-xs text-gray-500">
              💡 Dica: Pergunte sobre precificação, impostos ou concorrência para obter insights personalizados
            </div>
          </div>
        </div>
      )}
    </>
  );
};