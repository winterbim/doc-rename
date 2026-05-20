import React from 'react';
import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../lib/tokens';
import { liftIn } from '../lib/easing';

type Kind = 'old' | 'new' | 'neutral';

const EXT_ICON: Record<string, { label: string; bg: string }> = {
  pdf: { label: 'PDF', bg: colors.brick },
  docx: { label: 'DOC', bg: colors.blue },
  doc: { label: 'DOC', bg: colors.blue },
  xlsx: { label: 'XLS', bg: colors.moss },
  csv: { label: 'CSV', bg: colors.moss },
  zip: { label: 'ZIP', bg: colors.ink },
  dwg: { label: 'DWG', bg: colors.gold },
  png: { label: 'IMG', bg: colors.goldSoft },
  jpg: { label: 'IMG', bg: colors.goldSoft },
};

function getExt(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}

/**
 * Single file row reflecting the production FileRow:
 *   [type-pill] [name]                                   [status?]
 *
 * `kind` styles: old = strike-through grey, new = bold moss green.
 */
export function FileRow({
  name,
  kind = 'neutral',
  appearAt = 0,
  status,
  fade,
  large = false,
}: {
  name: string;
  kind?: Kind;
  appearAt?: number;
  status?: string;
  fade?: number;
  large?: boolean;
}) {
  const frame = useCurrentFrame();
  const { opacity, translateY } = liftIn({ frame, start: appearAt, duration: 14, distance: 18 });

  const ext = getExt(name);
  const pill = EXT_ICON[ext] ?? { label: ext.toUpperCase() || 'FILE', bg: colors.muted };

  const color =
    kind === 'old'
      ? colors.muted
      : kind === 'new'
        ? colors.moss
        : colors.ink;

  return (
    <div
      style={{
        opacity: opacity * (fade ?? 1),
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: large ? '14px 16px' : '10px 14px',
        borderTop: `1px solid ${colors.line}`,
        fontFamily: fonts.mono,
        fontSize: large ? 22 : 18,
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          background: pill.bg,
          color: '#FFF',
          padding: '3px 8px',
          borderRadius: 4,
          fontFamily: fonts.sans,
          fontWeight: 700,
          fontSize: large ? 14 : 12,
          letterSpacing: '0.03em',
        }}
      >
        {pill.label}
      </span>
      <span
        style={{
          color,
          fontWeight: kind === 'new' ? 720 : 500,
          textDecoration: kind === 'old' ? 'line-through' : 'none',
          textDecorationColor: colors.brick,
          textDecorationThickness: 2,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      {status && (
        <span
          style={{
            flexShrink: 0,
            fontFamily: fonts.sans,
            fontSize: large ? 13 : 12,
            color: kind === 'new' ? colors.moss : colors.muted,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {status}
        </span>
      )}
    </div>
  );
}
