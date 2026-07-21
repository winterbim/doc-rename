import React from 'react';
import { colors, fonts, radii, shadows } from '../lib/tokens';
import { BrandMark } from './BrandMark';
import { APP_URL } from '../lib/tokens';

/**
 * Faithful reconstruction of the production app chrome:
 * browser bar + real Header (BC gradient tile, Free badge, Voir Team).
 */
export function AppFrame({
  url = APP_URL,
  leftPane,
  children,
  footer,
  width,
  height,
  style,
  showUpgrade = true,
}: {
  url?: string;
  leftPane?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  showUpgrade?: boolean;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: colors.surface,
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: radii.xl,
        boxShadow: shadows.card,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: fonts.sans,
        color: colors.ink,
        ...style,
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 16px',
          background: colors.surface2,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FF5F57' }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#FEBC2E' }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: '#28C840' }} />
        </div>
        <div
          style={{
            flex: 1,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '7px 14px',
            fontSize: 13,
            color: colors.inkMute,
            fontFamily: fonts.mono,
          }}
        >
          https://{url}
        </div>
      </div>

      {/* App header — mirrors web/components/Header.tsx */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        <BrandMark size="sm" mode="app" />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: colors.inkSoft, fontWeight: 500 }}>Accueil</span>
          <span style={{ fontSize: 13, color: colors.inkSoft, fontWeight: 500 }}>Tarifs</span>
          {showUpgrade && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 8,
                background: colors.primary,
                color: '#fff',
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,.18)',
                  borderRadius: 6,
                  padding: '2px 6px',
                  fontSize: 10,
                }}
              >
                Team
              </span>
              Voir Team
            </div>
          )}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.inkMute,
            }}
          >
            v0.3.0
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: colors.bg }}>
        {leftPane && (
          <aside
            style={{
              width: 360,
              borderRight: `1px solid ${colors.border}`,
              background: colors.surface,
              padding: 18,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {leftPane}
          </aside>
        )}
        <section
          style={{
            flex: 1,
            padding: 20,
            overflow: 'hidden',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {children}
        </section>
      </div>
      {footer}
    </div>
  );
}
