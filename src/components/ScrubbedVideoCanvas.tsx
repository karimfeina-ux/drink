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

function selectInitialTier() {
  if (typeof window === 'undefined') return CINEMA_TIERS.desktop;
  const isPortrait =
    window.matchMedia('(orientation: portrait)').matches ||
    window.innerHeight > window.innerWidth;
  const isCoarseSmall =
    window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 900;
  return isPortrait || isCoarseSmall ? CINEMA_TIERS.mobile : CINEMA_TIERS.desktop;
}

function isSaveDataEnabled() {
  if (typeof navigator === 'undefined') return false;
  return Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

/**
 * Full-viewport scrubbed video backdrop:
 * - Picks mobile portrait (1080x1920) or desktop QHD (2560x1440) tier strictly once on mount
 * - Honors Save-Data & prefers-reduced-motion (poster only, zero video download)
 * - Preloads All-Intra MP4 into an in-memory Blob URL with fallback & full cleanup
 * - Driven by the single unified rAF loop via videoTickRef with dt-normalized smoothing
 *   and exact frame quantization ((frame + 0.25) / fps)
 */
export function ScrubbedVideoCanvas({
  scrollProgressRef,
  videoTickRef,
  reducedMotion,
}: ScrubbedVideoCanvasProps) {
  const [tier] = useState(selectInitialTier);
  const [saveData] = useState(isSaveDataEnabled);
  const posterOnly = reducedMotion || saveData;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const posterRef = useRef<HTMLImageElement | null>(null);

  const smoothedScrubRef = useRef(0);
  const lastRequestedFrameRef = useRef(-1);
  const desiredFrameRef = useRef(0);
  const lastTransformRef = useRef('');
  const unlockedRef = useRef(false);

  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Preload active video tier once into an in-memory Blob URL for zero-network scrubbing
  useEffect(() => {
    if (posterOnly) {
      setBlobSrc(null);
      return;
    }

    const controller = new AbortController();
    let objectUrl: string | null = null;

    fetch(tier.src, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobSrc(objectUrl);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          setBlobSrc(tier.src);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [posterOnly, tier]);

  // iOS Safari silent playback unlock on first user interaction
  useEffect(() => {
    if (posterOnly) return;
    const unlock = () => {
      if (unlockedRef.current) return;
      const vid = videoRef.current;
      if (!vid) return;
      unlockedRef.current = true;
      vid
        .play()
        .then(() => {
          vid.pause();
        })
        .catch(() => {
          // Browsers blocking silent play() still allow currentTime seeking
        });
    };

    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('pointerdown', unlock);
    };
  }, [posterOnly]);

  // Register frame-quantized tick callback with App's single unified rAF loop
  useEffect(() => {
    if (posterOnly || videoFailed || !blobSrc) {
      videoTickRef.current = null;
      return;
    }

    const { fps, totalFrames } = CINEMA_TIERS;

    videoTickRef.current = (_now: number, dt: number) => {
      const clampedProgress = Math.max(0, Math.min(1, scrollProgressRef.current));
      const mappedVideoProgress = Math.min(1, clampedProgress / 0.76);

      // Frame-rate independent exponential smoothing (identical feel at 60/120/144 Hz)
      const k = 1 - Math.exp(-dt * 30);
      smoothedScrubRef.current += (mappedVideoProgress - smoothedScrubRef.current) * k;
      if (Math.abs(mappedVideoProgress - smoothedScrubRef.current) < 0.00025) {
        smoothedScrubRef.current = mappedVideoProgress;
      }

      // Transform ends at exact scale(1) at final frame so video renders pixel-native
      const rawScale = 1.03 - mappedVideoProgress * 0.03;
      const nextTransform =
        rawScale <= 1.0001
          ? 'scale(1) translate3d(0, 0, 0)'
          : `scale(${rawScale.toFixed(5)}) translate3d(0, 0, 0)`;

      const vid = videoRef.current;
      if (vid) {
        if (lastTransformRef.current !== nextTransform) {
          lastTransformRef.current = nextTransform;
          vid.style.transform = nextTransform;
        }

        if (vid.readyState >= 1) {
          const frame = Math.max(
            0,
            Math.min(totalFrames - 1, Math.round(smoothedScrubRef.current * (totalFrames - 1)))
          );
          desiredFrameRef.current = frame;

          if (frame !== lastRequestedFrameRef.current && !vid.seeking) {
            lastRequestedFrameRef.current = frame;
            try {
              vid.currentTime = (frame + 0.25) / fps;
            } catch {
              // Ignore transient seek state during initial decode
            }
          }
        }
      } else if (posterRef.current && lastTransformRef.current !== nextTransform) {
        lastTransformRef.current = nextTransform;
        posterRef.current.style.transform = nextTransform;
      }
    };

    return () => {
      videoTickRef.current = null;
    };
  }, [posterOnly, videoFailed, blobSrc, scrollProgressRef, videoTickRef]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#07060B]" aria-hidden="true">
      {/* Immediate Poster Layer — zero CSS filters */}
      <img
        ref={posterRef}
        src={tier.poster}
        alt="Aetheria botanical electrolyte cans suspended in light"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ willChange: 'transform' }}
      />

      {/* All-Intra Scrubbed Tier Layer — fades cleanly over poster when ready */}
      {!posterOnly && !videoFailed && blobSrc && (
        <video
          ref={videoRef}
          src={blobSrc}
          poster={tier.poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={(e) => {
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
            try {
              vid.currentTime = (frame + 0.25) / fps;
            } catch {
              // Ignore transient metadata seek edge case
            }
          }}
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          onSeeked={() => {
            const vid = videoRef.current;
            if (!vid || vid.readyState < 1) return;
            const targetFrame = desiredFrameRef.current;
            if (targetFrame !== lastRequestedFrameRef.current) {
              lastRequestedFrameRef.current = targetFrame;
              try {
                vid.currentTime = (targetFrame + 0.25) / CINEMA_TIERS.fps;
              } catch {
                // Ignore transient seek errors
              }
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ willChange: 'transform' }}
        />
      )}

      {/* Cheap Static Gradient Overlays Only (zero backdrop-filter, zero SVG turbulence) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(7,6,11,0.02) 0%, rgba(7,6,11,0.34) 70%, rgba(7,6,11,0.82) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07060B]/55 via-transparent to-[#07060B]/75 pointer-events-none" />
    </div>
  );
}
