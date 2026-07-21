'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { buildContactMailto } from '@/lib/contact';
import { HAS_DIRECT_CHECKOUT, PAID_PILOT_PRICE_LABEL } from '@/lib/pricing';
import {
  PILOT_CONVENTIONS,
  PILOT_INDUSTRIES,
  PILOT_MONTHLY_VOLUMES,
  PILOT_OFFERS,
} from '@/lib/pilot-request';

type PilotFormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  industry: string;
  currentTool: string;
  monthlyFiles: string;
  convention: string;
  message: string;
  consent: boolean;
  website: string;
};

const initialState: PilotFormState = {
  name: '',
  email: '',
  company: '',
  role: '',
  industry: 'BIM / Construction',
  currentTool: 'GED / dossier partagé',
  monthlyFiles: '50-200',
  convention: 'Convention interne',
  message: '',
  consent: false,
  website: '',
};

function buildMailto(values: PilotFormState): string {
  const subject = `Demande pilote BIMCHECK-Rename - ${values.company || 'équipe'}`;
  const body = [
    'Bonjour,',
    '',
    `Je souhaite échanger sur le pilote BIMCHECK-Rename (tarif public annoncé : ${PAID_PILOT_PRICE_LABEL}).`,
    HAS_DIRECT_CHECKOUT
      ? 'Merci de me répondre avec les prochaines étapes de facturation.'
      : 'Je comprends que cette demande ne déclenche aucun paiement ni engagement en ligne.',
    '',
    `Nom : ${values.name}`,
    `Email : ${values.email}`,
    `Organisation : ${values.company}`,
    `Rôle : ${values.role}`,
    `Métier : ${values.industry}`,
    `Outil / plateforme actuelle : ${values.currentTool}`,
    `Volume mensuel : ${values.monthlyFiles} fichiers`,
    `Convention : ${values.convention}`,
    '',
    'Contexte / besoin :',
    values.message || '-',
    '',
    'Je confirme ne pas envoyer de fichiers confidentiels par email sans accord préalable.',
  ].join('\n');

  return buildContactMailto(subject, body);
}

export function PilotRequestForm() {
  const [values, setValues] = useState<PilotFormState>(initialState);
  const [submission, setSubmission] = useState<
    | { state: 'idle' | 'sending' }
    | { state: 'success'; reference: string }
    | { state: 'error'; message: string }
  >({ state: 'idle' });

  const mailtoHref = useMemo(() => buildMailto(values), [values]);
  const isReady =
    values.email.trim().length > 0 &&
    values.company.trim().length > 0 &&
    values.consent &&
    submission.state !== 'sending';

  function updateField<K extends keyof PilotFormState>(field: K, value: PilotFormState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ state: 'sending' });

    const queryPlan = new URLSearchParams(globalThis.location.search).get('plan');
    const offer = PILOT_OFFERS.includes(queryPlan as (typeof PILOT_OFFERS)[number])
      ? (queryPlan as (typeof PILOT_OFFERS)[number])
      : 'pilot';

    try {
      const response = await fetch('/api/pilot-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, offer }),
      });
      const result = (await response.json().catch(() => null)) as
        | { accepted?: boolean; reference?: string; error?: string }
        | null;
      if (!response.ok || !result?.accepted || !result.reference) {
        throw new Error(result?.error || 'La demande n’a pas pu être transmise.');
      }
      setSubmission({ state: 'success', reference: result.reference });
    } catch (error) {
      setSubmission({
        state: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'La demande n’a pas pu être transmise.',
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative grid min-w-0 gap-4"
      aria-busy={submission.state === 'sending'}
    >
      <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Site web (laisser vide)
        <input
          value={values.website}
          onChange={(event) => updateField('website', event.target.value)}
          name="website"
          autoComplete="off"
          tabIndex={-1}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Nom
          <input
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Email pro
          <input
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
            type="email"
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
            autoComplete="email"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Organisation
          <input
            value={values.company}
            onChange={(event) => updateField('company', event.target.value)}
            required
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
            autoComplete="organization"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Rôle
          <input
            value={values.role}
            onChange={(event) => updateField('role', event.target.value)}
            placeholder="Ex. BIM Manager, juriste, responsable qualité…"
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Métier principal
          <select
            value={values.industry}
            onChange={(event) => updateField('industry', event.target.value)}
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
          >
            {PILOT_INDUSTRIES.map((industry) => <option key={industry}>{industry}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Outil / plateforme actuelle
          <input
            value={values.currentTool}
            onChange={(event) => updateField('currentTool', event.target.value)}
            placeholder="Ex. SharePoint, Autodesk Docs, dossier réseau…"
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Volume mensuel de fichiers
          <select
            value={values.monthlyFiles}
            onChange={(event) => updateField('monthlyFiles', event.target.value)}
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
          >
            {PILOT_MONTHLY_VOLUMES.map((volume) => <option key={volume}>{volume}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Convention
          <select
            value={values.convention}
            onChange={(event) => updateField('convention', event.target.value)}
            className="min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
          >
            {PILOT_CONVENTIONS.map((convention) => <option key={convention}>{convention}</option>)}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Contexte du pilote
        <textarea
          value={values.message}
          onChange={(event) => updateField('message', event.target.value)}
          rows={5}
          placeholder="Ex. Nous préparons 200 documents par mois et devons appliquer une convention client avant chaque livraison."
          className="min-w-0 resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20 dark:bg-paper-2"
        />
      </label>

      <label className="flex items-start gap-3 text-sm leading-6 text-ink-soft">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(event) => updateField('consent', event.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0 accent-brick"
        />
        <span>
          J’accepte que mes coordonnées et mon besoin soient utilisés pour répondre à cette demande,
          conformément à la{' '}
          <Link href="/privacy" className="text-brick underline underline-offset-2 hover:text-brick-deep">
            politique de confidentialité
          </Link>.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!isReady}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-brick disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submission.state === 'sending' ? 'Transmission…' : 'Envoyer la demande'}
        </button>
        <a
          href={mailtoHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-paper"
        >
          Envoyer plutôt un email
        </a>
      </div>

      <p className="text-xs leading-5 text-ink-mute">
        Le formulaire transmet uniquement les informations saisies au canal commercial privé de
        BIMCHECK-Rename. Aucun document ni nom de fichier n’est transmis ; n’ajoutez pas de donnée
        projet confidentielle dans le message.
        {!HAS_DIRECT_CHECKOUT && ' Aucun paiement ni engagement n’est déclenché par cette demande.'}
      </p>

      {submission.state === 'success' && (
        <p className="rounded-md border border-olive/30 bg-olive/10 px-3 py-2 text-sm text-olive" role="status">
          Demande transmise et enregistrée. Référence :{' '}
          <span className="font-mono">{submission.reference}</span>. Nous vous répondrons par email.
        </p>
      )}
      {submission.state === 'error' && (
        <p className="rounded-md border border-brick/30 bg-brick/10 px-3 py-2 text-sm text-brick-deep" role="alert">
          {submission.message} Vous pouvez utiliser « Envoyer plutôt un email » sans joindre de fichier confidentiel.
        </p>
      )}
    </form>
  );
}
