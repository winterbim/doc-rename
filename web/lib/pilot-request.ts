export const PILOT_INDUSTRIES = [
  'BIM / Construction',
  'Juridique',
  'Finance',
  'Ressources humaines',
  'Santé',
  'Industrie',
  'Immobilier',
  'Autre',
] as const;

export const PILOT_MONTHLY_VOLUMES = [
  'Moins de 50',
  '50-200',
  '200-1000',
  '1000+',
] as const;

export const PILOT_CONVENTIONS = [
  'Convention interne',
  'Convention client / donneur d’ordre',
  'ISO 19650 / BEP projet',
  'SIA 2051',
  'Règles réglementaires ou métier',
  'À construire',
] as const;

export const PILOT_OFFERS = ['pilot', 'team', 'cabinet'] as const;

export type PilotRequestPayload = {
  name: string;
  email: string;
  company: string;
  role: string;
  industry: (typeof PILOT_INDUSTRIES)[number];
  currentTool: string;
  monthlyFiles: (typeof PILOT_MONTHLY_VOLUMES)[number];
  convention: (typeof PILOT_CONVENTIONS)[number];
  message: string;
  offer: (typeof PILOT_OFFERS)[number];
  consent: true;
  website: string;
};

type ValidationResult =
  | { ok: true; value: PilotRequestPayload }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(
  source: Record<string, unknown>,
  key: string,
  label: string,
  maxLength: number,
  required = false,
): string | { error: string } {
  const raw = source[key];
  if (typeof raw !== 'string') return { error: `${label} invalide.` };
  const normalized = raw.trim();
  if (required && !normalized) return { error: `${label} requis.` };
  if (normalized.length > maxLength) {
    return { error: `${label} trop long (${maxLength} caractères maximum).` };
  }
  return normalized;
}

function choice<const T extends readonly string[]>(
  source: Record<string, unknown>,
  key: string,
  values: T,
  fallback?: T[number],
): T[number] | null {
  const raw = source[key];
  if (typeof raw === 'string' && (values as readonly string[]).includes(raw)) {
    return raw as T[number];
  }
  return raw === undefined ? (fallback ?? null) : null;
}

export function validatePilotRequest(input: unknown): ValidationResult {
  const source = record(input);
  if (!source) return { ok: false, error: 'Demande invalide.' };

  const name = text(source, 'name', 'Nom', 120);
  const email = text(source, 'email', 'Email', 254, true);
  const company = text(source, 'company', 'Organisation', 160, true);
  const role = text(source, 'role', 'Rôle', 120);
  const currentTool = text(source, 'currentTool', 'Outil actuel', 160);
  const message = text(source, 'message', 'Contexte', 2_000);
  const website = text(source, 'website', 'Champ de contrôle', 200);

  if (typeof name !== 'string') return { ok: false, error: name.error };
  if (typeof email !== 'string') return { ok: false, error: email.error };
  if (typeof company !== 'string') return { ok: false, error: company.error };
  if (typeof role !== 'string') return { ok: false, error: role.error };
  if (typeof currentTool !== 'string') return { ok: false, error: currentTool.error };
  if (typeof message !== 'string') return { ok: false, error: message.error };
  if (typeof website !== 'string') return { ok: false, error: website.error };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  if (source.consent !== true) {
    return { ok: false, error: 'Votre accord est requis pour transmettre la demande.' };
  }
  if (website) return { ok: false, error: 'Demande non transmise.' };

  const industry = choice(source, 'industry', PILOT_INDUSTRIES);
  const monthlyFiles = choice(source, 'monthlyFiles', PILOT_MONTHLY_VOLUMES);
  const convention = choice(source, 'convention', PILOT_CONVENTIONS);
  const offer = choice(source, 'offer', PILOT_OFFERS, 'pilot');
  if (!industry || !monthlyFiles || !convention || !offer) {
    return { ok: false, error: 'Une option sélectionnée est invalide.' };
  }

  return {
    ok: true,
    value: {
      name,
      email: email.toLowerCase(),
      company,
      role,
      industry,
      currentTool,
      monthlyFiles,
      convention,
      message,
      offer,
      consent: true,
      website: '',
    },
  };
}
