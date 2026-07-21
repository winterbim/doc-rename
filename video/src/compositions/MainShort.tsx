import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { FPS } from '../lib/tokens';
import { subtitlesShort } from '../lib/script';
import { Subtitle } from '../components/Subtitle';
import { ProgressBar } from '../components/ProgressBar';
import { SceneProblem } from '../scenes/SceneProblem';
import { SceneSolution } from '../scenes/SceneSolution';
import { SceneImport } from '../scenes/SceneImport';
import { SceneBIM } from '../scenes/SceneBIM';
import { ScenePrivacy } from '../scenes/ScenePrivacy';
import { SceneCTA } from '../scenes/SceneCTA';

/**
 * 30s short — real product beats only.
 */
const BEATS = [
  { start: 0, len: 4 * FPS, Scene: SceneProblem },
  { start: 4 * FPS, len: 4 * FPS, Scene: SceneSolution },
  { start: 8 * FPS, len: 5 * FPS, Scene: SceneImport },
  { start: 13 * FPS, len: 6 * FPS, Scene: SceneBIM },
  { start: 19 * FPS, len: 5 * FPS, Scene: ScenePrivacy },
  { start: 24 * FPS, len: 6 * FPS, Scene: SceneCTA },
];

export function MainShort() {
  return (
    <AbsoluteFill>
      {BEATS.map(({ start, len, Scene }) => (
        <Sequence key={start} from={start} durationInFrames={len} layout="none">
          <Scene />
        </Sequence>
      ))}
      <Subtitle cues={subtitlesShort} />
      <ProgressBar />
    </AbsoluteFill>
  );
}
