import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atelier de renommage',
  description: 'Atelier local de renommage BIMCHECK-Rename.',
  alternates: { canonical: '/app' },
  robots: { index: false, follow: false },
};

export default function AppWorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
