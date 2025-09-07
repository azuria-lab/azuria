import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSharedCalculations() {
  return useQuery({
    queryKey: ['shared-calculations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calculation_shares')
        .select(`
          *,
          calculation_history (
            id,
            cost,
            margin,
            result,
            date,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {throw error;}
      return data;
    }
  });
}

export function useCalculationComments(calculationId: string) {
  return useQuery({
    queryKey: ['calculation-comments', calculationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calculation_comments')
        .select('*')
        .eq('calculation_id', calculationId)
        .order('created_at', { ascending: true });

      if (error) {throw error;}
      return data;
    },
    enabled: !!calculationId
  });
}

export function useShareCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      calculationId, 
      sharedWith, 
      permissionLevel,
      expiresAt 
    }: {
      calculationId: string;
      sharedWith: string;
      permissionLevel: 'view' | 'comment' | 'edit';
      expiresAt?: Date;
    }) => {
      const { data, error } = await supabase
        .from('calculation_shares')
        .insert({
          calculation_id: calculationId,
          shared_with: sharedWith,
          permission_level: permissionLevel,
          expires_at: expiresAt?.toISOString()
        })
        .select()
        .single();

      if (error) {throw error;}

      // Criar notificação
      await supabase.rpc('create_collaboration_notification', {
        _user_id: sharedWith,
        _type: 'calculation_shared',
        _title: 'Cálculo compartilhado com você',
        _message: `Um cálculo foi compartilhado com você com permissão de ${permissionLevel}`,
        _related_id: calculationId
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-calculations'] });
    }
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      calculationId, 
      content, 
      parentId 
    }: {
      calculationId: string;
      content: string;
      parentId?: string;
    }) => {
      const { data, error } = await supabase
        .from('calculation_comments')
        .insert({
          calculation_id: calculationId,
          content,
          parent_id: parentId
        })
        .select()
        .single();

      if (error) {throw error;}
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['calculation-comments', variables.calculationId] 
      });
    }
  });
}

export function useRequestApproval() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      calculationId, 
      approverId 
    }: {
      calculationId: string;
      approverId: string;
    }) => {
      const { data, error } = await supabase
        .from('calculation_approvals')
        .insert({
          calculation_id: calculationId,
          approver_id: approverId
        })
        .select()
        .single();

      if (error) {throw error;}

      // Criar notificação para o aprovador
      await supabase.rpc('create_collaboration_notification', {
        _user_id: approverId,
        _type: 'approval_requested',
        _title: 'Aprovação solicitada',
        _message: 'Um cálculo foi enviado para sua aprovação',
        _related_id: calculationId
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-approvals'] });
    }
  });
}

export function useApproveCalculation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      approvalId, 
      status, 
      comment 
    }: {
      approvalId: string;
      status: 'approved' | 'rejected';
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from('calculation_approvals')
        .update({
          status,
          comment,
          approved_at: new Date().toISOString()
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) {throw error;}
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-approvals'] });
    }
  });
}

export function useCollaborationNotifications() {
  return useQuery({
    queryKey: ['collaboration-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {throw error;}
      return data;
    }
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('collaboration_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {throw error;}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-notifications'] });
    }
  });
}

// Main collaboration hook that combines all collaboration functionality
export function useCollaboration() {
  const sharedCalculations = useSharedCalculations();
  const collaborationNotifications = useCollaborationNotifications();
  const shareCalculation = useShareCalculation();
  const addComment = useAddComment();
  const requestApproval = useRequestApproval();
  const approveCalculation = useApproveCalculation();
  const markNotificationAsRead = useMarkNotificationAsRead();

  return {
    sharedCalculations,
    collaborationNotifications,
    shareCalculation,
    addComment,
    requestApproval,
    approveCalculation,
    markNotificationAsRead
  };
}