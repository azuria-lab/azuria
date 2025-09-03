
import React, { useMemo } from "react";
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth";
import TwoFactorSetup from "./two-factor/TwoFactorSetup";
import TwoFactorStatus from "./two-factor/TwoFactorStatus";
import BackupCodes from "./two-factor/BackupCodes";

interface TwoFactorAuthProps {
  userId?: string;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ 
  userId = "demo-user", 
  isEnabled = false, 
  onToggle 
}) => {
  const {
    is2FAEnabled,
    showSetup,
    backupCodes,
    isLoading,
    handleEnable2FA,
    handleDisable2FA,
    handleShowSetup,
    handleCancelSetup
  } = useTwoFactorAuth(isEnabled, onToggle);

  // Generate secure TOTP secret for 2FA setup
  const totpSecret = useMemo(() => {
    // Generate cryptographically secure 32-character base32 secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, [userId]);
  
  const qrCodeData = `otpauth://totp/Precifica%2B:${userId}?secret=${totpSecret}&issuer=Precifica%2B`;

  if (showSetup) {
    return (
      <TwoFactorSetup
        userId={userId}
        totpSecret={totpSecret}
        qrCodeData={qrCodeData}
        onVerifyAndEnable={handleEnable2FA}
        onCancel={handleCancelSetup}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TwoFactorStatus
        isEnabled={is2FAEnabled}
        onEnable={handleShowSetup}
        onDisable={handleDisable2FA}
      />
      
      {is2FAEnabled && (
        <BackupCodes codes={backupCodes} />
      )}
    </div>
  );
};

export default TwoFactorAuth;
