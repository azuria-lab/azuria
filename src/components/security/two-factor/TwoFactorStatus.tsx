
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";

interface TwoFactorStatusProps {
  isEnabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
}

const TwoFactorStatus: React.FC<TwoFactorStatusProps> = ({
  isEnabled,
  onEnable,
  onDisable
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Autenticação de Dois Fatores (2FA)
          {isEnabled && <Badge variant="default" className="bg-green-100 text-green-800">Ativado</Badge>}
        </CardTitle>
        <CardDescription>
          Adicione uma camada extra de segurança à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEnabled ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Sua conta está protegida com autenticação de dois fatores.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sua conta não está protegida com 2FA. Recomendamos ativar para maior segurança.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {isEnabled ? (
          <Button variant="destructive" onClick={onDisable}>
            Desativar 2FA
          </Button>
        ) : (
          <Button onClick={onEnable} className="bg-green-600 hover:bg-green-700">
            Configurar 2FA
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwoFactorStatus;
