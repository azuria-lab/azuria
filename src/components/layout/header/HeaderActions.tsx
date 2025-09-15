
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import UserProfileButton from '@/components/auth/UserProfileButton';

export default function HeaderActions() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-9 h-9 rounded-full"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-20 h-8 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div data-onboarding="theme-toggle">
        <ThemeToggle />
      </div>
      <UserProfileButton />
    </div>
  );
}
