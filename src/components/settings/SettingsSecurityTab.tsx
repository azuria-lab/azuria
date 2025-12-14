import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Database, FileText, KeyRound, LayoutDashboard, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/domains/auth";
import { useIsAdminOrOwner } from "@/hooks/useUserRoles";
import { logger } from "@/services/logger";
import { cn } from "@/lib/utils";
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
  const [activeTab, setActiveTab] = useState("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const securityTabs = [
    { id: 'password', label: 'Senha', icon: KeyRound, shortLabel: 'Senha' },
    { id: '2fa', label: '2FA', icon: Lock, shortLabel: '2FA' },
    { id: 'audit', label: 'Auditoria', icon: FileText, shortLabel: 'Auditoria' },
    { id: 'backup', label: 'Backup', icon: Database, shortLabel: 'Backup' },
    { id: 'lgpd', label: 'LGPD', icon: ShieldCheck, shortLabel: 'LGPD' },
    ...(isAdmin ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Dashboard' }] : []),
  ];

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Premium Navigation - Quick Actions Style */}
      <div className="flex flex-wrap gap-2 mb-8">
        {securityTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-md',
                'text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90'
                  : 'text-foreground hover:border-primary/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </motion.button>
          );
        })}
      </div>

      <TabsContent value="password" className="mt-0">
        <motion.div
          key="password"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                </div>
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte. Use pelo menos 6 caracteres.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  placeholder="Digite sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input 
                  id="confirm-password" 
                  type="password"
                  placeholder="Digite novamente a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t pt-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdating}
                  className="min-w-[140px]"
                >
                  {isUpdating ? "Atualizando..." : "Atualizar senha"}
                </Button>
              </motion.div>
              <p className="text-muted-foreground text-sm mt-4">
                Última atualização de senha: Nunca
                {userId && <span className="text-xs opacity-50 ml-2">(ID: {userId.substring(0, 6)}...)</span>}
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </TabsContent>

      <TabsContent value="2fa" className="mt-0">
        <motion.div
          key="2fa"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <TwoFactorAuth userId={userId} />
        </motion.div>
      </TabsContent>

      <TabsContent value="audit" className="mt-0">
        <motion.div
          key="audit"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <AuditLogs />
        </motion.div>
      </TabsContent>

      <TabsContent value="backup" className="mt-0">
        <motion.div
          key="backup"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <DataBackup />
        </motion.div>
      </TabsContent>

      <TabsContent value="lgpd" className="mt-0">
        <motion.div
          key="lgpd"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <LGPDCompliance />
        </motion.div>
      </TabsContent>

      {isAdmin && (
        <TabsContent value="dashboard" className="mt-0">
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SecurityDashboard />
          </motion.div>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default SettingsSecurityTab;
