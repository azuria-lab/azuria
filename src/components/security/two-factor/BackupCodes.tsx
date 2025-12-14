
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackupCodesProps {
  codes: string[];
}

const BackupCodes: React.FC<BackupCodesProps> = ({ codes }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  if (codes.length === 0) {return null;}

  return (
    <div className="space-y-2">
      <Label>Códigos de backup (guarde em local seguro):</Label>
      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded border">
        {codes.map((code) => (
          <code key={code} className="text-sm font-mono">{code}</code>
        ))}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => copyToClipboard(codes.join('\n'))}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar códigos
      </Button>
    </div>
  );
};

export default BackupCodes;
