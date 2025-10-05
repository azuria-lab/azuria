import { useAuthContext } from "@/domains/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  evaluateUsage,
  fetchSubscriptionInfo,
  fetchUsageSummary,
  incrementUsage,
} from "../services/limits";
import {
  SubscriptionAuthError,
  type SubscriptionInfo,
  UsageLimitError,
  type UsageSummary,
} from "../types";

const CALCULATION_LIMIT_FREE = 10;

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  plan: "free",
  status: "active",
};

const DEFAULT_USAGE: UsageSummary = {
  date: new Date().toISOString().split("T")[0] ?? "",
  calculations: 0,
  calculationLimit: CALCULATION_LIMIT_FREE,
  apiCalls: 0,
  exports: 0,
};

function normalizeUsage(summary: UsageSummary, subscription: SubscriptionInfo): UsageSummary {
  if (subscription.plan === "free") {
    return { ...summary, calculationLimit: CALCULATION_LIMIT_FREE };
  }

  return {
    ...summary,
    calculationLimit: Number.POSITIVE_INFINITY,
  };
}

export const useSubscriptionLimits = () => {
  const { user } = useAuthContext();
  const userId = user?.id ?? null;

  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_SUBSCRIPTION);
  const [usage, setUsage] = useState<UsageSummary>(DEFAULT_USAGE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      setUsage(DEFAULT_USAGE);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [subscriptionInfo, usageSummary] = await Promise.all([
        fetchSubscriptionInfo(userId),
        fetchUsageSummary(userId),
      ]);

      setSubscription(subscriptionInfo);
      setUsage(normalizeUsage(usageSummary, subscriptionInfo));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar assinatura";
      setError(message);
      setSubscription(DEFAULT_SUBSCRIPTION);
      setUsage(DEFAULT_USAGE);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ensureCanCalculate = useCallback(async () => {
    if (!userId) {
      throw new SubscriptionAuthError();
    }

    const evaluation = await evaluateUsage(userId, "calculate");

    setSubscription(evaluation.subscription);
    setUsage(normalizeUsage(evaluation.usage, evaluation.subscription));

    if (!evaluation.allowed) {
      const message = evaluation.subscription.status !== "active"
        ? "Sua assinatura não está ativa. Verifique o pagamento ou contate o suporte."
        : "Limite diário de cálculos atingido no plano FREE. Faça upgrade para cálculos ilimitados.";

      throw new UsageLimitError(message, "calculate", evaluation.remaining);
    }

    return evaluation;
  }, [userId]);

  const registerCalculation = useCallback(async () => {
    if (!userId) {
      throw new SubscriptionAuthError();
    }

    await incrementUsage(userId, "calculate");
    await refresh();
  }, [refresh, userId]);

  const isPro = useMemo(() => {
    return subscription.plan !== "free" && subscription.status === "active";
  }, [subscription.plan, subscription.status]);

  return {
    subscription,
    usage,
    isLoading,
    error,
    refresh,
    ensureCanCalculate,
    registerCalculation,
    isPro,
  };
};
