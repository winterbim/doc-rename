'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStatus } from '@/lib/auth-status';
import {
  clearStoredLicense,
  getDeviceId,
  licensePlanFromStorage,
  readStoredLicense,
} from '@/lib/license-client';
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
  source: 'env' | 'license' | 'cloud' | 'free';
  isLoading: boolean;
  isAuthenticated: boolean;
}

function isPaid(plan: AccessPlan): boolean {
  return plan === 'pro' || plan === 'team' || plan === 'cabinet' || plan === 'pilot';
}

/**
 * Effective plan for the current browser session.
 * Priority: deploy env → automatic Stripe browser license → cloud user → free.
 */
export function useAccessPlan(): AccessPlanState {
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const envPlan = getConfiguredAccessPlan();
  const claimAttempted = useRef(false);
  const verifiedKey = useRef<string | null>(null);
  const claimPendingEntitlement = useMutation(api.billing.claimPendingEntitlement);
  const [licensePlan, setLicensePlan] = useState<AccessPlan | null>(() =>
    licensePlanFromStorage(),
  );
  const [licenseLoading, setLicenseLoading] = useState(false);

  const cloudUser = useQuery(
    api.users.currentUser,
    isAuthenticated ? {} : 'skip',
  );

  useEffect(() => {
    const sync = () => setLicensePlan(licensePlanFromStorage());
    sync();
    globalThis.addEventListener?.('storage', sync);
    globalThis.addEventListener?.('bimcheck-license-changed', sync);
    return () => {
      globalThis.removeEventListener?.('storage', sync);
      globalThis.removeEventListener?.('bimcheck-license-changed', sync);
    };
  }, []);

  useEffect(() => {
    const stored = readStoredLicense();
    if (!stored?.licenseKey) {
      setLicensePlan(null);
      return;
    }
    if (verifiedKey.current === stored.licenseKey) return;
    let cancelled = false;
    setLicenseLoading(true);
    void (async () => {
      try {
        const response = await fetch('/api/license/status', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            licenseKey: stored.licenseKey,
            deviceId: getDeviceId(),
          }),
          cache: 'no-store',
        });
        const result = (await response.json().catch(() => null)) as
          | { active?: boolean; plan?: string; expiresAt?: number | null }
          | null;
        if (cancelled) return;
        if (!response.ok || !result?.active || !result.plan) {
          clearStoredLicense();
          setLicensePlan(null);
          verifiedKey.current = null;
          return;
        }
        verifiedKey.current = stored.licenseKey;
        setLicensePlan(normalizeAccessPlan(result.plan));
      } catch {
        // Offline: keep last stored paid plan until next online check.
      } finally {
        if (!cancelled) setLicenseLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || claimAttempted.current) return;
    claimAttempted.current = true;
    void claimPendingEntitlement({}).catch(() => {
      // Plan query remains authoritative; retry next session.
    });
  }, [claimPendingEntitlement, isAuthenticated]);

  return useMemo(() => {
    const cloudPlan =
      cloudUser && cloudUser.plan
        ? normalizeAccessPlan(cloudUser.plan)
        : null;
    const plan = resolveAccessPlan(envPlan, cloudPlan, licensePlan);
    const source: AccessPlanState['source'] = isPaid(envPlan)
      ? 'env'
      : licensePlan && isPaid(licensePlan)
        ? 'license'
        : cloudPlan && isPaid(cloudPlan)
          ? 'cloud'
          : 'free';

    return {
      plan,
      label: getAccessPlanLabel(plan),
      usageLimitEnabled: isUsageLimitEnabled(plan),
      source,
      isLoading:
        authLoading ||
        licenseLoading ||
        (isAuthenticated && cloudUser === undefined),
      isAuthenticated,
    };
  }, [envPlan, cloudUser, authLoading, isAuthenticated, licensePlan, licenseLoading]);
}
