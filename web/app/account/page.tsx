import { AccountPageDynamic } from './AccountPageDynamic';
import { AuthUnavailable } from '@/components/AuthUnavailable';
import { PAID_ACCOUNTS_ENABLED } from '@/lib/features';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compte',
  alternates: { canonical: '/account' },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return PAID_ACCOUNTS_ENABLED ? <AccountPageDynamic /> : <AuthUnavailable />;
}
