-- Criar tabela team_tasks
CREATE TABLE IF NOT EXISTS public.team_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID[],
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    tags TEXT[],
    checklist JSONB,
    attachments TEXT[]
);

-- Habilitar RLS
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso a membros da equipe
CREATE POLICY "Allow all access for team members"
ON public.team_tasks FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.team_members
        WHERE team_members.team_id = team_tasks.team_id
        AND team_members.user_id = auth.uid()
    )
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_team_tasks_team_id ON public.team_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_created_by ON public.team_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON public.team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_team_tasks_priority ON public.team_tasks(priority);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_tasks_updated_at BEFORE UPDATE ON public.team_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
