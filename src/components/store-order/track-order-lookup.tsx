'use client';

import { useState } from 'react';

/** Status steps a parcel moves through, in order. */
const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'transit', label: 'In Transit' },
  { key: 'out', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
] as const;

interface TrackedOrder {
  orderId: string;
  status: string;
  createdAt: string;
  itemCount: number;
  name: string;
  city: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  courierStatus: string;
  shippedDate: string | null;
  deliveredDate: string | null;
  estimatedDelivery: string | null;
  scans: { date: string; activity: string; location: string }[];
}

/**
 * How far along the parcel is.
 *
 * Read from the courier's own words where there are any — they are more
 * current than the order status, which only moves when our own code runs —
 * and from the order status otherwise.
 */
function currentStep(order: TrackedOrder): number {
  const courier = (order.courierStatus ?? '').toLowerCase();
  const own = (order.status ?? '').toLowerCase();

  // "Out for delivery" is tested FIRST: it contains the word "deliver", so a
  // looser delivered-check above it reports a parcel as delivered while it is
  // still on the van.
  if (/out for delivery/.test(courier)) return 3;
  if (order.deliveredDate || own === 'delivered' || /deliver/.test(courier)) return 4;
  if (/transit|in.?scan|bag/.test(courier)) return 2;

  /**
   * Dispatched means the courier physically has it.
   *
   * Driven by the courier's own words, not ours. `pending_pickup` is a label
   * bought and a parcel still on our shelf — and because that string contains
   * "pick" it used to match here, so an order waiting days for collection
   * told the customer it had been dispatched. `shippedDate` is no good as a
   * signal either: it is stamped at booking.
   */
  if (/picked|pickup completed|dispatch|manifest|out.?scan/.test(courier)) return 1;
  if (own === 'shipped') return 1;

  return 0;
}

const prettyStatus = (order: TrackedOrder) => {
  const step = currentStep(order);
  if (/cancel/i.test(order.status)) return 'Cancelled';
  if (/refund/i.test(order.status)) return 'Refunded';
  if (/return/i.test(order.status)) return 'Return in progress';
  return STEPS[step].label;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function TrackOrderLookup() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order/track`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderId.trim(), phone: phone.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'We could not find that order.');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const step = order ? currentStep(order) : 0;

  return (
    <div className="wf-wrap" style={{ maxWidth: 640, padding: '48px 16px 80px' }}>
      <h1 className="mb-1 text-2xl font-semibold" style={{ color: 'var(--wf-ink)' }}>
        Track your order
      </h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--wf-ink-soft)' }}>
        Enter your order number and the mobile number you used at checkout.
      </p>

      <form onSubmit={submit} className="mb-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          placeholder="Order number (UWH-1038)"
          aria-label="Order number"
          required
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Mobile number"
          aria-label="Mobile number"
          inputMode="numeric"
          autoComplete="tel"
          required
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-60"
          style={{ background: 'var(--wf-brand)' }}
        >
          {loading ? 'Checking…' : 'Track'}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {order && (
        <div className="space-y-4">
          <section className="rounded-xl border border-border p-5 text-center">
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--wf-ink-soft)' }}>
              Your package is
            </p>
            <p className="my-1 text-2xl font-semibold" style={{ color: 'var(--wf-brand)' }}>
              {prettyStatus(order)}
            </p>
            {order.estimatedDelivery && (
              <p className="text-sm" style={{ color: 'var(--wf-ink-soft)' }}>
                Estimated delivery: {formatDate(order.estimatedDelivery)}
              </p>
            )}
          </section>

          {/* Progress rail */}
          <section className="rounded-xl border border-border p-5">
            <ol className="relative flex justify-between">
              <span
                aria-hidden
                className="absolute left-0 right-0 top-[7px] h-px"
                style={{ background: 'var(--wf-line)' }}
              />
              <span
                aria-hidden
                className="absolute left-0 top-[7px] h-px transition-all"
                style={{
                  background: 'var(--wf-brand)',
                  width: `${(step / (STEPS.length - 1)) * 100}%`,
                }}
              />
              {STEPS.map((s, i) => (
                <li key={s.key} className="relative z-10 flex w-1/5 flex-col items-center gap-2">
                  <span
                    className="size-[15px] rounded-full border-2"
                    style={{
                      borderColor: i <= step ? 'var(--wf-brand)' : 'var(--wf-line)',
                      background: i <= step ? 'var(--wf-brand)' : 'var(--wf-cream)',
                    }}
                    aria-hidden
                  />
                  <span
                    className="text-center text-[11px] leading-tight"
                    style={{ color: i <= step ? 'var(--wf-ink)' : 'var(--wf-ink-soft)' }}
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--wf-ink)' }}>
              Detailed journey
            </h2>
            {order.scans.length > 0 ? (
              <ol className="space-y-3">
                {order.scans.map((scan, i) => (
                  <li key={i} className="border-l-2 pl-3" style={{ borderColor: 'var(--wf-line)' }}>
                    <p className="text-sm" style={{ color: 'var(--wf-ink)' }}>{scan.activity}</p>
                    <p className="text-xs" style={{ color: 'var(--wf-ink-soft)' }}>
                      {[scan.location, scan.date].filter(Boolean).join(' · ')}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm" style={{ color: 'var(--wf-ink-soft)' }}>
                Your tracking updates will appear here as soon as we get the next scan.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border p-5">
            <h2 className="mb-3 text-lg font-semibold" style={{ color: 'var(--wf-ink)' }}>
              Shipment details
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Order', order.orderId],
                ['Courier', order.courier || 'Not booked yet'],
                ['Tracking ID', order.trackingNumber || '—'],
                ['Items', String(order.itemCount)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg p-3" style={{ background: 'var(--wf-cream-2)' }}>
                  <dt className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--wf-ink-soft)' }}>
                    {label}
                  </dt>
                  <dd className="font-medium" style={{ color: 'var(--wf-ink)' }}>
                    {label === 'Tracking ID' && order.trackingUrl && order.trackingNumber ? (
                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Nothing about what is inside the parcel appears on this page: the
              URL is shareable and the contents are the customer's business. */}
          <section
            className="rounded-xl p-5 text-sm"
            style={{ background: 'var(--wf-brand)', color: 'var(--wf-cream)' }}
          >
            <h2 className="mb-1 text-lg font-semibold">Your order, kept private</h2>
            <p style={{ opacity: 0.9 }}>
              Contents are hidden on this tracking page. Your parcel ships in plain,
              unmarked packaging.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
