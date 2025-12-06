import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schema for web vitals metrics
const webVitalsSchema = z.object({
  name: z.string().min(1).max(50),
  value: z.number().nonnegative(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  id: z.string().optional(),
  delta: z.number().optional(),
  navigationType: z.string().optional(),
});

const metricsArraySchema = z.array(webVitalsSchema);

// Allowed origins for CORS (production and development)
const ALLOWED_ORIGINS = new Set([
  'https://azuria.app.br',
  'https://www.azuria.app.br',
  'https://azuria-lab-azuria.vercel.app',
  'http://localhost:8080',
  'http://localhost:5173',
]);

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration with origin validation
  const origin = req.headers.origin || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.has(origin);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate origin for POST requests
  if (!isAllowedOrigin) {
    return res.status(403).json({ error: 'Forbidden - Invalid origin' });
  }

  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { metrics } = req.body;

    // Validate metrics array
    const validationResult = metricsArraySchema.safeParse(metrics);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid metrics data',
        details: validationResult.error.errors,
      });
    }

    // Here you would typically send this data to your analytics service
    // For now, we'll just return success
    // In production, consider: Supabase, Google Analytics, or custom analytics endpoint

    return res.status(200).json({
      success: true,
      received: validationResult.data.length,
    });
  } catch (_error) {
    // Vercel automatically logs errors in serverless functions
    // Error details are available in function logs
    return res.status(500).json({ error: 'Internal server error' });
  }
}
