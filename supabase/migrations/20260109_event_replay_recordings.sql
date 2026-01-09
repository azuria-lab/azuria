-- ═══════════════════════════════════════════════════════════════════════════════
-- EVENT REPLAY RECORDINGS - Persistência de Gravações do Sistema Cognitivo
-- ═══════════════════════════════════════════════════════════════════════════════
-- Data: 2026-01-09
-- Propósito: Armazenar gravações de eventos para replay e análise posterior
-- ═══════════════════════════════════════════════════════════════════════════════

-- Tabela principal de recordings
CREATE TABLE IF NOT EXISTS public.event_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Untitled Recording',
    description TEXT,
    
    -- Metadata
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_ms INTEGER,
    event_count INTEGER DEFAULT 0,
    
    -- Filtros usados na gravação
    event_types TEXT[] DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('recording', 'completed', 'archived')),
    
    -- Quem gravou
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de eventos individuais da gravação
CREATE TABLE IF NOT EXISTS public.event_recording_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES public.event_recordings(id) ON DELETE CASCADE,
    
    -- Dados do evento
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL,
    relative_time_ms INTEGER NOT NULL DEFAULT 0,
    
    -- Índice para ordenação
    sequence_number INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de alertas persistidos
CREATE TABLE IF NOT EXISTS public.cognitive_alerts_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    
    -- Detalhes do alerta
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL,
    operator TEXT NOT NULL,
    message TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    
    -- Timestamps
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_event_recordings_session ON public.event_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_event_recordings_status ON public.event_recordings(status);
CREATE INDEX IF NOT EXISTS idx_event_recordings_created_by ON public.event_recordings(created_by);
CREATE INDEX IF NOT EXISTS idx_event_recordings_created_at ON public.event_recordings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_recording_items_recording ON public.event_recording_items(recording_id);
CREATE INDEX IF NOT EXISTS idx_event_recording_items_type ON public.event_recording_items(event_type);
CREATE INDEX IF NOT EXISTS idx_event_recording_items_sequence ON public.event_recording_items(recording_id, sequence_number);

CREATE INDEX IF NOT EXISTS idx_cognitive_alerts_history_status ON public.cognitive_alerts_history(status);
CREATE INDEX IF NOT EXISTS idx_cognitive_alerts_history_severity ON public.cognitive_alerts_history(severity);
CREATE INDEX IF NOT EXISTS idx_cognitive_alerts_history_triggered ON public.cognitive_alerts_history(triggered_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_event_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_event_recordings_updated_at ON public.event_recordings;
CREATE TRIGGER trigger_event_recordings_updated_at
    BEFORE UPDATE ON public.event_recordings
    FOR EACH ROW
    EXECUTE FUNCTION update_event_recordings_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES - Apenas admins podem acessar
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.event_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_recording_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_alerts_history ENABLE ROW LEVEL SECURITY;

-- Policy: Admins podem fazer tudo
CREATE POLICY "Admins can manage event_recordings"
    ON public.event_recordings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR is_owner = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR is_owner = true)
        )
    );

CREATE POLICY "Admins can manage event_recording_items"
    ON public.event_recording_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR is_owner = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR is_owner = true)
        )
    );

CREATE POLICY "Admins can manage cognitive_alerts_history"
    ON public.cognitive_alerts_history
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR is_owner = true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND (is_admin = true OR is_owner = true)
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMENTÁRIOS
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.event_recordings IS 'Gravações de eventos do sistema cognitivo para replay e análise';
COMMENT ON TABLE public.event_recording_items IS 'Eventos individuais de uma gravação';
COMMENT ON TABLE public.cognitive_alerts_history IS 'Histórico de alertas do sistema cognitivo';
