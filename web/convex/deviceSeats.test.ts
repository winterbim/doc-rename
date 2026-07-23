import { describe, expect, it } from 'vitest';
import {
  MAX_REACTIVATIONS_PER_DAY,
  REACTIVATION_WINDOW_MS,
  bindDevice,
  isDeviceActive,
  isReactivationRateLimited,
  pruneReactivations,
  seatsForPlan,
} from './deviceSeats';

const NOW = 1_700_000_000_000;

describe('seatsForPlan', () => {
  it('Team et Pilote : 1 poste · Cabinet : 3 postes', () => {
    expect(seatsForPlan('team')).toBe(1);
    expect(seatsForPlan('pilot')).toBe(1);
    expect(seatsForPlan('cabinet')).toBe(3);
  });
});

describe('isDeviceActive', () => {
  it('licence sans appareil lié (antérieure à la fonctionnalité) : actif', () => {
    expect(isDeviceActive(undefined, 'dev_a')).toBe(true);
    expect(isDeviceActive([], 'dev_a')).toBe(true);
  });

  it('appareil lié : actif · non lié : inactif', () => {
    const devices = [{ deviceId: 'dev_a', activatedAt: NOW }];
    expect(isDeviceActive(devices, 'dev_a')).toBe(true);
    expect(isDeviceActive(devices, 'dev_b')).toBe(false);
  });
});

describe('bindDevice — bascule (takeover)', () => {
  it('lie un premier appareil', () => {
    expect(bindDevice(undefined, 'dev_a', 1, NOW)).toEqual([
      { deviceId: 'dev_a', activatedAt: NOW },
    ]);
  });

  it('re-lier le même appareil rafraîchit sans dupliquer', () => {
    const devices = bindDevice(
      [{ deviceId: 'dev_a', activatedAt: NOW - 1000 }],
      'dev_a',
      1,
      NOW,
    );
    expect(devices).toHaveLength(1);
    expect(devices[0]).toEqual({ deviceId: 'dev_a', activatedAt: NOW });
  });

  it('1 poste (Team) : le nouveau PC évince l’ancien', () => {
    const devices = bindDevice(
      [{ deviceId: 'ancien_pc', activatedAt: NOW - 1000 }],
      'nouveau_pc',
      1,
      NOW,
    );
    expect(devices).toEqual([{ deviceId: 'nouveau_pc', activatedAt: NOW }]);
  });

  it('3 postes (Cabinet) : le 4e évince uniquement le plus ancien', () => {
    const devices = bindDevice(
      [
        { deviceId: 'a', activatedAt: NOW - 3000 },
        { deviceId: 'b', activatedAt: NOW - 2000 },
        { deviceId: 'c', activatedAt: NOW - 1000 },
      ],
      'd',
      3,
      NOW,
    );
    expect(devices.map((d) => d.deviceId)).toEqual(['d', 'c', 'b']);
    expect(devices.map((d) => d.deviceId)).not.toContain('a');
  });
});

describe('rate limit des réactivations', () => {
  it('sous la limite : autorisé', () => {
    const stamps = Array.from({ length: MAX_REACTIVATIONS_PER_DAY - 1 }, (_, i) => NOW - i);
    expect(isReactivationRateLimited(stamps, NOW)).toBe(false);
  });

  it('à la limite dans la fenêtre 24 h : bloqué', () => {
    const stamps = Array.from({ length: MAX_REACTIVATIONS_PER_DAY }, (_, i) => NOW - i * 1000);
    expect(isReactivationRateLimited(stamps, NOW)).toBe(true);
  });

  it('les horodatages hors fenêtre sont purgés', () => {
    const old = NOW - REACTIVATION_WINDOW_MS - 1;
    expect(pruneReactivations([old, NOW - 10], NOW)).toEqual([NOW - 10]);
    expect(
      isReactivationRateLimited(
        Array.from({ length: MAX_REACTIVATIONS_PER_DAY }, () => old),
        NOW,
      ),
    ).toBe(false);
  });
});
