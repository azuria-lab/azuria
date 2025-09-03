
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useTwoFactorAuth = (isEnabled: boolean = false, onToggle?: (enabled: boolean) => void) => {
  const { toast } = useToast();
  const [is2FAEnabled, setIs2FAEnabled] = useState(isEnabled);
  const [showSetup, setShowSetup] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate cryptographically secure backup codes
      const codes = Array.from({ length: 8 }, () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result.match(/.{1,4}/g)?.join('-') || result;
      });
      
      setBackupCodes(codes);
      setIs2FAEnabled(true);
      setShowSetup(false);
      onToggle?.(true);
      
      toast({
        title: "2FA ativado com sucesso",
        description: "Sua conta agora está protegida com autenticação de dois fatores.",
      });
      
      setIsLoading(false);
    }, 1500);
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    setBackupCodes([]);
    onToggle?.(false);
    
    toast({
      title: "2FA desativado",
      description: "A autenticação de dois fatores foi removida da sua conta.",
      variant: "destructive",
    });
  };

  const handleShowSetup = () => {
    setShowSetup(true);
  };

  const handleCancelSetup = () => {
    setShowSetup(false);
  };

  return {
    is2FAEnabled,
    showSetup,
    backupCodes,
    isLoading,
    handleEnable2FA,
    handleDisable2FA,
    handleShowSetup,
    handleCancelSetup
  };
};
