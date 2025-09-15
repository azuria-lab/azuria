# Marketplace Context Structure

This folder splits the marketplace context into:

- MarketplaceContext.tsx: React component provider only
- MarketplaceContextBase.tsx: Context object and hook
- types.ts: Types and initial state
- actions.ts: Action creators

This separation ensures react-refresh/only-export-components rule remains satisfied.
