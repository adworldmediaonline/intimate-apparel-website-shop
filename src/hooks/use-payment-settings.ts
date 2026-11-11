'use client';

import { useEffect, useState } from 'react';
import { PARTIAL_PAYMENT_PERCENT } from '@/lib/brand';

export interface PaymentSettings {
  razorpayEnabled: boolean;
  codEnabled: boolean;
  partialEnabled: boolean;
  partialPercent: number;
}

/**
 * Which methods checkout should offer, as saved by the admin.
 *
 * The brand config seeds the first render so the options do not flash in, and
 * it is also what we fall back to if the request fails — the server re-checks
 * every method before taking money, so a stale answer here can only mis-draw
 * the form, never let a disabled method through.
 */
const FALLBACK: PaymentSettings = {
  razorpayEnabled: true,
  // shop.unwrapher.com offers all three. This differs from the main site's
  // copy of this file, where COD is off — it seeds the first render so the
  // option does not appear a moment late. The server still decides.
  codEnabled: true,
  partialEnabled: PARTIAL_PAYMENT_PERCENT > 0,
  partialPercent: PARTIAL_PAYMENT_PERCENT,
};

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function usePaymentSettings(): PaymentSettings {
  const [settings, setSettings] = useState<PaymentSettings>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiUrl}/api/store/settings/payment`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || !data) return;
        setSettings({
          razorpayEnabled: data.razorpayEnabled ?? FALLBACK.razorpayEnabled,
          codEnabled: data.codEnabled ?? FALLBACK.codEnabled,
          partialEnabled: data.partialEnabled ?? FALLBACK.partialEnabled,
          partialPercent: Number(data.partialPercent) || FALLBACK.partialPercent,
        });
      })
      .catch(() => {
        /* keep the fallback; the server still has the final say */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
