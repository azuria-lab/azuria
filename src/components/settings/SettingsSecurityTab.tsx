import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/domains/auth";
import { useIsAdminOrOwner } from "@/hooks/useUserRoles";
import { logger } from "@/services/logger";
import TwoFactorAuth from "@/components/security/TwoFactorAuth";
import AuditLogs from "@/components/security/AuditLogs";
import DataBackup from "@/components/security/DataBackup";
import LGPDCompliance from "@/components/security/LGPDCompliance";
import SecurityDashboard from "@/components/security/SecurityDashboard";

interface Props {
  userId?: string;
}

const SettingsSecurityTab: React.FC<Props> = ({ userId }) => {
  const { toast } = useToast();
  const { updatePassword } = useAuthContext();
  const { data: isAdmin } = useIsAdminOrOwner();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    // Validation
    if (!currentPassword) {
      toast({
        title: "Erro de validação",
        description: "Digite sua senha atual.",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: "Erro de validação",
        description: "Digite sua nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const success = await updatePassword(newPassword);
      if (success) {
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi atualizada com sucesso.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
  } catch (error) {
      logger.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro ao atualizar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Tabs defaultValue="password" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <TabsTrigger value="password" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
          Senha
        </TabsTrigger>
        <TabsTrigger value="2fa" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
          2FA
        </TabsTrigger>
        <TabsTrigger value="audit" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
          Auditoria
        </TabsTrigger>
        <TabsTrigger value="backup" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
          Backup
        </TabsTrigger>
        <TabsTrigger value="lgpd" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white">
          LGPD
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-brand-600 data-[state=active]:text-white col-span-2 md:col-span-1">
            Dashboard
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="password" className="mt-6">
        <Card className="border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-brand-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-brand-600 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              Alterar Senha
            </CardTitle>
            <CardDescription>
              Mantenha sua conta segura com uma senha forte. Use pelo menos 6 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="font-semibold">Senha atual</Label>
              <Input 
                id="current-password" 
                type="password" 
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="font-semibold">Nova senha</Label>
              <Input 
                id="new-password" 
                type="password"
                placeholder="Digite sua nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="font-semibold">Confirmar nova senha</Label>
              <Input 
                id="confirm-password" 
                type="password"
                placeholder="Digite novamente a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-gray-300 focus:border-brand-500 focus:ring-brand-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start bg-gray-50 border-t">
            <Button 
              onClick={handleUpdatePassword}
              disabled={isUpdating}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              {isUpdating ? "Atualizando..." : "Atualizar senha"}
            </Button>
            <p className="text-gray-500 text-sm mt-4">
              Última atualização de senha: Nunca
              {userId && <span className="text-xs opacity-50 ml-2">(ID: {userId.substring(0, 6)}...)</span>}
            </p>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="2fa">
        <TwoFactorAuth userId={userId} />
      </TabsContent>

      <TabsContent value="audit">
        <AuditLogs />
      </TabsContent>

      <TabsContent value="backup">
        <DataBackup />
      </TabsContent>

      <TabsContent value="lgpd">
        <LGPDCompliance />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="dashboard">
          <SecurityDashboard />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default SettingsSecurityTab;
