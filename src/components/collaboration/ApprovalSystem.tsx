import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApproveCalculation, useRequestApproval } from '@/hooks/useCollaboration';
import { AlertCircle, CheckCircle, Clock, UserCheck, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

interface ApprovalSystemProps {
  calculationId: string;
  currentUserId?: string;
}

interface ApprovalRequestDialogProps {
  calculationId: string;
  onSuccess?: () => void;
}

interface ApprovalRecord {
  id: string;
  calculation_id: string;
  requested_by: string;
  approver_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  created_at: string;
  approved_at?: string;
}

function ApprovalRequestDialog({ calculationId, onSuccess }: ApprovalRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [approverEmail, setApproverEmail] = useState('');
  const [reason, setReason] = useState('');

  const requestApproval = useRequestApproval();

  const handleRequest = async () => {
    if (!approverEmail) {
      toast.error('Email do aprovador é obrigatório');
      return;
    }

    try {
      await requestApproval.mutateAsync({
        calculationId,
        approverId: approverEmail, // Em um cenário real, buscaria o ID pelo email
      });

      toast.success('Solicitação de aprovação enviada!');
      setOpen(false);
      setApproverEmail('');
      setReason('');
      onSuccess?.();
    } catch (_error) {
      toast.error('Erro ao solicitar aprovação');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserCheck className="h-4 w-4 mr-2" />
          Solicitar Aprovação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Aprovação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approver-email">Email do aprovador</Label>
            <Input
              id="approver-email"
              placeholder="aprovador@empresa.com"
              value={approverEmail}
              onChange={(e) => setApproverEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da solicitação</Label>
            <Textarea
              id="reason"
              placeholder="Descreva por que esta aprovação é necessária..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleRequest}
              disabled={requestApproval.isPending || !approverEmail}
              className="flex-1"
            >
              {requestApproval.isPending ? 'Enviando...' : 'Solicitar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ApprovalItemProps {
  approval: ApprovalRecord;
  canApprove?: boolean;
  onApprove?: (approvalId: string, status: 'approved' | 'rejected', comment?: string) => void;
}

function ApprovalItem({ approval, canApprove, onApprove }: ApprovalItemProps) {
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproval = (status: 'approved' | 'rejected') => {
    onApprove?.(approval.id, status, comment);
    setComment('');
    setShowCommentForm(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(approval.status)}
          <div>
            <div className="font-medium">
              Solicitado por: Usuário {approval.requested_by.slice(-4)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(approval.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(approval.status)}>
          {approval.status === 'pending' ? 'Pendente' :
           approval.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
        </Badge>
      </div>

      {approval.comment && (
        <div className="bg-gray-50 p-3 rounded text-sm">
          <strong>Comentário:</strong> {approval.comment}
        </div>
      )}

      {canApprove && approval.status === 'pending' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowCommentForm(!showCommentForm)}
              variant="outline"
            >
              {showCommentForm ? 'Fechar' : 'Adicionar Comentário'}
            </Button>
          </div>

          {showCommentForm && (
            <div className="space-y-2">
              <Textarea
                placeholder="Adicione um comentário sobre sua decisão..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleApproval('rejected')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejeitar
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleApproval('approved')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalSystem({ calculationId, currentUserId }: ApprovalSystemProps) {
  // Mock data - em um cenário real, você buscaria do banco
  const [approvals] = useState<ApprovalRecord[]>([
    {
      id: '1',
      calculation_id: calculationId,
      requested_by: 'user123',
      approver_id: currentUserId,
      status: 'pending',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
    },
    {
      id: '2',
      calculation_id: calculationId,
      requested_by: 'user456',
      approver_id: 'other_user',
      status: 'approved',
      comment: 'Cálculo está correto e dentro dos parâmetros esperados.',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
      approved_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  const approveCalculation = useApproveCalculation();

  const handleApprove = async (approvalId: string, status: 'approved' | 'rejected', comment?: string) => {
    try {
      await approveCalculation.mutateAsync({
        approvalId,
        status,
        comment
      });

      toast.success(status === 'approved' ? 'Cálculo aprovado!' : 'Cálculo rejeitado!');
    } catch (_error) {
      toast.error('Erro ao processar aprovação');
    }
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const completedApprovals = approvals.filter(a => a.status !== 'pending');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Sistema de Aprovação
          </CardTitle>
          <ApprovalRequestDialog calculationId={calculationId} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aprovações Pendentes */}
        {pendingApprovals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-amber-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({pendingApprovals.length})
            </h3>
            {pendingApprovals.map((approval) => (
              <ApprovalItem
                key={approval.id}
                approval={approval}
                canApprove={approval.approver_id === currentUserId}
                onApprove={handleApprove}
              />
            ))}
          </div>
        )}

        {/* Aprovações Concluídas */}
        {completedApprovals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Histórico ({completedApprovals.length})
            </h3>
            {completedApprovals.map((approval) => (
              <ApprovalItem
                key={approval.id}
                approval={approval}
                canApprove={false}
              />
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {approvals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhuma solicitação de aprovação.</p>
            <p className="text-sm">Use o botão acima para solicitar uma aprovação.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}