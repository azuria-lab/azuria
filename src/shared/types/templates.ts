export interface CalculationTemplate {
  id: string;
  name: string;
  description: string | null;
  category: TemplateCategory;
  sector_specific_config: Record<string, unknown>;
  default_values: Record<string, unknown>;
  custom_formulas: Record<string, unknown> | null;
  image_url: string | null;
  price: number | null;
  is_premium: boolean | null;
  is_public: boolean | null;
  status: TemplateStatus | null;
  created_by: string | null;
  downloads_count: number | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory =
  | 'ecommerce'
  | 'restaurante'
  | 'servicos'
  | 'artesanal'
  | 'saas'
  | 'varejo'
  | 'industria'
  | 'consultoria'
  | 'b2b'
  | 'importacao'
  | 'outros';

export type TemplateStatus = 'draft' | 'published' | 'archived';

export interface TemplatePurchase {
  id: string;
  user_id: string;
  template_id: string;
  purchase_price: number;
  purchased_at: string;
}

export interface TemplateReview {
  id: string;
  user_id: string;
  template_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface TemplateFavorite {
  id: string;
  user_id: string;
  template_id: string;
  created_at: string;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name' | 'rating' | 'downloads' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  isPremium?: boolean;
}

export const TEMPLATE_CATEGORIES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'artesanal', label: 'Artesanal' },
  { value: 'saas', label: 'SaaS/Software' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'industria', label: 'Indústria' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'b2b', label: 'B2B Corporativo' },
  { value: 'importacao', label: 'Importação' },
  { value: 'outros', label: 'Outros' },
] as const;
