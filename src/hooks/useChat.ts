import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { useToast } from "@/hooks/use-toast";

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  last_message_id?: string;
  last_message_text?: string;
  unread_count?: number;
  members_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  status: "pending" | "sent" | "delivered" | "read";
  reply_to_id?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  last_read_at?: string;
  is_muted: boolean;
  is_archived: boolean;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export type UserStatusType = "online" | "away" | "offline";

export function useChat() {
  const { userProfile } = useAuthContext();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar salas do usuário
  const loadRooms = useCallback(async () => {
    if (!userProfile?.id) {return;}

    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(`
          *,
          chat_room_members!inner(user_id),
          chat_messages(count)
        `)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) {throw error;}

      // Calcular unread_count para cada sala
      const roomsWithUnread = await Promise.all(
        (data || []).map(async (room) => {
          const { data: unreadData } = await supabase.rpc("get_unread_count", {
            p_room_id: room.id,
            p_user_id: userProfile.id,
          });

          return {
            ...room,
            unread_count: unreadData || 0,
            members_count: room.chat_room_members?.length || 0,
          };
        })
      );

      setRooms(roomsWithUnread);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading rooms:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as salas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id, toast]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Criar nova sala
  const createRoom = useCallback(
    async (name: string, description?: string, isGroup: boolean = true) => {
      if (!userProfile?.id) {return null;}

      try {
        const { data: room, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({
            name,
            description,
            is_group: isGroup,
            created_by: userProfile.id,
          })
          .select()
          .single();

        if (roomError) {throw roomError;}

        // Adicionar criador como membro admin
        const { error: memberError } = await supabase
          .from("chat_room_members")
          .insert({
            room_id: room.id,
            user_id: userProfile.id,
            role: "admin",
          });

        if (memberError) {throw memberError;}

        toast({
          title: "Sala criada",
          description: `A sala "${name}" foi criada com sucesso.`,
        });

        await loadRooms();
        return room;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error creating room:", error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a sala.",
          variant: "destructive",
        });
        return null;
      }
    },
    [userProfile?.id, toast, loadRooms]
  );

  // Atualizar nome da sala
  const updateRoomName = useCallback(
    async (roomId: string, newName: string) => {
      try {
        const { error } = await supabase
          .from("chat_rooms")
          .update({ name: newName })
          .eq("id", roomId);

        if (error) {throw error;}

        toast({
          title: "Nome atualizado",
          description: "O nome da sala foi alterado com sucesso.",
        });

        await loadRooms();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error updating room name:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o nome da sala.",
          variant: "destructive",
        });
      }
    },
    [toast, loadRooms]
  );

  // Atualizar avatar da sala (com upload para Supabase Storage)
  const updateRoomAvatar = useCallback(
    async (roomId: string, avatarFile: File | string) => {
      if (!userProfile?.id) {return;}

      try {
        let avatarUrl = avatarFile as string;

        // Se for um arquivo, fazer upload para Supabase Storage
        if (avatarFile instanceof File) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${roomId}-${Date.now()}.${fileExt}`;
          const filePath = `chat-rooms/${fileName}`;

          // Upload para Supabase Storage
          const { data: _uploadData, error: uploadError } = await supabase.storage
            .from('chat-avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {throw uploadError;}

          // Obter URL pública
          const { data: urlData } = supabase.storage
            .from('chat-avatars')
            .getPublicUrl(filePath);

          avatarUrl = urlData.publicUrl;
        }

        // Atualizar no banco de dados
        const { error } = await supabase
          .from("chat_rooms")
          .update({ avatar_url: avatarUrl })
          .eq("id", roomId)
          .eq("created_by", userProfile.id);

        if (error) {throw error;}

        toast({
          title: "Foto atualizada",
          description: "A foto da sala foi alterada com sucesso.",
        });

        await loadRooms();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error updating room avatar:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a foto da sala.",
          variant: "destructive",
        });
      }
    },
    [userProfile?.id, toast, loadRooms]
  );

  // Enviar mensagem
  const sendMessage = useCallback(
    async (roomId: string, content: string, replyToId?: string) => {
      if (!userProfile?.id) {return null;}

      try {
        const { data: message, error } = await supabase
          .from("chat_messages")
          .insert({
            room_id: roomId,
            sender_id: userProfile.id,
            content,
            reply_to_id: replyToId,
            status: "sent",
          })
          .select()
          .single();

        if (error) {throw error;}

        // Atualizar status para "delivered" após um delay
        setTimeout(async () => {
          await supabase
            .from("chat_messages")
            .update({ status: "delivered" })
            .eq("id", message.id);
        }, 1000);

        return message;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error sending message:", error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive",
        });
        return null;
      }
    },
    [userProfile?.id, toast]
  );

  // Carregar mensagens de uma sala
  const loadMessages = useCallback(
    async (roomId: string, limit: number = 50): Promise<ChatMessage[]> => {
      try {
        // Buscar mensagens sem join (relação pode não existir)
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", roomId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) {throw error;}

        // Mapear dados do Supabase para o tipo ChatMessage
        const messages: ChatMessage[] = (data || []).map((row) => ({
          id: row.id,
          room_id: row.room_id,
          sender_id: row.sender_id,
          content: row.content,
          status: (row.status || 'sent') as ChatMessage['status'],
          reply_to_id: row.reply_to_id ?? undefined,
          created_at: row.created_at,
          updated_at: row.updated_at ?? undefined,
          deleted_at: row.deleted_at ?? undefined,
          sender: undefined, // Sender info can be fetched separately if needed
        }));
        return messages.reverse();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading messages:", error);
        return [];
      }
    },
    []
  );

  // Marcar mensagens como lidas
  const markAsRead = useCallback(
    async (roomId: string) => {
      if (!userProfile?.id) {return;}

      try {
        await supabase.rpc("mark_messages_as_read", {
          p_room_id: roomId,
          p_user_id: userProfile.id,
        });

        await loadRooms();
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [userProfile?.id, loadRooms]
  );

  // Atualizar status do usuário
  const updateUserStatus = useCallback(
    async (status: UserStatusType) => {
      if (!userProfile?.id) {return;}

      try {
        await supabase
          .from("user_status")
          .upsert({
            user_id: userProfile.id,
            status,
            last_seen_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    },
    [userProfile?.id]
  );

  return {
    rooms,
    loading,
    createRoom,
    updateRoomName,
    updateRoomAvatar,
    sendMessage,
    loadMessages,
    markAsRead,
    updateUserStatus,
    refreshRooms: loadRooms,
  };
}

