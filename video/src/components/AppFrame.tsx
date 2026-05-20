import React from 'react';
import { colors, fonts, radii, shadows } from '../lib/tokens';
import { BrandMark } from './BrandMark';

/**
 * A faithful reconstruction of the DOC-RENAME app chrome:
 *   - browser-ish window (traffic lights + URL)
 *   - app header (DR mark + theme dot + lang)
 *   - 3-pane layout (left nomenclature / center files / optional right tools)
 *
 * Children render INSIDE the center pane unless `leftPane`/`rightPane`
 * are supplied — in which case those slots are used for the full window.
 */
export function AppFrame({
  url = 'doc-rename.com/app',
  leftPane,
  rightPane,
  children,
  width,
  height,
  style,
}: {
  url?: string;
  leftPane?: React.ReactNode;
  rightPane?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: '#FFF',
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
      {/* Browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          background: '#FBF7EE',
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: colors.brick }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: colors.gold }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: colors.moss }} />
        </div>
        <div
          style={{
            flex: 1,
            background: '#FFFAF0',
            border: `1px solid ${colors.line}`,
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 14,
            color: colors.muted,
            fontFamily: fonts.mono,
          }}
        >
          {url}
        </div>
      </div>

      {/* App header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderBottom: `1px solid ${colors.line}`,
          background: '#FFF',
        }}
      >
        <BrandMark size="sm" />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: colors.muted, fontWeight: 600 }}>FR</span>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: colors.paperSoft,
              border: `1px solid ${colors.line}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 14,
            }}
          >
            ☀
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {leftPane && (
          <aside
            style={{
              width: 340,
              borderRight: `1px solid ${colors.line}`,
              background: '#FFF',
              padding: 22,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 3,
                background: colors.gold,
              }}
            />
            {leftPane}
          </aside>
        )}
        <section style={{ flex: 1, padding: 28, overflow: 'hidden', minWidth: 0 }}>{children}</section>
        {rightPane && (
          <aside
            style={{
              width: 300,
              borderLeft: `1px solid ${colors.line}`,
              background: '#FFF',
              padding: 22,
              overflow: 'hidden',
            }}
          >
            {rightPane}
          </aside>
        )}
      </div>
    </div>
  );
}
