import { describe, expect, it } from 'vitest';
import { validatePilotRequest } from '../pilot-request';

const validRequest = {
  name: 'Camille Martin',
  email: 'Camille@Example.com',
  company: 'Atelier Exemple',
  role: 'BIM Manager',
  industry: 'BIM / Construction',
  currentTool: 'Autodesk Docs',
  monthlyFiles: '200-1000',
  convention: 'ISO 19650 / BEP projet',
  message: 'Besoin de fiabiliser les dépôts.',
  offer: 'pilot',
  consent: true,
  website: '',
};

describe('validatePilotRequest', () => {
  it('normalizes a valid request without adding document data', () => {
    const result = validatePilotRequest(validRequest);
    expect(result).toEqual({
      ok: true,
      value: { ...validRequest, email: 'camille@example.com' },
    });
  });

  it.each([
    [{ ...validRequest, email: 'invalid' }, 'Adresse email invalide.'],
    [{ ...validRequest, company: '' }, 'Organisation requis.'],
    [{ ...validRequest, consent: false }, 'Votre accord est requis'],
    [{ ...validRequest, website: 'https://spam.example' }, 'Demande non transmise.'],
    [{ ...validRequest, offer: 'enterprise' }, 'Une option sélectionnée est invalide.'],
  ])('rejects invalid or automated input', (input, message) => {
    const result = validatePilotRequest(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain(message);
  });

  it('enforces the message length limit', () => {
    const result = validatePilotRequest({ ...validRequest, message: 'x'.repeat(2_001) });
    expect(result.ok).toBe(false);
  });
});
