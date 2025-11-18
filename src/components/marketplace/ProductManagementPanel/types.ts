/**
 * Tipos para o Painel de Gestão de Produtos
 */

export interface ProductManagementPanelProps {
  onProductSelect?: (product: import('@/types/product-management').Product) => void;
}

export type ViewMode = 'grid' | 'list';

