import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import UserProfileButton from "@/components/auth/UserProfileButton";
import SmartNotificationCenter from "@/components/notifications/SmartNotificationCenter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthContext } from "@/domains/auth";

export default function DashboardHeader() {
  const authContext = useAuthContext();
  const userProfile = authContext?.userProfile;

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex flex-1 items-center justify-end gap-2">
        <ThemeToggle />
        {userProfile && <SmartNotificationCenter />}
        {userProfile && <UserProfileButton />}
      </div>
    </header>
  );
}

