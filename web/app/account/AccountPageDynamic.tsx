'use client';

import dynamic from 'next/dynamic';

const AccountPageClient = dynamic(
  () => import('./AccountPageClient'),
  { ssr: false }
);

export function AccountPageDynamic() {
  return <AccountPageClient />;
}
