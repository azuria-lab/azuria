export type SubscriptionPlan = "free" | "pro" | "business";

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "past_due" | "pending";

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  mpSubscriptionId?: string | null;
  mpPlanId?: string | null;
  currentPeriodEnd?: string | null;
  currentPeriodStart?: string | null;
  cancelAt?: string | null;
  cancelledAt?: string | null;
  lastSyncedAt?: string | null;
}

export interface UsageSummary {
  date: string;
  calculations: number;
  calculationLimit: number;
  apiCalls: number;
  exports: number;
}

export type UsageAction = "calculate" | "api" | "export";

export class UsageLimitError extends Error {
  constructor(
    message: string,
    readonly action: UsageAction,
    readonly remaining: number,
  ) {
    super(message);
    this.name = "UsageLimitError";
  }
}

export class SubscriptionAuthError extends Error {
  constructor(message = "Usuário não autenticado") {
    super(message);
    this.name = "SubscriptionAuthError";
  }
}
