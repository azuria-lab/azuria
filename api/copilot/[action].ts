import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

/* eslint-disable no-console */

// ============================================================================
// Types & Validation
// ============================================================================

const suggestionSchema = z.object({
  user_id: z.string().uuid(),
  suggestion_id: z.string(),
  type: z.enum(['hint', 'explanation', 'warning', 'opportunity', 'correction', 'optimization', 'tutorial', 'proactive']),
  category: z.enum(['calculation', 'pricing', 'tax', 'bidding', 'navigation', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().max(200),
  message: z.string().max(1000),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['primary', 'secondary', 'dismiss']),
  })).optional(),
  metadata: z.record(z.unknown()).optional(),
  context: z.record(z.unknown()).optional(),
  screen: z.string().optional(),
});

const updateStatusSchema = z.object({
  suggestion_id: z.string(),
  status: z.enum(['pending', 'shown', 'accepted', 'dismissed', 'expired', 'completed']),
});

const feedbackSchema = z.object({
  suggestion_id: z.string().uuid(),
  user_id: z.string().uuid(),
  feedback_type: z.enum(['helpful', 'not_helpful', 'too_frequent', 'wrong_timing', 'confusing', 'other']),
  comment: z.string().max(500).optional(),
  context: z.record(z.unknown()).optional(),
});

// ============================================================================
// CORS Configuration
// ============================================================================

const ALLOWED_ORIGINS = new Set([
  'https://azuria.app.br',
  'https://www.azuria.app.br',
  'https://azuria-lab-azuria.vercel.app',
  'http://localhost:8080',
  'http://localhost:5173',
]);

function setCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin || '';
  const isAllowedOrigin = ALLOWED_ORIGINS.has(origin);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

  return isAllowedOrigin;
}

// ============================================================================
// Supabase Client
// ============================================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// ============================================================================
// Handler
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isAllowedOrigin = setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isAllowedOrigin) {
    return res.status(403).json({ error: 'Forbidden - Invalid origin' });
  }

  const { action } = req.query;

  try {
    const supabase = getSupabaseClient();

    switch (req.method) {
      case 'GET': {
        // GET /api/copilot/suggestions?user_id=xxx&status=pending
        if (action === 'suggestions') {
          const { user_id, status, limit = '10' } = req.query;

          if (!user_id || typeof user_id !== 'string') {
            return res.status(400).json({ error: 'user_id is required' });
          }

          let query = supabase
            .from('user_suggestions')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit as string, 10));

          if (status && typeof status === 'string') {
            query = query.eq('status', status);
          }

          const { data, error } = await query;

          if (error) {
            console.error('Error fetching suggestions:', error);
            return res.status(500).json({ error: 'Failed to fetch suggestions' });
          }

          return res.status(200).json({ suggestions: data });
        }

        // GET /api/copilot/metrics?user_id=xxx
        if (action === 'metrics') {
          const { user_id } = req.query;

          if (!user_id || typeof user_id !== 'string') {
            return res.status(400).json({ error: 'user_id is required' });
          }

          const { data: suggestions, error: sugError } = await supabase
            .from('user_suggestions')
            .select('status')
            .eq('user_id', user_id);

          if (sugError) {
            console.error('Error fetching metrics:', sugError);
            return res.status(500).json({ error: 'Failed to fetch metrics' });
          }

          const metrics = {
            total: suggestions?.length || 0,
            pending: suggestions?.filter(s => s.status === 'pending').length || 0,
            shown: suggestions?.filter(s => s.status === 'shown').length || 0,
            accepted: suggestions?.filter(s => s.status === 'accepted').length || 0,
            dismissed: suggestions?.filter(s => s.status === 'dismissed').length || 0,
            expired: suggestions?.filter(s => s.status === 'expired').length || 0,
          };

          return res.status(200).json({ metrics });
        }

        return res.status(400).json({ error: 'Invalid action' });
      }

      case 'POST': {
        // POST /api/copilot/suggestions - Create suggestion
        if (action === 'suggestions') {
          const validation = suggestionSchema.safeParse(req.body);

          if (!validation.success) {
            return res.status(400).json({ 
              error: 'Validation failed', 
              details: validation.error.errors 
            });
          }

          const { data, error } = await supabase
            .from('user_suggestions')
            .insert({
              ...validation.data,
              status: 'pending',
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating suggestion:', error);
            return res.status(500).json({ error: 'Failed to create suggestion' });
          }

          return res.status(201).json({ suggestion: data });
        }

        // POST /api/copilot/feedback - Record feedback
        if (action === 'feedback') {
          const validation = feedbackSchema.safeParse(req.body);

          if (!validation.success) {
            return res.status(400).json({ 
              error: 'Validation failed', 
              details: validation.error.errors 
            });
          }

          const { data, error } = await supabase
            .from('suggestion_feedback')
            .insert({
              ...validation.data,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error('Error recording feedback:', error);
            return res.status(500).json({ error: 'Failed to record feedback' });
          }

          return res.status(201).json({ feedback: data });
        }

        return res.status(400).json({ error: 'Invalid action' });
      }

      case 'PUT': {
        // PUT /api/copilot/suggestions - Update status
        if (action === 'suggestions') {
          const validation = updateStatusSchema.safeParse(req.body);

          if (!validation.success) {
            return res.status(400).json({ 
              error: 'Validation failed', 
              details: validation.error.errors 
            });
          }

          const updateData: Record<string, unknown> = {
            status: validation.data.status,
          };

          // Add timestamp based on status
          if (validation.data.status === 'shown') {
            updateData.shown_at = new Date().toISOString();
          } else if (['accepted', 'dismissed', 'expired', 'completed'].includes(validation.data.status)) {
            updateData.responded_at = new Date().toISOString();
          }

          const { data, error } = await supabase
            .from('user_suggestions')
            .update(updateData)
            .eq('id', validation.data.suggestion_id)
            .select()
            .single();

          if (error) {
            console.error('Error updating suggestion:', error);
            return res.status(500).json({ error: 'Failed to update suggestion' });
          }

          return res.status(200).json({ suggestion: data });
        }

        return res.status(400).json({ error: 'Invalid action' });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
