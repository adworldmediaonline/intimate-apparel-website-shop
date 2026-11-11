'use client';

import * as React from 'react';

export default function BackToTopCom(): React.ReactElement {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    function handleScroll() {
      const y = window.scrollY || window.pageYOffset;
      setIsVisible(y > 400);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = React.useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, 0);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="hidden pointer-events-none fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 pb-[env(safe-area-inset-bottom)]">
      <button
        type="button"
        aria-label="Back to top"
        title="Back to top"
        onClick={handleClick}
        className={`pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-primary/90 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <svg
          className="h-4 w-4"
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M11 6L6 1L1 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
