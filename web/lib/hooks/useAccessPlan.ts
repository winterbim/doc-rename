'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStatus } from '@/lib/auth-status';
import {
  type AccessPlan,
  getAccessPlanLabel,
  getConfiguredAccessPlan,
  isUsageLimitEnabled,
  normalizeAccessPlan,
  resolveAccessPlan,
} from '@/lib/usage-limits';

export interface AccessPlanState {
  plan: AccessPlan;
  label: string;
  usageLimitEnabled: boolean;
  source: 'env' | 'cloud' | 'free';
  isLoading: boolean;
  isAuthenticated: boolean;
}

function isPaid(plan: AccessPlan): boolean {
  return plan === 'pro' || plan === 'team' || plan === 'cabinet';
}

/**
 * Effective SaaS plan for the current browser session.
 * Priority: deploy env (manual provision after Stripe) → Convex user.plan → free.
 */
export function useAccessPlan(): AccessPlanState {
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const envPlan = getConfiguredAccessPlan();

  const cloudUser = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : 'skip',
  );

  return useMemo(() => {
    const cloudPlan =
      cloudUser && cloudUser.plan
        ? normalizeAccessPlan(cloudUser.plan)
        : null;
    const plan = resolveAccessPlan(envPlan, cloudPlan);
    const source: AccessPlanState['source'] = isPaid(envPlan)
      ? 'env'
      : cloudPlan && isPaid(cloudPlan)
        ? 'cloud'
        : 'free';

    return {
      plan,
      label: getAccessPlanLabel(plan),
      usageLimitEnabled: isUsageLimitEnabled(plan),
      source,
      isLoading: authLoading || (isAuthenticated && cloudUser === undefined),
      isAuthenticated,
    };
  }, [envPlan, cloudUser, authLoading, isAuthenticated]);
}
