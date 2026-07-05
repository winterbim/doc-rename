'use client';

import dynamic from 'next/dynamic';

const LoginPageClient = dynamic(
  () => import('./LoginPageClient'),
  { ssr: false }
);

export function LoginPageDynamic() {
  return <LoginPageClient />;
}
