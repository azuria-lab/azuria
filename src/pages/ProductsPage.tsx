/**
 * Products Page
 * 
 * Página de gestão de produtos
 */

import Layout from '@/components/layout/Layout';
import ProductManagementPanel from '@/components/marketplace/ProductManagementPanel';
import type { Product } from '@/types/product-management';

export default function ProductsPage() {
  const handleProductSelect = (_product: Product) => {
    // Modal de edição será implementado em próxima fase
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <ProductManagementPanel onProductSelect={handleProductSelect} />
      </div>
    </Layout>
  );
}
