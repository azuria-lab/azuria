/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONSCIOUSNESS STATUS - Indicador de Status do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Componente compacto que mostra o status do Modo Deus e permite
 * controlar silêncio.
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Activity,
  Bell,
  BellOff,
  Brain,
  Crown,
  Shield,
} from 'lucide-react';
import { useConsciousnessContext } from '../ConsciousnessProvider';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface ConsciousnessStatusProps {
  /** Se deve mostrar versão compacta */
  compact?: boolean;
  /** Posição */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

export const ConsciousnessStatus: React.FC<ConsciousnessStatusProps> = ({
  compact = false,
  position = 'inline',
}) => {
  const [expanded, setExpanded] = useState(false);
  const {
    initialized,
    loading,
    silenced,
    userRole,
    userTier: _userTier,
    activeMessages,
    requestSilence,
    disableSilence,
    clearMessages,
  } = useConsciousnessContext();
  
  // Status color
  const getStatusColor = () => {
    if (loading) {
      return 'text-amber-400';
    }
    if (!initialized) {
      return 'text-slate-500';
    }
    if (silenced) {
      return 'text-slate-400';
    }
    return 'text-cyan-400';
  };
  
  const getStatusPulse = () => {
    if (loading) {return 'animate-pulse';}
    if (!initialized) {return '';}
    if (silenced) {return '';}
    return 'animate-pulse';
  };
  
  // Tier badge
  const getTierBadge = () => {
    switch (userTier) {
      case 'ENTERPRISE':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded">
            ENTERPRISE
          </span>
        );
      case 'PRO':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded">
            PRO
          </span>
        );
      default:
        return null;
    }
  };
  
  // Position classes
  const getPositionClasses = () => {
    if (position === 'inline') {return '';}
    
    const positions = {
      'top-left': 'fixed top-4 left-4',
      'top-right': 'fixed top-4 right-4',
      'bottom-left': 'fixed bottom-4 left-4',
      'bottom-right': 'fixed bottom-4 right-4',
    };
    
    return positions[position];
  };
  
  // Versão compacta
  if (compact) {
    return (
      <div className={`${getPositionClasses()} z-40`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl
            bg-slate-800/80 backdrop-blur-xl border border-slate-700/50
            hover:bg-slate-700/80 transition-all
            ${getStatusColor()}
          `}
        >
          <Brain className={`w-4 h-4 ${getStatusPulse()}`} />
          {activeMessages.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-cyan-500 text-white rounded-full">
              {activeMessages.length}
            </span>
          )}
          {silenced && <BellOff className="w-3 h-3 text-slate-500" />}
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-64 p-4 rounded-xl
                         bg-slate-800/95 backdrop-blur-xl border border-slate-700/50
                         shadow-2xl shadow-black/40"
            >
              <StatusContent 
                initialized={initialized}
                loading={loading}
                silenced={silenced}
                userRole={userRole}
                userTier={userTier}
                activeMessages={activeMessages}
                requestSilence={requestSilence}
                disableSilence={disableSilence}
                clearMessages={clearMessages}
                getTierBadge={getTierBadge}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Versão completa
  return (
    <div className={`${getPositionClasses()} z-40`}>
      <div className="p-4 rounded-xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 w-72">
        <StatusContent 
          initialized={initialized}
          loading={loading}
          silenced={silenced}
          userRole={userRole}
          userTier={userTier}
          activeMessages={activeMessages}
          requestSilence={requestSilence}
          disableSilence={disableSilence}
          clearMessages={clearMessages}
          getTierBadge={getTierBadge}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEÚDO DO STATUS
// ═══════════════════════════════════════════════════════════════════════════════

interface StatusContentProps {
  initialized: boolean;
  loading: boolean;
  silenced: boolean;
  userRole: string;
  userTier: string;
  activeMessages: unknown[];
  requestSilence: (duration?: number) => void;
  disableSilence: () => void;
  clearMessages: () => void;
  getTierBadge: () => React.ReactNode;
}

const StatusContent: React.FC<StatusContentProps> = ({
  initialized,
  loading,
  silenced,
  userRole,
  userTier: _userTier,
  activeMessages,
  requestSilence,
  disableSilence,
  clearMessages,
  getTierBadge,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 ${initialized ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="font-semibold text-white">Modo Deus</span>
        </div>
        {getTierBadge()}
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          loading ? 'bg-amber-400 animate-pulse' :
          !initialized ? 'bg-slate-500' :
          silenced ? 'bg-slate-400' :
          'bg-cyan-400 animate-pulse'
        }`} />
        <span className="text-slate-300">
          {loading ? 'Inicializando...' :
           !initialized ? 'Offline' :
           silenced ? 'Silenciado' :
           'Ativo'}
        </span>
      </div>
      
      {/* Role Badge */}
      {userRole === 'ADMIN' && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-200 font-medium">Modo Administrador</span>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-700/50 rounded-lg">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">{activeMessages.length} mensagens</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-700/50 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Anti-spam</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => silenced ? disableSilence() : requestSilence(300000)}
          disabled={!initialized}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
            text-xs font-medium transition-all
            ${silenced 
              ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30' 
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {silenced ? (
            <>
              <Bell className="w-3.5 h-3.5" />
              Ativar
            </>
          ) : (
            <>
              <BellOff className="w-3.5 h-3.5" />
              Silenciar
            </>
          )}
        </button>
        
        {activeMessages.length > 0 && (
          <button
            onClick={clearMessages}
            className="px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 
                       hover:bg-slate-600/50 text-xs font-medium transition-all"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
};

export default ConsciousnessStatus;

