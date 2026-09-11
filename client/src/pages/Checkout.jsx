import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Field from '../components/Field';
import OrderTotals from '../components/orders/OrderTotals';
import { calculateTotals } from '../lib/pricing';
import { formatPrice } from '../lib/format';
import { PAYMENT_HINTS, PAYMENT_LABELS } from '../lib/orders';
import { mapEmbedUrl } from '../lib/maps';
import { buttonPrimary, inputClass } from '../lib/styles';

const DETAILS_KEY = 'tastybites-delivery-details';
const emptyAddress = { line1: '', line2: '', landmark: '', city: '', state: '', pincode: '' };

const readSavedDetails = () => {
  try {
    return JSON.parse(localStorage.getItem(DETAILS_KEY));
  } catch {
    return null;
  }
};

const onlyDigits = (value, max) => value.replace(/\D/g, '').slice(0, max);

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="7.5" />
    </svg>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, hasUnavailable, clearCart, refreshFromMenu } = useCart();
  const navigate = useNavigate();

  const [saved] = useState(readSavedDetails);
  const [contact, setContact] = useState({
    customerName: saved?.customerName ?? user.name,
    phone: saved?.phone ?? '',
  });
  const [address, setAddress] = useState(saved?.address ?? emptyAddress);
  const [location, setLocation] = useState(saved?.location ?? null);
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const askedForLocation = useRef(false);
  const orderPlaced = useRef(false);

  useEffect(() => {
    refreshFromMenu().catch(() => {});
  }, [refreshFromMenu]);

  const detectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationNote({ tone: 'error', text: 'Your browser does not support location access. Please type your address below.' });
      return;
    }

    setLocating(true);
    setLocationNote(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const point = { lat: Number(coords.latitude.toFixed(6)), lng: Number(coords.longitude.toFixed(6)) };
        setLocation(point);

        try {
          const { data } = await api.get('/geocode/reverse', { params: point });
          const found = Object.fromEntries(Object.entries(data.address).filter(([, value]) => value));
          setAddress((prev) => ({ ...prev, ...found }));
          setLocationNote({
            tone: 'ok',
            text: 'Address filled in from your location. Please check it and add your flat or house number.',
          });
        } catch {
          setLocationNote({
            tone: 'error',
            text: "We found your location but couldn't look up the address. Please type it below.",
          });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocationNote({
          tone: 'error',
          text:
            err.code === err.PERMISSION_DENIED
              ? 'Location access is blocked. You can allow it from the icon in the address bar, or type your address below.'
              : "We couldn't get your location. Please type your address below.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // First-time customers get the browser's location prompt straight away; returning ones see their saved address
  useEffect(() => {
    if (askedForLocation.current || saved?.address) return;
    askedForLocation.current = true;
    detectLocation();
  }, [detectLocation, saved]);

  if (items.length === 0) return orderPlaced.current ? null : <Navigate to="/cart" replace />;

  const totals = calculateTotals(items);
  const updateAddress = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await api.post('/orders', {
        items: items.map((item) => ({ menuItem: item._id, quantity: item.quantity })),
        customerName: contact.customerName,
        phone: contact.phone,
        address: location ? { ...address, location } : address,
        instructions,
        paymentMethod,
      });

      localStorage.setItem(DETAILS_KEY, JSON.stringify({ ...contact, address, location }));
      orderPlaced.current = true;
      navigate(`/orders/${data.order._id}`, { replace: true, state: { justPlaced: true } });
      clearCart();
    } catch (err) {
      if (err.response?.status === 409) refreshFromMenu().catch(() => {});
      const fieldErrors = err.response?.data?.errors;
      setError(
        fieldErrors
          ? Object.values(fieldErrors)[0]
          : err.response?.data?.message || 'Could not place your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <Link to="/cart" className="text-sm text-ink-faint transition-colors hover:text-ink">
        &larr; Back to cart
      </Link>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-ink">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <section>
            <h2 className="font-display text-2xl text-ink">Contact</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="customerName">
                <input
                  id="customerName"
                  autoComplete="name"
                  value={contact.customerName}
                  onChange={(e) => setContact({ ...contact, customerName: e.target.value })}
                  required
                  maxLength={60}
                  className={inputClass}
                />
              </Field>

              <Field label="Mobile number" htmlFor="phone" hint="For the rider to call you">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    title="Enter a 10-digit mobile number"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: onlyDigits(e.target.value, 10) })}
                    required
                    className={`${inputClass} pl-12`}
                  />
                </div>
              </Field>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl text-ink">Delivery address</h2>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink disabled:opacity-60"
              >
                <LocationIcon />
                {locating ? 'Finding you...' : 'Use my current location'}
              </button>
            </div>

            {locationNote && (
              <p
                role="status"
                className={`mt-4 rounded-md px-3 py-2 text-sm ${
                  locationNote.tone === 'ok' ? 'bg-olive/10 text-olive' : 'bg-danger/10 text-danger'
                }`}
              >
                {locationNote.text}
              </p>
            )}

            {location && (
              <div className="mt-4 overflow-hidden rounded-md border border-line">
                <iframe title="Your delivery location" src={mapEmbedUrl(location)} loading="lazy" className="h-48 w-full" />
                <div className="flex items-center justify-between gap-4 bg-paper-soft px-3 py-2 text-xs text-ink-soft">
                  <span className="tabular-nums">
                    Pinned at {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                  <button type="button" onClick={() => setLocation(null)} className="transition-colors hover:text-danger">
                    Remove pin
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Flat / house no." htmlFor="line1">
                <input id="line1" name="line1" value={address.line1} onChange={updateAddress} required maxLength={120} className={inputClass} />
              </Field>
              <Field label="Street and area" htmlFor="line2">
                <input
                  id="line2"
                  name="line2"
                  autoComplete="address-line2"
                  value={address.line2}
                  onChange={updateAddress}
                  required
                  maxLength={160}
                  className={inputClass}
                />
              </Field>
              <Field label="Landmark" htmlFor="landmark" hint="Optional">
                <input id="landmark" name="landmark" value={address.landmark} onChange={updateAddress} maxLength={120} className={inputClass} />
              </Field>
              <Field label="City" htmlFor="city">
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={updateAddress}
                  required
                  maxLength={60}
                  className={inputClass}
                />
              </Field>
              <Field label="State" htmlFor="state">
                <input
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={updateAddress}
                  required
                  maxLength={60}
                  className={inputClass}
                />
              </Field>
              <Field label="Pincode" htmlFor="pincode">
                <input
                  id="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[0-9]{6}"
                  title="Enter a 6-digit pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: onlyDigits(e.target.value, 6) })}
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Delivery instructions" htmlFor="instructions" hint="Optional">
                <textarea
                  id="instructions"
                  rows={2}
                  maxLength={200}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ring the bell twice, leave it with the guard..."
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Payment</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ink/30 ${
                    paymentMethod === value ? 'border-ink bg-paper-soft' : 'border-line hover:border-ink/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="mt-0.5 accent-brand"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">{label}</span>
                    <span className="text-xs text-ink-faint">{PAYMENT_HINTS[value]}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5 lg:pl-6">
          <div className="rounded-md border border-line bg-paper-soft p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-2xl text-ink">Your order</h2>

            <ul className="mt-5 space-y-3 text-sm">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between gap-4">
                  <span className="text-ink">
                    <span className="tabular-nums text-ink-faint">{item.quantity} &times;</span> {item.name}
                    {item.available === false && <span className="ml-2 text-danger">(unavailable)</span>}
                  </span>
                  <span className="tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <OrderTotals totals={totals} className="mt-5 border-t border-line pt-5" />

            {error && (
              <p role="alert" className="mt-5 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting || hasUnavailable} className={`${buttonPrimary} mt-6 w-full`}>
              {submitting ? 'Placing your order...' : `Place order · ${formatPrice(totals.totalAmount)}`}
            </button>

            {hasUnavailable && (
              <p className="mt-3 text-sm text-danger">
                Some dishes are unavailable.{' '}
                <Link to="/cart" className="underline underline-offset-4">
                  Update your cart
                </Link>
              </p>
            )}

            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              You pay when your food arrives. You can cancel until the kitchen starts cooking.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
