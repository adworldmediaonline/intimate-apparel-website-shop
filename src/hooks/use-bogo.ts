'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export type BogoState = {
  /** Null when no offer is running. Everything else is then inert. */
  offer: {
    _id: string;
    name: string;
    headline?: string;
    buyQuantity: number;
    freeQuantity: number;
  } | null;
  /** Money off the basket right now. */
  discount: number;
  /** How many units are already free. */
  freeUnits: number;
  /** Product id -> how many of its units are free. Lets the drawer mark the
   *  item itself instead of only naming a total. */
  freeByProduct: Record<string, number>;
  /** Qualifying units in the basket. */
  eligibleUnits: number;
  /** How many more units until the next free one. */
  unitsToNextFree: number;
  /** How many more must be bought before the free one is earned. */
  toQualify: number;
  /** True when the very next item added costs nothing. */
  nextIsFree: boolean;
  loading: boolean;
};

const EMPTY: BogoState = {
  offer: null,
  discount: 0,
  freeUnits: 0,
  freeByProduct: {},
  eligibleUnits: 0,
  unitsToNextFree: 0,
  toQualify: 0,
  nextIsFree: false,
  loading: false,
};

type CartLine = {
  _id?: string;
  price?: number;
  finalPriceDiscount?: number;
  orderQuantity?: number;
  category?: { name?: string };
  parent?: string;
};

/**
 * Prices the basket against the running buy-N-get-M offer.
 *
 * The server does the arithmetic, through the same function that prices the
 * order when it is written. The alternative — reimplementing the rule here
 * for speed — gives two copies that drift, and the one the customer reads
 * would be the one that is wrong.
 *
 * Returns a quiet zero when no offer is running, so callers can render
 * unconditionally.
 */
export function useBogo(enabled = true): BogoState {
  const { cart_products } = useSelector(
    (s: { cart: { cart_products: CartLine[] } }) => s.cart
  );
  const [state, setState] = useState<BogoState>(EMPTY);

  // Only the parts of the cart that change the price. Without this the
  // effect refires on every unrelated cart write.
  const cartKey = useMemo(() => {
    const lines = Array.isArray(cart_products) ? cart_products : [];
    return JSON.stringify(
      lines.map(l => [
        l._id,
        l.finalPriceDiscount ?? l.price,
        l.orderQuantity ?? 1,
        l.category?.name ?? l.parent ?? '',
      ])
    );
  }, [cart_products]);

  const latest = useRef(0);

  useEffect(() => {
    if (!enabled || !API) return undefined;

    const lines = JSON.parse(cartKey) as [string, number, number, string][];
    if (lines.length === 0) {
      setState(EMPTY);
      return undefined;
    }

    const token = ++latest.current;
    let cancelled = false;
    setState(prev => ({ ...prev, loading: true }));

    fetch(`${API}/api/offer/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart: lines.map(([_id, price, orderQuantity, category]) => ({
          _id,
          price,
          orderQuantity,
          category: { name: category },
        })),
      }),
    })
      .then(res => (res.ok ? res.json() : null))
      .then(body => {
        // A slower earlier request must not overwrite a newer answer.
        if (cancelled || token !== latest.current) return;
        const data = body?.data;
        if (!data?.offer) {
          setState(EMPTY);
          return;
        }
        setState({
          offer: data.offer,
          discount: Number(data.discount) || 0,
          freeUnits: Number(data.freeUnits) || 0,
          freeByProduct: (data.freeByProduct ?? {}) as Record<string, number>,
          eligibleUnits: Number(data.eligibleUnits) || 0,
          unitsToNextFree: Number(data.unitsToNextFree) || 0,
          toQualify: Number(data.toQualify) || 0,
          nextIsFree: Boolean(data.nextIsFree),
          loading: false,
        });
      })
      .catch(() => {
        // An offer that cannot be priced is simply not shown. The server
        // still applies it at checkout, so nothing is lost but the banner.
        if (!cancelled && token === latest.current) setState(EMPTY);
      });

    return () => {
      cancelled = true;
    };
  }, [cartKey, enabled]);

  return state;
}

export default useBogo;
