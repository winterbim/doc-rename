import type { AccessPlan } from '@/lib/usage-limits';

/**
 * Échelle produit — source unique des capacités par plan.
 *
 * Free (0 €)    : découvrir — 5 lots/jour, volumes d'essai.
 * Team (19 €)   : industrialiser UNE équipe — lots illimités, volumes équipe,
 *                 rapport de renommage TXT.
 * Cabinet (49 €): gérer PLUSIEURS clients — bibliothèque de conventions
 *                 multi-clients, rapport CSV d'audit, volumes maximum,
 *                 entités illimitées.
 *
 * Les plafonds « techniques » absolus restent dans lib/upload-guard.ts ;
 * ceux-ci sont les plafonds COMMERCIAUX appliqués selon la licence.
 */
export interface PlanFeatures {
  /** Nombre maximum de fichiers par lot (import cumulé). */
  maxFilesPerBatch: number;
  /** Taille maximum cumulée d'un lot en octets. */
  maxBatchBytes: number;
  /** Nombre maximum d'entités importées par profil (Infinity = illimité). */
  maxEntitiesPerProfile: number;
  /** Export du rapport de renommage TXT (preuve Avant → Après). */
  reportTxt: boolean;
  /** Export du rapport d'audit CSV (traçabilité tableur). */
  reportCsv: boolean;
  /** Bibliothèque de conventions multi-clients (enregistrer / basculer). */
  conventionLibrary: boolean;
}

const MIB = 1024 * 1024;

const FREE_FEATURES: PlanFeatures = {
  maxFilesPerBatch: 200,
  maxBatchBytes: 250 * MIB,
  maxEntitiesPerProfile: 100,
  reportTxt: false,
  reportCsv: false,
  conventionLibrary: false,
};

const TEAM_FEATURES: PlanFeatures = {
  maxFilesPerBatch: 1_000,
  maxBatchBytes: 1_024 * MIB,
  maxEntitiesPerProfile: 1_000,
  reportTxt: true,
  reportCsv: false,
  conventionLibrary: false,
};

const CABINET_FEATURES: PlanFeatures = {
  maxFilesPerBatch: 5_000,
  maxBatchBytes: 2_048 * MIB,
  maxEntitiesPerProfile: Number.POSITIVE_INFINITY,
  reportTxt: true,
  reportCsv: true,
  conventionLibrary: true,
};

export function getPlanFeatures(plan: AccessPlan): PlanFeatures {
  switch (plan) {
    case 'cabinet':
      return CABINET_FEATURES;
    // Le pilote découvre l'offre Cabinet complète pendant 14 jours.
    case 'pilot':
      return CABINET_FEATURES;
    case 'team':
    case 'pro':
      return TEAM_FEATURES;
    default:
      return FREE_FEATURES;
  }
}

export function formatBytesLimit(bytes: number): string {
  if (bytes >= 1024 * MIB) {
    const gib = bytes / (1024 * MIB);
    return `${Number.isInteger(gib) ? gib : gib.toFixed(1)} Go`;
  }
  return `${Math.round(bytes / MIB)} Mo`;
}

/** Message d'upgrade cohérent quand un plafond commercial est atteint. */
export function planLimitMessage(
  plan: AccessPlan,
  kind: 'files' | 'bytes' | 'entities',
  limit: number,
): string {
  const upgrade =
    plan === 'free' || plan === undefined
      ? ' Passez à Team (1 000 fichiers / 1 Go / 1 000 entités) ou Cabinet.'
      : plan === 'team' || plan === 'pro'
        ? ' Passez à Cabinet (5 000 fichiers / 2 Go / entités illimitées).'
        : '';
  if (kind === 'files') {
    return `Limite du plan atteinte : ${limit} fichiers par lot.${upgrade}`;
  }
  if (kind === 'bytes') {
    return `Limite du plan atteinte : ${formatBytesLimit(limit)} par lot.${upgrade}`;
  }
  return `Limite du plan atteinte : ${limit} entités par profil.${upgrade}`;
}
