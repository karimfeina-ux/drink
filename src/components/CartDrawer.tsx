import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, type FormEvent } from 'react';
import { BRAND_CONFIG, type ElixirProduct } from '../data/elixirs';
import type { PackSize } from './ProductLandingPage';

export interface CartItem {
  elixir: ElixirProduct;
  packSize: PackSize;
  unitPrice: number;
  quantity: number;
}

interface CartDrawerProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (elixirId: string, packSize: PackSize, delta: number) => void;
  onRemoveItem: (elixirId: string, packSize: PackSize) => void;
  onClearCart: () => void;
}

export function CartDrawer({
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; address?: string }>({});
  const [orderRef] = useState(() => `AE-${Math.floor(1000 + Math.random() * 9000)}`);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const freeShippingRemaining = Math.max(0, BRAND_CONFIG.freeShippingThreshold - subtotal);
  const shippingCost = subtotal === 0 || freeShippingRemaining === 0 ? 0 : 9;
  const total = subtotal + shippingCost;

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; email?: string; address?: string } = {};

    if (fullName.trim().length < 2) {
      nextErrors.name = 'Enter your full name.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (address.trim().length < 6) {
      nextErrors.address = 'Enter a complete delivery street address.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onClearCart();
    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#07060B]/75 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-[#0D0B13] border-l border-[#F3F1EC]/15 h-full flex flex-col"
      >
        <div className="px-6 py-5 border-b border-[#F3F1EC]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#D9A441]" aria-hidden="true" />
            <h2 className="font-display text-2xl font-medium text-[#F3F1EC]">
              {step === 'bag'
                ? 'Your Bag'
                : step === 'checkout'
                  ? 'Order Preview'
                  : 'Preview Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="w-10 h-10 flex items-center justify-center border border-[#F3F1EC]/15 text-[#9A96A6] hover:text-[#F3F1EC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'confirmed' ? (
            <div className="py-10 space-y-5">
              <CheckCircle2 className="w-10 h-10 text-[#2EE59D]" aria-hidden="true" />
              <div className="space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#D9A441]">
                  Order {orderRef} · Prototype Preview
                </p>
                <h3 className="font-display text-3xl text-[#F3F1EC]">
                  Dispatch preview recorded for {fullName}.
                </h3>
                <p className="text-sm text-[#9A96A6] leading-relaxed">
                  This storefront is a demonstration build. No real payment was charged and no physical shipment was scheduled.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-11 bg-[#F3F1EC] text-[#07060B] text-xs font-semibold uppercase tracking-[0.08em] cursor-pointer"
              >
                Return to Showcase
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-display text-2xl text-[#F3F1EC]">Your bag is empty.</p>
              <p className="text-sm text-[#9A96A6]">
                Tap any can directly in the film or select an elixir below to inspect its mineral profile.
              </p>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-5">
              {/* Shipping threshold */}
              <div className="p-3.5 bg-[#110F18] border border-[#F3F1EC]/10">
                <p className="text-xs text-[#F3F1EC] tabular-nums">
                  {freeShippingRemaining === 0
                    ? 'Complimentary chilled delivery unlocked.'
                    : `Add $${freeShippingRemaining.toFixed(0)} more for complimentary chilled delivery.`}
                </p>
                <div className="mt-2 h-1 bg-[#F3F1EC]/10 overflow-hidden">
                  <div
                    className="h-full bg-[#D9A441] transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (subtotal / BRAND_CONFIG.freeShippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-[#F3F1EC]/10">
                {items.map((item) => (
                  <li key={`${item.elixir.id}-${item.packSize}`} className="py-4 flex gap-4">
                    <img
                      src={item.elixir.image}
                      alt={item.elixir.name}
                      className="w-16 h-20 object-cover border border-[#F3F1EC]/15 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-[#F3F1EC]">
                            {item.elixir.name}
                          </h3>
                          <p className="font-mono text-[11px] text-[#9A96A6] mt-0.5">
                            {item.packSize} · ${item.unitPrice}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.elixir.id, item.packSize)}
                          aria-label={`Remove ${item.elixir.name} ${item.packSize}`}
                          className="text-[#9A96A6] hover:text-[#FF5678] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#F3F1EC]/15 bg-[#110F18]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => onUpdateQuantity(item.elixir.id, item.packSize, -1)}
                            className="w-8 h-8 flex items-center justify-center text-[#9A96A6] hover:text-[#F3F1EC] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs tabular-nums text-[#F3F1EC]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => onUpdateQuantity(item.elixir.id, item.packSize, 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#9A96A6] hover:text-[#F3F1EC] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-mono text-sm tabular-nums text-[#F3F1EC]">
                          ${(item.unitPrice * item.quantity).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <form id="checkout-preview-form" onSubmit={handleCheckoutSubmit} className="space-y-4" noValidate>
              <p className="text-xs text-[#9A96A6] leading-relaxed">
                Preview checkout with client-side validation. No payment gateway is connected in this showcase.
              </p>

              <div>
                <label htmlFor="checkout-name" className="block font-mono text-[11px] uppercase tracking-[0.1em] text-[#9A96A6] mb-1.5">
                  Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#110F18] border border-[#F3F1EC]/20 text-sm text-[#F3F1EC] focus:outline-none focus:border-[#D9A441]"
                  placeholder="Alex Mercer"
                />
                {errors.name && (
                  <p className="text-xs text-[#FF5678] mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-email" className="block font-mono text-[11px] uppercase tracking-[0.1em] text-[#9A96A6] mb-1.5">
                  Email Address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#110F18] border border-[#F3F1EC]/20 text-sm text-[#F3F1EC] focus:outline-none focus:border-[#D9A441]"
                  placeholder="alex@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-[#FF5678] mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-address" className="block font-mono text-[11px] uppercase tracking-[0.1em] text-[#9A96A6] mb-1.5">
                  Delivery Address
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#110F18] border border-[#F3F1EC]/20 text-sm text-[#F3F1EC] focus:outline-none focus:border-[#D9A441]"
                  placeholder="Street, City, Postal Code"
                />
                {errors.address && (
                  <p className="text-xs text-[#FF5678] mt-1">{errors.address}</p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-[#F3F1EC]/10 bg-[#0A0810] space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#9A96A6]">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-[#F3F1EC]">${subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-[#9A96A6]">
                <span>Chilled Delivery</span>
                <span className="font-mono tabular-nums text-[#F3F1EC]">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#F3F1EC] pt-2 border-t border-[#F3F1EC]/10">
                <span>Total</span>
                <span className="font-mono tabular-nums">${total.toFixed(0)}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full h-12 bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] font-semibold text-xs uppercase tracking-[0.08em] transition-colors cursor-pointer"
              >
                Continue to Order Preview
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-4 h-12 border border-[#F3F1EC]/20 text-xs font-medium text-[#F3F1EC] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-preview-form"
                  className="flex-1 h-12 bg-[#D9A441] hover:bg-[#E7B657] text-[#07060B] font-semibold text-xs uppercase tracking-[0.08em] transition-colors cursor-pointer"
                >
                  Confirm Preview Order
                </button>
              </div>
            )}
          </div>
        )}
      </motion.aside>
    </div>
  );
}
