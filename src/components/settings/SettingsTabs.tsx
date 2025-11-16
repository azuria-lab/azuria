
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, CircleDollarSign, ShieldCheck, UserRound } from "lucide-react";

import SettingsProfileTab from "@/components/settings/SettingsProfileTab";
import SettingsNotificationsTab from "@/components/settings/SettingsNotificationsTab";
import SettingsSecurityTab from "@/components/settings/SettingsSecurityTab";
import SettingsSubscriptionTab from "@/components/settings/SettingsSubscriptionTab";
import SettingsBusinessTab from "@/components/settings/SettingsBusinessTab";
import { UserProfileWithDisplayData } from "@/hooks/auth";
import { logger } from "@/services/logger";

interface SettingsTabsProps {
  activeTab?: string;
  userProfile: UserProfileWithDisplayData | null;
  isPro: boolean;
  onTabChange?: (tab: string) => void;
  onUpdateProfile: (data: Partial<UserProfileWithDisplayData>) => Promise<boolean>;
  onCancelSubscription: () => void;
  onUpgradeSubscription: () => void;
}

export default function SettingsTabs({
  activeTab = "profile",
  userProfile,
  isPro,
  onTabChange,
  onUpdateProfile,
  onCancelSubscription,
  onUpgradeSubscription,
}: SettingsTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Handle profile save from child tab
  const handleProfileSave = async (data: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  }) => {
    const result = await onUpdateProfile(data);
    return Boolean(result);
  };
  
  // Handle notifications save
  const handleNotificationsSave = () => {
    // Implement notifications save logic
    logger.info("Saving notifications settings:", { emailNotifications });
  };

  // Simulate subscription end date (30 days from now)
  const subscriptionEnd = new Date();
  subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

  return (
    <Tabs defaultValue={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:grid-cols-5 mb-8 bg-gray-100 p-1 rounded-xl">
        <TabsTrigger 
          value="profile" 
          className="flex items-center gap-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md transition-all"
        >
          <UserRound className="w-4 h-4" />
          <span className="hidden sm:block">Perfil</span>
        </TabsTrigger>
        <TabsTrigger 
          value="notifications" 
          className="flex items-center gap-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md transition-all"
        >
          <BellRing className="w-4 h-4" />
          <span className="hidden sm:block">Notificações</span>
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="flex items-center gap-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:block">Segurança</span>
        </TabsTrigger>
        <TabsTrigger 
          value="subscription" 
          className="flex items-center gap-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md transition-all"
        >
          <CircleDollarSign className="w-4 h-4" />
          <span className="hidden sm:block">Assinatura</span>
        </TabsTrigger>
        <TabsTrigger 
          value="business" 
          className="flex items-center gap-2 sm:py-2.5 data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-md transition-all"
        >
          <CircleDollarSign className="w-4 h-4" />
          <span className="hidden sm:block">Negócio</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <SettingsProfileTab 
          onSave={handleProfileSave}
          initialData={{
            name: userProfile?.name || undefined,
            email: userProfile?.email || undefined,
            avatar_url: userProfile?.avatar_url || undefined,
            phone: userProfile?.phone || undefined,
            company: userProfile?.company || undefined
          }}
        />
      </TabsContent>
      
      <TabsContent value="notifications">
        <SettingsNotificationsTab 
          emailNotifications={emailNotifications}
          setEmailNotifications={setEmailNotifications}
          onSave={handleNotificationsSave}
        />
      </TabsContent>
      
      <TabsContent value="security">
        <SettingsSecurityTab userId={userProfile?.id} />
      </TabsContent>
      
      <TabsContent value="subscription">
        <SettingsSubscriptionTab 
          isPro={isPro}
          subscriptionEnd={subscriptionEnd}
          onCancel={onCancelSubscription}
          onUpgrade={onUpgradeSubscription}
        />
      </TabsContent>
      
      <TabsContent value="business">
        <SettingsBusinessTab userId={userProfile?.id} />
      </TabsContent>
    </Tabs>
  );
}
