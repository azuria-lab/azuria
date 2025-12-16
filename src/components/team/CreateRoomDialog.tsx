import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (name: string, description?: string) => void;
}

export default function CreateRoomDialog({
  open,
  onOpenChange,
  onCreateRoom,
}: CreateRoomDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da sala é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    onCreateRoom(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    onOpenChange(false);
    
    toast({
      title: "Sala criada",
      description: `A sala "${name.trim()}" foi criada com sucesso.`,
    });
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Nova Sala
          </DialogTitle>
          <DialogDescription>
            Crie uma nova sala de conversa para seu time
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Nome da Sala *</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Projeto X, Suporte, etc."
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-description">Descrição (opcional)</Label>
            <Textarea
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito desta sala..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/200 caracteres
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Criar Sala
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

