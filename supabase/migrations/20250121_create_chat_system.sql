-- Migration: Sistema de Chat Completo
-- Data: 2025-01-20
-- Descrição: Cria todas as tabelas, funções e políticas necessárias para o sistema de chat estilo WhatsApp

-- ============================================
-- 1. ENUMS
-- ============================================

-- Status de entrega/leitura de mensagens
create type message_delivery_status as enum ('pending', 'sent', 'delivered', 'read');

-- Status de usuário (online, ausente, offline)
create type user_status_type as enum ('online', 'away', 'offline');

-- ============================================
-- 2. TABELAS
-- ============================================

-- Tabela de salas de chat (rooms)
create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  is_group boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_message_id uuid,
  last_message_text text
);

-- Tabela de membros das salas
create table if not exists chat_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  is_muted boolean not null default false,
  is_archived boolean not null default false,
  unique(room_id, user_id)
);

-- Tabela de mensagens
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  status message_delivery_status not null default 'pending',
  reply_to_id uuid references chat_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

-- Tabela de leitura de mensagens (para controle de "lida")
create table if not exists chat_message_reads (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references chat_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  unique(message_id, user_id)
);

-- Tabela de status de usuários
create table if not exists user_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status user_status_type not null default 'offline',
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 3. ÍNDICES
-- ============================================

-- Índices para performance
create index if not exists idx_chat_rooms_created_by on chat_rooms(created_by);
create index if not exists idx_chat_rooms_last_message_at on chat_rooms(last_message_at desc);
create index if not exists idx_chat_room_members_room_id on chat_room_members(room_id);
create index if not exists idx_chat_room_members_user_id on chat_room_members(user_id);
create index if not exists idx_chat_messages_room_id on chat_messages(room_id, created_at desc);
create index if not exists idx_chat_messages_sender_id on chat_messages(sender_id);
create index if not exists idx_chat_messages_status on chat_messages(status);
create index if not exists idx_chat_message_reads_message_id on chat_message_reads(message_id);
create index if not exists idx_chat_message_reads_user_id on chat_message_reads(user_id);
create index if not exists idx_user_status_status on user_status(status);

-- ============================================
-- 4. FUNÇÕES
-- ============================================

-- Função para atualizar last_message da sala quando nova mensagem é criada
create or replace function update_chat_room_last_message()
returns trigger as $$
begin
  update chat_rooms
  set 
    last_message_at = new.created_at,
    last_message_id = new.id,
    last_message_text = new.content,
    updated_at = now()
  where id = new.room_id;
  return new;
end;
$$ language plpgsql;

-- Função para atualizar status de mensagem para "delivered" quando criada
create or replace function set_message_delivered()
returns trigger as $$
begin
  -- Marca como "sent" imediatamente
  new.status := 'sent';
  return new;
end;
$$ language plpgsql;

-- Função para contar mensagens não lidas de um usuário em uma sala
create or replace function get_unread_count(p_room_id uuid, p_user_id uuid)
returns integer as $$
declare
  v_last_read_at timestamptz;
  v_count integer;
begin
  -- Busca última leitura do usuário na sala
  select last_read_at into v_last_read_at
  from chat_room_members
  where room_id = p_room_id and user_id = p_user_id;
  
  -- Conta mensagens após última leitura (ou todas se nunca leu)
  select count(*) into v_count
  from chat_messages
  where room_id = p_room_id
    and sender_id != p_user_id
    and deleted_at is null
    and (v_last_read_at is null or created_at > v_last_read_at);
  
  return coalesce(v_count, 0);
end;
$$ language plpgsql security definer;

-- Função para atualizar last_read_at quando usuário lê mensagens
create or replace function mark_messages_as_read(p_room_id uuid, p_user_id uuid)
returns void as $$
begin
  -- Atualiza last_read_at do membro
  update chat_room_members
  set last_read_at = now()
  where room_id = p_room_id and user_id = p_user_id;
  
  -- Marca mensagens como lidas
  insert into chat_message_reads (message_id, user_id)
  select id, p_user_id
  from chat_messages
  where room_id = p_room_id
    and sender_id != p_user_id
    and deleted_at is null
    and id not in (
      select message_id from chat_message_reads where user_id = p_user_id
    )
  on conflict do nothing;
  
  -- Atualiza status das mensagens para "read"
  update chat_messages
  set status = 'read'
  where room_id = p_room_id
    and sender_id != p_user_id
    and status = 'delivered'
    and id in (
      select message_id from chat_message_reads where user_id = p_user_id
    );
end;
$$ language plpgsql security definer;

-- Função para atualizar updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- 5. TRIGGERS
-- ============================================

-- Trigger para atualizar last_message quando nova mensagem é criada
drop trigger if exists trigger_update_chat_room_last_message on chat_messages;
create trigger trigger_update_chat_room_last_message
  after insert on chat_messages
  for each row
  execute function update_chat_room_last_message();

-- Trigger para atualizar updated_at em chat_rooms
drop trigger if exists trigger_update_chat_rooms_updated_at on chat_rooms;
create trigger trigger_update_chat_rooms_updated_at
  before update on chat_rooms
  for each row
  execute function update_updated_at_column();

