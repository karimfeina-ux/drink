import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { BRAND_CONFIG } from '../data/elixirs';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onScrollToSection: (sectionId: string) => void;
  hasProductOpen: boolean;
  onCloseProduct: () => void;
}

const NAV_LINKS = [
  { id: 'scene-arrival', label: 'Origin' },
  { id: 'scene-botanicals', label: 'Botanicals' },
  { id: 'scene-lineup', label: 'Vessels' },
  { id: 'scene-collection', label: 'Collection' },
];

export function Navbar({
  cartCount,
  onOpenCart,
  onScrollToSection,
  hasProductOpen,
  onCloseProduct,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    if (hasProductOpen) {
      onCloseProduct();
      setTimeout(() => onScrollToSection(id), 80);
    } else {
      onScrollToSection(id);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 transition-colors duration-300 bg-gradient-to-b from-[#07060B]/92 via-[#07060B]/55 to-transparent">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <a
          href="#scene-arrival"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('scene-arrival');
          }}
          className="font-display text-2xl sm:text-[1.65rem] font-semibold tracking-[0.14em] text-[#F3F1EC] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441]"
        >
          {BRAND_CONFIG.name}
        </a>

        {/* Zone 2: Clean single-line nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-[0.06em] text-[#F3F1EC]/75"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              className="relative py-1 hover:text-[#F3F1EC] transition-colors whitespace-nowrap shrink-0 after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-[#D9A441] hover:after:w-full after:transition-all after:duration-200 focus-visible:outline-none focus-visible:text-[#F3F1EC]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag, ${cartCount} items`}
            className="inline-flex items-center gap-2.5 px-4 py-2 min-h-[40px] border border-[#F3F1EC]/20 bg-[#110F18]/70 hover:border-[#D9A441]/70 hover:bg-[#110F18] text-[#F3F1EC] text-xs font-medium tracking-[0.08em] uppercase transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D9A441]" aria-hidden="true" />
            <span>Bag</span>
            <span className="font-mono tabular-nums text-[#D9A441]">({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 border border-[#F3F1EC]/15 bg-[#110F18]/80 text-[#F3F1EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A441]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden bg-[#07060B]/95 backdrop-blur-xl border-b border-[#F3F1EC]/10 px-6 py-5 flex flex-col gap-3"
        >
          {NAV_LINKS.map((link, idx) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              className="flex items-center justify-between py-2.5 text-left text-base font-medium text-[#F3F1EC] border-b border-[#F3F1EC]/8 last:border-none"
            >
              <span>{link.label}</span>
              <span className="font-mono text-xs text-[#9A96A6] tabular-nums">
                0{idx + 1}
              </span>
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
