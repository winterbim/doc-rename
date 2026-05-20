import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { FPS } from '../lib/tokens';
import { subtitlesShort } from '../lib/script';
import { Subtitle } from '../components/Subtitle';
import { ProgressBar } from '../components/ProgressBar';
import { SceneProblem } from '../scenes/SceneProblem';
import { SceneSolution } from '../scenes/SceneSolution';
import { SceneNomenclature } from '../scenes/SceneNomenclature';
import { SceneBIM } from '../scenes/SceneBIM';
import { SceneExport } from '../scenes/SceneExport';
import { SceneCTA } from '../scenes/SceneCTA';

/**
 * 30-second short — 1920×1080 — 30 fps — 900 frames.
 * Drops Import/Others/Privacy scenes, tightens the others.
 *
 * Beat plan (s | frames):
 *   0  – 4  | 120  Problem (condensed)
 *   4  – 8  | 120  Solution (brand reveal)
 *   8  – 14 | 180  Nomenclature
 *  14  – 20 | 180  BIM before/after
 *  20  – 26 | 180  Export
 *  26  – 30 | 120  CTA
 */
const PROBLEM_START = 0;
const PROBLEM_LEN = 4 * FPS;
const SOLUTION_START = PROBLEM_START + PROBLEM_LEN;
const SOLUTION_LEN = 4 * FPS;
const NOMEN_START = SOLUTION_START + SOLUTION_LEN;
const NOMEN_LEN = 6 * FPS;
const BIM_START = NOMEN_START + NOMEN_LEN;
const BIM_LEN = 6 * FPS;
const EXPORT_START = BIM_START + BIM_LEN;
const EXPORT_LEN = 6 * FPS;
const CTA_START = EXPORT_START + EXPORT_LEN;
const CTA_LEN = 4 * FPS;

export function MainShort() {
  return (
    <AbsoluteFill>
      <Sequence from={PROBLEM_START} durationInFrames={PROBLEM_LEN} layout="none">
        <SceneProblem />
      </Sequence>
      <Sequence from={SOLUTION_START} durationInFrames={SOLUTION_LEN} layout="none">
        <SceneSolution />
      </Sequence>
      <Sequence from={NOMEN_START} durationInFrames={NOMEN_LEN} layout="none">
        <SceneNomenclature />
      </Sequence>
      <Sequence from={BIM_START} durationInFrames={BIM_LEN} layout="none">
        <SceneBIM />
      </Sequence>
      <Sequence from={EXPORT_START} durationInFrames={EXPORT_LEN} layout="none">
        <SceneExport />
      </Sequence>
      <Sequence from={CTA_START} durationInFrames={CTA_LEN} layout="none">
        <SceneCTA />
      </Sequence>
      <Subtitle cues={subtitlesShort} />
      <ProgressBar />
    </AbsoluteFill>
  );
}
