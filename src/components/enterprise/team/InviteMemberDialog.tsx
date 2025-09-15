
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { TeamMember } from "@/types/enterprise";
import { toast } from "@/components/ui/use-toast";

interface InviteMemberDialogProps {
  isLoading: boolean;
  onInvite: (email: string, role: TeamMember['role']) => Promise<void>;
}

export default function InviteMemberDialog({ isLoading, onInvite }: InviteMemberDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>("editor");
  const [isOpen, setIsOpen] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }

    await onInvite(inviteEmail, inviteRole);
    setInviteEmail("");
    setInviteRole("editor");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Membro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
          <DialogDescription>
            Envie um convite para adicionar um novo membro à sua equipe
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="role">Função</Label>
            <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TeamMember['role'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizador</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Convite"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
