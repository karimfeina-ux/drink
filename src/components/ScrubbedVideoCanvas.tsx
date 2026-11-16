import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import { CINEMA_TIERS } from '../data/elixirs';

export type VideoTickFn = (now: number, dt: number) => void;

interface ScrubbedVideoCanvasProps {
  scrollProgressRef: MutableRefObject<number>;
  videoTickRef: MutableRefObject<VideoTickFn | null>;
  reducedMotion: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    saveData?: boolean;
  };
}

type TierKey = 'desktop' | 'mobile';

export interface VideoDiagnosticsSnapshot {
  tier: TierKey;
  src: string;
  poster: string;
  decodedWidth: number;
  decodedHeight: number;
  containerWidth: number;
  containerHeight: number;
  dpr: number;
  scaleVsSourceX: number;
  scaleVsSourceY: number;
  readyState: number;
  networkState: number;
  bufferedPct: number;
  paused: boolean;
  seeking: boolean;
  playingVideoCount: number;
  totalVideoElements: number;
  currentFrame: number;
  lastSeekLatencyMs: number;
  avgSeekLatencyMs: number;
  seeksIssued: number;
  seeksSkippedBusy: number;
  occludedByCatalog: boolean;
  iosUnlocked: boolean;
  posterDismissed: boolean;
}

declare global {
  interface Window {
    __AETHERIA_VIDEO_DIAG__?: VideoDiagnosticsSnapshot;
  }
}

function selectTierKey(): TierKey {
  if (typeof window === 'undefined') return 'desktop';
  const isPortrait =
    window.matchMedia('(orientation: portrait)').matches ||
    window.innerHeight > window.innerWidth;
  return isPortrait ? 'mobile' : 'desktop';
}

function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  return Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

function isDiagOverlayRequested(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'video' || params.get('diag') === '1';
}

function getBufferedPercent(vid: HTMLVideoElement): number {
  if (!vid.duration || !Number.isFinite(vid.duration) || vid.buffered.length === 0) {
    return 0;
  }
  let totalBuffered = 0;
  for (let i = 0; i < vid.buffered.length; i++) {
    totalBuffered += vid.buffered.end(i) - vid.buffered.start(i);
  }
  return Math.min(100, Math.round((totalBuffered / vid.duration) * 100));
}

/**
 * Full-viewport scrubbed video backdrop:
 * - Responsive orientation-matched tier: mobile portrait (1080x1920) vs desktop landscape (3840x2160 4K)
 * - Direct HTTP Range streaming (moov-first MP4, preload="auto", zero blocking fetch().blob())
 * - Pure 1:1 native hardware video plane: zero CSS transforms, zero filters, zero darkening overlays
 * - Zero forced layout reads in rAF (IntersectionObserver occlusion + ResizeObserver dimensions)
 */
