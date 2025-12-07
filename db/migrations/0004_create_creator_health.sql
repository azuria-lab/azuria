CREATE TABLE IF NOT EXISTS creator_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  health TEXT NOT NULL,
  latency_ms NUMERIC,
  error_rate NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);


