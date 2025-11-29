import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Documento {
  id: string;
  user_id: string;
  tipo: string;
  nome: string;
  numero?: string;
  data_emissao: string;
  data_validade: string;
  arquivo_url?: string;
  status: 'valido' | 'proximo_vencimento' | 'vencido';
  dias_para_vencer: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentoParams {
  tipo: string;
  nome: string;
  numero?: string;
  data_emissao: string;
  data_validade: string;
  arquivo_url?: string;
  observacoes?: string;
}

export interface UploadFileParams {
  file: File;
  userId: string;
}

export function useDocumentos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os documentos do usuário
  const {
    data: documentos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .order('data_validade', { ascending: true });

      if (error) {
        throw error;
      }
      return data as Documento[];
    },
  });

  // Upload de arquivo para Storage
  const uploadFile = useMutation({
    mutationFn: async ({ file, userId }: UploadFileParams) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (error) {
        throw error;
      }
      return data.path;
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Criar documento
  const createDocumento = useMutation({
    mutationFn: async (params: CreateDocumentoParams) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('documentos')
        .insert({
          user_id: userData.user.id,
          tipo: params.tipo,
          nome: params.nome,
          numero: params.numero ?? null,
          data_emissao: params.data_emissao,
          data_validade: params.data_validade,
          arquivo_url: params.arquivo_url ?? null,
          observacoes: params.observacoes ?? null,
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as Documento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Sucesso!',
        description: 'Documento cadastrado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateDocumento = useMutation({
    mutationFn: async ({
      id,
      ...params
    }: Partial<Documento> & { id: string }) => {
      const updateData: Partial<Omit<Documento, 'id' | 'created_at'>> = {};

      if (params.tipo !== undefined) {
        updateData.tipo = params.tipo;
      }
      if (params.nome !== undefined) {
        updateData.nome = params.nome;
      }
      if (params.numero !== undefined) {
        updateData.numero = params.numero;
      }
      if (params.data_emissao !== undefined) {
        updateData.data_emissao = params.data_emissao;
      }
      if (params.data_validade !== undefined) {
        updateData.data_validade = params.data_validade;
      }
      if (params.arquivo_url !== undefined) {
        updateData.arquivo_url = params.arquivo_url;
      }
      if (params.status !== undefined) {
        updateData.status = params.status;
      }
      if (params.dias_para_vencer !== undefined) {
        updateData.dias_para_vencer = params.dias_para_vencer;
      }
      if (params.observacoes !== undefined) {
        updateData.observacoes = params.observacoes;
      }

      const { data, error } = await supabase
        .from('documentos')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as Documento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Atualizado!',
        description: 'Documento atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Deletar documento
  const deleteDocumento = useMutation({
    mutationFn: async (id: string) => {
      // Buscar documento para pegar arquivo_url
      const { data: documento, error: fetchError } = (await supabase
        .from('documentos')
        .select('arquivo_url')
        .eq('id', id)
        .single()) as {
        data: { arquivo_url: string | null } | null;
        error: any;
      };

      if (fetchError) {
        throw fetchError;
      }

      // Deletar arquivo do storage se existir
      if (documento && documento.arquivo_url) {
        await supabase.storage
          .from('documentos')
          .remove([documento.arquivo_url]);
      }

      // Deletar registro do banco
      const { error } = await supabase.from('documentos').delete().eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      toast({
        title: 'Excluído!',
        description: 'Documento excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Download de arquivo
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .download(filePath);

      if (error) {
        throw error;
      }

      // Criar URL temporária e fazer download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: 'Download iniciado',
        description: `Baixando ${fileName}...`,
      });
    } catch (error) {
      toast({
        title: 'Erro no download',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  // Buscar documentos próximos ao vencimento
  const documentosProximosVencimento = documentos?.filter(
    doc => doc.status === 'proximo_vencimento' || doc.status === 'vencido'
  );

  // Buscar documentos vencidos
  const documentosVencidos = documentos?.filter(
    doc => doc.status === 'vencido'
  );

  return {
    documentos,
    documentosProximosVencimento,
    documentosVencidos,
    isLoading,
    error,
    uploadFile,
    createDocumento,
    updateDocumento,
    deleteDocumento,
    downloadFile,
  };
}
