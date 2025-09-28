// Runtime Environment Configuration
// Centralized environment variables management with validation

interface RuntimeEnv {
  // Database
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  DATABASE_URL?: string;
  
  // Authentication
  JWT_SECRET?: string;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  
  // Analytics & Monitoring
  GOOGLE_ANALYTICS_ID?: string;
  SENTRY_DSN?: string;
  PROMETHEUS_ENDPOINT?: string;
  
  // External APIs
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL?: string;
  API_BASE_URL?: string;
  
  // Performance
  ENABLE_PERFORMANCE_MONITORING?: string;
  LIGHTHOUSE_CI_BUDGET?: string;
  WEB_VITALS_ENDPOINT?: string;
  
  // Infrastructure
  AZURE_SUBSCRIPTION_ID?: string;
  AWS_REGION?: string;
  CDN_URL?: string;
}

// Environment variables with fallbacks
export const env: RuntimeEnv = {
  // Database
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  
  // Analytics & Monitoring
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  PROMETHEUS_ENDPOINT: process.env.PROMETHEUS_ENDPOINT,
  
  // External APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  
  // Application
  NODE_ENV: (process.env.NODE_ENV as RuntimeEnv['NODE_ENV']) || 'development',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // Performance
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING || 'true',
  LIGHTHOUSE_CI_BUDGET: process.env.LIGHTHOUSE_CI_BUDGET,
  WEB_VITALS_ENDPOINT: process.env.WEB_VITALS_ENDPOINT,
  
  // Infrastructure
  AZURE_SUBSCRIPTION_ID: process.env.AZURE_SUBSCRIPTION_ID,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
};

// Validation functions
export function assertEnv(key: keyof RuntimeEnv, value?: string): string {
  const envValue = value || env[key];
  if (!envValue) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Please check your .env file or environment configuration.`
    );
  }
  return envValue;
}

export function assertPublicEnv(key: keyof RuntimeEnv, value?: string): string {
  return assertEnv(key, value);
}

// Utility functions
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

// Database configuration
export function getSupabaseConfig() {
  return {
    url: assertPublicEnv('SUPABASE_URL'),
    anonKey: assertPublicEnv('SUPABASE_ANON_KEY'),
  };
}

// Analytics configuration
export function getAnalyticsConfig() {
  return {
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    sentryDsn: env.SENTRY_DSN,
    enableTracking: isProduction(),
  };
}

// Performance monitoring configuration
export function getPerformanceConfig() {
  return {
    enabled: env.ENABLE_PERFORMANCE_MONITORING === 'true',
    webVitalsEndpoint: env.WEB_VITALS_ENDPOINT,
    prometheusEndpoint: env.PROMETHEUS_ENDPOINT,
  };
}

// Infrastructure configuration
export function getInfrastructureConfig() {
  return {
    azureSubscriptionId: env.AZURE_SUBSCRIPTION_ID,
    awsRegion: env.AWS_REGION,
    cdnUrl: env.CDN_URL,
  };
}

// Export for backward compatibility
export { env as runtimeEnv };
export default env;