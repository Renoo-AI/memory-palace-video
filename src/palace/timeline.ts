export interface WordTiming {
  word: string;
  clean: string;
  start: number;
  end: number;
  shot: string;
}

export interface BreathPause {
  after_shot: string;
  before_shot: string;
  start: number;
  end: number;
  duration: number;
}

export interface ShotTiming {
  id: string;
  start: number;
  end: number;
  duration: number;
  speech_start: number;
  speech_end: number;
  line: string;
}

export interface AlignedTimeline {
  narration_duration: number;
  video_duration: number;
  fps: number;
  total_frames: number;
  script_verified: boolean;
  words: WordTiming[];
  breaths: BreathPause[];
  shots: ShotTiming[];
}

export function findSyncTime(
  timeline: AlignedTimeline,
  shotId: string,
  wordClean: string,
  fallbackOffset = 0.5
): number {
  const shot = timeline.shots.find((s) => s.id === shotId);
  const w = timeline.words.find(
    (item) => item.shot === shotId && item.clean.replace(/'/g, '') === wordClean.toLowerCase()
  );
  if (w) return w.start;
  return shot ? shot.start + fallbackOffset : 0;
}

export function getActiveShot(timeline: AlignedTimeline, t: number): ShotTiming {
  for (const s of timeline.shots) {
    if (t >= s.start && t < s.end) return s;
  }
  return timeline.shots[timeline.shots.length - 1];
}

/**
 * Returns phrase-grouped captions (3 to 6 words at a time) for Section 8.12.
 * Hidden during S38's silent beat (after 149.02s).
 */
export function getCaptionGroup(
  timeline: AlignedTimeline,
  t: number
): { words: { text: string; active: boolean }[] } | null {
  if (t >= 149.02) return null; // Hide during S38 silent beat

  // Find active or upcoming word inside current speech phrase
  const activeIdx = timeline.words.findIndex((w) => t >= w.start - 0.04 && t <= w.end + 0.14);
  if (activeIdx === -1) return null;

  const activeWord = timeline.words[activeIdx];
  const shotWords = timeline.words.filter((w) => w.shot === activeWord.shot);
  const posInShot = shotWords.indexOf(activeWord);

  // Chunk shot words into groups of up to 5 words
  const chunkSize = 5;
  const chunkStart = Math.floor(posInShot / chunkSize) * chunkSize;
  const slice = shotWords.slice(chunkStart, chunkStart + chunkSize);

  return {
    words: slice.map((w) => ({
      text: w.word,
      active: t >= w.start - 0.02 && t <= w.end + 0.06,
    })),
  };
}
