'use client';

import { useEffect, useRef } from 'react';

export default function CurrentYear() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.textContent = String(new Date().getFullYear());
  }, []);

  return <span ref={ref}>2026</span>;
}