-- Trigger para atualizar updated_at em chat_messages
drop trigger if exists trigger_update_chat_messages_updated_at on chat_messages;
create trigger trigger_update_chat_messages_updated_at
  before update on chat_messages
  for each row
  execute function update_updated_at_column();

-- Trigger para atualizar updated_at em user_status
drop trigger if exists trigger_update_user_status_updated_at on user_status;
create trigger trigger_update_user_status_updated_at
  before update on user_status
  for each row
  execute function update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
alter table chat_rooms enable row level security;
alter table chat_room_members enable row level security;
alter table chat_messages enable row level security;
alter table chat_message_reads enable row level security;
alter table user_status enable row level security;

-- Políticas para chat_rooms
-- Usuários podem ver salas que são membros
create policy "Users can view rooms they are members of"
  on chat_rooms for select
  using (
    exists (
      select 1 from chat_room_members
      where room_id = chat_rooms.id
        and user_id = auth.uid()
    )
  );

-- Usuários podem criar salas
create policy "Users can create rooms"
  on chat_rooms for insert
  with check (created_by = auth.uid());

-- Usuários podem atualizar salas que criaram ou são admin
create policy "Users can update rooms they created or are admin"
  on chat_rooms for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from chat_room_members
      where room_id = chat_rooms.id
        and user_id = auth.uid()
        and role = 'admin'
    )
  );

-- Políticas para chat_room_members
-- Usuários podem ver membros de salas que participam
create policy "Users can view members of rooms they belong to"
  on chat_room_members for select
  using (
    exists (
      select 1 from chat_room_members crm
      where crm.room_id = chat_room_members.room_id
        and crm.user_id = auth.uid()
    )
  );

-- Usuários podem adicionar membros em salas que criaram ou são admin
create policy "Users can add members to rooms they created or are admin"
  on chat_room_members for insert
  with check (
    exists (
      select 1 from chat_rooms
      where id = chat_room_members.room_id
        and (created_by = auth.uid() or exists (
          select 1 from chat_room_members crm
          where crm.room_id = chat_rooms.id
            and crm.user_id = auth.uid()
            and crm.role = 'admin'
        ))
    )
  );

-- Usuários podem atualizar seu próprio status de membro
create policy "Users can update their own member status"
  on chat_room_members for update
  using (user_id = auth.uid());

-- Políticas para chat_messages
-- Usuários podem ver mensagens de salas que são membros
create policy "Users can view messages from rooms they belong to"
  on chat_messages for select
  using (
    deleted_at is null
    and exists (
      select 1 from chat_room_members
      where room_id = chat_messages.room_id
        and user_id = auth.uid()
    )
  );

-- Usuários podem criar mensagens em salas que são membros
create policy "Users can create messages in rooms they belong to"
  on chat_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from chat_room_members
      where room_id = chat_messages.room_id
        and user_id = auth.uid()
    )
  );

-- Usuários podem atualizar suas próprias mensagens
create policy "Users can update their own messages"
  on chat_messages for update
  using (sender_id = auth.uid());

-- Políticas para chat_message_reads
-- Usuários podem ver leituras de mensagens de salas que participam
create policy "Users can view reads from rooms they belong to"
  on chat_message_reads for select
  using (
    exists (
      select 1 from chat_room_members
      where room_id = (select room_id from chat_messages where id = chat_message_reads.message_id)
        and user_id = auth.uid()
    )
  );

-- Usuários podem criar leituras de mensagens de salas que participam
create policy "Users can create reads for messages in rooms they belong to"
  on chat_message_reads for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from chat_room_members
      where room_id = (select room_id from chat_messages where id = chat_message_reads.message_id)
        and user_id = auth.uid()
    )
  );

-- Políticas para user_status
-- Usuários podem ver status de todos os usuários
create policy "Users can view all user statuses"
  on user_status for select
  using (true);

-- Usuários podem atualizar apenas seu próprio status
create policy "Users can update their own status"
  on user_status for update
  using (user_id = auth.uid());

-- Usuários podem inserir apenas seu próprio status
create policy "Users can insert their own status"
  on user_status for insert
  with check (user_id = auth.uid());

-- ============================================
-- 7. DADOS INICIAIS (SEED)
-- ============================================

-- Criar sala padrão "Chat do Time" para cada time existente
-- (Esta parte pode ser adaptada conforme necessário)

-- ============================================
-- 8. COMENTÁRIOS
-- ============================================

comment on table chat_rooms is 'Salas de chat (grupos e conversas privadas)';
comment on table chat_room_members is 'Membros das salas de chat';
comment on table chat_messages is 'Mensagens enviadas nas salas';
comment on table chat_message_reads is 'Controle de leitura de mensagens';
comment on table user_status is 'Status online/offline dos usuários';

comment on function get_unread_count is 'Retorna o número de mensagens não lidas de um usuário em uma sala';
comment on function mark_messages_as_read is 'Marca mensagens como lidas e atualiza last_read_at';

