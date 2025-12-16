import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface EditRoomNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (newName: string) => void;
}

export default function EditRoomNameDialog({
  open,
  onOpenChange,
  currentName,
  onSave,
}: EditRoomNameDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

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

    if (name.trim() === currentName) {
      onOpenChange(false);
      return;
    }

    onSave(name.trim());
    onOpenChange(false);
    
    toast({
      title: "Nome atualizado",
      description: `O nome da sala foi alterado para "${name.trim()}".`,
    });
  };

  const handleCancel = () => {
    setName(currentName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Editar Nome da Sala
          </DialogTitle>
          <DialogDescription>
            Altere o nome desta sala de conversa
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

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <Edit2 className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

