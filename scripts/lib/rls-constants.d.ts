// Type declarations for RLS governance constants.
export const RLS_TABLES: string[];
export const RLS_EXPECTED_POLICIES: Record<string, string[]>;

// Allow importing via explicit .mjs extension path used in tests.
// Support importing with extension from various relative depths by wildcard module declaration.
declare module '*.*/scripts/lib/rls-constants.mjs' {
	export const RLS_TABLES: string[];
	export const RLS_EXPECTED_POLICIES: Record<string, string[]>;
}

// Specific relative import used in tests
declare module '../../../scripts/lib/rls-constants.mjs' {
	export const RLS_TABLES: string[];
	export const RLS_EXPECTED_POLICIES: Record<string, string[]>;
}
