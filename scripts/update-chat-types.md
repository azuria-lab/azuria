# Instruções para Atualizar Types.ts

Após executar a migration `20250120_create_chat_system.sql`, você precisa adicionar as seguintes tabelas ao arquivo `src/integrations/supabase/types.ts`:

## Localização

Adicione as tabelas após `user_profiles` e antes de `sales_data` (linha ~437).

## Tabelas a Adicionar

Veja o arquivo `src/integrations/supabase/types.ts` - as tabelas já foram parcialmente adicionadas nas funções, mas precisam ser adicionadas na seção `Tables`.

As definições completas estão no arquivo da migration SQL como referência.

## Verificação

Após adicionar, verifique se:
- Todas as 5 tabelas estão definidas (chat_rooms, chat_room_members, chat_messages, chat_message_reads, user_status)
- Os enums estão definidos (message_delivery_status, user_status_type)
- As funções estão definidas (get_unread_count, mark_messages_as_read)

