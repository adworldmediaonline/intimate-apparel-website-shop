'use client';

import React, { useEffect, useState } from 'react';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * ClientOnlyWrapper prevents hydration mismatches by ensuring components
 * only render on the client side. This is essential for components that
 * use browser APIs, authentication state, or other client-only features.
 *
 * Based on Next.js best practices for preventing hydration errors.
 */
export default function ClientOnlyWrapper({
  children,
  fallback,
  className = '',
}: ClientOnlyWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag after component mounts
    setIsClient(true);
  }, []);

  // Show fallback or nothing until client-side hydration is complete
  if (!isClient) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  // Render children only after client-side hydration
  return <>{children}</>;
}

/**
 * Hook to check if component is running on client side
 * Useful for conditional logic that depends on client state
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
