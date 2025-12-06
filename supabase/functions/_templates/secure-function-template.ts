/**
 * Template for Secure Edge Function
 *
 * Use this template when creating new Edge Functions to ensure
 * security best practices are followed from the start.
 */

/// <reference types="https://deno.land/x/deno/cli/tsc/dts/lib.deno.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { withSecurityMiddleware } from '../_shared/security-config.ts';

// Main handler function
async function handleRequest(req: Request): Promise<Response> {
  // 1. Authentication (if required)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Unauthorized');
  }

  // 2. Parse and validate input
  const body = await req.json();

  // TODO: Add Zod validation
  // const schema = z.object({ ... });
  // const data = schema.parse(body);

  // 3. Create Supabase client (if needed)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 4. Your business logic here
  // ...

  // 5. Return response
  return new Response(
    JSON.stringify({
      success: true,
      data: {}, // Your data here
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Wrap handler with security middleware and serve
// Options:
// - allowCredentials: true (for authenticated endpoints)
// - allowCredentials: false (for public endpoints)
Deno.serve(withSecurityMiddleware(handleRequest, { allowCredentials: true }));