export function ScrubbedVideoCanvas({
  scrollProgressRef,
  videoTickRef,
  reducedMotion,
}: ScrubbedVideoCanvasProps) {
  const [tierKey, setTierKey] = useState<TierKey>(selectTierKey);
  const [saveData] = useState(isSaveDataEnabled);
  const [showDiagHud, setShowDiagHud] = useState(isDiagOverlayRequested);
  const [diagSnapshot, setDiagSnapshot] = useState<VideoDiagnosticsSnapshot | null>(null);

  const tier = CINEMA_TIERS[tierKey];
  const posterOnly = reducedMotion || saveData;

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  const smoothedScrubRef = useRef(0);
  const lastRequestedFrameRef = useRef(-1);
  const desiredFrameRef = useRef(0);
  const unlockedRef = useRef(false);
  const occludedRef = useRef(false);
  const catalogCoversTopRef = useRef(false);

  const seekStartedAtRef = useRef(0);
  const seekCountRef = useRef(0);
  const totalSeekLatencyRef = useRef(0);
  const lastSeekLatencyRef = useRef(0);
  const skippedBusyRef = useRef(0);
  const lastDiagPublishRef = useRef(0);

  const [videoReady, setVideoReady] = useState(false);
  const [posterDismissed, setPosterDismissed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Switch tier cleanly only when viewport orientation flips (portrait <-> landscape)
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const syncTier = () => {
      const next = selectTierKey();
      setTierKey((prev) => {
        if (prev === next) return prev;
        setVideoReady(false);
        setPosterDismissed(false);
        setVideoFailed(false);
        lastRequestedFrameRef.current = -1;
        return next;
      });
    };

    mq.addEventListener('change', syncTier);
    window.addEventListener('resize', syncTier, { passive: true });
    return () => {
      mq.removeEventListener('change', syncTier);
      window.removeEventListener('resize', syncTier);
    };
  }, []);

  // Cache container dimensions via ResizeObserver (avoids per-frame getBoundingClientRect reflows)
  useEffect(() => {
    const el = backdropRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        containerSizeRef.current = {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Observe #scene-collection off-main-thread to hide occluded video without rAF layout reads
  useEffect(() => {
    const catalogEl = document.getElementById('scene-collection');
    if (!catalogEl || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        catalogCoversTopRef.current =
          entry.isIntersecting && entry.boundingClientRect.top <= 1;
      },
      { threshold: [0, 0.05, 0.25, 0.5, 0.99, 1] }
    );
    io.observe(catalogEl);
    return () => io.disconnect();
  }, []);

  // Dismiss poster layer once video fade-in settles so GPU doesn't hold a second full-viewport bitmap
  useEffect(() => {
    if (!videoReady || posterDismissed) return;
    const timer = window.setTimeout(() => {
      setPosterDismissed(true);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [videoReady, posterDismissed]);

  // Reliable iOS Safari silent playback unlock once <video> is mounted
  useEffect(() => {
    if (posterOnly || videoFailed) return;
    unlockedRef.current = false;

    const cleanup = () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    const unlock = () => {
      if (unlockedRef.current) {
        cleanup();
        return;
      }
      const vid = videoRef.current;
      if (!vid) return;

      vid
        .play()
        .then(() => {
          unlockedRef.current = true;
          cleanup();
          vid.pause();
          const mapped = Math.min(1, Math.max(0, scrollProgressRef.current) / 0.76);
          const { fps, totalFrames } = CINEMA_TIERS;
          const frame = Math.max(
            0,
            Math.min(totalFrames - 1, Math.round(mapped * (totalFrames - 1)))
          );
          lastRequestedFrameRef.current = frame;
          desiredFrameRef.current = frame;
          if (vid.readyState >= 1) {
            vid.currentTime = (frame + 0.25) / fps;
          }
        })
        .catch(() => {
          // Keep listeners active so next touch/click unlocks once media is ready
        });
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    return cleanup;
  }, [posterOnly, videoFailed, tier.src, scrollProgressRef]);

  // Register frame-quantized tick callback with App's unified rAF loop
  useEffect(() => {
    if (posterOnly || videoFailed) {
      videoTickRef.current = null;
      return;
    }

    const { fps, totalFrames } = CINEMA_TIERS;

    const publishDiagnostics = (now: number, vid: HTMLVideoElement | null, frame: number) => {
      if (!import.meta.env.DEV) return;
      if (now - lastDiagPublishRef.current < 250) return;
      lastDiagPublishRef.current = now;

      const cw = containerSizeRef.current.width || window.innerWidth;
      const ch = containerSizeRef.current.height || window.innerHeight;
      const dw = vid?.videoWidth ?? 0;
      const dh = vid?.videoHeight ?? 0;
      const videos = document.querySelectorAll('video');
      let playingCount = 0;
      videos.forEach((v) => {
        if (!v.paused && !v.ended) playingCount++;
      });

      const seeks = seekCountRef.current;
      window.__AETHERIA_VIDEO_DIAG__ = {
        tier: tierKey,
        src: tier.src,
        poster: tier.poster,
        decodedWidth: dw,
        decodedHeight: dh,
        containerWidth: cw,
        containerHeight: ch,
        dpr: window.devicePixelRatio || 1,
        scaleVsSourceX: dw > 0 ? Number((cw / dw).toFixed(2)) : 0,
        scaleVsSourceY: dh > 0 ? Number((ch / dh).toFixed(2)) : 0,
        readyState: vid?.readyState ?? 0,
        networkState: vid?.networkState ?? 0,
        bufferedPct: vid ? getBufferedPercent(vid) : 0,
        paused: vid?.paused ?? true,
        seeking: vid?.seeking ?? false,
        playingVideoCount: playingCount,
        totalVideoElements: videos.length,
        currentFrame: frame,
        lastSeekLatencyMs: Number(lastSeekLatencyRef.current.toFixed(1)),
        avgSeekLatencyMs:
          seeks > 0 ? Number((totalSeekLatencyRef.current / seeks).toFixed(1)) : 0,
        seeksIssued: seeks,
        seeksSkippedBusy: skippedBusyRef.current,
        occludedByCatalog: occludedRef.current,
        iosUnlocked: unlockedRef.current,
        posterDismissed,
      };
    };

    videoTickRef.current = (now: number, dt: number) => {
      const clampedProgress = Math.max(0, Math.min(1, scrollProgressRef.current));
      const mappedVideoProgress = Math.min(1, clampedProgress / 0.76);

      const isOccluded = clampedProgress >= 0.8 && catalogCoversTopRef.current;
      if (occludedRef.current !== isOccluded) {
        occludedRef.current = isOccluded;
        if (backdropRef.current) {
          backdropRef.current.style.visibility = isOccluded ? 'hidden' : 'visible';
        }
      }

      if (isOccluded) {
        publishDiagnostics(now, videoRef.current, lastRequestedFrameRef.current);
        return;
      }

      const delta = mappedVideoProgress - smoothedScrubRef.current;
      if (Math.abs(delta) > 0.04) {
        const k = 1 - Math.exp(-dt * 40);
        smoothedScrubRef.current += delta * k;
      } else if (delta !== 0) {
        smoothedScrubRef.current = mappedVideoProgress;
      }

      const frame = Math.max(
        0,
        Math.min(totalFrames - 1, Math.round(smoothedScrubRef.current * (totalFrames - 1)))
      );
      desiredFrameRef.current = frame;

      const vid = videoRef.current;
      if (vid && vid.readyState >= 1 && frame !== lastRequestedFrameRef.current) {
        if (!vid.seeking) {
          lastRequestedFrameRef.current = frame;
          seekStartedAtRef.current = performance.now();
          try {
            vid.currentTime = (frame + 0.25) / fps;
          } catch {
            // Ignore transient seek state during initial decode
          }
        } else {
          skippedBusyRef.current++;
        }
      }

      publishDiagnostics(now, vid, frame);
    };

    return () => {
      videoTickRef.current = null;
    };
  }, [
    posterOnly,
    videoFailed,
    tierKey,
    tier.src,
    tier.poster,
    posterDismissed,
    scrollProgressRef,
    videoTickRef,
  ]);

  // Periodically refresh dev HUD only when explicitly enabled via ?debug=video or ?diag=1
  useEffect(() => {
    if (!showDiagHud) return;
    const id = window.setInterval(() => {
      if (window.__AETHERIA_VIDEO_DIAG__) {
        setDiagSnapshot({ ...window.__AETHERIA_VIDEO_DIAG__ });
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [showDiagHud]);

  return (
    <div
      ref={backdropRef}
      className="fixed top-0 left-0 w-full h-screen h-[100lvh] z-0 overflow-hidden bg-[#07060B] pointer-events-none transform-gpu"
      aria-hidden="true"
    >
      {/* Immediate Poster Layer — unmounted after video fades in */}
      {!posterDismissed && (
        <img
          src={tier.poster}
          alt="Aetheria botanical electrolyte cans suspended in light"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Direct-Streamed Short-GOP 4K/HD Video Layer — pure 1:1 native display scaling, zero overlays */}
      {!posterOnly && !videoFailed && (
        <video
          key={tier.src}
          ref={videoRef}
          src={tier.src}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedData={(e) => {
            const vid = e.currentTarget;
            const mapped = Math.min(1, Math.max(0, scrollProgressRef.current) / 0.76);
            const { fps, totalFrames } = CINEMA_TIERS;
            const frame = Math.max(
              0,
              Math.min(totalFrames - 1, Math.round(mapped * (totalFrames - 1)))
            );
            smoothedScrubRef.current = mapped;
            desiredFrameRef.current = frame;
            lastRequestedFrameRef.current = frame;
            if (frame > 0) {
              try {
                vid.currentTime = (frame + 0.25) / fps;
              } catch {
                setVideoReady(true);
              }
            } else {
              setVideoReady(true);
            }
          }}
          onCanPlay={(e) => {
            if (!e.currentTarget.seeking) {
              setVideoReady(true);
            }
          }}
          onError={() => setVideoFailed(true)}
          onSeeked={() => {
            setVideoReady(true);
            if (seekStartedAtRef.current > 0) {
              const latency = performance.now() - seekStartedAtRef.current;
              lastSeekLatencyRef.current = latency;
              totalSeekLatencyRef.current += latency;
              seekCountRef.current++;
              seekStartedAtRef.current = 0;
            }
            const vid = videoRef.current;
            if (!vid || vid.readyState < 1) return;
            const targetFrame = desiredFrameRef.current;
            if (targetFrame !== lastRequestedFrameRef.current) {
              lastRequestedFrameRef.current = targetFrame;
              seekStartedAtRef.current = performance.now();
              try {
                vid.currentTime = (targetFrame + 0.25) / CINEMA_TIERS.fps;
              } catch {
                // Ignore transient seek errors
              }
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none ${
            posterDismissed
              ? 'opacity-100'
              : `transition-opacity duration-500 ${videoReady ? 'opacity-100' : 'opacity-0'}`
          }`}
        />
      )}

      {/* Dev-Only Video Diagnostics HUD (?debug=video or ?diag=1) */}
      {import.meta.env.DEV && showDiagHud && diagSnapshot && (
        <aside className="fixed bottom-4 left-4 z-50 pointer-events-auto bg-[#07060B]/92 border border-[#D9A441]/45 px-3.5 py-2.5 text-[11px] font-mono text-[#F3F1EC] leading-relaxed max-w-xs">
          <div className="flex items-center justify-between gap-4 border-b border-[#F3F1EC]/15 pb-1 mb-1.5">
            <span className="text-[#D9A441] uppercase tracking-[0.12em]">Video Diag</span>
            <button
              type="button"
              onClick={() => setShowDiagHud(false)}
              className="text-[#9A96A6] hover:text-[#F3F1EC] cursor-pointer"
            >
              ×
            </button>
          </div>
          <div>
            Src: {diagSnapshot.tier} ({diagSnapshot.src.split('/').pop()})
          </div>
          <div>
            Decoded: {diagSnapshot.decodedWidth}×{diagSnapshot.decodedHeight} | Box:{' '}
            {diagSnapshot.containerWidth}×{diagSnapshot.containerHeight}@{diagSnapshot.dpr}x
          </div>
          <div>
            Scale: {diagSnapshot.scaleVsSourceX}× / {diagSnapshot.scaleVsSourceY}×
          </div>
          <div>
            State: r={diagSnapshot.readyState} n={diagSnapshot.networkState} buf=
            {diagSnapshot.bufferedPct}%
          </div>
          <div>
            Frame: {diagSnapshot.currentFrame}/479 | Seek: {diagSnapshot.lastSeekLatencyMs}ms
            (avg {diagSnapshot.avgSeekLatencyMs}ms)
          </div>
          <div>
            Playing: {diagSnapshot.playingVideoCount}/{diagSnapshot.totalVideoElements} |
            Occluded: {String(diagSnapshot.occludedByCatalog)}
          </div>
        </aside>
      )}
    </div>
  );
}
