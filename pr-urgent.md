## CRITICAL FIX - prebuild not working

### Issue
Despite PR #33 adding prebuild script, Vercel is NOT executing it.

Build logs show:
- npm install ✅
- vite build ✅  
- prebuild ❌ (missing!)

### Root Cause
Vercel ignores npm prebuild hooks when using cached builds.

### Solution
Move cleanup to buildCommand in vercel.json:
```json
{
  "buildCommand": "rm -rf dist && npm run build"
}
```

### Why This Will Work
- buildCommand runs FIRST, always
- Cannot be cached or skipped
- Shell command deletes dist/ before build
- Forces fresh compilation

### Expected Result
- dist/ deleted before build
- New hashes generated
- Correct chunks served
- Site works!

---

**MERGE IMMEDIATELY - Production down for 3 days**
