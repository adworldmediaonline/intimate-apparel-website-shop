'use client';

import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from '@/lib/brand';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderContactInfoProps {
  className?: string;
}

interface ContactLink {
  icon: typeof Phone;
  label: string;
  href: string;
  ariaLabel: string;
  title: string;
}

export function HeaderContactInfo({ className }: HeaderContactInfoProps) {
  // Phone is only rendered once a real number is set in brand.config.json.
  const contactInfo: ContactLink[] = [
    ...(SUPPORT_PHONE && SUPPORT_PHONE_HREF
      ? [
          {
            icon: Phone,
            label: 'Phone',
            href: SUPPORT_PHONE_HREF,
            ariaLabel: `Call us at ${SUPPORT_PHONE}`,
            title: SUPPORT_PHONE,
          },
        ]
      : []),
    // The envelope always goes somewhere. With a support inbox configured it
    // opens a mail composer; without one it falls back to the contact form
    // rather than sitting there doing nothing when tapped.
    {
      icon: Mail,
      label: 'Email',
      href: SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : '/contact',
      ariaLabel: SUPPORT_EMAIL ? `Email us at ${SUPPORT_EMAIL}` : 'Contact us',
      title: SUPPORT_EMAIL ?? 'Contact us',
    },
  ];

  if (contactInfo.length === 0) return null;

  return (
    <div
      className={cn('flex items-center gap-1.5 md:gap-2 shrink-0', className)}
    >
      {contactInfo.map(contact => {
        const Icon = contact.icon;
        return (
          <Link
            key={contact.label}
            href={contact.href}
            aria-label={contact.ariaLabel}
            title={contact.title}
            className="relative inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            <Icon className="h-4 w-4 md:h-4 md:w-4" />
          </Link>
        );
      })}
    </div>
  );
}

export default HeaderContactInfo;
