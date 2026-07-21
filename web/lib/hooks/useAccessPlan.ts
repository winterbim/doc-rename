'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
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
 * Priority: deploy env (manual override) → signed Stripe/Convex entitlement → free.
 */
export function useAccessPlan(): AccessPlanState {
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const envPlan = getConfiguredAccessPlan();
  const claimAttempted = useRef(false);
  const claimPendingEntitlement = useMutation(api.billing.claimPendingEntitlement);

  const cloudUser = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : 'skip',
  );

  useEffect(() => {
    if (!isAuthenticated || claimAttempted.current) return;
    claimAttempted.current = true;
    void claimPendingEntitlement({}).catch(() => {
      // The current plan query remains authoritative; retry on the next session.
    });
  }, [claimPendingEntitlement, isAuthenticated]);

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
