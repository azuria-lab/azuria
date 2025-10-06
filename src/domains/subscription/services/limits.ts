import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  SubscriptionInfo,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageAction,
  UsageSummary,
} from "../types";

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mp_subscription_id: string | null;
  mp_plan_id: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type SubscriptionInsert = {
  id?: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mp_subscription_id?: string | null;
  mp_plan_id?: string | null;
  current_period_end?: string | null;
  current_period_start?: string | null;
  cancel_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SubscriptionUpdate = Partial<SubscriptionRow>;

type UsageRow = {
  id: string;
  user_id: string;
  date: string;
  calculations_count: number | null;
  api_calls_count: number | null;
  exports_count: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type UsageInsert = {
  id?: string;
  user_id: string;
  date?: string;
  calculations_count?: number | null;
  api_calls_count?: number | null;
  exports_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UsageUpdate = Partial<UsageRow>;

type ExtendedDatabase = Database & {
  public: Database["public"] & {
    Tables: Database["public"]["Tables"] & {
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
        Relationships: [];
      };
      usage_tracking: {
        Row: UsageRow;
        Insert: UsageInsert;
        Update: UsageUpdate;
        Relationships: [];
      };
    };
    Functions: Database["public"]["Functions"] & {
      can_user_perform_action: {
        Args: { p_user_id: string; p_action: UsageAction };
        Returns: boolean;
      };
      increment_usage: {
        Args: { p_user_id: string; p_action: UsageAction };
        Returns: null;
      };
    };
  };
};

const supabaseClient = supabase as unknown as SupabaseClient<ExtendedDatabase>;

const DAILY_FREE_LIMIT = 10;

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  plan: "free",
  status: "active",
};

function getTodayIsoDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0] ?? "";
}

function getLimitForAction(plan: SubscriptionPlan, action: UsageAction): number {
  if (plan === "free") {
    if (action === "calculate") {
      return DAILY_FREE_LIMIT;
    }

    // Free users cannot call APIs or export dados
    return 0;
  }

  // PRO and BUSINESS are unlimited for now
  return Number.POSITIVE_INFINITY;
}

export async function fetchSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  try {
    const { data, error } = await supabaseClient
      .from("subscriptions")
      .select(
        "id, user_id, plan, status, mp_subscription_id, mp_plan_id, current_period_end, current_period_start, cancel_at, cancelled_at, created_at, updated_at"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.warn("Erro ao buscar assinatura, retornando free", { error });
      return DEFAULT_SUBSCRIPTION;
    }

    const record = (data as SubscriptionRow | null) ?? null;

    if (!record) {
      return DEFAULT_SUBSCRIPTION;
    }

    return {
      plan: record.plan ?? "free",
      status: record.status ?? "active",
      mpSubscriptionId: record.mp_subscription_id,
      mpPlanId: record.mp_plan_id,
      currentPeriodEnd: record.current_period_end,
      currentPeriodStart: record.current_period_start,
      cancelAt: record.cancel_at,
      cancelledAt: record.cancelled_at,
      lastSyncedAt: record.updated_at ?? null,
    };
  } catch (error) {
    logger.error("Falha inesperada ao obter assinatura", { error });
    return DEFAULT_SUBSCRIPTION;
  }
}

export async function fetchUsageSummary(userId: string): Promise<UsageSummary> {
  const today = getTodayIsoDate();

  try {
    const { data, error } = await supabaseClient
      .from("usage_tracking")
      .select("id, user_id, date, calculations_count, api_calls_count, exports_count, created_at, updated_at")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (error) {
      // PGRST116 = no rows returned
      if ((error as { code?: string }).code !== "PGRST116") {
        logger.warn("Erro ao carregar uso diário", { error });
      }
    }

    const record = data as UsageRow | null;

    return {
      date: today,
      calculations: record?.calculations_count ?? 0,
      calculationLimit: DAILY_FREE_LIMIT,
      apiCalls: record?.api_calls_count ?? 0,
      exports: record?.exports_count ?? 0,
    };
  } catch (error) {
    logger.error("Falha inesperada ao buscar uso", { error });
    return {
      date: today,
      calculations: 0,
      calculationLimit: DAILY_FREE_LIMIT,
      apiCalls: 0,
      exports: 0,
    };
  }
}

export interface UsageEvaluation {
  allowed: boolean;
  remaining: number;
  subscription: SubscriptionInfo;
  usage: UsageSummary;
}

export async function evaluateUsage(
  userId: string,
  action: UsageAction,
): Promise<UsageEvaluation> {
  const [subscription, usage] = await Promise.all([
    fetchSubscriptionInfo(userId),
    fetchUsageSummary(userId),
  ]);

  if (subscription.status !== "active") {
    return {
      allowed: false,
      remaining: 0,
      subscription,
      usage,
    };
  }

  const limit = getLimitForAction(subscription.plan, action);

  if (!Number.isFinite(limit)) {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY,
      subscription,
      usage,
    };
  }

  try {
    const { data, error } = await supabaseClient.rpc("can_user_perform_action", {
      p_user_id: userId,
      p_action: action,
    });

    if (error) {
      logger.error("Erro ao validar limite de uso", { error });
      return {
        allowed: false,
        remaining: 0,
        subscription,
        usage,
      };
    }

    const calculationsUsed = action === "calculate" ? usage.calculations : 0;
    const remaining = Math.max(limit - calculationsUsed, 0);

    return {
      allowed: Boolean(data),
      remaining,
      subscription,
      usage,
    };
  } catch (error) {
    logger.error("Falha inesperada na verificação de limite", { error });
    return {
      allowed: false,
      remaining: 0,
      subscription,
      usage,
    };
  }
}

export async function incrementUsage(
  userId: string,
  action: UsageAction,
): Promise<void> {
  try {
    const { error } = await supabaseClient.rpc("increment_usage", {
      p_user_id: userId,
      p_action: action,
    });

    if (error) {
      logger.warn("Erro ao incrementar uso", { error });
    }
  } catch (error) {
    logger.error("Falha inesperada ao incrementar uso", { error });
  }
}
