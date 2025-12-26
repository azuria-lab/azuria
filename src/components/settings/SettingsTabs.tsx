
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BellRing, Building2, CircleDollarSign, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: UserRound, shortLabel: 'Perfil' },
    { id: 'notifications', label: 'Notificações', icon: BellRing, shortLabel: 'Notif.' },
    { id: 'security', label: 'Segurança', icon: ShieldCheck, shortLabel: 'Segurança' },
    { id: 'subscription', label: 'Assinatura', icon: CircleDollarSign, shortLabel: 'Assinatura' },
    { id: 'business', label: 'Negócio', icon: Building2, shortLabel: 'Negócio' },
  ];

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      {/* Premium Navigation - Quick Actions Style */}
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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

      <TabsContent value="profile" className="mt-0">
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>
      </TabsContent>
      
      <TabsContent value="notifications" className="mt-0">
        <motion.div
          key="notifications"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <SettingsNotificationsTab 
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            onSave={handleNotificationsSave}
          />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="security" className="mt-0">
        <motion.div
          key="security"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <SettingsSecurityTab userId={userProfile?.id} />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="subscription" className="mt-0">
        <motion.div
          key="subscription"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <SettingsSubscriptionTab 
            isPro={isPro}
            subscriptionEnd={subscriptionEnd}
            onCancel={onCancelSubscription}
            onUpgrade={onUpgradeSubscription}
          />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="business" className="mt-0">
        <motion.div
          key="business"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <SettingsBusinessTab userId={userProfile?.id} />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
