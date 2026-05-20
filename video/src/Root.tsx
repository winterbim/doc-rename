import React from 'react';
import { Composition } from 'remotion';
import { FPS, SIZE_16x9, SIZE_9x16, TOTAL_FRAMES } from './lib/tokens';
import { MainMaster } from './compositions/MainMaster';
import { MainVertical } from './compositions/MainVertical';
import { MainShort } from './compositions/MainShort';
import { MainShortVertical } from './compositions/MainShortVertical';

const SHORT_FRAMES = 30 * FPS;

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MainMaster"
        component={MainMaster}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={SIZE_16x9.width}
        height={SIZE_16x9.height}
      />
      <Composition
        id="MainVertical"
        component={MainVertical}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={SIZE_9x16.width}
        height={SIZE_9x16.height}
      />
      <Composition
        id="MainShort"
        component={MainShort}
        durationInFrames={SHORT_FRAMES}
        fps={FPS}
        width={SIZE_16x9.width}
        height={SIZE_16x9.height}
      />
      <Composition
        id="MainShortVertical"
        component={MainShortVertical}
        durationInFrames={SHORT_FRAMES}
        fps={FPS}
        width={SIZE_9x16.width}
        height={SIZE_9x16.height}
      />
    </>
  );
};
