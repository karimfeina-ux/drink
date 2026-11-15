import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { BRAND_CONFIG, ELIXIRS, type ElixirProduct } from '../data/elixirs';

export type PackSize = '6-Pack' | '12-Pack' | '24-Pack';

interface ProductLandingPageProps {
  product: ElixirProduct;
  onBackToFilm: () => void;
  onNavigateProduct: (elixir: ElixirProduct) => void;
  onAddToCart: (elixir: ElixirProduct, packSize: PackSize, quantity: number, openBag?: boolean) => void;
}

export function ProductLandingPage({
  product,
  onBackToFilm,
  onNavigateProduct,
  onAddToCart,
}: ProductLandingPageProps) {
  const [selectedPackIndex, setSelectedPackIndex] = useState(1); // Default 12-Pack
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const currentIdx = ELIXIRS.findIndex((e) => e.id === product.id);
  const prevProduct = ELIXIRS[(currentIdx - 1 + ELIXIRS.length) % ELIXIRS.length];
  const nextProduct = ELIXIRS[(currentIdx + 1) % ELIXIRS.length];
  const activePack = product.packs[selectedPackIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setQuantity(1);
    setJustAdded(false);
  }, [product.id]);

  const handleAdd = (openBag = false) => {
    onAddToCart(product, activePack.size, quantity, openBag);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen bg-[#07060B] text-[#F3F1EC] pt-20 pb-28 md:pb-20"
    >
      {/* Subtle elixir ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-45"
        style={{
          background: `radial-gradient(ellipse at 25% 22%, ${product.surfaceTint} 0%, rgba(7,6,11,0) 60%)`,
        }}
      />

      {/* Breadcrumb & Prev/Next Bar */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 pt-2 pb-6 border-b border-[#F3F1EC]/10 flex flex-wrap items-center justify-between gap-4">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onBackToFilm();
          }}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#9A96A6] hover:text-[#F3F1EC] py-2 min-h-[40px] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Cinema Film</span>
        </a>

        <div className="flex items-center gap-4 text-xs font-mono text-[#9A96A6]">
          <a
            href={`#/product/${prevProduct.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateProduct(prevProduct);
            }}
            className="inline-flex items-center gap-1.5 hover:text-[#F3F1EC] transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{prevProduct.index}</span>
          </a>
          <span className="text-[#F3F1EC]/20" aria-hidden="true">
            /
          </span>
          <span className="text-[#F3F1EC] tabular-nums">
            {product.index} of 06
          </span>
          <span className="text-[#F3F1EC]/20" aria-hidden="true">
            /
          </span>
          <a
            href={`#/product/${nextProduct.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateProduct(nextProduct);
            }}
            className="inline-flex items-center gap-1.5 hover:text-[#F3F1EC] transition-colors py-1"
          >
            <span>{nextProduct.index}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* SECTION 1: PRODUCT HERO & PURCHASE MODULE */}
      <section className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Sticky Can Portrait */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#110F18] border border-[#F3F1EC]/12">
            <div
              className="absolute inset-0 pointer-events-none opacity-75"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${product.surfaceTint} 0%, rgba(17,15,24,0.25) 55%, #07060B 100%)`,
              }}
            />

            <img
              src={product.image}
              alt={`${product.name} — ${product.crest}`}
              className="relative z-10 w-full h-full object-cover object-center"
            />

            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#07060B] via-[#07060B]/80 to-transparent z-20 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9A96A6]">
                  Vessel Crest · {product.crest}
                </p>
                <p className="text-sm text-[#F3F1EC] mt-1">{product.flavorNotes}</p>
              </div>
              <span className="font-mono text-xs tabular-nums text-[#F3F1EC]/85 shrink-0">
                {product.metrics.volumeMl} ml
              </span>
            </div>
          </div>
        </div>

        {/* Right: Purchase & Ritual Specification */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono tracking-[0.1em] text-[#9A96A6] uppercase">
              <span style={{ color: product.accentHex }}>{product.index}</span>
              <span aria-hidden="true">·</span>
              <span>{product.benefit}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{product.metrics.osmolarity}</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#F3F1EC] mt-3 text-balance leading-[0.95]">
              {product.name}
            </h1>

            <p className="text-base sm:text-lg text-[#F3F1EC]/80 leading-relaxed mt-5 max-w-xl optical-light">
              {product.description}
            </p>
          </div>

          {/* Case Size Selector */}
          <div className="border-t border-[#F3F1EC]/10 pt-7">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9A96A6]">
                Choose Case Size
              </h2>
              <span className="font-mono text-xs text-[#9A96A6] tabular-nums">
                ${(activePack.price / activePack.cans).toFixed(2)} / can
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {product.packs.map((pack, idx) => {
                const selected = idx === selectedPackIndex;
                return (
                  <button
                    key={pack.size}
                    type="button"
                    onClick={() => setSelectedPackIndex(idx)}
                    className={`p-4 text-left border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441] ${
                      selected
                        ? 'bg-[#110F18] border-[#D9A441] text-[#F3F1EC]'
                        : 'bg-transparent border-[#F3F1EC]/15 text-[#9A96A6] hover:border-[#F3F1EC]/35 hover:text-[#F3F1EC]'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{pack.size}</span>
                    <span className="block font-mono text-sm mt-1 tabular-nums text-[#F3F1EC]">
                      ${pack.price}
                    </span>
                    <span className="block font-mono text-[10px] mt-0.5 text-[#9A96A6] tabular-nums">
                      {pack.cans} × {product.metrics.volumeMl} ml
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Quantity + Add to Bag + Instant Checkout */}
          <div className="hidden md:flex items-center gap-3 pt-1">
            <div className="inline-flex items-center border border-[#F3F1EC]/20 bg-[#110F18]">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-12 flex items-center justify-center text-[#9A96A6] hover:text-[#F3F1EC] cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono text-sm tabular-nums text-[#F3F1EC]">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-12 flex items-center justify-center text-[#9A96A6] hover:text-[#F3F1EC] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAdd(false)}
              className="flex-1 h-12 px-6 bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] font-semibold text-xs tracking-[0.08em] uppercase inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span className="tabular-nums">
                    Add to Bag — ${(activePack.price * quantity).toFixed(0)}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleAdd(true)}
              className="h-12 px-5 border border-[#F3F1EC]/25 hover:border-[#F3F1EC] text-[#F3F1EC] text-xs font-medium uppercase tracking-[0.08em] transition-colors whitespace-nowrap cursor-pointer"
            >
              Buy Now
            </button>
          </div>

          {/* Ritual Timing & Botanical Breakdown */}
          <div className="border-t border-[#F3F1EC]/10 pt-7 space-y-5">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#D9A441]">
                Ritual Window · {product.ritualMoment}
              </p>
              <p className="text-sm text-[#9A96A6] leading-relaxed mt-2">
                {product.ritualDetail}
              </p>
            </div>

            <div>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9A96A6] mb-3">
                Botanical Extracts
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#F3F1EC]">
                {product.botanicals.map((botanical, i) => (
                  <span key={botanical} className="inline-flex items-center gap-3">
                    <span>{botanical}</span>
                    {i < product.botanicals.length - 1 && (
                      <span className="text-[#9A96A6]" aria-hidden="true">
                        /
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Electrolyte Matrix */}
          <div className="border-t border-[#F3F1EC]/10 pt-7">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9A96A6] mb-4">
              Ionic Specification per {product.metrics.volumeMl} ml Can
            </h2>

            <div className="divide-y divide-[#F3F1EC]/10 border-y border-[#F3F1EC]/10">
              {[
                { label: 'Sodium (Ionic Sea Salt)', value: `${product.metrics.sodiumMg} mg` },
                { label: 'Potassium (Citrate)', value: `${product.metrics.potassiumMg} mg` },
                { label: 'Magnesium (Glycinate)', value: `${product.metrics.magnesiumMg} mg` },
                { label: 'Chelated Zinc', value: `${product.metrics.zincMg} mg` },
                { label: 'Added Sugar', value: `${product.metrics.sugarG} g` },
                { label: 'Energy', value: `${product.metrics.calories} kcal` },
              ].map((row) => (
                <div key={row.label} className="py-3 flex items-center justify-between text-sm">
                  <span className="text-[#9A96A6]">{row.label}</span>
                  <span className="font-mono tabular-nums text-[#F3F1EC]">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#9A96A6] mt-3">
              Prototype formulation specs for preview. Free chilled delivery on orders over $
              {BRAND_CONFIG.freeShippingThreshold}.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: SWITCH TO ANY OTHER ELIXIR LANDING PAGE */}
      <section className="relative z-10 max-w-[1360px] mx-auto px-5 sm:px-8 mt-20 pt-14 border-t border-[#F3F1EC]/10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#D9A441]">
              Explore the Six
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#F3F1EC] mt-1">
              Switch elixir formula
            </h2>
          </div>

          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onBackToFilm();
            }}
            className="text-xs font-mono uppercase tracking-[0.12em] text-[#9A96A6] hover:text-[#F3F1EC] transition-colors"
          >
            ← Return to Scroll Film
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ELIXIRS.map((item) => {
            const isCurrent = item.id === product.id;
            return (
              <a
                key={item.id}
                href={`#/product/${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateProduct(item);
                }}
                className={`group block border transition-all ${
                  isCurrent
                    ? 'border-[#D9A441] bg-[#110F18]'
                    : 'border-[#F3F1EC]/12 bg-[#110F18]/60 hover:border-[#F3F1EC]/40'
                }`}
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#0A0810]">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <span
                    className="block font-mono text-[10px] tabular-nums"
                    style={{ color: item.accentHex }}
                  >
                    {item.index}
                  </span>
                  <span className="block text-xs font-medium text-[#F3F1EC] mt-0.5 truncate">
                    {item.name}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Mobile Sticky Bottom Buy Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07060B]/95 backdrop-blur-xl border-t border-[#F3F1EC]/15 px-4 py-3 flex items-center gap-3">
        <div className="inline-flex items-center border border-[#F3F1EC]/20 bg-[#110F18] h-11">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-full flex items-center justify-center text-[#9A96A6]"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-7 text-center font-mono text-xs tabular-nums text-[#F3F1EC]">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-full flex items-center justify-center text-[#9A96A6]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleAdd(true)}
          className="flex-1 h-11 px-4 bg-[#D9A441] text-[#07060B] font-semibold text-xs tracking-[0.06em] uppercase inline-flex items-center justify-center gap-2"
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added</span>
            </>
          ) : (
            <span className="tabular-nums">
              Add {activePack.size} — ${(activePack.price * quantity).toFixed(0)}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
