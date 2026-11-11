import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Intimate Apparel - Track Order',
  alternates: {
    canonical: '/track-order',
  },
};

export default async function TrackOrderIdLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  return children;
}
