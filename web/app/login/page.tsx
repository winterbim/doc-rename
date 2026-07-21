import { LoginPageDynamic } from './LoginPageDynamic';
import { AuthUnavailable } from '@/components/AuthUnavailable';
import { PAID_ACCOUNTS_ENABLED } from '@/lib/features';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return PAID_ACCOUNTS_ENABLED ? <LoginPageDynamic /> : <AuthUnavailable />;
}
