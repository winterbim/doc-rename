import React from 'react';
import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../lib/tokens';
import { liftIn } from '../lib/easing';

/**
 * Landing-style headline:
 *   <eyebrow>
 *   <h1> with optional <em> serif italic accent in brick </em>
 *   <lead>
 */
export function Headline({
  eyebrow,
  title,
  emphasis,
  lead,
  align = 'left',
  appearAt = 0,
  size = 'lg',
}: {
  eyebrow?: string;
  title: string;
  emphasis?: string;
  lead?: string;
  align?: 'left' | 'center';
  appearAt?: number;
  size?: 'md' | 'lg' | 'xl';
}) {
  const frame = useCurrentFrame();
  const a = liftIn({ frame, start: appearAt, duration: 18 });
  const b = liftIn({ frame, start: appearAt + 6, duration: 18 });
  const c = liftIn({ frame, start: appearAt + 12, duration: 18 });

  const fontSize = size === 'xl' ? 108 : size === 'lg' ? 84 : 64;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        gap: 18,
        maxWidth: 1200,
      }}
    >
      {eyebrow && (
        <span
          style={{
            opacity: a.opacity,
            transform: `translateY(${a.translateY}px)`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            color: colors.inkSoft,
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: colors.moss,
              boxShadow: `0 0 0 6px rgba(79,105,72,.18)`,
            }}
          />
          {eyebrow}
        </span>
      )}
      <h1
        style={{
          opacity: b.opacity,
          transform: `translateY(${b.translateY}px)`,
          margin: 0,
          fontFamily: fonts.sans,
          fontSize,
          fontWeight: 520,
          lineHeight: 0.95,
          letterSpacing: '-0.045em',
          color: colors.ink,
        }}
      >
        {title}
        {emphasis && (
          <>
            {' '}
            <em
              style={{
                fontFamily: fonts.serif,
                fontStyle: 'italic',
                fontWeight: 460,
                color: colors.brick,
                letterSpacing: '-0.025em',
              }}
            >
              {emphasis}
            </em>
          </>
        )}
      </h1>
      {lead && (
        <p
          style={{
            opacity: c.opacity,
            transform: `translateY(${c.translateY}px)`,
            margin: 0,
            maxWidth: 820,
            fontFamily: fonts.sans,
            color: colors.inkSoft,
            fontSize: 24,
            lineHeight: 1.55,
          }}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
