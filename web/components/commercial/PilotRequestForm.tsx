'use client';

import { FormEvent, useMemo, useState } from 'react';
import { buildContactMailto } from '@/lib/contact';

type PilotFormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  cde: string;
  monthlyFiles: string;
  convention: string;
  message: string;
};

const initialState: PilotFormState = {
  name: '',
  email: '',
  company: '',
  role: '',
  cde: 'Autodesk Docs / ACC',
  monthlyFiles: '50-200',
  convention: 'ISO 19650 / BEP projet',
  message: '',
};

function buildMailto(values: PilotFormState): string {
  const subject = `Pilote BimDoc Renamer - ${values.company || 'équipe BIM'}`;
  const body = [
    'Bonjour,',
    '',
    'Je souhaite tester BimDoc Renamer sur un lot réel.',
    '',
    `Nom : ${values.name}`,
    `Email : ${values.email}`,
    `Organisation : ${values.company}`,
    `Rôle : ${values.role}`,
    `CDE utilisée : ${values.cde}`,
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
  const [submitted, setSubmitted] = useState(false);

  const mailtoHref = useMemo(() => buildMailto(values), [values]);
  const isReady = values.email.trim().length > 0 && values.company.trim().length > 0;

  function updateField<K extends keyof PilotFormState>(field: K, value: PilotFormState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    globalThis.location.href = mailtoHref;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Nom
          <input
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
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
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
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
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
            autoComplete="organization"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Rôle
          <input
            value={values.role}
            onChange={(event) => updateField('role', event.target.value)}
            placeholder="BIM Manager, coordinateur BIM..."
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          CDE utilisée
          <select
            value={values.cde}
            onChange={(event) => updateField('cde', event.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
          >
            <option>Autodesk Docs / ACC</option>
            <option>Trimble Connect</option>
            <option>Kroqi</option>
            <option>ProjectWise</option>
            <option>CDE interne</option>
            <option>Autre</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Volume mensuel
          <select
            value={values.monthlyFiles}
            onChange={(event) => updateField('monthlyFiles', event.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
          >
            <option>Moins de 50</option>
            <option>50-200</option>
            <option>200-1000</option>
            <option>1000+</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Convention
          <select
            value={values.convention}
            onChange={(event) => updateField('convention', event.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
          >
            <option>ISO 19650 / BEP projet</option>
            <option>SIA 2051</option>
            <option>Convention donneur d’ordre</option>
            <option>Convention interne</option>
            <option>À construire</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Contexte du pilote
        <textarea
          value={values.message}
          onChange={(event) => updateField('message', event.target.value)}
          rows={5}
          placeholder="Ex. Nous livrons 80 fichiers PDF/DWG par jalon, avec une convention imposée par le BEP."
          className="resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brick focus:ring-2 focus:ring-brick/20"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!isReady}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-brick disabled:cursor-not-allowed disabled:opacity-50"
        >
          Demander un pilote
        </button>
        <a
          href={mailtoHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-paper"
        >
          Préparer l’email
        </a>
      </div>

      <p className="text-xs leading-5 text-ink-mute">
        Ce formulaire ouvre votre client email. Aucune donnée n’est stockée par BimDoc Renamer
        depuis cette page, et aucun fichier projet ne doit être joint avant accord.
      </p>

      {submitted && (
        <p className="rounded-md border border-olive/30 bg-olive/10 px-3 py-2 text-sm text-olive" role="status">
          Email préparé. Si votre client mail ne s’ouvre pas, utilisez le bouton “Préparer l’email”.
        </p>
      )}
    </form>
  );
}
