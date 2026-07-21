/**
 * BIM Companies (Entreprises — fournisseurs, entreprises générales, ingénierie)
 *
 * Catalogue CH + FR + marques équipements, trié par code, codes uniques.
 * Affichage UI : une seule ligne `CODE — Raison sociale` (évite le double
 * affichage code/nom du datalist navigateur).
 */

import type { Company } from '../types';

/** Separator used in searchable company option labels. */
export const COMPANY_OPTION_SEP = ' — ';

export const COMPANIES: Company[] = [
  // --- A ---
  { code: 'ABB', name: 'ABB', lots: ['ELE', 'CFO', 'GTB'] },
  { code: 'ABB_SUISSE', name: 'ABB Suisse', lots: ['ELE', 'CFO', 'GTB'] },
  { code: 'ACOUPHEN', name: 'Acouphen', lots: ['SYN', 'BIM'] },
  { code: 'AFRY', name: 'AFRY', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'AFRY_SUISSE', name: 'AFRY Suisse', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'AGTAN', name: 'Agtan', lots: [] },
  { code: 'AIA_LIFE_DESIGNERS', name: 'AIA Life Designers', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'AIRWELL', name: 'Airwell', lots: ['CVC', 'CLI'] },
  { code: 'ALPIQ', name: 'Alpiq', lots: ['ELE', 'CFO', 'CVC', 'GTB'] },
  { code: 'ALTAREA', name: 'Altarea', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'AMSTEIN_WALTHERT', name: 'Amstein + Walthert', lots: ['CVC', 'ELE', 'CFO', 'CFA', 'GTB', 'BIM'] },
  { code: 'APAVE', name: 'Apave', lots: ['SYN', 'BIM', 'STR', 'SEC'] },
  { code: 'AREP', name: 'AREP', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'ARTELIA', name: 'Artelia', lots: ['BIM', 'SYN', 'CVC', 'ELE', 'STR', 'VRD'] },
  { code: 'ARUP', name: 'Arup', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'ARUP_SUISSE', name: 'Arup Suisse', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'ASSYSTEM', name: 'Assystem', lots: ['BIM', 'SYN', 'ELE', 'CVC'] },
  { code: 'ATELIERS_JEAN_NOUVEL', name: 'Ateliers Jean Nouvel', lots: ['ARC', 'BIM'] },
  { code: 'ATOS', name: 'Atos', lots: ['GTB', 'CFA'] },
  { code: 'AUTODESK', name: 'Autodesk', lots: ['BIM'] },
  { code: 'AXIMA', name: 'Axima (Equans)', lots: ['CVC', 'VEN', 'CLI', 'GTB'] },
  { code: 'AXIMA_CONCEPT', name: 'Axima Concept', lots: ['CVC', 'VEN', 'CLI', 'GTB'] },

  // --- B ---
  { code: 'BAUDIN_CHATEAUNEUF', name: 'Baudin Châteauneuf', lots: ['STR', 'SER'] },
  { code: 'BASLER_HOFMANN', name: 'Basler & Hofmann', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC'] },
  { code: 'BELIMO', name: 'Belimo', lots: ['CVC', 'VEN', 'GTB'] },
  { code: 'BG_INGENIEURS', name: 'BG Ingénieurs Conseils', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC'] },
  { code: 'BKW', name: 'BKW Building Solutions', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'BOBST_ARCHITECTES', name: 'Bobst Architectes', lots: ['ARC', 'BIM'] },
  { code: 'BOSCH', name: 'Bosch Building Technologies', lots: ['SEC', 'SSI', 'GTB'] },
  { code: 'BOUYGUES_BATIMENT', name: 'Bouygues Bâtiment', lots: ['STR', 'ARC', 'FAC', 'BIM', 'SYN'] },
  { code: 'BOUYGUES_ENERGIES', name: 'Bouygues Energies & Services', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'BOUYGUES_ENERGIES_CH', name: 'Bouygues Energies & Services Suisse', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'BTP_CONSULTANTS', name: 'BTP Consultants', lots: ['SYN', 'BIM', 'STR', 'SEC'] },
  { code: 'BUREAU_VERITAS', name: 'Bureau Veritas Construction', lots: ['SYN', 'BIM', 'STR', 'SEC'] },
  { code: 'BURCKHARDT_PARTNER', name: 'Burckhardt+Partner', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'BURKHALTER', name: 'Burkhalter Technics', lots: ['ELE', 'CFO', 'CFA', 'GTB'] },

  // --- C ---
  { code: 'CARDONNEL', name: 'Cardonnel Ingénierie', lots: ['CVC', 'CHA', 'ELE', 'GTB'] },
  { code: 'CARRIER', name: 'Carrier', lots: ['CVC', 'CLI', 'CHA'] },
  { code: 'CCHE', name: 'CCHE Architecture', lots: ['ARC', 'BIM'] },
  { code: 'CEGELEC', name: 'Cegelec', lots: ['ELE', 'CFO', 'CFA', 'GTB'] },
  { code: 'CHARIER', name: 'Charier', lots: ['VRD', 'TER', 'CAN'] },
  { code: 'CIMENTS_FRANCAIS', name: 'Ciments Français (Heidelberg)', lots: ['STR'] },
  { code: 'COLAS', name: 'Colas', lots: ['VRD', 'TER', 'CAN'] },
  { code: 'CSD_INGENIEURS', name: 'CSD Ingénieurs', lots: ['BIM', 'SYN', 'STR', 'VRD', 'GEO'] },
  { code: 'CSL', name: 'CSL (Construction Services)', lots: ['STR', 'ARC'] },
  { code: 'CUISINELLA', name: 'Cuisinella', lots: ['CUI'] },

  // --- D ---
  { code: 'DAIKIN', name: 'Daikin', lots: ['CVC', 'CLI'] },
  { code: 'DALKIA', name: 'Dalkia', lots: ['CVC', 'CHA', 'GTB'] },
  { code: 'DANFOSS', name: 'Danfoss', lots: ['CVC', 'HYD', 'CHA'] },
  { code: 'DEKRA', name: 'DEKRA Industrial', lots: ['SYN', 'STR', 'SEC'] },
  { code: 'DEMATHIEU_BARD', name: 'Demathieu Bard', lots: ['STR', 'ARC', 'VRD'] },
  { code: 'DORMAKABA', name: 'dormakaba Schweiz AG', lots: ['SER', 'MEN', 'CFA'] },
  { code: 'DROUAULT', name: 'Drouault', lots: ['INT', 'MEN'] },

  // --- E ---
  { code: 'EBENISTERIE_MEYER_SUTER', name: 'Ébénisterie Meyer et Suter Sàrl', lots: ['INT', 'MEN'] },
  { code: 'EBP_SCHWEIZ', name: 'EBP Schweiz', lots: ['BIM', 'SYN', 'STR', 'VRD'] },
  { code: 'ECHAMI_LEMAN', name: 'Echami Léman SA', lots: [] },
  { code: 'ECOSERVICES', name: 'Ecoservices SA', lots: ['ELE', 'VRD'] },
  { code: 'EDEIS', name: 'Edeis', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'EDF', name: 'EDF', lots: ['ELE', 'GTB'] },
  { code: 'EGIS', name: 'Egis', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC', 'ELE'] },
  { code: 'EIG_CRUSTAG', name: 'EIG Crustag', lots: ['CFA', 'ELE'] },
  { code: 'EIFFAGE_CONSTRUCTION', name: 'Eiffage Construction', lots: ['STR', 'ARC', 'FAC', 'BIM'] },
  { code: 'EIFFAGE_ENERGIE', name: 'Eiffage Énergie Systèmes', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'ELECTROSUISSE', name: 'Electrosuisse', lots: ['ELE'] },
  { code: 'EMCH_BERGER', name: 'Emch+Berger', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC'] },
  { code: 'EMMERICH', name: 'Emmerich GmbH', lots: ['CVC'] },
  { code: 'ENERGIE_360', name: 'Energie 360°', lots: ['CHA', 'HYD', 'GTB'] },
  { code: 'ENGIE', name: 'Engie Solutions', lots: ['CVC', 'CHA', 'ELE', 'GTB'] },
  { code: 'EQUANS_FRANCE', name: 'Equans France', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'EQUANS_SWITZERLAND', name: 'Equans Switzerland', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'ERNE', name: 'Erne AG', lots: ['STR', 'ARC', 'FAC', 'BIM'] },
  { code: 'ETAVIS', name: 'Etavis AG', lots: ['ELE', 'CFO', 'CFA'] },
  { code: 'EUROVIA', name: 'Eurovia', lots: ['VRD', 'TER', 'CAN'] },
  { code: 'EVOLE', name: 'Evole Sàrl', lots: [] },

  // --- F ---
  { code: 'FAYAT_BATIMENT', name: 'Fayat Bâtiment', lots: ['STR', 'ARC', 'FAC'] },
  { code: 'FAYAT_ENERGIE', name: 'Fayat Énergie Services', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'FELLER', name: 'Feller SA (Schneider Electric)', lots: ['ELE', 'CFO'] },
  { code: 'FERRARI_ARCHITECTES', name: 'Ferrari Architectes', lots: ['ARC', 'BIM'] },
  { code: 'FIRE_SYSTEM', name: 'Fire System SA', lots: ['SEC', 'SSI'] },
  { code: 'FIXIDE', name: 'Fixide Power Systems Sàrl', lots: ['ELE', 'CFO'] },
  { code: 'FOSTER_PARTNERS', name: 'Foster + Partners', lots: ['ARC', 'BIM'] },
  { code: 'FREYSSINET', name: 'Freyssinet', lots: ['STR', 'FOU'] },

  // --- G ---
  { code: 'GCC', name: 'GCC Construction', lots: ['STR', 'ARC', 'FAC'] },
  { code: 'GEBERIT', name: 'Geberit Distribution SA', lots: ['SAN', 'PLB'] },
  { code: 'GENERAL_ELECTRIC', name: 'GE Vernova / General Electric', lots: ['ELE', 'GTB'] },
  { code: 'GEX_DORTHE', name: 'Gex & Dorthe', lots: ['ARC', 'BIM'] },
  { code: 'GINGER', name: 'Ginger Burgeap', lots: ['GEO', 'TER', 'VRD'] },
  { code: 'GK_RAUMCONCEPT', name: 'GK Raumconcept AG', lots: ['INT', 'FAC'] },
  { code: 'GR_SANITAR', name: 'GR Sanitär GmbH', lots: ['SAN', 'PLB'] },
  { code: 'GROHE', name: 'Grohe Group SA', lots: ['SAN', 'PLB'] },
  { code: 'GROUPE_6', name: 'Groupe-6', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'GRUNDFOS', name: 'Grundfos Handels AG', lots: ['HYD', 'CHA', 'SAN'] },
  { code: 'GRUNER', name: 'Gruner', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },

  // --- H ---
  { code: 'HAGER', name: 'Hager', lots: ['ELE', 'CFO'] },
  { code: 'HAGER_SUISSE', name: 'Hager Suisse', lots: ['ELE', 'CFO'] },
  { code: 'HAKA_GERODUR', name: 'Haka Gerodur AG', lots: ['SAN'] },
  { code: 'HALTER', name: 'Halter AG', lots: ['ARC', 'STR', 'BIM', 'SYN'] },
  { code: 'HANSGROHE', name: 'Hansgrohe AG', lots: ['SAN', 'PLB'] },
  { code: 'HELBLING', name: 'Helbling', lots: ['BIM', 'SYN', 'CVC', 'ELE'] },
  { code: 'HERVE_THERMIQUE', name: 'Hervé Thermique', lots: ['CVC', 'CHA', 'VEN', 'ELE', 'GTB'] },
  { code: 'HEVRON', name: 'Hevron SA', lots: ['CVC'] },
  { code: 'HILTI', name: 'Hilti', lots: ['STR', 'FAC', 'CVC', 'ELE'] },
  { code: 'HILTI_SUISSE', name: 'Hilti Suisse', lots: ['STR', 'FAC', 'CVC', 'ELE'] },
  { code: 'HOFMANN_PARATONNERRE', name: 'Hofmann Capt Paratonnerre Sàrl', lots: ['ELE'] },
  { code: 'HOLCIM', name: 'Holcim', lots: ['STR', 'FAC'] },
  { code: 'HOLCIM_SUISSE', name: 'Holcim Suisse', lots: ['STR', 'FAC'] },
  { code: 'HONEYWELL', name: 'Honeywell Building Technologies', lots: ['GTB', 'SEC', 'SSI'] },
  { code: 'HRS_REAL_ESTATE', name: 'HRS Real Estate', lots: ['ARC', 'STR', 'BIM', 'SYN'] },
  { code: 'HW_ROMANDIE', name: 'HW Romandie SA', lots: [] },

  // --- I ---
  { code: 'IDOM', name: 'IDOM France', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'IFM', name: 'ifm electronic', lots: ['GTB'] },
  { code: 'IMI_HYDRONIC', name: 'IMI Hydronic Engineering Switzerland AG', lots: ['HYD', 'CVC'] },
  { code: 'IMPLENIA', name: 'Implenia', lots: ['STR', 'ARC', 'VRD', 'BIM', 'SYN'] },
  { code: 'INDUNI', name: 'Induni & Cie SA', lots: ['STR', 'TER'] },
  { code: 'INEXIS', name: 'Inexis Sàrl', lots: ['CFA', 'BIM'] },
  { code: 'INGEROP', name: 'Ingérop', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC', 'ELE'] },
  { code: 'ITW', name: 'ITW Construction Products', lots: ['STR', 'FAC'] },

  // --- J ---
  { code: 'JOHNSON_CONTROLS', name: 'Johnson Controls', lots: ['GTB', 'CVC', 'SEC'] },
  { code: 'JOSEPH_DIEMAND', name: 'Joseph Diemand SA', lots: [] },
  { code: 'JPF_CONSTRUCTION', name: 'JPF Construction', lots: ['STR', 'ARC', 'FAC'] },
  { code: 'JUNG', name: 'JUNG', lots: ['ELE', 'CFO'] },

  // --- K ---
  { code: 'KAESER', name: 'Kaeser Kompressoren AG', lots: ['GAZ', 'CVC'] },
  { code: 'KAUFMAN_BROAD', name: 'Kaufman & Broad', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'KIBAG', name: 'Kibag', lots: ['STR', 'TER', 'VRD'] },
  { code: 'KNAUF', name: 'Knauf', lots: ['INT', 'FAC'] },
  { code: 'KONE', name: 'KONE', lots: ['ASC'] },
  { code: 'KONE_FRANCE', name: 'KONE France', lots: ['ASC'] },
  { code: 'KONE_SUISSE', name: 'KONE Suisse', lots: ['ASC'] },
  { code: 'KROQI', name: 'Kroqi / Plan.One', lots: ['BIM'] },

  // --- L ---
  { code: 'L_ATELIER_DU_PAYSAGE', name: "L'Atelier du Paysage", lots: ['PAY'] },
  { code: 'LAFARGE', name: 'Lafarge', lots: ['STR'] },
  { code: 'LANZ_OENSINGEN', name: 'Lanz Oensingen AG', lots: ['VRD', 'CAN'] },
  { code: 'LEGRAND', name: 'Legrand', lots: ['ELE', 'CFO', 'CFA'] },
  { code: 'LEGRAND_SUISSE', name: 'Legrand Suisse', lots: ['ELE', 'CFO', 'CFA'] },
  { code: 'LEGENDRE', name: 'Legendre Construction', lots: ['STR', 'ARC', 'FAC'] },
  { code: 'LEHMANN_GEOMETRE', name: 'Lehmann Géomètre SA', lots: ['GEO'] },
  { code: 'LENZLINGER', name: 'Lenzlinger Fils SA', lots: ['TER', 'VRD'] },
  { code: 'LEON_GROSSE', name: 'Léon Grosse', lots: ['STR', 'ARC', 'FAC'] },
  { code: 'LOSINGER_MARAZZI', name: 'Losinger Marazzi', lots: ['STR', 'ARC', 'BIM', 'SYN'] },

  // --- M ---
  { code: 'MARTI', name: 'Marti', lots: ['STR', 'TER', 'VRD'] },
  { code: 'MAZZOLI', name: 'Mazzoli Creastaff Sàrl', lots: [] },
  { code: 'MDT_TECHNOLOGIES', name: 'MDT Technologies', lots: ['CFA', 'SEC'] },
  { code: 'MEIER_TOBLER', name: 'Meier Tobler', lots: ['CVC', 'CHA'] },
  { code: 'MITSUBISHI_ELECTRIC', name: 'Mitsubishi Electric', lots: ['CVC', 'CLI', 'ELE'] },
  { code: 'MONOD_PIGUET', name: 'Monod-Piguet + Associés', lots: ['STR', 'SYN', 'BIM'] },

  // --- N ---
  { code: 'NEON_LUMIERES_STAUB', name: 'Néon Lumières Staub SA', lots: ['LUM', 'ELE'] },
  { code: 'NEOVAC', name: 'Neovac AG', lots: ['CHA', 'SAN'] },
  { code: 'NET_POWERSAFE', name: 'Net Powersafe SA', lots: ['ELE', 'CFO'] },
  { code: 'NEXITY', name: 'Nexity', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'NGE', name: 'NGE', lots: ['VRD', 'TER', 'CAN', 'STR'] },
  { code: 'NOVOFERM', name: 'Novoferm Schweiz AG', lots: ['MEN', 'SER'] },

  // --- O ---
  { code: 'OLSY', name: 'Olsy Sàrl', lots: [] },
  { code: 'OPTIMALWAY', name: 'Optimalway Sàrl', lots: ['ELE', 'CFA'] },
  { code: 'ORLLATI', name: 'Orllati', lots: ['TER', 'DEM', 'VRD', 'STR'] },
  { code: 'OTIS', name: 'Otis', lots: ['ASC'] },
  { code: 'OTIS_FRANCE', name: 'Otis France', lots: ['ASC'] },
  { code: 'OTIS_SUISSE', name: 'Otis Suisse', lots: ['ASC'] },

  // --- P ---
  { code: 'PELLICHET_POSSE', name: 'Pellichet Posse SA', lots: ['FAC', 'COU'] },
  { code: 'PENSIMO', name: 'Pensimo', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'PERFO_LUX', name: 'Perfo Lux SA', lots: ['LUM', 'ELE'] },
  { code: 'PERRIN_LANOIR', name: 'Perrin et Lanoir SA', lots: [] },
  { code: 'PHIDA_ETANCHEITE', name: 'Phida Étanchéité (GE) SA', lots: ['COU', 'FAC'] },
  { code: 'PHILIPS', name: 'Signify / Philips Lighting', lots: ['LUM', 'ELE'] },
  { code: 'PLANAR', name: 'Planar', lots: ['BIM', 'SYN', 'CVC', 'ELE'] },
  { code: 'PLASTITECH', name: 'Plastitech Sàrl', lots: ['MEN', 'FAC'] },
  { code: 'POGAR', name: 'Pogar SA', lots: [] },
  { code: 'POM_PLUS', name: 'POM+', lots: ['BIM', 'SYN', 'GTB'] },
  { code: 'PORCHER', name: 'Porcher', lots: ['SAN', 'PLB'] },
  { code: 'PRIMUS', name: 'Primus AG', lots: ['CVC'] },
  { code: 'PROGIN', name: 'Progin', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },

  // --- Q ---
  { code: 'QUALICONSULT', name: 'Qualiconsult', lots: ['SYN', 'BIM', 'STR', 'SEC'] },

  // --- R ---
  { code: 'RAPP', name: 'Rapp', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC'] },
  { code: 'RATIONAL', name: 'Rational', lots: ['CUI'] },
  { code: 'RAZEL_BEC', name: 'Razel-Bec', lots: ['VRD', 'TER', 'STR'] },
  { code: 'RDR_ARCHITECTES', name: 'RDR Architectes', lots: ['ARC', 'BIM'] },
  { code: 'REGENT', name: 'Regent SA', lots: ['LUM'] },
  { code: 'REICHEN_MASSARIE', name: 'Reichen & P. de Massarie AG', lots: ['FAC', 'COU'] },
  { code: 'REMARQ_DENGES', name: 'Remarq SA (Denges)', lots: [] },
  { code: 'ROCKWOOL', name: 'Rockwool', lots: ['FAC', 'INT'] },
  { code: 'ROMANDE_ENERGIE', name: 'Romande Energie SA', lots: ['ELE'] },
  { code: 'ROSCONI_SYSTEM', name: 'Rosconi System AG', lots: ['INT', 'MOB'] },

  // --- S ---
  { code: 'SABAG', name: 'Sabag', lots: ['SAN', 'PLB', 'CUI'] },
  { code: 'SADE', name: 'SADE', lots: ['CAN', 'VRD', 'HYD'] },
  { code: 'SAGERIME', name: 'Sagerime SA', lots: ['GEO'] },
  { code: 'SAINT_GOBAIN', name: 'Saint-Gobain', lots: ['FAC', 'INT'] },
  { code: 'SAMVAZ', name: 'Samvaz SA', lots: [] },
  { code: 'SANITAS_TROESCH', name: 'Sanitas Troesch', lots: ['SAN', 'PLB', 'CUI'] },
  { code: 'SBB_CFF_FFS', name: 'SBB CFF FFS', lots: ['BIM', 'SYN', 'VRD', 'ELE'] },
  { code: 'SCHERLER', name: 'Scherler', lots: ['ELE', 'CFO', 'CFA', 'GTB'] },
  { code: 'SCHINDLER', name: 'Schindler', lots: ['ASC'] },
  { code: 'SCHINDLER_SUISSE', name: 'Schindler Suisse', lots: ['ASC'] },
  { code: 'SCHNEIDER', name: 'Schneider Electric', lots: ['ELE', 'CFO', 'GTB'] },
  { code: 'SCRASA', name: 'Scrasa', lots: ['VRD', 'TER', 'CAN'] },
  { code: 'SEECRET', name: 'Seecret.ch', lots: ['SEC', 'CFA'] },
  { code: 'SETEC', name: 'Setec', lots: ['BIM', 'SYN', 'STR', 'VRD', 'CVC', 'ELE'] },
  { code: 'SIEMENS', name: 'Siemens', lots: ['ELE', 'CFO', 'GTB'] },
  { code: 'SIG', name: 'Services Industriels de Genève', lots: ['ELE', 'HYD', 'CAN'] },
  { code: 'SIKA', name: 'Sika AG', lots: ['STR', 'FAC', 'COU'] },
  { code: 'SIL', name: 'Services Industriels de Lausanne', lots: ['ELE', 'HYD', 'CAN'] },
  { code: 'SNEF', name: 'SNEF', lots: ['ELE', 'CFO', 'CFA', 'GTB'] },
  { code: 'SOCOTEC', name: 'Socotec', lots: ['SYN', 'BIM', 'STR', 'SEC'] },
  { code: 'SOLEOL', name: 'Soleol SA', lots: ['ELE'] },
  { code: 'SPIE', name: 'SPIE', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'SPIE_BATIGNOLLES', name: 'SPIE Batignolles', lots: ['STR', 'ARC', 'VRD', 'TER'] },
  { code: 'SPIE_FRANCE', name: 'SPIE France', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'START_CITY', name: 'Start City SA', lots: [] },
  { code: 'STEINER', name: 'Steiner', lots: ['STR', 'ARC', 'BIM', 'SYN'] },
  { code: 'STELO', name: 'Stelo SA', lots: ['VRD'] },
  { code: 'STIVAC', name: 'Stivac', lots: ['VEN', 'CVC'] },
  { code: 'STOCKLIN', name: 'Stöcklin Logistik AG', lots: ['ASC', 'STR'] },
  { code: 'SUEZ', name: 'Suez', lots: ['HYD', 'CAN', 'GTB'] },
  { code: 'SUNGROW', name: 'Sungrow Deutschland GmbH', lots: ['ELE'] },
  { code: 'SURSECTOR', name: 'Sursector SA', lots: ['SER', 'SEC'] },
  { code: 'SVS_SERRURERIE', name: 'SVS Serrurerie de Versoix SA', lots: ['SER'] },
  { code: 'SWEGON', name: 'Swegon', lots: ['VEN', 'CVC'] },
  { code: 'SYSTRA', name: 'Systra', lots: ['BIM', 'SYN', 'STR', 'VRD'] },

  // --- T ---
  { code: 'TEKHNE', name: 'Tekhné', lots: ['ARC', 'BIM', 'SYN'] },
  { code: 'TEMSA', name: 'Temsa SA', lots: [] },
  { code: 'THYSSENKRUPP', name: 'TK Elevator / thyssenkrupp', lots: ['ASC'] },
  { code: 'TOP_CABLE', name: 'Top Cable', lots: ['ELE', 'CFO'] },
  { code: 'TROX', name: 'Trox', lots: ['VEN', 'CVC'] },
  { code: 'TRIMBLE', name: 'Trimble', lots: ['BIM', 'GEO'] },

  // --- U ---
  { code: 'UNIFIL', name: 'Unifil AG', lots: [] },
  { code: 'UPONOR', name: 'Uponor', lots: ['SAN', 'CHA', 'HYD'] },

  // --- V ---
  { code: 'V_ZUG', name: 'V-ZUG', lots: ['CUI', 'ELE'] },
  { code: 'VAILLANT', name: 'Vaillant', lots: ['CHA', 'CVC'] },
  { code: 'VELUX', name: 'Velux', lots: ['COU', 'MEN', 'FAC'] },
  { code: 'VELUX_SUISSE', name: 'Velux Suisse', lots: ['COU', 'MEN', 'FAC'] },
  { code: 'VEOLIA', name: 'Veolia', lots: ['HYD', 'CAN', 'GTB'] },
  { code: 'VERSUSS', name: 'Versuss Sàrl', lots: [] },
  { code: 'VIESSMANN', name: 'Viessmann', lots: ['CHA', 'CVC'] },
  { code: 'VINCI_CONSTRUCTION', name: 'Vinci Construction', lots: ['STR', 'ARC', 'FAC', 'BIM', 'SYN'] },
  { code: 'VINCI_ENERGIES', name: 'Vinci Energies', lots: ['ELE', 'CFO', 'CFA', 'CVC', 'GTB'] },
  { code: 'VOGEL', name: 'Vogel SA', lots: ['HYD', 'CVC'] },
  { code: 'VUICHARD', name: 'Vuichard Groupe SA', lots: ['MEN', 'FAC'] },

  // --- W ---
  { code: 'W_TISCH_REYMOND', name: 'W. Tisch-Reymond SA', lots: [] },
  { code: 'WF_GMBH', name: 'WF GmbH', lots: [] },
  { code: 'WIELAND', name: 'Wieland Electric AG', lots: ['ELE', 'CFO'] },
  { code: 'WILO', name: 'Wilo', lots: ['HYD', 'CHA', 'SAN'] },
  { code: 'WSP', name: 'WSP', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'WSP_FRANCE', name: 'WSP France', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },
  { code: 'WSP_SUISSE', name: 'WSP Suisse', lots: ['BIM', 'SYN', 'STR', 'CVC', 'ELE'] },

  // --- X Y Z ---
  { code: 'XEROX_PRINT', name: 'Xerox / services repro', lots: [] },
  { code: 'ZPF_INGENIEURE', name: 'ZPF Ingenieure', lots: ['BIM', 'SYN', 'STR'] },
  { code: 'ZUMTOBEL', name: 'Zumtobel', lots: ['LUM', 'ELE'] },

  // --- Complément CH / FR / marques (élargissement catalogue) ---
  { code: 'ACTEMIUM', name: 'Actemium', lots: ['ELE', 'GTB', 'CFO'] },
  { code: 'AERMEC', name: 'Aermec', lots: ['CVC', 'CLI'] },
  { code: 'AIRELEC', name: 'Airelec', lots: ['CHA', 'ELE'] },
  { code: 'ALDES', name: 'Aldes', lots: ['VEN', 'CVC'] },
  { code: 'ALUMINIUM_SUISSE', name: 'Aluminium Suisse / Wicona', lots: ['FAC', 'MEN'] },
  { code: 'ARCADIS', name: 'Arcadis', lots: ['BIM', 'SYN', 'STR', 'VRD'] },
  { code: 'ARMOR_LUX_BAT', name: 'Armor (équip. bat.)', lots: [] },
  { code: 'ATLANTIC', name: 'Atlantic', lots: ['CHA', 'CVC', 'SAN'] },
  { code: 'BAUMERT', name: 'Baumert', lots: ['SER', 'MEN'] },
  { code: 'BECHTEL', name: 'Bechtel', lots: ['STR', 'BIM', 'SYN'] },
  { code: 'BEGHELLI', name: 'Beghelli', lots: ['LUM', 'SEC'] },
  { code: 'BOSCH_THERMOTECHNIK', name: 'Bosch Thermotechnik', lots: ['CHA', 'CVC'] },
  { code: 'BPM', name: 'BPM (Bâtiment)', lots: ['STR', 'ARC'] },
  { code: 'BRINK', name: 'Brink Climate Systems', lots: ['VEN', 'CVC'] },
  { code: 'BROEN', name: 'Broen', lots: ['HYD', 'CVC'] },
  { code: 'CAMPENON_BERNARD', name: 'Campenon Bernard (Vinci)', lots: ['STR', 'ARC'] },
  { code: 'CIAT', name: 'CIAT', lots: ['CVC', 'CLI'] },
  { code: 'CITEC', name: 'Citec Ingénieurs', lots: ['BIM', 'SYN', 'CVC', 'ELE'] },
  { code: 'CLIMAVENETA', name: 'Climaveneta / Mitsubishi Heavy', lots: ['CVC', 'CLI'] },
  { code: 'COFELY', name: 'Cofely (historique Engie)', lots: ['CVC', 'ELE', 'GTB'] },
  { code: 'COMETTO', name: 'Cometto', lots: [] },
  { code: 'DELTA_DORE', name: 'Delta Dore', lots: ['GTB', 'CFA'] },
  { code: 'DEVI', name: 'DEVI (Danfoss)', lots: ['CHA', 'ELE'] },
  { code: 'DORMA', name: 'DORMA (historique dormakaba)', lots: ['SER', 'MEN'] },
  { code: 'EFFAGE_ROUTE', name: 'Eiffage Route', lots: ['VRD', 'TER'] },
  { code: 'EIFFEL', name: 'Eiffel (Fayat)', lots: ['STR'] },
  { code: 'ELECTROLUX', name: 'Electrolux Professional', lots: ['CUI'] },
  { code: 'ELICA', name: 'Elica', lots: ['CUI', 'VEN'] },
  { code: 'ELM_LEBLANC', name: 'Elm Leblanc', lots: ['CHA', 'SAN'] },
  { code: 'EMERSON', name: 'Emerson', lots: ['GTB', 'CVC'] },
  { code: 'ERCO', name: 'ERCO', lots: ['LUM'] },
  { code: 'ESSO', name: 'Esso / Exxon (réseaux)', lots: [] },
  { code: 'EUROTHERM', name: 'Eurotherm', lots: ['GTB', 'CHA'] },
  { code: 'FAGOR', name: 'Fagor Industrial', lots: ['CUI'] },
  { code: 'FAAC', name: 'FAAC', lots: ['SER', 'CFA'] },
  { code: 'FLAKTGROUP', name: 'FläktGroup', lots: ['VEN', 'CVC'] },
  { code: 'FRANKE', name: 'Franke', lots: ['SAN', 'CUI'] },
  { code: 'GEWISS', name: 'Gewiss', lots: ['ELE', 'CFO'] },
  { code: 'GIRPI', name: 'Girpi', lots: ['SAN', 'HYD'] },
  { code: 'GRANDS_TRAVAUX_SUISES', name: 'Grands Travaux Suisses (ex.)', lots: ['STR', 'VRD'] },
  { code: 'GRUNER_AG', name: 'Gruner AG', lots: ['BIM', 'SYN', 'STR'] },
  { code: 'GUNTAMATIC', name: 'Guntamatic', lots: ['CHA'] },
  { code: 'HAJOM', name: 'Hajom', lots: ['MEN', 'FAC'] },
  { code: 'HEINEMANN', name: 'Heinemann', lots: [] },
  { code: 'HERZ', name: 'Herz Armaturen', lots: ['HYD', 'CHA'] },
  { code: 'HITACHI', name: 'Hitachi Cooling & Heating', lots: ['CVC', 'CLI'] },
  { code: 'HOVAL', name: 'Hoval', lots: ['CHA', 'CVC'] },
  { code: 'HONEYWELL_SUISSE', name: 'Honeywell Suisse', lots: ['GTB', 'SEC'] },
  { code: 'IDEAL_STANDARD', name: 'Ideal Standard', lots: ['SAN', 'PLB'] },
  { code: 'ISOVER', name: 'Isover (Saint-Gobain)', lots: ['FAC', 'INT'] },
  { code: 'JAGA', name: 'Jaga', lots: ['CHA', 'CVC'] },
  { code: 'JAUN', name: 'Jaun SA', lots: ['STR', 'TER'] },
  { code: 'KALDEWEI', name: 'Kaldewei', lots: ['SAN'] },
  { code: 'KNAUF_INSULATION', name: 'Knauf Insulation', lots: ['FAC', 'INT'] },
  { code: 'KOHLER', name: 'Kohler', lots: ['SAN', 'PLB'] },
  { code: 'KORADO', name: 'Korado', lots: ['CHA'] },
  { code: 'LINDAB', name: 'Lindab', lots: ['VEN', 'CVC'] },
  { code: 'LIXIL', name: 'LIXIL / Grohe', lots: ['SAN'] },
  { code: 'MANITOU', name: 'Manitou', lots: [] },
  { code: 'MIELE', name: 'Miele Professional', lots: ['CUI'] },
  { code: 'MOELLER', name: 'Moeller / Eaton', lots: ['ELE', 'CFO'] },
  { code: 'NIBE', name: 'NIBE', lots: ['CHA', 'CVC'] },
  { code: 'NIKKEN', name: 'Nikken Sekkei Europe', lots: ['ARC', 'BIM'] },
  { code: 'OBO_BETTERMANN', name: 'OBO Bettermann', lots: ['ELE', 'CFO'] },
  { code: 'PANASONIC', name: 'Panasonic Heating & Cooling', lots: ['CVC', 'CLI'] },
  { code: 'PLACO', name: 'Placo (Saint-Gobain)', lots: ['INT'] },
  { code: 'POLYPIPE', name: 'Polypipe', lots: ['SAN', 'HYD'] },
  { code: 'REHAU', name: 'REHAU', lots: ['SAN', 'CHA', 'FAC'] },
  { code: 'RIELLO', name: 'Riello', lots: ['CHA', 'CVC'] },
  { code: 'ROCA', name: 'Roca', lots: ['SAN', 'PLB'] },
  { code: 'SAUTER', name: 'Sauter', lots: ['GTB', 'CVC'] },
  { code: 'SCHACO', name: 'Schaco', lots: ['VEN', 'CVC'] },
  { code: 'SCHLUTER', name: 'Schlüter-Systems', lots: ['SAN', 'INT'] },
  { code: 'SOMFY', name: 'Somfy', lots: ['CFA', 'MEN'] },
  { code: 'SPIE_ICS', name: 'SPIE ICS', lots: ['CFA', 'GTB'] },
  { code: 'SYSTEMAIR', name: 'Systemair', lots: ['VEN', 'CVC'] },
  { code: 'TECE', name: 'TECE', lots: ['SAN', 'PLB'] },
  { code: 'TENDANCE_BAIN', name: 'Tendance Bain', lots: ['SAN'] },
  { code: 'TERREAL', name: 'Terreal', lots: ['FAC', 'COU'] },
  { code: 'THERMADOR', name: 'Thermador', lots: ['HYD', 'SAN'] },
  { code: 'TOTO', name: 'TOTO', lots: ['SAN'] },
  { code: 'URSA', name: 'URSA', lots: ['FAC', 'INT'] },
  { code: 'VAILLANT_GROUP', name: 'Vaillant Group', lots: ['CHA', 'CVC'] },
  { code: 'VILLEROY_BOCH', name: 'Villeroy & Boch', lots: ['SAN', 'PLB'] },
  { code: 'WAGO', name: 'WAGO', lots: ['ELE', 'CFO', 'GTB'] },
  { code: 'WEBER', name: 'Weber (Saint-Gobain)', lots: ['STR', 'FAC'] },
  { code: 'WIENERBERGER', name: 'Wienerberger', lots: ['STR', 'FAC'] },
  { code: 'ZEHNDER', name: 'Zehnder', lots: ['CHA', 'VEN', 'CVC'] },
  { code: 'ZIEHL_ABEGG', name: 'Ziehl-Abegg', lots: ['VEN', 'CVC'] },
];

/** Build a single-line option label (code + raison sociale). */
export function formatCompanyOption(company: Pick<Company, 'code' | 'name'>): string {
  const name = company.name.trim();
  if (!name || name.toUpperCase() === company.code.toUpperCase()) {
    return company.code;
  }
  return `${company.code}${COMPANY_OPTION_SEP}${name}`;
}

/**
 * Extract the company code from a free-text / datalist value.
 * Accepts raw code, "CODE — Name", or exact name match.
 */
export function resolveCompanyCode(raw: string): string {
  const value = raw.trim();
  if (!value) return '';

  if (value.includes(COMPANY_OPTION_SEP)) {
    return value.split(COMPANY_OPTION_SEP)[0]!.trim();
  }

  // Legacy "CODE - Name" from entity import
  if (value.includes(' - ')) {
    const maybeCode = value.split(' - ')[0]!.trim();
    if (getCompany(maybeCode)) return maybeCode;
  }

  const byCode = getCompany(value);
  if (byCode) return byCode.code;

  const upper = value.toUpperCase();
  const byCodeCI = COMPANIES.find((c) => c.code.toUpperCase() === upper);
  if (byCodeCI) return byCodeCI.code;

  const byName = COMPANIES.find((c) => c.name.toUpperCase() === upper);
  if (byName) return byName.code;

  return value;
}

export function getCompany(code: string): Company | undefined {
  const upper = code.trim().toUpperCase();
  return COMPANIES.find((c) => c.code.toUpperCase() === upper);
}

export function getCompaniesForLot(lotCode: string): Company[] {
  return COMPANIES.filter((c) => c.lots.includes(lotCode));
}

/** Sorted options for UI selects / datalists — one line per company. */
export function getCompanySelectOptions(): Array<{ code: string; name: string }> {
  return [...COMPANIES]
    .sort((a, b) => a.code.localeCompare(b.code, 'fr'))
    .map((c) => ({
      code: c.code,
      // `name` is the single-line label shown; `code` is the stored value.
      name: formatCompanyOption(c),
    }));
}
