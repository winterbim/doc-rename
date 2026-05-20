import React from 'react';
import { colors, fonts, radii, shadows } from '../lib/tokens';

/**
 * Card / panel mimicking the landing "product-shot" container.
 * `traffic` toggles the macOS-style red/yellow/green dots on the header.
 */
export function Panel({
  title,
  badge,
  traffic = false,
  width,
  height,
  children,
  style,
}: {
  title?: string;
  badge?: string;
  traffic?: boolean;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: colors.paperHard,
        border: `1px solid ${colors.lineStrong}`,
        borderRadius: radii.lg,
        boxShadow: shadows.card,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: fonts.sans,
        color: colors.ink,
        ...style,
      }}
    >
      {(title || badge || traffic) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            padding: '16px 22px',
            background: '#FBF7EE',
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          {traffic ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: 999, background: colors.brick }} />
              <span style={{ width: 12, height: 12, borderRadius: 999, background: colors.gold }} />
              <span style={{ width: 12, height: 12, borderRadius: 999, background: colors.moss }} />
            </div>
          ) : (
            <span
              style={{
                fontSize: 13,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: colors.muted,
                fontWeight: 700,
              }}
            >
              {title}
            </span>
          )}
          {badge && (
            <span style={{ color: colors.blue, fontSize: 14, fontWeight: 720 }}>{badge}</span>
          )}
        </div>
      )}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

/** Inner panel — the smaller cards inside Panel (e.g. Before / Après). */
export function SubPanel({
  title,
  children,
  style,
}: {
  title?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: radii.md,
        background: colors.paper,
        padding: 18,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 13,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: colors.muted,
            fontWeight: 700,
            marginBottom: 12,
            fontFamily: fonts.sans,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
