
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useApproveCalculation, useRequestApproval } from '@/hooks/useCollaboration';
import { CheckCircle, Clock, Send, XCircle } from 'lucide-react';

interface ApprovalsSectionProps {
  calculationId: string;
}

export default function ApprovalsSection({ calculationId }: ApprovalsSectionProps) {
  const requestApprovalMutation = useRequestApproval();
  const processApprovalMutation = useApproveCalculation();
  const [approverEmail, setApproverEmail] = useState('');
  const [requestComment, setRequestComment] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approverEmail.trim()) {return;}

    requestApprovalMutation.mutate({
      calculationId,
      approverId: approverEmail.trim()
    }, {
      onSuccess: () => {
        setApproverEmail('');
        setRequestComment('');
        setShowRequestForm(false);
      }
    });
  };

  const _handleProcessApproval = async (approvalId: string, status: 'approved' | 'rejected') => {
    processApprovalMutation.mutate({ approvalId, status });
  };

  const _getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão para solicitar aprovação */}
      {!showRequestForm ? (
        <Button
          onClick={() => setShowRequestForm(true)}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Solicitar Aprovação
        </Button>
      ) : (
        <form onSubmit={handleRequestApproval} className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="approver-email">Email do aprovador</Label>
            <Input
              id="approver-email"
              type="email"
              placeholder="aprovador@exemplo.com"
              value={approverEmail}
              onChange={(e) => setApproverEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-comment">Comentário (opcional)</Label>
            <Textarea
              id="request-comment"
              placeholder="Adicione um comentário sobre a solicitação..."
              value={requestComment}
              onChange={(e) => setRequestComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRequestForm(false);
                setApproverEmail('');
                setRequestComment('');
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!approverEmail.trim() || requestApprovalMutation.isPending}>
              {requestApprovalMutation.isPending ? 'Enviando...' : 'Solicitar'}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de aprovações */}
      <div className="text-center text-gray-500 py-8">
        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Nenhuma solicitação de aprovação</p>
        <p className="text-sm">As aprovações aparecerão aqui</p>
      </div>
    </div>
  );
}
