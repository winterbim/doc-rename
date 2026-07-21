/**
 * BIM Work Lots (Lots de Travail)
 * Ported 1:1 from extension/js/config.js — CONFIG.WORK_LOTS
 */

import type { WorkLot } from '../types';

export const WORK_LOTS: WorkLot[] = [
  // === STRUCTURE & GROS ŒUVRE ===
  { code: 'ARC', name: 'Architecture', category: 'structure', tooltip: 'Plans architecturaux, façades, aménagements intérieurs' },
  { code: 'STR', name: 'Structure', category: 'structure', tooltip: 'Béton armé, charpente métallique, bois, calculs' },
  { code: 'FER', name: 'Ferraillage', category: 'structure', tooltip: 'Plans de ferraillage béton armé, armatures' },
  { code: 'TER', name: 'Terrassement', category: 'structure', tooltip: 'Excavations, remblais, mouvements de terre' },
  { code: 'DEM', name: 'Démolition', category: 'structure', tooltip: 'Plans de démolition, curage, désamiantage' },
  { code: 'FOU', name: 'Fondations', category: 'structure', tooltip: 'Fondations spéciales, pieux, micropieux' },

  // === ENVELOPPE ===
  { code: 'FAC', name: 'Façades', category: 'envelope', tooltip: 'Façades, bardage, isolation extérieure, murs rideaux' },
  { code: 'COU', name: 'Couverture', category: 'envelope', tooltip: 'Toiture, étanchéité, zinguerie, charpente' },
  { code: 'MEN', name: 'Menuiseries ext.', category: 'envelope', tooltip: 'Fenêtres, portes extérieures, volets, stores' },
  { code: 'SER', name: 'Serrurerie', category: 'envelope', tooltip: 'Métallerie, garde-corps, escaliers métalliques' },

  // === FLUIDES (CVC) ===
  { code: 'CVC', name: 'CVC/HVAC', category: 'mep', tooltip: 'Chauffage, Ventilation, Climatisation - global' },
  { code: 'CHA', name: 'Chauffage', category: 'mep', tooltip: 'Production et distribution de chaleur, radiateurs' },
  { code: 'CLI', name: 'Climatisation', category: 'mep', tooltip: 'Production et distribution de froid, splits, VRV' },
  { code: 'VEN', name: 'Ventilation', category: 'mep', tooltip: 'VMC, CTA, désenfumage, gaines, diffuseurs' },
  { code: 'SAN', name: 'Sanitaire', category: 'mep', tooltip: 'Eau chaude/froide, évacuations, appareils' },
  { code: 'PLB', name: 'Plomberie', category: 'mep', tooltip: 'Réseaux eau, robinetterie, appareils sanitaires' },
  { code: 'HYD', name: 'Hydraulique', category: 'mep', tooltip: 'Réseaux hydrauliques, pompes, vannes' },

  // === ÉLECTRICITÉ ===
  { code: 'ELE', name: 'Électricité', category: 'elec', tooltip: 'Distribution électrique générale, prises, éclairage' },
  { code: 'CFO', name: 'Courants forts', category: 'elec', tooltip: 'HT/BT, TGBT, tableaux, distribution principale' },
  { code: 'CFA', name: 'Courants faibles', category: 'elec', tooltip: 'Informatique, téléphonie, contrôle d\'accès, interphonie' },
  { code: 'LUM', name: 'Éclairage', category: 'elec', tooltip: 'Luminaires, éclairage de sécurité, BAES' },

  // === SÉCURITÉ INCENDIE ===
  { code: 'SEC', name: 'Sécurité incendie', category: 'security', tooltip: 'Détection, alarme, compartimentage, issues' },
  { code: 'SSI', name: 'SSI', category: 'security', tooltip: 'Système de Sécurité Incendie, CMSI, DAI' },
  { code: 'SPK', name: 'Sprinkler', category: 'security', tooltip: 'Extinction automatique à eau, têtes, réseaux' },
  { code: 'EXT', name: 'Extinction', category: 'security', tooltip: 'Extincteurs, RIA, colonnes sèches/humides' },
  { code: 'DES', name: 'Désenfumage', category: 'security', tooltip: 'Évacuation des fumées, exutoires, ventilateurs' },

  // === ÉQUIPEMENTS ===
  { code: 'ASC', name: 'Ascenseurs', category: 'equipment', tooltip: 'Ascenseurs, monte-charges, escalators, PMR' },
  { code: 'CUI', name: 'Cuisine pro', category: 'equipment', tooltip: 'Équipements cuisine professionnelle, hottes, froid' },
  { code: 'GTB', name: 'GTB/GTC', category: 'equipment', tooltip: 'Gestion Technique du Bâtiment, supervision, automates' },

  // === AMÉNAGEMENTS INTÉRIEURS ===
  { code: 'INT', name: 'Aménagements int.', category: 'interior', tooltip: 'Cloisons, faux-plafonds, menuiseries intérieures' },
  { code: 'SOL', name: 'Sols', category: 'interior', tooltip: 'Revêtements de sols, chapes, carrelage, parquet' },
  { code: 'MOB', name: 'Mobilier', category: 'interior', tooltip: 'Mobilier fixe, équipements intégrés, signalétique' },

  // === EXTÉRIEURS ===
  { code: 'VRD', name: 'VRD', category: 'exterior', tooltip: 'Voirie, Réseaux, Divers - aménagements extérieurs' },
  { code: 'PAY', name: 'Paysage', category: 'exterior', tooltip: 'Espaces verts, plantations, arrosage automatique' },
  { code: 'CAN', name: 'Canalisations', category: 'exterior', tooltip: 'Réseaux enterrés, assainissement, eaux pluviales' },

  // === COORDINATION & DIVERS ===
  { code: 'SYN', name: 'Synthèse', category: 'coord', tooltip: 'Synthèse technique tous corps d\'état, coordination' },
  { code: 'GEO', name: 'Géomètre', category: 'coord', tooltip: 'Implantation, relevés, topographie, bornage' },
  { code: 'BIM', name: 'BIM Management', category: 'coord', tooltip: 'Coordination BIM, maquette numérique, fédération' },
  { code: 'PIC', name: 'Installation chantier', category: 'coord', tooltip: 'Plan d\'Installation de Chantier, base vie, grues' },
  { code: 'GAZ', name: 'Gaz spéciaux', category: 'mep', tooltip: 'Argon, azote, oxygène, vide, air comprimé médical' },
  { code: 'SGV', name: 'Géothermie', category: 'mep', tooltip: 'Sondes géothermiques, pompes à chaleur géothermiques' },
];

export function getWorkLot(code: string): WorkLot | undefined {
  return WORK_LOTS.find(w => w.code === code);
}
