'use client';

import { useAppContext } from '@/lib/app-state';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface StatsFooterProps {
  /** Inline / compact rendering for use inside a sticky toolbar (no border, no background). */
  compact?: boolean;
}

export function StatsFooter({ compact = false }: StatsFooterProps) {
  const { state } = useAppContext();
  const { files } = state;

  const total = files.length;
  const renamed = files.filter((f) => f.status === 'renamed').length;
  const errors = files.filter((f) => f.status === 'error').length;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const selectedCount = state.ui.selectedIds.length;

  const wrapperCls = compact
    ? 'flex flex-wrap items-center gap-4 text-xs text-ink-mute font-sans'
    : 'flex flex-wrap items-center gap-4 border-t border-line px-4 py-2.5 text-xs text-ink-soft font-sans bg-paper-2';

  if (total === 0) {
    return (
      <div className={wrapperCls}>
        <span className="text-ink-mute font-sans">Aucun fichier déposé</span>
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      <span>
        <span className="font-medium text-ink">{total}</span>{' '}
        fichier{total !== 1 ? 's' : ''}
      </span>
      {selectedCount > 0 && (
        <span className="text-brick font-medium">
          {selectedCount} sélectionné{selectedCount !== 1 ? 's' : ''}
        </span>
      )}
      {renamed > 0 && (
        <span className="text-olive">
          <span className="font-medium">{renamed}</span> renommé{renamed !== 1 ? 's' : ''}
        </span>
      )}
      {errors > 0 && (
        <span className="text-brick-deep">
          <span className="font-medium">{errors}</span> erreur{errors !== 1 ? 's' : ''}
        </span>
      )}
      {!compact && total > 0 && (
        <span>
          Taille ZIP: <span className="font-medium text-ink">{formatBytes(totalSize)}</span>
        </span>
      )}
    </div>
  );
}
