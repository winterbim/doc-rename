/**
 * Modèle pur des « postes actifs » par licence (testé unitairement).
 *
 * - Team / Pilote : 1 poste actif · Cabinet : 3 postes actifs.
 * - Bascule (takeover) : lier un nouveau poste au-delà du quota évince le
 *   poste le plus ancien — le client honnête change de PC sans support,
 *   le partage de clé devient inutilisable (déconnexions mutuelles).
 */
export interface LicenseDevice {
  deviceId: string;
  activatedAt: number;
}

export type SeatPlan = 'team' | 'cabinet' | 'pilot';

export function seatsForPlan(plan: SeatPlan): number {
  return plan === 'cabinet' ? 3 : 1;
}

export function isDeviceActive(
  devices: LicenseDevice[] | undefined,
  deviceId: string,
): boolean {
  // Licence d'avant la fonctionnalité « postes » : aucun appareil lié encore.
  if (!devices || devices.length === 0) return true;
  return devices.some((d) => d.deviceId === deviceId);
}

/**
 * Lie `deviceId` à la licence et retourne la nouvelle liste d'appareils.
 * Évince les plus anciens si le quota de postes est dépassé.
 */
export function bindDevice(
  devices: LicenseDevice[] | undefined,
  deviceId: string,
  seats: number,
  now: number,
): LicenseDevice[] {
  const kept = (devices ?? []).filter((d) => d.deviceId !== deviceId);
  kept.push({ deviceId, activatedAt: now });
  // Trie du plus récent au plus ancien, garde `seats` postes.
  return kept
    .sort((a, b) => b.activatedAt - a.activatedAt)
    .slice(0, Math.max(1, seats));
}

/** Fenêtre glissante de réactivations : anti-abus (10 / 24 h). */
export const MAX_REACTIVATIONS_PER_DAY = 10;
export const REACTIVATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export function pruneReactivations(timestamps: number[] | undefined, now: number): number[] {
  return (timestamps ?? []).filter((t) => now - t < REACTIVATION_WINDOW_MS);
}

export function isReactivationRateLimited(
  timestamps: number[] | undefined,
  now: number,
): boolean {
  return pruneReactivations(timestamps, now).length >= MAX_REACTIVATIONS_PER_DAY;
}
