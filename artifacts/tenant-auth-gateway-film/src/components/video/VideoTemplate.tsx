import { useEffect, useRef, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { VideoCanvas, VideoPausedContext, type VideoAspectRatio, useVideoPlayer } from '@/lib/video';
import { BoundaryScene } from './BoundaryScene';
import { TokenScene } from './TokenScene';
import { RedisScene } from './RedisScene';
import { TenantScopeScene } from './TenantScopeScene';
import { RoleScene } from './RoleScene';
import { RotationScene } from './RotationScene';
import { OverviewScene } from './OverviewScene';

export const SCENE_DURATIONS = {
  boundary: 4800,
  token: 4300,
  redis: 4800,
  scope: 4850,
  roles: 4800,
  rotation: 4300,
  overview: 5150,
};

const VIDEO_ASPECT_RATIO: VideoAspectRatio = '16:9';
const SCENE_START_SEC: Record<string, number> = (() => {
  const starts: Record<string, number> = {};
  let elapsed = 0;
  for (const [key, duration] of Object.entries(SCENE_DURATIONS)) {
    starts[key] = elapsed / 1000;
    elapsed += duration;
  }
  return starts;
})();
const SCENE_COMPONENTS: Record<string, ComponentType> = {
  boundary: BoundaryScene,
  token: TokenScene,
  redis: RedisScene,
  scope: TenantScopeScene,
  roles: RoleScene,
  rotation: RotationScene,
  overview: OverviewScene,
};
const CARRIER_POSES = [
  { left: '76%', top: '50%', scale: 1 },
  { left: '34%', top: '35%', scale: 0.86 },
  { left: '24%', top: '54%', scale: 0.92 },
  { left: '54%', top: '58%', scale: 0.86 },
  { left: '80%', top: '56%', scale: 0.72 },
  { left: '68%', top: '43%', scale: 0.7 },
  { left: '50%', top: '50%', scale: 0.82 },
];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  paused = false,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop, paused });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSceneKeyRef = useRef<string | null>(null);
  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];
  const canonicalIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.43;
    if (paused) {
      audio.pause();
      return;
    }
    if (lastSceneKeyRef.current !== currentSceneKey) {
      lastSceneKeyRef.current = currentSceneKey;
      const seekTo = SCENE_START_SEC[baseSceneKey] ?? 0;
      if (Math.abs(audio.currentTime - seekTo) > 0.18) audio.currentTime = seekTo;
    }
    audio.play().catch(() => {});
  }, [baseSceneKey, currentSceneKey, muted, paused]);

  return (
    <VideoCanvas aspectRatio={VIDEO_ASPECT_RATIO} style={{ backgroundColor: 'var(--color-bg-dark)' }}>
      <VideoPausedContext.Provider value={paused}>
        <motion.div
          className="carrier-ring"
          initial={false}
          animate={CARRIER_POSES[canonicalIndex] ?? CARRIER_POSES[0]}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginLeft: '-2.2vmin', marginTop: '-2.2vmin' }}
          aria-hidden="true"
        />
        <AnimatePresence mode="sync">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
        <audio
          ref={audioRef}
          src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
          preload="auto"
          autoPlay
          muted={muted}
          aria-hidden="true"
        />
      </VideoPausedContext.Provider>
    </VideoCanvas>
  );
}
