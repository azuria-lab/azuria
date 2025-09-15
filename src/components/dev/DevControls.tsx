
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/domains/auth";
import { Crown, User } from "lucide-react";

export default function DevControls() {
  const { isPro, updateProStatus } = useAuthContext();

  const toggleProStatus = async () => {
    const newStatus = !isPro;
    await updateProStatus(newStatus);
    // Para garantir que funcione durante os testes, também atualiza o localStorage
    localStorage.setItem("isPro", newStatus.toString());
    window.location.reload();
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🚀 Controles de Desenvolvimento
          <Badge variant="outline" className="text-xs">TESTE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Status atual:</span>
            {isPro ? (
              <Badge className="bg-brand-600 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                PRO
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Gratuito
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={toggleProStatus}
            variant={isPro ? "outline" : "default"}
            size="sm"
            className={isPro ? "" : "bg-brand-600 hover:bg-brand-700"}
          >
            {isPro ? "Voltar para Gratuito" : "Ativar PRO para Teste"}
          </Button>
        </div>
        
        <p className="text-xs text-gray-600 mt-2">
          Use este controle para testar as funcionalidades PRO e gratuitas.
        </p>
      </CardContent>
    </Card>
  );
}
