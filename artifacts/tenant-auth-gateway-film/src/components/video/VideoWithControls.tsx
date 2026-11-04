import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown, ChevronUp, Pause, Play, Repeat2, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { SCENE_DETAILS } from './sceneMeta';
import { useSceneControls } from './useSceneControls';

const TICK_MS = 60;

export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;
  const controls = useSceneControls(SCENE_DURATIONS);
  const [muted, setMuted] = useState(false);
  const sensorRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);

  const handleJumpTo = useCallback((index: number) => {
    controls.jumpTo(index);
    const key = controls.sceneKeys[index];
    const details = SCENE_DETAILS[key];
    if (!details?.filePath) return;
    window.parent.postMessage({
      type: 'REPLIT_VIDEO_SCENE_SELECTED',
      payload: { sceneIndex: index, sceneCount: controls.sceneKeys.length, sceneTitle: details.title, filePath: details.filePath, lineNumber: 1 },
    }, '*');
  }, [controls.jumpTo, controls.sceneKeys]);

  const onPointerEnter = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setHovering(true);
  }, []);
  const onPointerLeave = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setHovering(false);
  }, []);
  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' && collapsed) setTapPinned(true);
  }, [collapsed]);
  const onToggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      if (!value) { setHovering(false); setTapPinned(false); }
      return !value;
    });
  }, []);

  useEffect(() => {
    if (!(collapsed && tapPinned)) return;
    const onDocumentPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') return;
      if (sensorRef.current && !sensorRef.current.contains(event.target as Node)) setTapPinned(false);
    };
    document.addEventListener('pointerdown', onDocumentPointerDown);
    return () => document.removeEventListener('pointerdown', onDocumentPointerDown);
  }, [collapsed, tapPinned]);

  if (!isIframed) return <VideoTemplate />;
  const visible = !collapsed || hovering || tapPinned;

  return (
    <div className="relative h-screen w-full">
      <VideoTemplate
        key={controls.mountKey}
        durations={controls.durations}
        loop
        paused={controls.paused}
        muted={muted}
        onSceneChange={controls.onSceneChange}
      />
      <div
        ref={sensorRef}
        className="control-sensor"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
      >
        <div className="control-filler" aria-hidden="true" />
        <div className={`control-bar ${visible ? '' : 'hidden'}`} aria-hidden={!visible}>
          <button className="control-btn" onClick={controls.togglePause} title={controls.paused ? 'Play' : 'Pause'} aria-label={controls.paused ? 'Play' : 'Pause'}>
            {controls.paused ? <Play size="2.3vmin" /> : <Pause size="2.3vmin" />}
          </button>
          <button className="control-btn" onClick={controls.toggleLock} title={controls.locked ? 'Loop current scene: on' : 'Loop current scene: off'} aria-label={controls.locked ? 'Loop current scene: on' : 'Loop current scene: off'} aria-pressed={controls.locked}>
            <Repeat2 size="2.1vmin" />
          </button>
          <button className="control-btn" onClick={() => setMuted((value) => !value)} title={muted ? 'Unmute audio' : 'Mute audio'} aria-label={muted ? 'Unmute audio' : 'Mute audio'} aria-pressed={muted}>
            {muted ? <VolumeX size="2.1vmin" /> : <Volume2 size="2.1vmin" />}
          </button>
          <div className="control-divider" aria-hidden="true" />
          <PlaybackStatus
            sceneKeys={controls.sceneKeys}
            activeIndex={controls.activeIndex}
            activeDuration={controls.activeDuration}
            activeStartTime={controls.activeStartTime}
            totalDuration={controls.totalDuration}
            tick={controls.tick}
            paused={controls.paused}
            onJumpTo={handleJumpTo}
          />
          <button className="control-btn" onClick={onToggleCollapsed} title={collapsed ? 'Show controls' : 'Hide controls'} aria-label={collapsed ? 'Show controls' : 'Hide controls'} aria-expanded={!collapsed}>
            {collapsed ? <ChevronUp size="2.5vmin" /> : <ChevronDown size="2.5vmin" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaybackStatus({
  sceneKeys,
  activeIndex,
  activeDuration,
  activeStartTime,
  totalDuration,
  tick,
  paused,
  onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  activeStartTime: number;
  totalDuration: number;
  tick: number;
  paused: boolean;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedBase = useRef(0);
  useEffect(() => {
    setElapsed(0);
    elapsedBase.current = 0;
  }, [tick]);
  useEffect(() => {
    if (paused) return;
    const started = performance.now();
    const timer = window.setInterval(() => setElapsed(elapsedBase.current + performance.now() - started), TICK_MS);
    return () => {
      window.clearInterval(timer);
      elapsedBase.current += performance.now() - started;
    };
  }, [paused, tick]);
  const progress = activeDuration > 0 ? Math.min(1, elapsed / activeDuration) : 0;
  const totalElapsed = Math.min(totalDuration, activeStartTime + Math.min(elapsed, activeDuration));
  return (
    <>
      <div className="control-track">
        {sceneKeys.map((key, index) => (
          <button key={key} className="control-segment" onClick={() => onJumpTo(index)} aria-label={`Jump to scene ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined}>
            <span style={{ width: `${index === activeIndex ? progress * 100 : index < activeIndex ? 100 : 0}%` }} />
          </button>
        ))}
      </div>
      <div className="control-readout control-count">{activeIndex + 1}/{sceneKeys.length}</div>
      <div className="control-readout" role="timer" aria-label={`Playback time ${formatTime(totalElapsed)} of ${formatTime(totalDuration)}`}>
        {formatTime(totalElapsed)} / {formatTime(totalDuration)}
      </div>
    </>
  );
}

function formatTime(durationMs: number): string {
  const seconds = Math.max(0, Math.floor(durationMs / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
