'use client';

import { CurrencySwitcher } from '@/components/commercial/CurrencySwitcher';
import { useCurrency } from '@/lib/hooks/useCurrency';
import {
  convertFromEur,
  formatMoney,
  FREE_DAILY_LOTS,
  getCabinetCta,
  getPilotCta,
  getTeamCta,
  TEAM_PRICE_EUR,
  CABINET_PRICE_EUR,
  PILOT_PRICE_EUR,
  CURRENCIES,
} from '@/lib/pricing';

/**
 * Landing pricing block with live currency switch (EUR / CHF / USD).
 * Styles come from landing page CSS classes (.plan, .button, …).
 */
export function LandingPricing() {
  const { currency, setCurrency } = useCurrency();
  const teamPrice = convertFromEur(TEAM_PRICE_EUR, currency);
  const cabinetPrice = convertFromEur(CABINET_PRICE_EUR, currency);
  const pilotLabel = formatMoney(convertFromEur(PILOT_PRICE_EUR, currency), currency);
  const unit = currency === 'EUR' ? '€' : CURRENCIES[currency].symbol;
  const teamCta = getTeamCta(currency);
  const cabinetCta = getCabinetCta(currency);
  const pilotCta = getPilotCta(currency);
  const perMonth =
    currency === 'EUR' ? `${unit} / mois` : currency === 'USD' ? `${unit}/mo` : `${unit} / mois`;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <CurrencySwitcher currency={currency} onChange={setCurrency} />
        <p className="small-note" style={{ margin: 0, textAlign: 'center', maxWidth: 420 }}>
          Devise d’affichage : {CURRENCIES[currency].label}. Hors euro = conversion indicative (base EUR).
        </p>
      </div>

      <div className="pricing grid-3">
        <article className="plan">
          <div className="plan-top">
            <h3>Free</h3>
            <span className="badge">Pour tester</span>
          </div>
          <p className="price">
            0 <small>{unit === '€' ? '€' : unit}</small>
          </p>
          <p className="muted">{FREE_DAILY_LOTS} lots de renommage par jour. Sans compte.</p>
          <ul>
            <li>Tous les profils métier</li>
            <li>Convention personnalisée</li>
            <li>Aperçu Avant / Après</li>
            <li>Traitement local navigateur</li>
            <li>Export ZIP propre</li>
          </ul>
          <a className="button secondary" href="/app">
            Essayer maintenant
          </a>
        </article>

        <article className="plan team">
          <div className="plan-top">
            <h3>Team</h3>
            <span className="badge">Le plus choisi</span>
          </div>
          <p className="price">
            {teamPrice} <small>{perMonth}</small>
          </p>
          <p className="muted">Lots illimités + convention partagée en équipe.</p>
          <ul>
            <li>Jusqu’à 10 utilisateurs</li>
            <li>Sync des conventions (JSON)</li>
            <li>3 projets</li>
            <li>Support email</li>
            <li>Sans upload de vos fichiers</li>
          </ul>
          <a
            className="button primary"
            href={teamCta.href}
            {...(teamCta.checkout ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {teamCta.label}
          </a>
        </article>

        <article className="plan pro">
          <div className="plan-top">
            <h3>Cabinet</h3>
            <span className="badge">Multi-équipes</span>
          </div>
          <p className="price">
            {cabinetPrice} <small>{perMonth}</small>
          </p>
          <p className="muted">Volume élevé, support prioritaire.</p>
          <ul>
            <li>Utilisateurs illimités</li>
            <li>Projets illimités</li>
            <li>Sync cloud des conventions</li>
            <li>Support prioritaire</li>
            <li>Devis / virement possible</li>
          </ul>
          <a
            className="button primary"
            href={cabinetCta.href}
            {...(cabinetCta.checkout ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {cabinetCta.label}
          </a>
        </article>
      </div>

      <p className="small-note" style={{ marginTop: 30 }}>
        Besoin d’un déploiement on-premise, SSO ou DPA Entreprise ?{' '}
        <a href="/pilot" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          Parlons-en →
        </a>
      </p>

      <div className="paid-pilot">
        <div>
          <strong>Pilote 14 jours — {pilotLabel}</strong>
          <p>
            Onboarding 30 min, convention reproduite, test sur lot non confidentiel et décision
            Team/Cabinet. Prix volontairement bas pour valider le gain sans risque.
          </p>
        </div>
        <a
          className="button primary"
          href={pilotCta.href}
          {...(pilotCta.checkout ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {pilotCta.label}
        </a>
      </div>
    </>
  );
}
