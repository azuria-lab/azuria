import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/domains/auth";
import { useIsAdminOrOwner } from "@/hooks/useUserRoles";
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
  } catch (_error) {
      toast({
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro ao atualizar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const tabCount = isAdmin ? 6 : 5;

  return (
    <Tabs defaultValue="password" className="w-full">
      <TabsList className={`grid w-full grid-cols-2 lg:grid-cols-${tabCount}`}>
        <TabsTrigger value="password">Senha</TabsTrigger>
        <TabsTrigger value="2fa">2FA</TabsTrigger>
        <TabsTrigger value="audit">Auditoria</TabsTrigger>
        <TabsTrigger value="backup">Backup</TabsTrigger>
        <TabsTrigger value="lgpd">LGPD</TabsTrigger>
        {isAdmin && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
      </TabsList>

      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Mantenha sua conta segura com uma senha forte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input 
                id="new-password" 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button 
              onClick={handleUpdatePassword}
              disabled={isUpdating}
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
