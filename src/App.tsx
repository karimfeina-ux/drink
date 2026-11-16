import Lenis from 'lenis';
import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CartDrawer, type CartItem } from './components/CartDrawer';
import { CinematicScenes } from './components/CinematicScenes';
import { ElixirDock } from './components/ElixirDock';
import { Navbar } from './components/Navbar';
import { ProductLandingPage, type PackSize } from './components/ProductLandingPage';
import { ScrubbedVideoCanvas, type VideoTickFn } from './components/ScrubbedVideoCanvas';
import {
  ELIXIRS,
  getActiveFeaturedElixir,
  type ElixirProduct,
} from './data/elixirs';

function parseProductFromHash(): ElixirProduct | null {
  const hash = window.location.hash;
  const match = hash.match(/^#\/product\/([a-z0-9-]+)$/i);
  if (!match) return null;
  return ELIXIRS.find((e) => e.id === match[1]) ?? null;
}

export default function App() {
  const [dockReady, setDockReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedElixir, setSelectedElixir] = useState<ElixirProduct>(ELIXIRS[4]);
  const [hasManualSelection, setHasManualSelection] = useState(false);

  const [routedProduct, setRoutedProduct] = useState<ElixirProduct | null>(() =>
    parseProductFromHash()
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const scrollProgressRef = useRef(0);
  const videoTickRef = useRef<VideoTickFn | null>(null);
  const filmPercentRef = useRef<HTMLSpanElement | null>(null);
  const lastPctRef = useRef(-1);
  const lastWindowIdRef = useRef(ELIXIRS[4].id);
  const lenisRef = useRef<Lenis | null>(null);
  const savedScrollYRef = useRef(0);
  const hasManualSelectionRef = useRef(false);

  useEffect(() => {
    hasManualSelectionRef.current = hasManualSelection;
  }, [hasManualSelection]);

  // Sync browser hash navigation (#/product/:id <-> cinema film)
  useEffect(() => {
    const onHashChange = () => {
      const next = parseProductFromHash();
      setRoutedProduct(next);
      if (next) {
        setSelectedElixir(next);
        setHasManualSelection(true);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Detect prefers-reduced-motion dynamically
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Single unified rAF loop + Lenis + visibility pause (zero per-frame React state updates)
  useEffect(() => {
    if (routedProduct) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    let maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );

    const syncScrollMetrics = () => {
      const nextProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgressRef.current = nextProgress;

      const nextPct = Math.round(nextProgress * 100);
      if (nextPct !== lastPctRef.current) {
        lastPctRef.current = nextPct;
        if (filmPercentRef.current) {
          filmPercentRef.current.textContent = `Film ${nextPct.toString().padStart(2, '0')}%`;
        }
      }

      const shouldShowDock = nextProgress >= 0.62;
      setDockReady((prev) => (prev === shouldShowDock ? prev : shouldShowDock));

      if (!hasManualSelectionRef.current) {
        const featured = getActiveFeaturedElixir(nextProgress);
        if (featured.id !== lastWindowIdRef.current) {
          lastWindowIdRef.current = featured.id;
          setSelectedElixir(featured);
        }
      }
    };

    const recomputeBounds = () => {
      maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      syncScrollMetrics();
    };

    syncScrollMetrics();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(recomputeBounds)
        : null;
    resizeObserver?.observe(document.body);

    if (reducedMotion) {
      window.addEventListener('scroll', syncScrollMetrics, { passive: true });
      window.addEventListener('resize', recomputeBounds, { passive: true });
      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener('scroll', syncScrollMetrics);
        window.removeEventListener('resize', recomputeBounds);
      };
    }

    const lenis = new Lenis({
      lerp: 0.095,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.35,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', syncScrollMetrics);

    let rafId = 0;
    let lastNow = performance.now();

    const frame = (now: number) => {
      if (document.hidden) {
        rafId = 0;
        return;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

      lenis.raf(now);
      videoTickRef.current?.(now, dt);

      rafId = requestAnimationFrame(frame);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else {
        lastNow = performance.now();
        if (!rafId) {
          rafId = requestAnimationFrame(frame);
        }
      }
    };

    if (!document.hidden) {
      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', recomputeBounds, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', recomputeBounds);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion, routedProduct]);

  useEffect(() => {
    if (cartOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }
  }, [cartOpen]);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { duration: 1.15 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSelectElixir = useCallback((elixir: ElixirProduct) => {
    setHasManualSelection(true);
    setSelectedElixir(elixir);
  }, []);

  const handleOpenProductPage = useCallback(
    (elixir: ElixirProduct) => {
      if (!routedProduct) {
        savedScrollYRef.current = window.scrollY;
      }
      setHasManualSelection(true);
      setSelectedElixir(elixir);
      setRoutedProduct(elixir);
      window.location.hash = `#/product/${elixir.id}`;
    },
    [routedProduct]
  );

  const handleBackToFilm = useCallback(() => {
    setRoutedProduct(null);
    if (window.location.hash.startsWith('#/product/')) {
      window.location.hash = '#/';
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollYRef.current, behavior: 'auto' });
    });
  }, []);

  const handleAddToCart = useCallback(
    (elixir: ElixirProduct, packSize: PackSize, quantity: number, openDrawer = false) => {
      const pack = elixir.packs.find((p) => p.size === packSize) ?? elixir.packs[1];
      setCartItems((prev) => {
        const idx = prev.findIndex(
          (item) => item.elixir.id === elixir.id && item.packSize === packSize
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + quantity,
          };
          return updated;
        }
        return [
          ...prev,
          {
            elixir,
            packSize,
            unitPrice: pack.price,
            quantity,
          },
        ];
      });
      if (openDrawer) {
        setCartOpen(true);
      }
    },
    []
  );

  const handleUpdateQuantity = useCallback(
    (elixirId: string, packSize: PackSize, delta: number) => {
      setCartItems((prev) =>
        prev
          .map((item) =>
            item.elixir.id === elixirId && item.packSize === packSize
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const handleRemoveItem = useCallback((elixirId: string, packSize: PackSize) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.elixir.id === elixirId && item.packSize === packSize))
    );
  }, []);

  const totalBagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const dockVisible = !cartOpen && dockReady;

  return (
    <div className="relative min-h-screen bg-[#07060B] text-[#F3F1EC]">
      <Navbar
        cartCount={totalBagCount}
        onOpenCart={() => setCartOpen(true)}
        onScrollToSection={handleScrollToSection}
        hasProductOpen={Boolean(routedProduct)}
        onCloseProduct={handleBackToFilm}
      />

      {routedProduct ? (
        <ProductLandingPage
          product={routedProduct}
          onBackToFilm={handleBackToFilm}
          onNavigateProduct={handleOpenProductPage}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <>
          <ScrubbedVideoCanvas
            scrollProgressRef={scrollProgressRef}
            videoTickRef={videoTickRef}
            reducedMotion={reducedMotion}
          />

          <CinematicScenes
            filmPercentRef={filmPercentRef}
            selectedElixir={selectedElixir}
            onSelectElixir={handleSelectElixir}
            onOpenProduct={handleOpenProductPage}
            onQuickAdd={(elixir, packSize, qty) => handleAddToCart(elixir, packSize, qty, true)}
            onScrollToSection={handleScrollToSection}
          />

          <ElixirDock
            visible={dockVisible}
            selectedElixir={selectedElixir}
            onSelectElixir={handleSelectElixir}
            onOpenProduct={handleOpenProductPage}
          />
        </>
      )}

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            items={cartItems}
            onClose={() => setCartOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={() => setCartItems([])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
