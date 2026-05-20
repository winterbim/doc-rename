import React from 'react';
import { AbsoluteFill } from 'remotion';
import { subtitles } from '../lib/script';
import { Subtitle } from '../components/Subtitle';
import { ProgressBar } from '../components/ProgressBar';
import { MainScenes } from './MainScenes';

/**
 * Master 16:9 — 1920×1080 — 30 fps — 94 s.
 * Visual timeline + global subtitle layer + thin progress bar.
 */
export function MainMaster() {
  return (
    <AbsoluteFill>
      <MainScenes />
      <Subtitle cues={subtitles} />
      <ProgressBar />
    </AbsoluteFill>
  );
}
