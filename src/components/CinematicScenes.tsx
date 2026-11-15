import { ArrowDown, ArrowUpRight, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { type FormEvent, type RefObject, useState } from 'react';
import { BRAND_CONFIG, ELIXIRS, type ElixirProduct } from '../data/elixirs';
import type { PackSize } from './ProductLandingPage';

interface CinematicScenesProps {
  filmPercentRef: RefObject<HTMLSpanElement | null>;
  selectedElixir: ElixirProduct;
  onSelectElixir: (elixir: ElixirProduct) => void;
  onOpenProduct: (elixir: ElixirProduct) => void;
  onQuickAdd: (elixir: ElixirProduct, packSize: PackSize, quantity: number) => void;
  onScrollToSection: (sectionId: string) => void;
}

const RITUAL_SCHEDULE = [
  { time: '07:00', phase: 'Morning Altitude', elixirId: 'cobalt-lotus', note: '280 mOsm/L yuzu sea mineral reset' },
  { time: '13:00', phase: 'Solar Output', elixirId: 'aurelia-lion', note: '520 mg sodium + Kashmiri saffron stamina' },
  { time: '18:00', phase: 'Heat Recovery', elixirId: 'jade-verdant', note: '110 mg magnesium glycinate & mint' },
  { time: '22:00', phase: 'Dusk Decompression', elixirId: 'amethyst-stag', note: '150 mg L-theanine & hibiscus calm' },
];

export function CinematicScenes({
  filmPercentRef,
  selectedElixir,
  onSelectElixir,
  onOpenProduct,
  onQuickAdd,
  onScrollToSection,
}: CinematicScenesProps) {
  const [conciergeEmail, setConciergeEmail] = useState('');
  const [conciergeInterest, setConciergeInterest] = useState('Private Pantry / Studio');
  const [conciergeError, setConciergeError] = useState('');
  const [conciergeSent, setConciergeSent] = useState(false);

  const handleConciergeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conciergeEmail.trim())) {
      setConciergeError('Enter a valid email address.');
      return;
    }
    setConciergeError('');
    setConciergeSent(true);
  };

  return (
    <main className="relative z-10 pointer-events-none">
      {/* SCENE 01 — THE ARRIVAL (0s – 2.5s) */}
      <section
        id="scene-arrival"
        className="min-h-[135svh] flex flex-col justify-between px-5 sm:px-8 lg:px-14 pt-24 pb-20 max-w-[1440px] mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4 text-[11px] font-mono uppercase tracking-[0.16em] text-[#9A96A6]"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span>280 mOsm/L Isotonic</span>
            <span aria-hidden="true">·</span>
            <span>Six Botanical Elixirs</span>
            <span aria-hidden="true">·</span>
            <span>Zero Sugar</span>
          </div>
          <span ref={filmPercentRef} className="tabular-nums hidden sm:inline">
            Film 00%
          </span>
        </motion.div>

        <div className="my-auto py-10 max-w-6xl pointer-events-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3.3rem,9.2vw,8.4rem)] font-medium leading-[0.89] tracking-[-0.03em] text-[#F3F1EC] text-balance drop-shadow-[0_4px_32px_rgba(7,6,11,0.9)]"
          >
            Cellular hydration,{' '}
            <span className="italic font-normal text-stroke-bone">sculpted</span> in mineral.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-8 max-w-4xl"
          >
            <p className="max-w-sm text-sm sm:text-base text-[#F3F1EC]/85 leading-relaxed optical-light drop-shadow-[0_2px_16px_rgba(7,6,11,0.95)]">
              Six small-batch mineral formulas in crisp spring carbonation. Scroll slowly through the two-part film to unveil every vessel and select your bottle.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onScrollToSection('scene-lineup')}
                className="inline-flex items-center gap-2.5 px-5 py-3.5 min-h-[44px] bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer"
              >
                <span>Choose Vessel</span>
                <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <a
                href={`#/product/${selectedElixir.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenProduct(selectedElixir);
                }}
                className="inline-flex items-center gap-2 px-4 py-3.5 min-h-[44px] border-b border-[#F3F1EC]/35 hover:border-[#D9A441] text-[#F3F1EC] text-xs font-medium uppercase tracking-[0.08em] transition-colors cursor-pointer"
              >
                <span>Flagship · {selectedElixir.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#D9A441]" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-[#9A96A6]">
          <span>Scroll slowly to scrub</span>
          <span>00:00 — 00:20</span>
        </div>
      </section>

      {/* BREATHER I — NEARLY EMPTY SHOWCASE (OBSIDIAN EMERGENCE & GLASS SHARDS · 2.5s – 5s) */}
      <section
        aria-label="Obsidian emergence sequence"
        className="min-h-[130svh] flex flex-col justify-end px-5 sm:px-8 lg:px-14 pb-20 max-w-[1440px] mx-auto"
      >
        <div className="flex items-center gap-4">
          <span className="w-12 h-px bg-[#D9A441]/75" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#F3F1EC]/75">
            Act I · Obsidian Emergence — Six Vessels Suspended in Glass
          </p>
        </div>
      </section>

      {/* SCENE 02 — THE OSMOTIC STANDARD (5s – 7s) */}
      <section
        id="scene-atmosphere"
        className="min-h-[125svh] flex items-center px-5 sm:px-8 lg:px-14 py-24 max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 pointer-events-auto relative"
          >
            <span
              aria-hidden="true"
              className="block font-display text-[6rem] sm:text-[8.5rem] leading-none text-stroke-bone select-none -mb-6 sm:-mb-9"
            >
              01
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-medium leading-[0.96] tracking-tight text-[#F3F1EC] text-balance drop-shadow-[0_4px_28px_rgba(7,6,11,0.95)]">
              Water alone passes through.{' '}
              <span className="italic font-normal text-[#D9A441]">Minerals</span> lock in.
            </h2>
            <div className="mt-5 h-px w-20 bg-[#F3F1EC]/25" aria-hidden="true" />
            <p className="text-sm sm:text-base text-[#F3F1EC]/85 leading-relaxed mt-5 max-w-md optical-light drop-shadow-[0_2px_18px_rgba(7,6,11,0.95)]">
              Plain water lacks the osmotic pressure required for rapid cellular uptake. Each 355 ml vessel pairs Atlantic sea minerals, potassium citrate, and magnesium glycinate at blood-matched 280 mOsm/L—zero powder grit.
            </p>
          </motion.div>
          <div className="lg:col-span-7 hidden lg:block" />
        </div>
      </section>

      {/* BREATHER II — NEARLY EMPTY SHOWCASE (CHILLED CONDENSATION COLLISION · 7s – 9s) */}
      <section
        aria-label="Condensation collision sequence"
        className="min-h-[135svh] flex flex-col justify-between px-5 sm:px-8 lg:px-14 py-24 max-w-[1440px] mx-auto"
      >
        <div className="flex items-center gap-4">
          <span className="w-12 h-px bg-[#F3F1EC]/35" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#F3F1EC]/75">
            Act II · Cold Specular Collision — 4 °C Micro-Carbonation
          </p>
        </div>

        <div className="flex justify-end">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#D9A441]">
            Amethyst Stag × Aurelia Lion
          </p>
        </div>
      </section>

      {/* SCENE 03 — PRECISION ELECTROLYTE GEOMETRY (9s – 11s) */}
      <section
        id="scene-formulation"
        className="min-h-[125svh] flex items-center px-5 sm:px-8 lg:px-14 py-24 max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-center">
          <div className="lg:col-span-7 hidden lg:block" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 pointer-events-auto"
          >
            <span
              aria-hidden="true"
              className="block font-display text-[6rem] sm:text-[8.5rem] leading-none text-stroke-bone select-none -mb-6 sm:-mb-9"
            >
              02
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[0.98] tracking-tight text-[#F3F1EC] text-balance drop-shadow-[0_4px_28px_rgba(7,6,11,0.95)]">
              Precision electrolyte geometry.
            </h2>

            <div className="mt-7 divide-y divide-[#F3F1EC]/18 border-y border-[#F3F1EC]/18">
              <div className="py-3.5 flex items-baseline justify-between text-sm">
                <span className="text-[#F3F1EC]/80">Ionic Sodium Range</span>
                <span className="font-mono tabular-nums text-[#F3F1EC]">360 – 540 mg</span>
              </div>
              <div className="py-3.5 flex items-baseline justify-between text-sm">
                <span className="text-[#F3F1EC]/80">Potassium Citrate</span>
                <span className="font-mono tabular-nums text-[#F3F1EC]">195 – 260 mg</span>
              </div>
              <div className="py-3.5 flex items-baseline justify-between text-sm">
                <span className="text-[#F3F1EC]/80">Magnesium Glycinate</span>
                <span className="font-mono tabular-nums text-[#F3F1EC]">85 – 130 mg</span>
              </div>
              <div className="py-3.5 flex items-baseline justify-between text-sm">
                <span className="text-[#F3F1EC]/80">Refined Sugar</span>
                <span className="font-mono tabular-nums text-[#D9A441]">0 g</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BREATHER III (NEW VIDEO PART II) — SOLAR ECLIPSE AWAKENING (11s – 13.5s) */}
      <section
        aria-label="Solar eclipse awakening sequence"
        className="min-h-[135svh] flex flex-col justify-between px-5 sm:px-8 lg:px-14 py-24 max-w-[1440px] mx-auto"
      >
        <div className="flex items-center gap-4">
          <span className="w-12 h-px bg-[#D9A441]/75" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#F3F1EC]/75">
            Act III · Solar Eclipse — Luminous Botanical Sweep
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="font-display italic text-2xl sm:text-4xl text-[#F3F1EC]/85 max-w-lg drop-shadow-[0_4px_24px_rgba(7,6,11,0.95)]"
        >
          Cold-extracted botanicals, zero synthetic color, bottled in embossed aluminum.
        </motion.p>
      </section>

      {/* NEW PAGE — SCENE 03C: BOTANICAL ALCHEMY (13.5s – 16s) */}
      <section
        id="scene-botanicals"
        className="min-h-[135svh] flex items-center px-5 sm:px-8 lg:px-14 py-24 max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 pointer-events-auto"
          >
            <span
              aria-hidden="true"
              className="block font-display text-[6rem] sm:text-[8.5rem] leading-none text-stroke-bone select-none -mb-6 sm:-mb-9"
            >
              03
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[0.98] tracking-tight text-[#F3F1EC] text-balance drop-shadow-[0_4px_28px_rgba(7,6,11,0.95)]">
              Botanical <span className="italic font-normal text-[#D9A441]">alchemy</span> in every crest.
            </h2>

            <div className="mt-7 divide-y divide-[#F3F1EC]/15 border-y border-[#F3F1EC]/15">
              {ELIXIRS.map((elixir) => (
                <a
                  key={elixir.id}
                  href={`#/product/${elixir.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenProduct(elixir);
                  }}
                  className="group py-3 flex items-center justify-between gap-4 text-sm hover:pl-2 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs tabular-nums" style={{ color: elixir.accentHex }}>
                      {elixir.index}
                    </span>
                    <span className="font-medium text-[#F3F1EC] group-hover:text-[#D9A441] transition-colors truncate">
                      {elixir.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#9A96A6] truncate text-right">
                    {elixir.botanicals[0]} · {elixir.botanicals[1]}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          <div className="lg:col-span-7 hidden lg:block" />
        </div>
      </section>

      {/* NEW PAGE — SCENE 03D: 24-HOUR HYDRATION RHYTHM (16s – 18s · GLASS PANELS SEQUENCE) */}
      <section
        id="scene-ritual"
        className="min-h-[135svh] flex items-center px-5 sm:px-8 lg:px-14 py-24 max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-center">
          <div className="lg:col-span-6 hidden lg:block" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 pointer-events-auto"
          >
            <span
              aria-hidden="true"
              className="block font-display text-[6rem] sm:text-[8.5rem] leading-none text-stroke-bone select-none -mb-6 sm:-mb-9"
            >
              04
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-medium leading-[0.98] tracking-tight text-[#F3F1EC] text-balance drop-shadow-[0_4px_28px_rgba(7,6,11,0.95)]">
              Timed to a twenty-four hour rhythm.
            </h2>

            <div className="mt-7 divide-y divide-[#F3F1EC]/18 border-y border-[#F3F1EC]/18">
              {RITUAL_SCHEDULE.map((slot) => {
                const drink = ELIXIRS.find((e) => e.id === slot.elixirId) ?? ELIXIRS[0];
                return (
                  <a
                    key={slot.time}
                    href={`#/product/${drink.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenProduct(drink);
                    }}
                    className="group py-3.5 flex items-center justify-between gap-4 hover:pl-2 transition-all cursor-pointer"
                  >
                    <div className="flex items-baseline gap-4 min-w-0">
                      <span className="font-mono text-xs tabular-nums text-[#D9A441] shrink-0">
                        {slot.time}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-[#F3F1EC] group-hover:text-[#D9A441] transition-colors">
                          {slot.phase} — {drink.name}
                        </span>
                        <span className="block text-xs text-[#9A96A6] truncate">
                          {slot.note}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 text-[#9A96A6] group-hover:text-[#D9A441] shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCENE 04 — LIVE GLASS-FRAMED LINEUP: CHOOSE YOUR BOTTLE (18s – 20s) */}
      <section
        id="scene-lineup"
        aria-label="Six vessels in orbit sequence"
        className="min-h-[165svh] flex flex-col justify-between px-5 sm:px-8 lg:px-14 pt-24 pb-28 max-w-[1440px] mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#D9A441]">
            05 · Choose Your Vessel
          </p>
          <h2 className="font-display text-4xl sm:text-6xl font-medium tracking-tight text-[#F3F1EC] mt-2 text-balance drop-shadow-[0_4px_28px_rgba(7,6,11,0.95)]">
            Every vessel in the frame is live.
          </h2>
          <p className="text-sm text-[#F3F1EC]/80 mt-3 max-w-md drop-shadow-[0_2px_16px_rgba(7,6,11,0.95)]">
            Pick any bottle from the selector bar below to preview it or jump directly to its dedicated product landing page.
          </p>
        </motion.div>

        <div className="flex-1" />

        <div className="flex flex-wrap items-center justify-between gap-4 pb-12">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#F3F1EC]/75">
            Active Selection: {selectedElixir.index} · {selectedElixir.name}
          </span>
          <button
            type="button"
            onClick={() => onScrollToSection('scene-collection')}
            className="pointer-events-auto text-xs font-mono uppercase tracking-[0.14em] text-[#D9A441] hover:text-[#F3F1EC] transition-colors cursor-pointer"
          >
            Editorial Lookbook Below ↓
          </button>
        </div>
      </section>

      {/* SCENE 05 — ASYMMETRIC EDITORIAL LOOKBOOK & CATALOG */}
      <section
        id="scene-collection"
        className="relative z-[25] pointer-events-auto bg-[#07060B] border-t border-[#F3F1EC]/12 px-5 sm:px-8 lg:px-14 py-24 sm:py-36"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 border-b border-[#F3F1EC]/10 items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#D9A441]">
                06. The Six Elixirs
              </p>
              <h2 className="font-display text-5xl sm:text-7xl font-medium tracking-[-0.02em] leading-[0.94] text-[#F3F1EC] mt-3 text-balance">
                Select a bottle to enter its <span className="italic font-normal">ritual</span> page.
              </h2>
            </div>
            <p className="lg:col-span-4 text-sm text-[#9A96A6] leading-relaxed">
              Cold-filled in infinitely recyclable embossed aluminum. Open any formula to inspect its botanical origin, electrolyte matrix, and case pricing.
            </p>
          </div>

          {/* Interactive Selected Spotlight + Direct Landing Page Link */}
          <div className="mt-16 pb-20 border-b border-[#F3F1EC]/10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <a
                href={`#/product/${selectedElixir.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenProduct(selectedElixir);
                }}
                className="group block relative aspect-[4/5] overflow-hidden bg-[#110F18] border border-[#F3F1EC]/12"
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-70"
                  style={{
                    background: `radial-gradient(circle at 50% 45%, ${selectedElixir.surfaceTint} 0%, transparent 70%)`,
                  }}
                />
                <img
                  src={selectedElixir.image}
                  alt={selectedElixir.name}
                  className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </a>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.14em] text-[#9A96A6]">
                  <span style={{ color: selectedElixir.accentHex }}>
                    {selectedElixir.index}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedElixir.ritualMoment}</span>
                </div>
                <h3 className="font-display text-4xl sm:text-6xl font-medium text-[#F3F1EC] mt-2">
                  {selectedElixir.name}
                </h3>
                <p className="text-base text-[#F3F1EC]/75 leading-relaxed mt-4 max-w-xl">
                  {selectedElixir.ritualDetail}
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9A96A6] mb-3">
                  Switch Selected Vessel
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {ELIXIRS.map((elixir) => {
                    const active = elixir.id === selectedElixir.id;
                    return (
                      <button
                        key={elixir.id}
                        type="button"
                        onClick={() => onSelectElixir(elixir)}
                        className={`group text-left border transition-all cursor-pointer p-1.5 ${
                          active
                            ? 'border-[#D9A441] bg-[#110F18]'
                            : 'border-[#F3F1EC]/10 hover:border-[#F3F1EC]/35'
                        }`}
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-[#0A0810]">
                          <img
                            src={elixir.image}
                            alt={elixir.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <span className="block text-[11px] font-medium text-[#F3F1EC] mt-1.5 truncate">
                          {elixir.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={`#/product/${selectedElixir.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenProduct(selectedElixir);
                  }}
                  className="h-12 px-7 bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] text-xs font-semibold uppercase tracking-[0.08em] inline-flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span>Open {selectedElixir.name} Landing Page</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => onQuickAdd(selectedElixir, '12-Pack', 1)}
                  className="h-12 px-5 border border-[#F3F1EC]/25 hover:border-[#F3F1EC] text-[#F3F1EC] text-xs font-medium uppercase tracking-[0.08em] inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="tabular-nums">
                    Add 12-Pack · ${selectedElixir.packs[1].price}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Staggered Two-Column Editorial Gallery of All 6 Vessels */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {ELIXIRS.map((elixir, idx) => (
              <article
                key={elixir.id}
                className={`group flex flex-col ${idx % 2 === 1 ? 'md:mt-16' : ''}`}
              >
                <a
                  href={`#/product/${elixir.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenProduct(elixir);
                  }}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-[#110F18] border border-[#F3F1EC]/10 group-hover:border-[#F3F1EC]/30 transition-colors block"
                >
                  <img
                    src={elixir.image}
                    alt={`${elixir.name} — ${elixir.crest}`}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07060B]/80 via-transparent to-transparent" />
                  <span className="absolute top-5 left-5 font-mono text-xs tracking-[0.14em] text-[#F3F1EC] tabular-nums">
                    {elixir.index}
                  </span>
                  <span className="absolute bottom-5 right-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#F3F1EC] opacity-80 group-hover:opacity-100 group-hover:text-[#D9A441] transition-colors">
                    <span>Enter Page</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </a>

                <div className="pt-5 flex items-baseline justify-between gap-4 border-b border-[#F3F1EC]/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#9A96A6]">
                      <span>{elixir.benefit}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{elixir.metrics.osmolarity}</span>
                    </div>
                    <h3 className="font-display text-3xl font-medium text-[#F3F1EC] mt-1">
                      {elixir.name}
                    </h3>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-[#F3F1EC] shrink-0">
                    From ${elixir.packs[0].price}
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#9A96A6] truncate">{elixir.flavorNotes}</span>
                  <button
                    type="button"
                    onClick={() => onQuickAdd(elixir, '12-Pack', 1)}
                    className="text-xs font-mono uppercase tracking-[0.1em] text-[#D9A441] hover:text-[#F3F1EC] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    + Quick Add (${elixir.packs[1].price})
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Direct Dispatch & Stockist Inquiry */}
          <div className="mt-28 pt-16 border-t border-[#F3F1EC]/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-6 space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#D9A441]">
                07. Direct Dispatch &amp; Stockist Concierge
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#F3F1EC] text-balance">
                Bring Aetheria to your training floor or pantry.
              </h2>
              <p className="text-sm sm:text-base text-[#9A96A6] max-w-lg leading-relaxed">
                We supply athletic clubs, architectural hospitality spaces, and boutique grocers via chilled direct dispatch. Request a tasting flight or wholesale allocation sheet below.
              </p>
            </div>

            <div className="lg:col-span-6 bg-[#110F18] border border-[#F3F1EC]/12 p-6 sm:p-8">
              {conciergeSent ? (
                <div className="py-4 space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-[#2EE59D]" aria-hidden="true" />
                  <h3 className="font-display text-2xl text-[#F3F1EC]">
                    Inquiry preview recorded.
                  </h3>
                  <p className="text-sm text-[#9A96A6]">
                    This is a demonstration storefront—connect your preferred CRM or form endpoint to route live wholesale requests.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConciergeSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="concierge-channel"
                      className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#9A96A6] mb-1.5"
                    >
                      Allocation Type
                    </label>
                    <select
                      id="concierge-channel"
                      value={conciergeInterest}
                      onChange={(e) => setConciergeInterest(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#07060B] border border-[#F3F1EC]/20 text-sm text-[#F3F1EC] focus:outline-none focus:border-[#D9A441]"
                    >
                      <option>Private Pantry / Studio</option>
                      <option>Athletic Club &amp; Recovery</option>
                      <option>Hospitality &amp; Fine Dining</option>
                      <option>Retail Stockist</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="concierge-email"
                      className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#9A96A6] mb-1.5"
                    >
                      Work Email
                    </label>
                    <input
                      id="concierge-email"
                      type="email"
                      value={conciergeEmail}
                      onChange={(e) => setConciergeEmail(e.target.value)}
                      placeholder="buyer@club.example"
                      className="w-full h-11 px-3.5 bg-[#07060B] border border-[#F3F1EC]/20 text-sm text-[#F3F1EC] focus:outline-none focus:border-[#D9A441]"
                    />
                    {conciergeError && (
                      <p className="text-xs text-[#FF5678] mt-1">{conciergeError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] text-xs font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer"
                  >
                    Request Tasting Flight
                  </button>
                </form>
              )}
            </div>
          </div>

          <footer className="mt-20 pt-8 border-t border-[#F3F1EC]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#9A96A6] pb-20 sm:pb-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-base tracking-[0.12em] text-[#F3F1EC]">
                {BRAND_CONFIG.name}
              </span>
              <span aria-hidden="true">·</span>
              <span>{BRAND_CONFIG.locationNote}</span>
            </div>
            <span className="font-mono text-[11px]">{BRAND_CONFIG.conciergeEmail}</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
