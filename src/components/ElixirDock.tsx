import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ELIXIRS, type ElixirProduct } from '../data/elixirs';

interface ElixirDockProps {
  visible: boolean;
  selectedElixir: ElixirProduct;
  onSelectElixir: (elixir: ElixirProduct) => void;
  onOpenProduct: (elixir: ElixirProduct) => void;
}

/**
 * Vessel selector bar that arrives when the scroll reaches the orbital lineup stage
 * ("Every vessel in the frame is live") and persists through the rest of the journey.
 */
export function ElixirDock({
  visible,
  selectedElixir,
  onSelectElixir,
  onOpenProduct,
}: ElixirDockProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 sm:bottom-6 inset-x-0 z-30 flex justify-center px-3 sm:px-6 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 bg-[#0A0810]/96 border border-[#F3F1EC]/18 max-w-full overflow-x-auto no-scrollbar shadow-2xl">
            <div
              className="flex items-center gap-1 shrink-0"
              role="tablist"
              aria-label="Choose bottle"
            >
              {ELIXIRS.map((elixir) => {
                const active = elixir.id === selectedElixir.id;
                return (
                  <button
                    key={elixir.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onSelectElixir(elixir)}
                    className={`group relative flex items-center gap-2 pr-2.5 pl-1.5 py-1 min-h-[40px] text-left transition-all whitespace-nowrap shrink-0 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441] ${
                      active
                        ? 'bg-[#F3F1EC]/12 border-[#D9A441]/70 text-[#F3F1EC]'
                        : 'border-transparent text-[#9A96A6] hover:text-[#F3F1EC] hover:bg-[#F3F1EC]/5'
                    }`}
                  >
                    <img
                      src={elixir.image}
                      alt=""
                      aria-hidden="true"
                      className="w-6 h-8 object-cover shrink-0 border border-[#F3F1EC]/15"
                    />
                    <div className="leading-tight">
                      <span
                        className="block font-mono text-[9px] tracking-[0.1em] tabular-nums"
                        style={{ color: active ? elixir.accentHex : '#9A96A6' }}
                      >
                        {elixir.index}
                      </span>
                      <span className="block text-[11px] sm:text-xs font-medium tracking-[0.01em]">
                        {elixir.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <span className="h-6 w-px bg-[#F3F1EC]/15 shrink-0" aria-hidden="true" />

            <a
              href={`#/product/${selectedElixir.id}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenProduct(selectedElixir);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3F1EC]"
            >
              <span>Shop {selectedElixir.name}</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
