import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import { CINEMA_VIDEO } from '../data/elixirs';

interface ScrubbedVideoCanvasProps {
  scrollProgressRef: MutableRefObject<number>;
  reducedMotion: boolean;
}

/**
 * Full-viewport scrubbed cinema master with:
 * - In-memory Blob preloading (eliminates HTTP 206 range-request stalls while scrubbing)
 * - Direct DOM transform + rAF lockstep with Lenis (no React re-renders or double-smoothing lag)
 * - Seeked-chained pipelining for instant forward & backward frame scrubbing
 */
export function ScrubbedVideoCanvas({
  scrollProgressRef,
  reducedMotion,
}: ScrubbedVideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const posterRef = useRef<HTMLImageElement | null>(null);
  const desiredTimeRef = useRef(0);
  const smoothedScrubRef = useRef(0);
  const unlockedRef = useRef(false);

  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Preload cinema-master.mp4 once into an in-memory Blob URL so every scroll seek is local RAM
  useEffect(() => {
    if (reducedMotion) return;

    const controller = new AbortController();
    let objectUrl: string | null = null;

    fetch(CINEMA_VIDEO.src, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Video fetch failed');
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobSrc(objectUrl);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          // Graceful fallback to direct URL streaming if Blob preload fails
          setBlobSrc(CINEMA_VIDEO.src);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [reducedMotion]);

  // Mobile Safari silent playback unlock on first gesture
  useEffect(() => {
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
  }, []);

  // 120Hz rAF lockstep sync + immediate seeked-pipelining
  useEffect(() => {
    if (reducedMotion || videoFailed || !blobSrc) return;

    let rafId = 0;
    const seekThreshold = 0.008; // Sub-frame precision

    const dispatchSeek = (vid: HTMLVideoElement, targetTime: number) => {
      if (vid.seeking) return;
      if (Math.abs(vid.currentTime - targetTime) > seekThreshold) {
        try {
          vid.currentTime = targetTime;
        } catch {
          // Ignore transient decode state while loading metadata
        }
      }
    };

    const tick = () => {
      const vid = videoRef.current;
      const clampedProgress = Math.max(0, Math.min(1, scrollProgressRef.current));
      // Map [0..0.76] scroll across 0..100% of the 20s film so Scene 05 locks on the final 6-can lineup
      const mappedVideoProgress = Math.min(1, clampedProgress / 0.76);

      // Tight 0.55 catchup removes any staircase micro-jitter while staying 1:1 responsive with Lenis
      smoothedScrubRef.current += (mappedVideoProgress - smoothedScrubRef.current) * 0.55;
      if (Math.abs(mappedVideoProgress - smoothedScrubRef.current) < 0.0004) {
        smoothedScrubRef.current = mappedVideoProgress;
      }

      const scale = 1.03 - Math.min(clampedProgress, 1) * 0.03;
      const scaleTransform = `scale(${scale.toFixed(5)}) translate3d(0, 0, 0)`;

      if (vid) {
        vid.style.transform = scaleTransform;
        if (vid.readyState >= 1 && Number.isFinite(vid.duration) && vid.duration > 0) {
          const targetTime = Math.max(
            0,
            Math.min(vid.duration - 0.02, smoothedScrubRef.current * vid.duration)
          );
          desiredTimeRef.current = targetTime;
          dispatchSeek(vid, targetTime);
        }
      } else if (posterRef.current) {
        posterRef.current.style.transform = scaleTransform;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, videoFailed, blobSrc, scrollProgressRef]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#07060B]" aria-hidden="true">
      {/* Instant Poster / Reduced Motion / Fallback */}
      <img
        ref={posterRef}
        src={CINEMA_VIDEO.poster}
        alt="Aetheria botanical electrolyte cans in suspended cosmic light"
        className={`absolute inset-0 w-full h-full object-cover brightness-[1.06] contrast-[1.03] transition-opacity duration-500 ${
          videoReady && !reducedMotion && !videoFailed ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* In-Memory Blob Mastered QHD Video */}
      {!reducedMotion && !videoFailed && blobSrc && (
        <video
          ref={videoRef}
          src={blobSrc}
          poster={CINEMA_VIDEO.poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            const mapped = Math.min(1, Math.max(0, scrollProgressRef.current) / 0.76);
            if (Number.isFinite(vid.duration) && vid.duration > 0) {
              const initialTime = Math.min(vid.duration - 0.02, mapped * vid.duration);
              desiredTimeRef.current = initialTime;
              smoothedScrubRef.current = mapped;
              try {
                vid.currentTime = initialTime;
              } catch {
                // Ignore initial seek edge case
              }
            }
          }}
          onLoadedData={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          onSeeked={() => {
            const vid = videoRef.current;
            if (!vid || vid.readyState < 1) return;
            if (Math.abs(vid.currentTime - desiredTimeRef.current) > 0.008) {
              try {
                vid.currentTime = desiredTimeRef.current;
              } catch {
                // Ignore transient seek errors
              }
            }
          }}
          className={`absolute inset-0 w-full h-full object-cover brightness-[1.06] contrast-[1.03] transition-opacity duration-500 pointer-events-none ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            willChange: 'transform',
          }}
        />
      )}

      {/* Measured Scrim keeping brightness alive while preserving editorial typography legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(7,6,11,0.02) 0%, rgba(7,6,11,0.34) 70%, rgba(7,6,11,0.82) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07060B]/55 via-transparent to-[#07060B]/75 pointer-events-none" />
      <div className="absolute inset-0 film-grain opacity-65 pointer-events-none" />
    </div>
  );
}
