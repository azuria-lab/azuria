
/**
 * User profile with display data
 */
export interface UserProfileWithDisplayData {
  id: string;
  name: string | null;
  email: string;
  isPro: boolean;
  createdAt: string;
  avatar_url?: string | null;
}

/**
 * Raw user profile from database
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  created_at: string;
  updated_at?: string;
}
