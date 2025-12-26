import { 
  Database, 
  Package, 
  ShoppingCart, 
  Store 
} from 'lucide-react';

export interface AdvancedTemplate {
  icon: typeof Database;
  name: string;
  description: string;
  badge?: string;
  variant: 'integration' | 'marketplace';
  onClick: () => void;
}

export const ERP_INTEGRATIONS: AdvancedTemplate[] = [
  {
    icon: Database,
    name: 'Bling ERP',
    description: 'Conecte seus produtos e precifique com inteligência.',
    badge: 'Em breve',
    variant: 'integration',
    onClick: () => {
      // TODO: Implementar integração Bling
      // eslint-disable-next-line no-console
      console.log('Conectar Bling ERP');
    },
  },
];

export const MARKETPLACE_TEMPLATES: AdvancedTemplate[] = [
  {
    icon: ShoppingCart,
    name: 'Mercado Livre',
    description: 'Comissão, taxa fixa, frete médio e impostos já configurados.',
    variant: 'marketplace',
    onClick: () => {
      // TODO: Aplicar template Mercado Livre
      // eslint-disable-next-line no-console
      console.log('Aplicar template Mercado Livre');
    },
  },
  {
    icon: Package,
    name: 'Shopee',
    description: 'Taxas e comissões otimizadas para vendas na Shopee.',
    variant: 'marketplace',
    onClick: () => {
      // TODO: Aplicar template Shopee
      // eslint-disable-next-line no-console
      console.log('Aplicar template Shopee');
    },
  },
  {
    icon: Store,
    name: 'Amazon',
    description: 'Configuração completa para vendas na Amazon Brasil.',
    variant: 'marketplace',
    onClick: () => {
      // TODO: Aplicar template Amazon
      // eslint-disable-next-line no-console
      console.log('Aplicar template Amazon');
    },
  },
];

