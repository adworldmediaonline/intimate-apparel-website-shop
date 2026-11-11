'use client';

import Link from 'next/link';
import { CHECKOUT_STEPS, stepIndex } from '@/lib/checkout-steps';

/**
 * Where the shopper is in the three steps.
 *
 * Completed steps are links so they can go back and correct something;
 * steps ahead are inert, because arriving at Payment with no address is a
 * dead end rather than a shortcut.
 *
 * `prefetch` on the links is what makes the forward move feel instant: the
 * next step's code is already in the browser by the time it is clicked.
 */
export default function CheckoutStepNav({ current }) {
  const currentIndex = stepIndex(current);

  return (
    <nav aria-label="Checkout progress" className="mb-5 md:mb-7">
      <ol className="flex items-center gap-2 sm:gap-3">
        {CHECKOUT_STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const body = (
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  active || done
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={[
                  'text-xs sm:text-sm',
                  active
                    ? 'font-semibold text-foreground'
                    : done
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                ].join(' ')}
              >
                {step.label}
              </span>
            </span>
          );

          return (
            <li key={step.key} className="flex items-center gap-2 sm:gap-3">
              {done ? (
                <Link href={step.href} prefetch className="hover:opacity-80">
                  {body}
                </Link>
              ) : (
                <span aria-current={active ? 'step' : undefined}>{body}</span>
              )}
              {i < CHECKOUT_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={[
                    'h-px w-4 sm:w-10',
                    i < currentIndex ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
