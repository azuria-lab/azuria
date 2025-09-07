
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorSetupProps {
  userId: string;
  totpSecret: string;
  qrCodeData: string;
  onVerifyAndEnable: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  userId: _userId,
  totpSecret,
  qrCodeData,
  onVerifyAndEnable,
  onCancel,
  isLoading
}) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      onVerifyAndEnable(verificationCode);
    } else {
      toast({
        title: "Código inválido",
        description: "Digite um código de 6 dígitos válido.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Configurar Autenticação 2FA
        </CardTitle>
        <CardDescription>
          Configure a autenticação de dois fatores para aumentar a segurança da sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            1. Escaneie o QR Code com seu app autenticador (Google Authenticator, Authy, etc.)
          </p>
          <div className="bg-white p-4 rounded-lg inline-block border">
            <QRCodeSVG value={qrCodeData} size={200} />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Ou digite manualmente este código:</Label>
          <div className="flex items-center gap-2">
            <Input value={totpSecret} readOnly className="font-mono" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(totpSecret)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification">2. Digite o código de 6 dígitos do app:</Label>
          <Input
            id="verification"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center font-mono text-lg"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          onClick={handleVerifyCode}
          disabled={verificationCode.length !== 6 || isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? "Verificando..." : "Verificar e Ativar"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorSetup;
