import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-bg py-20">
      <Container size="sm">
        <Card variant="elevated" padding="xl" className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Erreur 404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Page introuvable</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Cette adresse n’existe pas ou a été déplacée. Vos fichiers locaux n’ont pas été
            affectés.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">Revenir à l’accueil</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/app">Ouvrir l’atelier Free</Link>
            </Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}
