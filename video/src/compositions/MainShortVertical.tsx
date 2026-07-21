import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MainShort } from './MainShort';
import { SIZE_16x9, SIZE_9x16, colors, fonts } from '../lib/tokens';
import { BrandMark } from '../components/BrandMark';

/**
 * 30-second short, vertical 9:16 (1080×1920).
 * Same banding approach as MainVertical but built on top of MainShort.
 *
 * Note: the subtitles for the short are bundled inside MainShort already,
 * but they were sized for 16:9. Because the entire MainShort is scaled
 * down to fit width, subtitles will shrink too. For social formats this
 * is acceptable — copy is short. We add a second bottom strap so the
 * URL stays large even at small player sizes.
 */
export function MainShortVertical() {
  const target = SIZE_9x16;
  const scale = target.width / SIZE_16x9.width;
  const scaledHeight = SIZE_16x9.height * scale;
  const verticalBand = (target.height - scaledHeight) / 2;
  const topBand = Math.round(verticalBand * 0.55);
  const bottomBand = Math.round(verticalBand * 1.45);
  const stageHeight = target.height - topBand - bottomBand;
  const stageScale = stageHeight / SIZE_16x9.height;

  return (
    <AbsoluteFill style={{ background: colors.paper }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: topBand,
          background: colors.ink,
          color: colors.paper,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <BrandMark size="md" inverted showWordmark={false} />
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 22,
            color: 'rgba(247, 243, 234, 0.78)',
            fontWeight: 500,
          }}
        >
          Renommage pro · 30 sec
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: topBand,
          left: (target.width - SIZE_16x9.width * stageScale) / 2,
          width: SIZE_16x9.width,
          height: SIZE_16x9.height,
          transform: `scale(${stageScale})`,
          transformOrigin: 'top left',
          overflow: 'hidden',
          background: colors.paper,
          borderTop: `1px solid ${colors.line}`,
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <MainShort />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: bottomBand,
          background: colors.paper,
          borderTop: `2px solid ${colors.gold}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: fonts.sans,
            fontSize: 36,
            color: colors.ink,
            fontWeight: 700,
            letterSpacing: '-0.015em',
          }}
        >
          Essayez maintenant
        </span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 24,
            color: colors.brick,
            fontWeight: 700,
          }}
        >
          doc-rename.com
        </span>
      </div>
    </AbsoluteFill>
  );
}
