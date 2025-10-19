/**
 * Extended types for Dashboard tables
 * DEPRECATED: All types are now in @/integrations/supabase/types
 */

import type { Database } from "@/integrations/supabase/types";

export type UserDailyStats = Database["public"]["Tables"]["user_daily_stats"]["Row"];
export type UserDailyStatsInsert = Database["public"]["Tables"]["user_daily_stats"]["Insert"];
export type UserDailyStatsUpdate = Database["public"]["Tables"]["user_daily_stats"]["Update"];

export type UserActivity = Database["public"]["Tables"]["user_activities"]["Row"];
export type UserActivityInsert = Database["public"]["Tables"]["user_activities"]["Insert"];
export type UserActivityUpdate = Database["public"]["Tables"]["user_activities"]["Update"];

export type UserNotification = Database["public"]["Tables"]["user_notifications"]["Row"];
export type UserNotificationInsert = Database["public"]["Tables"]["user_notifications"]["Insert"];
export type UserNotificationUpdate = Database["public"]["Tables"]["user_notifications"]["Update"];

export type DashboardTip = Database["public"]["Tables"]["dashboard_tips"]["Row"];
export type DashboardTipInsert = Database["public"]["Tables"]["dashboard_tips"]["Insert"];
export type DashboardTipUpdate = Database["public"]["Tables"]["dashboard_tips"]["Update"];

export type DashboardWidget = Database["public"]["Tables"]["dashboard_widgets"]["Row"];
export type DashboardWidgetInsert = Database["public"]["Tables"]["dashboard_widgets"]["Insert"];
export type DashboardWidgetUpdate = Database["public"]["Tables"]["dashboard_widgets"]["Update"];

export type UserTipView = Database["public"]["Tables"]["user_tip_views"]["Row"];
export type UserTipViewInsert = Database["public"]["Tables"]["user_tip_views"]["Insert"];
export type UserTipViewUpdate = Database["public"]["Tables"]["user_tip_views"]["Update"];

export type ExtendedDatabase = Database;
export type ExtendedTables = Database["public"]["Tables"];
export type ExtendedFunctions = Database["public"]["Functions"];
