// Centralized branding and domain configuration for Azuria.
// If the final production domain changes (e.g., azuria.app not available),
// update only this file + env variables instead of scattering replacements.

export interface BrandingConfig {
  productName: string;
  shortName: string;
  legalName: string;
  primaryDomain: string;            // Main marketing/app domain
  apiBaseUrlV1: string;             // Current API base (versioned)
  apiBaseUrlV2: string;
  supportEmail: string;
  adminEmails: string[];
  storageNamespace: string;         // localStorage / indexedDB prefix
  pdfPrefix: string;                // Prefix for generated PDF filenames
  attributionFooter: string;        // Footer text for reports / PDFs
  featureFlagsEnvPrefix: string;    // Prefix for feature flags variables
}

// Environment overrides allow quick domain swap if azuria.app is not available yet.
const ENV_DOMAIN = import.meta.env.VITE_APP_DOMAIN as string | undefined; // e.g. "azuria.app"
const ENV_API_V1 = import.meta.env.VITE_API_BASE_V1 as string | undefined;
const ENV_API_V2 = import.meta.env.VITE_API_BASE_V2 as string | undefined;
const ENV_SUPPORT = import.meta.env.VITE_SUPPORT_EMAIL as string | undefined;

export const BRANDING: BrandingConfig = {
  productName: 'Azuria',
  shortName: 'Azuria',
  legalName: 'Azuria',
  primaryDomain: ENV_DOMAIN || 'azuria.app',
  apiBaseUrlV1: ENV_API_V1 || 'https://api.azuria.app/v1',
  apiBaseUrlV2: ENV_API_V2 || 'https://api.azuria.app/v2',
  supportEmail: ENV_SUPPORT || 'suporte@azuria.app',
  adminEmails: [
    'admin@azuria.com',
    'support@azuria.com'
  ],
  storageNamespace: 'azuria',
  pdfPrefix: 'Azuria',
  attributionFooter: '© Azuria - Documento gerado automaticamente',
  featureFlagsEnvPrefix: 'VITE_FLAG_' // e.g. VITE_FLAG_NEW_DASHBOARD
};

export const getApiBase = (version: 1 | 2 = 2) => version === 1 ? BRANDING.apiBaseUrlV1 : BRANDING.apiBaseUrlV2;

export const buildPdfFileName = (base: string) =>
  `${BRANDING.pdfPrefix}_${base}`;
