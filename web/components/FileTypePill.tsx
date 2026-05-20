/**
 * FileTypePill — small colored badge derived from the file extension.
 *
 * Each pill uses the warm-paper brand palette already defined in
 * `globals.css` so it stays coherent with the landing page, the
 * marketing video and the rest of the app chrome.
 *
 * Hex sources (see web/app/globals.css):
 *   brick      #B84A35  → documents that are most often the deliverable (PDF)
 *   blue       (landing only — exposed below)
 *   moss/olive #5C6B3A  → spreadsheets (XLSX, CSV)
 *   gold       #C49545  → CAD files (DWG, DXF…)
 *   gold-soft  #E0B96B  → images
 *   ink        #2B2218  → archives (ZIP, RAR, 7Z…)
 *   muted-mute #6E5E48  → fallback
 */

const TONE_CLASS: Record<Tone, string> = {
  brick: 'bg-brick text-paper',
  blue: 'bg-[#314D63] text-paper',
  moss: 'bg-olive text-paper',
  gold: 'bg-gold text-ink',
  goldSoft: 'bg-gold-soft text-ink',
  ink: 'bg-ink text-paper',
  muted: 'bg-ink-mute text-paper',
};

type Tone = 'brick' | 'blue' | 'moss' | 'gold' | 'goldSoft' | 'ink' | 'muted';

interface ExtTone {
  label: string;
  tone: Tone;
}

const EXTENSION_MAP: Record<string, ExtTone> = {
  // Documents
  pdf: { label: 'PDF', tone: 'brick' },
  doc: { label: 'DOC', tone: 'blue' },
  docx: { label: 'DOC', tone: 'blue' },
  rtf: { label: 'RTF', tone: 'blue' },
  odt: { label: 'ODT', tone: 'blue' },
  txt: { label: 'TXT', tone: 'muted' },
  md: { label: 'MD', tone: 'muted' },

  // Spreadsheets
  xls: { label: 'XLS', tone: 'moss' },
  xlsx: { label: 'XLS', tone: 'moss' },
  ods: { label: 'ODS', tone: 'moss' },
  csv: { label: 'CSV', tone: 'moss' },
  tsv: { label: 'TSV', tone: 'moss' },

  // Slides
  ppt: { label: 'PPT', tone: 'gold' },
  pptx: { label: 'PPT', tone: 'gold' },
  odp: { label: 'ODP', tone: 'gold' },

  // CAD / BIM
  dwg: { label: 'DWG', tone: 'gold' },
  dxf: { label: 'DXF', tone: 'gold' },
  rvt: { label: 'RVT', tone: 'gold' },
  ifc: { label: 'IFC', tone: 'gold' },
  nwd: { label: 'NWD', tone: 'gold' },
  nwc: { label: 'NWC', tone: 'gold' },
  skp: { label: 'SKP', tone: 'gold' },

  // Images
  png: { label: 'IMG', tone: 'goldSoft' },
  jpg: { label: 'IMG', tone: 'goldSoft' },
  jpeg: { label: 'IMG', tone: 'goldSoft' },
  gif: { label: 'IMG', tone: 'goldSoft' },
  webp: { label: 'IMG', tone: 'goldSoft' },
  svg: { label: 'SVG', tone: 'goldSoft' },
  tif: { label: 'IMG', tone: 'goldSoft' },
  tiff: { label: 'IMG', tone: 'goldSoft' },
  heic: { label: 'IMG', tone: 'goldSoft' },

  // Archives
  zip: { label: 'ZIP', tone: 'ink' },
  rar: { label: 'RAR', tone: 'ink' },
  '7z': { label: '7Z', tone: 'ink' },
  tar: { label: 'TAR', tone: 'ink' },
  gz: { label: 'GZ', tone: 'ink' },
};

/**
 * Pure helper — exposed for unit tests and re-use in other surfaces
 * (e.g. preview modal, error toasts).
 *
 * `input` may be a full filename (`"plan.dwg"`), an extension with
 * leading dot (`".pdf"`) or just the extension (`"docx"`). It is
 * lowercased before lookup.
 */
export function getFileTypeTone(input: string): ExtTone {
  if (!input) return { label: 'FILE', tone: 'muted' };
  const raw = input.toLowerCase().trim();
  const lastDot = raw.lastIndexOf('.');
  const ext = (lastDot >= 0 ? raw.slice(lastDot + 1) : raw).replace(/^\./, '');
  if (!ext) return { label: 'FILE', tone: 'muted' };
  return EXTENSION_MAP[ext] ?? { label: ext.slice(0, 4).toUpperCase(), tone: 'muted' };
}

interface FileTypePillProps {
  /** Filename, extension or raw ext code. */
  name: string;
  /** Optional override for label (e.g. forcing "DOC" instead of "DOCX"). */
  labelOverride?: string;
  /** Pill scale — defaults to `sm`. */
  size?: 'sm' | 'md';
  className?: string;
}

export function FileTypePill({ name, labelOverride, size = 'sm', className = '' }: FileTypePillProps) {
  const { label, tone } = getFileTypeTone(name);
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-1.5 py-0.5 text-[10px]';
  return (
    <span
      aria-label={`Type de fichier ${labelOverride ?? label}`}
      title={`.${(name.split('.').pop() ?? '').toLowerCase() || 'fichier'}`}
      className={`inline-flex shrink-0 items-center justify-center rounded font-sans font-semibold tracking-[0.04em] ${sizeClass} ${TONE_CLASS[tone]} ${className}`}
    >
      {labelOverride ?? label}
    </span>
  );
}
