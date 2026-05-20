import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENE_FRAMES, sceneStartFrames } from '../lib/tokens';
import { SceneProblem } from '../scenes/SceneProblem';
import { SceneSolution } from '../scenes/SceneSolution';
import { SceneImport } from '../scenes/SceneImport';
import { SceneNomenclature } from '../scenes/SceneNomenclature';
import { SceneBIM } from '../scenes/SceneBIM';
import { SceneExport } from '../scenes/SceneExport';
import { ScenePrivacy } from '../scenes/ScenePrivacy';
import { SceneCTA } from '../scenes/SceneCTA';

/**
 * The 8-scene BIM-only visual timeline — no subtitles, no progress bar.
 * Composed into:
 *   - MainMaster   (16:9 with global subtitles + progress)
 *   - MainVertical (9:16 wrapper, scaled visuals + larger subtitles)
 *
 * V1 BIM gate: the legacy "SceneOthers" (Finance/RH/Juridique) is
 * intentionally absent. The component still ships in src/scenes/ so it
 * can be reintroduced when the V2 multi-profile pitch is restored.
 */
export function MainScenes() {
  const starts = sceneStartFrames();
  return (
    <AbsoluteFill>
      <Sequence from={starts.problem} durationInFrames={SCENE_FRAMES.problem} layout="none">
        <SceneProblem />
      </Sequence>
      <Sequence from={starts.solution} durationInFrames={SCENE_FRAMES.solution} layout="none">
        <SceneSolution />
      </Sequence>
      <Sequence from={starts.imports} durationInFrames={SCENE_FRAMES.imports} layout="none">
        <SceneImport />
      </Sequence>
      <Sequence from={starts.nomen} durationInFrames={SCENE_FRAMES.nomen} layout="none">
        <SceneNomenclature />
      </Sequence>
      <Sequence from={starts.bim} durationInFrames={SCENE_FRAMES.bim} layout="none">
        <SceneBIM />
      </Sequence>
      <Sequence from={starts.exportZip} durationInFrames={SCENE_FRAMES.exportZip} layout="none">
        <SceneExport />
      </Sequence>
      <Sequence from={starts.privacy} durationInFrames={SCENE_FRAMES.privacy} layout="none">
        <ScenePrivacy />
      </Sequence>
      <Sequence from={starts.cta} durationInFrames={SCENE_FRAMES.cta} layout="none">
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
}
