import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';

/**
 * `cacheComponents: true` forbids `export const dynamic` / `revalidate` here.
 * `connection()` opts this segment into request-time rendering (Next 16+).
 */
export const metadata: Metadata = {
  title: 'Intimate Apparel - Order Confirmation',
  alternates: {
    canonical: '/confirmation',
  },
  // Reachable only straight after payment, and it carries a real order on it.
  robots: { index: false, follow: false },
};

export default async function ConfirmationIdLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  return children;
}
