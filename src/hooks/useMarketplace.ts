import { useContext } from 'react';
import { MarketplaceContext, type MarketplaceContextType } from '../contexts/MarketplaceContext';

/**
 * Hook personalizado para acessar o contexto do marketplace
 * 
 * @returns O contexto do marketplace com todas as funcionalidades disponíveis
 * @throws Error se usado fora do MarketplaceProvider
 */
export function useMarketplace(): MarketplaceContextType {
  const context = useContext(MarketplaceContext);
  
  if (context === undefined) {
    throw new Error('useMarketplace deve ser usado dentro de um MarketplaceProvider');
  }
  
  return context;
}

export default useMarketplace;