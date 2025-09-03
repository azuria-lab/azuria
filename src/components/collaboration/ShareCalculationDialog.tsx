import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useShareCalculation } from '@/hooks/useCollaboration';
import { Clock, Edit, Eye, Mail, MessageSquare, Share2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ShareCalculationDialogProps {
  calculationId: string;
}

export default function ShareCalculationDialog({ 
  calculationId
}: ShareCalculationDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [message, setMessage] = useState('');

  const shareCalculation = useShareCalculation();

  const handleShare = async () => {
    if (!email) {
      toast.error('Email é obrigatório');
      return;
    }

    // Calcular data de expiração
    let expiresAt: Date | undefined;
    if (expiresIn !== 'never') {
      const days = parseInt(expiresIn);
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    try {
      await shareCalculation.mutateAsync({
        calculationId,
        sharedWith: email,
        permissionLevel,
        expiresAt
      });

      toast.success('Cálculo compartilhado com sucesso!');
      setOpen(false);
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Erro ao compartilhar cálculo');
    }
  };

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getPermissionDescription = (level: string) => {
    switch (level) {
      case 'view': return 'Apenas visualizar o cálculo';
      case 'comment': return 'Visualizar e comentar';
      case 'edit': return 'Visualizar, comentar e editar';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Cálculo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email do destinatário */}
          <div className="space-y-2">
            <Label htmlFor="email">Email do destinatário</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Nível de permissão */}
          <div className="space-y-2">
            <Label>Nível de permissão</Label>
            <Select value={permissionLevel} onValueChange={(value: any) => setPermissionLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Visualizar</div>
                      <div className="text-xs text-muted-foreground">Apenas ver o cálculo</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="comment">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Comentar</div>
                      <div className="text-xs text-muted-foreground">Ver e comentar</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Editar</div>
                      <div className="text-xs text-muted-foreground">Ver, comentar e editar</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getPermissionDescription(permissionLevel)}
            </p>
          </div>

          {/* Expiração */}
          <div className="space-y-2">
            <Label>Expiração do acesso</Label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Nunca expira
                  </div>
                </SelectItem>
                <SelectItem value="1">1 dia</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem opcional */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem personalizada..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview da permissão */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {getPermissionIcon(permissionLevel)}
              <span className="font-medium capitalize">{permissionLevel}</span>
              <Badge variant="secondary" className="ml-auto">
                {expiresIn === 'never' ? 'Sem expiração' : `${expiresIn} dias`}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {getPermissionDescription(permissionLevel)}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleShare}
              disabled={shareCalculation.isPending || !email}
              className="flex-1"
            >
              {shareCalculation.isPending ? 'Compartilhando...' : 'Compartilhar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}