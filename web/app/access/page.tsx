import type { Metadata } from 'next';
import { isAccessProtectionEnabled, normalizeNextPath } from '@/lib/access-control';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Accès privé',
  robots: {
    index: false,
    follow: false,
  },
};

type AccessPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next);
  const hasError = params.error === '1';

  if (!isAccessProtectionEnabled()) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12 text-ink">
      <section className="w-full max-w-sm rounded-lg border border-line bg-white p-6 shadow-sm dark:border-line-2 dark:bg-paper-2">
        <div className="mb-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-ink text-sm font-semibold text-paper">
            BD
          </div>
          <h1 className="text-xl font-semibold leading-tight">Accès privé BIMCHECK-Rename</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Entrez le mot de passe fourni pour accéder à l’application.
          </p>
        </div>

        <form action="/api/access" method="post" className="space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:border-line-2 dark:bg-paper"
            />
            {hasError && (
              <p className="mt-2 text-sm text-brick-deep" role="alert">
                Mot de passe incorrect.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
          >
            Accéder
          </button>
        </form>
      </section>
    </main>
  );
}
