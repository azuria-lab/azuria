-- Migration: Estender user_profiles para perfil completo estilo LinkedIn
-- Data: 2025-01-20
-- Descrição: Adiciona campos necessários para o perfil completo (bio, experiência, habilidades, links, etc.)

-- ============================================
-- 1. ADICIONAR COLUNAS À TABELA user_profiles
-- ============================================

-- Campos básicos adicionais
alter table user_profiles
  add column if not exists phone text,
  add column if not exists location text,
  add column if not exists cover_url text,
  add column if not exists bio text,
  add column if not exists title text,
  add column if not exists company text;

-- Campos JSONB para dados estruturados
alter table user_profiles
  add column if not exists experience jsonb default '[]'::jsonb,
  add column if not exists skills jsonb default '[]'::jsonb,
  add column if not exists links jsonb default '{}'::jsonb;

-- ============================================
-- 2. COMENTÁRIOS
-- ============================================

comment on column user_profiles.phone is 'Número de telefone do usuário';
comment on column user_profiles.location is 'Localização do usuário (ex: São Paulo, Brasil)';
comment on column user_profiles.cover_url is 'URL da foto de capa/banner do perfil';
comment on column user_profiles.bio is 'Biografia/sobre do usuário';
comment on column user_profiles.title is 'Cargo/título profissional';
comment on column user_profiles.company is 'Empresa atual';
comment on column user_profiles.experience is 'Array JSON com experiência profissional: [{id, position, company, startDate, endDate, current, description}]';
comment on column user_profiles.skills is 'Array JSON com habilidades: ["skill1", "skill2", ...]';
comment on column user_profiles.links is 'Objeto JSON com links: {linkedin, github, website}';

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para busca por localização
create index if not exists idx_user_profiles_location on user_profiles(location) where location is not null;

-- Índice GIN para busca em skills (array JSONB)
create index if not exists idx_user_profiles_skills_gin on user_profiles using gin(skills);

-- Índice GIN para busca em experience (array JSONB)
create index if not exists idx_user_profiles_experience_gin on user_profiles using gin(experience);

-- ============================================
-- 4. FUNÇÕES AUXILIARES (OPCIONAL)
-- ============================================

-- Função para buscar usuários por skill
create or replace function search_users_by_skill(p_skill text)
returns table (
  id uuid,
  name text,
  email text,
  avatar_url text,
  title text,
  company text
) as $$
begin
  return query
  select 
    up.id,
    up.name,
    up.email,
    up.avatar_url,
    up.title,
    up.company
  from user_profiles up
  where up.skills @> to_jsonb(p_skill)
    and up.name is not null;
end;
$$ language plpgsql security definer;

-- Função para buscar usuários por localização
create or replace function search_users_by_location(p_location text)
returns table (
  id uuid,
  name text,
  email text,
  avatar_url text,
  title text,
  company text,
  location text
) as $$
begin
  return query
  select 
    up.id,
    up.name,
    up.email,
    up.avatar_url,
    up.title,
    up.company,
    up.location
  from user_profiles up
  where up.location ilike '%' || p_location || '%'
    and up.name is not null;
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. ATUALIZAR POLÍTICAS RLS (SE NECESSÁRIO)
-- ============================================

-- Permitir que usuários vejam perfis públicos (opcional - ajustar conforme necessário)
-- Por padrão, as políticas existentes já permitem que usuários vejam seus próprios perfis
-- Se quiser permitir visualização pública, descomente:

-- drop policy if exists "Users can view public profiles" on user_profiles;
-- create policy "Users can view public profiles"
--   on user_profiles for select
--   using (true); -- Todos podem ver todos os perfis (ajustar conforme privacidade desejada)

-- ============================================
-- 6. VALIDAÇÃO DE DADOS (OPCIONAL)
-- ============================================

-- Constraint para garantir que skills seja um array
-- (PostgreSQL já valida JSONB, mas podemos adicionar check se necessário)

-- Constraint para garantir que links seja um objeto
-- (PostgreSQL já valida JSONB)

-- Constraint para garantir que experience seja um array
-- (PostgreSQL já valida JSONB)

-- ============================================
-- 7. EXEMPLO DE ESTRUTURA JSON ESPERADA
-- ============================================

/*
-- experience (array de objetos):
[
  {
    "id": "exp-1",
    "position": "Desenvolvedor Full Stack",
    "company": "Azuria",
    "startDate": "2024-01",
    "endDate": null,
    "current": true,
    "description": "Desenvolvimento de aplicações web"
  }
]

-- skills (array de strings):
["JavaScript", "TypeScript", "React", "Node.js"]

-- links (objeto):
{
  "linkedin": "https://linkedin.com/in/usuario",
  "github": "https://github.com/usuario",
  "website": "https://meusite.com"
}
*/

