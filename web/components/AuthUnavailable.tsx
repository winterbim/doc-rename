import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AuthUnavailable() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2 text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-paper">
                BC
              </span>
              <span className="font-semibold">BIMCHECK-Rename</span>
            </Link>
          </div>
        </Container>
      </header>
      <main className="py-20">
        <Container size="sm">
          <Card variant="elevated" padding="xl" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Accès Free immédiat
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              Les comptes équipe ne sont pas encore ouverts.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              L’atelier local reste entièrement disponible sans compte. Aucune connexion Google
              ou GitHub ne vous sera proposée tant que le service cloud n’est pas activé.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/app">Utiliser l’atelier Free</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/pilot">Demander un pilote</Link>
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    </div>
  );
}
