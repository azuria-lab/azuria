/**
 * Constantes para a Calculadora Avançada
 */

import type { MarketplaceTemplate } from './types';

// Marketplace Icons Mapping - Usando emojis temporariamente
// TODO: Substituir por logos oficiais em SVG quando disponível
export const MARKETPLACE_ICONS: Record<string, string> = {
  mercadolivre: "🛒", // Mercado Livre - amarelo
  shopee: "🛍️", // Shopee - laranja
  amazon: "📦", // Amazon - marrom/dourado
  magalu: "🔵", // Magazine Luiza - azul
  custom: "🏪" // Loja Própria
};

// Marketplace Logos - URLs oficiais (placeholder para futuro)
export const MARKETPLACE_LOGOS: Record<string, string> = {
  mercadolivre: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png",
  shopee: "https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/d91264e165ed6facc6178994d5afae79.png",
  amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  magalu: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Magazine_Luiza_logo.svg",
  custom: ""
};

// Marketplace Templates
export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: "mercadolivre",
    name: "Mercado Livre",
    icon: "🛒",
    defaultFee: 16,
    includePaymentFee: false,
    shippingPolicy: "Taxa já inclusa na comissão",
    extraCommissions: ["Mercado Livre Full (+2%)", "Anúncio Premium (+1%)"],
    colors: { primary: "#FFE600", secondary: "#2D3277" }
  },
  {
    id: "shopee",
    name: "Shopee",
    icon: "🛍️",
    defaultFee: 14,
    includePaymentFee: false,
    shippingPolicy: "Frete por conta do vendedor",
    extraCommissions: ["Shopee Premium (+1.5%)"],
    colors: { primary: "#EE4D2D", secondary: "#F05F3C" }
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: "📦",
    defaultFee: 15,
    includePaymentFee: false,
    shippingPolicy: "FBA disponível",
    extraCommissions: ["Amazon Prime (+3%)", "FBA (+5%)"],
    colors: { primary: "#FF9900", secondary: "#146EB4" }
  },
  {
    id: "magalu",
    name: "Magazine Luiza",
    icon: "🔵",
    defaultFee: 18,
    includePaymentFee: false,
    shippingPolicy: "Split com marketplace",
    extraCommissions: ["Magalu Entrega (+2%)"],
    colors: { primary: "#0086FF", secondary: "#003D7A" }
  },
  {
    id: "custom",
    name: "Loja Própria / ERP",
    icon: "🏪",
    defaultFee: 0,
    includePaymentFee: true,
    shippingPolicy: "Configurável",
    extraCommissions: [],
    colors: { primary: "#8B5CF6", secondary: "#6D28D9" }
  }
];

