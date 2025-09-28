// Ambient declarations to unify Vite-style import.meta.env typing across toolchains
// This only affects TypeScript type checking and has no runtime effect.
interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly MODE?: string;
  // Allow any additional VITE_ variables
  readonly [key: string]: unknown;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
