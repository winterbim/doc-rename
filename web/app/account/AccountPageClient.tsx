'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAccessPlan } from '@/lib/hooks/useAccessPlan';
import { teamPlan, cabinetPlan, formatPlanPrice } from '@/lib/pricing';

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function AccountContent() {
  const { signOut } = useAuthActions();
  const organizations = useQuery(api.organizations.listMyOrganizations);
  const conventions = useQuery(api.conventions.listConventions, { orgId: undefined });
  const createOrg = useMutation(api.organizations.createOrganization);
  const cloudUser = useQuery(api.users.currentUser);
  const access = useAccessPlan();

  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!orgName.trim()) return;

    setIsCreating(true);
    try {
      const slug = slugify(orgName);
      await createOrg({
        name: orgName.trim(),
        slug,
      });
      setOrgName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-paper">
                BC
              </span>
              <span className="font-semibold">BIMCHECK-Rename</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              Se déconnecter
            </Button>
          </div>
        </Container>
      </header>

      <main className="py-10">
        <Container size="md">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Mon compte</h1>
          <p className="mt-1 text-ink-soft">
            Gérez votre plan, vos conventions et vos équipes.
          </p>

          <Card variant="elevated" padding="lg" className="mt-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Plan actuel
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-ink">{access.label}</h2>
                  <Badge variant={access.usageLimitEnabled ? 'soft' : 'primary'} size="sm">
                    {access.usageLimitEnabled ? 'Quota Free' : 'Illimité'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {cloudUser?.email ? (
                    <>Connecté en tant que <strong className="text-ink">{cloudUser.email}</strong></>
                  ) : (
                    'Compte authentifié — plan cloud mis à jour après paiement.'
                  )}
                  {access.source === 'env' && (
                    <span className="block text-xs text-ink-mute mt-1">
                      Plan provisionné au niveau déploiement.
                    </span>
                  )}
                </p>
              </div>
              {access.usageLimitEnabled ? (
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={teamPlan.cta.href}>{formatPlanPrice(teamPlan)} — Team</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={cabinetPlan.cta.href}>Cabinet</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm" variant="secondary">
                  <Link href="/app">Ouvrir l’atelier</Link>
                </Button>
              )}
            </div>
          </Card>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-ink">Mes conventions</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Conventions sauvegardées sur votre compte personnel.
              </p>

              {conventions === undefined ? (
                <div className="mt-4 h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ) : conventions.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-ink-soft">Aucune convention enregistrée.</p>
                  <Button variant="secondary" size="sm" className="mt-3" asChild>
                    <Link href="/app">Créer une convention</Link>
                  </Button>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {conventions.map((c) => (
                    <li key={c._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-xs text-ink-mute">
                          {c.profileId} · v{c.version ?? 1}
                        </p>
                      </div>
                      <Badge variant="soft" size="sm">Perso</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-ink">Mes équipes</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Organisations auxquelles vous appartenez.
              </p>

              {organizations === undefined ? (
                <div className="mt-4 h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ) : organizations.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm text-ink-soft">Vous n’appartenez à aucune équipe.</p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {organizations.map((org) => (
                    <li key={org._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-ink">{org.name}</p>
                        <p className="text-xs text-ink-mute">
                          {org.plan} · {org.role}
                        </p>
                      </div>
                      <Badge variant={org.plan === 'cabinet' ? 'accent' : 'soft'} size="sm">
                        {org.plan}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleCreateOrg} className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-ink">Créer une équipe</h3>
                <Input
                  placeholder="Nom de l’équipe"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
                <p className="text-xs text-ink-mute">
                  L’équipe reprend automatiquement le plan vérifié de votre compte.
                </p>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={isCreating || !orgName.trim()}
                >
                  {isCreating ? 'Création…' : 'Créer l’équipe'}
                </Button>
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default function AccountPage() {
  return <AccountContent />;
}
