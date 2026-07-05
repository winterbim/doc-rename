'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '@/convex/_generated/api';
import { useAppContext, type PersistedSlices } from '@/lib/app-state';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

function buildRuleJson(state: ReturnType<typeof useAppContext>['state']): string {
  const slices: PersistedSlices = {
    profileId: state.profileId,
    profileEntities: state.profileEntities,
    fields: {
      activeFieldIds: state.fields.activeFieldIds,
      values: state.fields.values,
    },
    separator: state.separator,
    cleaner: state.cleaner,
    prefixRules: state.prefixRules,
  };
  return JSON.stringify(slices);
}

export function CloudConventionToolbar() {
  const { state, dispatch } = useAppContext();
  const { signIn } = useAuthActions();
  const conventions = useQuery(api.conventions.listConventions, { orgId: undefined });
  const saveConvention = useMutation(api.conventions.saveConvention);

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await saveConvention({
        name: name.trim(),
        profileId: state.profileId,
        ruleJson: buildRuleJson(state),
      });
      setName('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = (ruleJson: string) => {
    try {
      const slices = JSON.parse(ruleJson) as PersistedSlices;
      dispatch({ type: 'STATE_HYDRATE', slices });
    } catch {
      setError('Convention corrompue');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showForm ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nom de la convention"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-40 text-xs"
          />
          <Button size="sm" onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? '…' : 'Sauver'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setShowForm(true)}>
          Sauvegarder
        </Button>
      )}

      {conventions && conventions.length > 0 && (
        <select
          aria-label="Charger une convention"
          className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-ink"
          onChange={(e) => {
            const c = conventions.find((c) => c._id === e.target.value);
            if (c) handleLoad(c.ruleJson);
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Charger…
          </option>
          {conventions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function CloudConventionToolbarLogin() {
  const { signIn } = useAuthActions();

  return (
    <Button size="sm" variant="secondary" onClick={() => void signIn('google')}>
      Se connecter pour sauvegarder
    </Button>
  );
}
