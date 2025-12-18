# Environment Variable Access Issue - Root Cause

## Problem

Both `GOOGLE_APPS_SCRIPT_URL` and `GEMINI_API_KEY` are failing because:

1. **Services access env vars in constructors** - When `DealsController` is instantiated, it tries to create `GeminiService` and `AppsScriptService` in the constructor
2. **Constructors run before env vars are available** - In Next.js serverless functions on AWS Amplify, environment variables may not be accessible when modules are imported/classes are instantiated
3. **Diagnose endpoint works** - Because it creates services directly in the route handler (when env vars ARE available)

## Solution Strategy

We need to make ALL services that depend on environment variables use **lazy initialization** or **runtime checks**:

### Pattern 1: Lazy Initialization (for GeminiService)
- Don't initialize in constructor
- Create getter that initializes on first access
- Check env var at initialization time (not constructor time)

### Pattern 2: Runtime Checks (for AppsScriptService)
- Constructor doesn't check env vars
- Methods check env vars when called (runtime)
- `getBaseUrl()` already does this

## Services That Need Fixing

1. ✅ **AppsScriptService** - Already fixed with runtime `getBaseUrl()` check
2. ❌ **GeminiService** - Still throws in constructor if `GEMINI_API_KEY` missing
3. ❌ **DealsController** - Creates GeminiService in constructor (needs lazy loading)

## Next Steps

1. Make GeminiService lazy-load in DealsController
2. Or make GeminiService constructor not throw, check at runtime instead
3. Ensure all env var access happens when methods are called, not when classes are instantiated

