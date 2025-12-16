# Sistema de Chat - Documentação de Setup

## 📋 Visão Geral

Este documento descreve como configurar o sistema de chat completo estilo WhatsApp no backend Supabase.

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

1. **chat_rooms** - Salas de chat (grupos e conversas privadas)
2. **chat_room_members** - Membros das salas
3. **chat_messages** - Mensagens enviadas
4. **chat_message_reads** - Controle de leitura de mensagens
5. **user_status** - Status online/offline dos usuários

### Enums Criados

- `message_delivery_status`: 'pending' | 'sent' | 'delivered' | 'read'
- `user_status_type`: 'online' | 'away' | 'offline'

## 🚀 Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase/migrations/20250120_create_chat_system.sql`
4. Cole todo o conteúdo no editor
5. Clique em **Run**

### Opção 2: Via CLI

```bash
# Se você usa Supabase CLI localmente
supabase db push

# Ou execute diretamente
psql -h [seu-host] -U postgres -d postgres -f supabase/migrations/20250120_create_chat_system.sql
```

## 🔐 Políticas de Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado:

- **chat_rooms**: Usuários só veem salas que são membros
- **chat_room_members**: Usuários só veem membros de salas que participam
- **chat_messages**: Usuários só veem mensagens de salas que são membros
- **chat_message_reads**: Usuários só veem leituras de mensagens de salas que participam
- **user_status**: Usuários podem ver todos os status, mas só atualizar o próprio

## ⚙️ Funções Criadas

### `get_unread_count(p_room_id, p_user_id)`
Retorna o número de mensagens não lidas de um usuário em uma sala.

**Uso:**
```sql
SELECT get_unread_count('room-uuid', 'user-uuid');
```

### `mark_messages_as_read(p_room_id, p_user_id)`
Marca todas as mensagens de uma sala como lidas para um usuário.

**Uso:**
```sql
SELECT mark_messages_as_read('room-uuid', 'user-uuid');
```

## 🔄 Triggers Automáticos

1. **trigger_update_chat_room_last_message**: Atualiza `last_message_at`, `last_message_id` e `last_message_text` quando nova mensagem é criada
2. **trigger_update_chat_rooms_updated_at**: Atualiza `updated_at` automaticamente
3. **trigger_update_chat_messages_updated_at**: Atualiza `updated_at` automaticamente
4. **trigger_update_user_status_updated_at**: Atualiza `updated_at` automaticamente

## 📝 Exemplos de Uso

### Criar uma Sala

```typescript
const { data, error } = await supabase
  .from('chat_rooms')
  .insert({
    name: 'Projeto X',
    description: 'Sala para discussão do projeto',
    is_group: true,
    created_by: userId
  })
  .select()
  .single();

// Adicionar membros
await supabase
  .from('chat_room_members')
  .insert([
    { room_id: data.id, user_id: userId, role: 'admin' },
    { room_id: data.id, user_id: otherUserId, role: 'member' }
  ]);
```

### Enviar Mensagem

```typescript
const { data, error } = await supabase
  .from('chat_messages')
  .insert({
    room_id: roomId,
    sender_id: userId,
    content: 'Olá pessoal!',
    status: 'sent'
  })
  .select()
  .single();
```

### Marcar Mensagens como Lidas

```typescript
await supabase.rpc('mark_messages_as_read', {
  p_room_id: roomId,
  p_user_id: userId
});
```

### Atualizar Status do Usuário

```typescript
await supabase
  .from('user_status')
  .upsert({
    user_id: userId,
    status: 'online',
    last_seen_at: new Date().toISOString()
  });
```

### Buscar Salas com Contagem de Não Lidas

```typescript
const { data: rooms } = await supabase
  .from('chat_rooms')
  .select('*')
  .order('last_message_at', { ascending: false });

// Para cada sala, buscar não lidas
for (const room of rooms) {
  const { data: unread } = await supabase.rpc('get_unread_count', {
    p_room_id: room.id,
    p_user_id: userId
  });
  room.unread_count = unread;
}
```

## 🔔 Real-time (Opcional)

Para habilitar real-time, você pode usar Supabase Realtime:

```typescript
// Escutar novas mensagens
const channel = supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    console.log('Nova mensagem:', payload.new);
  })
  .subscribe();

// Escutar mudanças de status
const statusChannel = supabase
  .channel('user_status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_status'
  }, (payload) => {
    console.log('Status atualizado:', payload.new);
  })
  .subscribe();
```

## ✅ Checklist de Verificação

Após aplicar a migration, verifique:

- [ ] Todas as tabelas foram criadas
- [ ] Todos os enums foram criados
- [ ] Todas as funções foram criadas
- [ ] Todos os triggers foram criados
- [ ] RLS está habilitado em todas as tabelas
- [ ] Políticas RLS estão funcionando corretamente
- [ ] Índices foram criados para performance

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Verifique se a migration foi executada completamente
- Verifique se está usando o schema correto (`public`)

### Erro: "permission denied"
- Verifique as políticas RLS
- Verifique se o usuário está autenticado
- Verifique se o usuário é membro da sala

### Performance lenta
- Verifique se os índices foram criados
- Considere adicionar mais índices conforme necessário
- Use `explain analyze` para identificar queries lentas

## 📚 Próximos Passos

1. Integrar o hook `useChat` nos componentes React
2. Implementar real-time com Supabase Realtime
3. Adicionar upload de arquivos/imagens
4. Implementar notificações push
5. Adicionar busca de mensagens

