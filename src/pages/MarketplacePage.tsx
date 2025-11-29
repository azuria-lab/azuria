import React, { useState } from "react";
import MultiMarketplaceDashboard from "@/components/marketplace/MultiMarketplaceDashboard";
import ConnectMarketplaceDialog from "@/components/marketplace/ConnectMarketplaceDialog";
import { TourButton } from "@/components/tour";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

export default function MarketplacePage() {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { isPro } = useAuth();
  const { toast } = useToast();

  const handleConnectMarketplace = () => {
    setShowConnectDialog(true);
  };

  const handleConnectionSuccess = (marketplaceId: string) => {
    toast({
      title: "Marketplace Conectado! 🎉",
      description: `${marketplaceId} foi integrado com sucesso à sua conta.`,
    });
  };

  return (
    <div className="relative">
        {/* Tour Button - Fixed position */}
        <div className="fixed bottom-8 right-8 z-50">
          <TourButton 
            tourId="marketplace-dashboard"
            label="Ver Tour Guiado"
            variant="default"
            size="lg"
          />
        </div>

        <MultiMarketplaceDashboard 
          onConnectMarketplace={handleConnectMarketplace}
          isPremium={isPro}
        />

        <ConnectMarketplaceDialog
          open={showConnectDialog}
          onOpenChange={setShowConnectDialog}
          onSuccess={handleConnectionSuccess}
        />
      </div>
  );
}
