## Issue

Users experiencing blank page even after MIME type fix (PR #28) due to browser/CDN caching the old broken version.

### Problems Identified

1. **Aggressive HTML caching**
   - index.html cached by CDN/browser
   - Users stuck with old broken version
   - No automatic revalidation

2. **Console warnings**
   - Unused preload resources
   - Image preloaded but not used immediately

### Changes

#### 1. Force HTML Revalidation
```json
{
  "source": "/index.html",
  "headers": [{
    "key": "Cache-Control",
    "value": "no-cache, no-store, must-revalidate"
  }]
}
```

#### 2. Remove Unused Preload
```diff
- <link rel="preload" as="image" href="/lovable-uploads/..." />
```

### Impact

✅ Users always get fresh HTML entry point  
✅ No stale cache issues  
✅ Clean console (no preload warnings)  
✅ Assets still cached (31536000s immutable)  

### Testing

**Before:**
- Blank page for users with cached version
- Console warnings about preload

**After:**
- Fresh HTML on every visit
- Assets loaded correctly
- Clean console

---

**Priority:** HIGH - Users still experiencing issues  
**Related:** #28
