'use client';

import { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  type: 'info' | 'warning' | 'success' | 'promotion';
  backgroundColor: string;
  textColor: string;
  showCloseButton: boolean;
}

interface AnnouncementBarProps {
  announcements: Announcement[];
}

export default function AnnouncementBar({ announcements }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Filter out dismissed announcements
  const activeAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.includes(announcement._id)
  );

  // Auto-rotate through announcements
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
    // Store in localStorage to persist dismissal
    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    localStorage.setItem('dismissedAnnouncements', JSON.stringify([...dismissed, id]));
  };

  // Load dismissed announcements from localStorage on mount
  useEffect(() => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
    setDismissedIds(dismissed);
  }, []);

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = activeAnnouncements[currentIndex];

  return (
    <div className="w-full py-3 px-4 text-center relative overflow-hidden bg-primary text-primary-foreground animate-subtle-flash">
      <div className="container mx-auto flex items-center justify-center gap-2 relative">
        {/* One line only.
            The title and the message used to be rendered side by side, which
            on a phone wrapped into two ragged columns — "Discreet / Packaging"
            next to "Plain, unbranded packaging — no product names / on the
            parcel". A bar this short has room for one statement, so the title
            is it; the message stays in the database for the admin list. */}
        <p className="text-sm sm:text-base font-semibold animate-content-flash">
          {currentAnnouncement.title || currentAnnouncement.message}
        </p>

        {/* Link */}
        {currentAnnouncement.link && (
          <Link
            href={currentAnnouncement.link}
            className="inline-flex items-center gap-1 text-sm sm:text-base font-semibold underline hover:no-underline transition-all animate-content-flash"
          >
            {currentAnnouncement.linkText || 'Learn More'}
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        )}

        {/* Pagination Dots (if multiple announcements) */}
        {activeAnnouncements.length > 1 && (
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            {activeAnnouncements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="h-1.5 rounded-full transition-all bg-primary-foreground font-semibold"
                style={{
                  opacity: index === currentIndex ? 1 : 0.4,
                  width: index === currentIndex ? '1rem' : '0.375rem',
                }}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Close Button */}
        {currentAnnouncement.showCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 h-6 w-6 rounded-full hover:bg-white/20 transition-colors text-primary-foreground"
            onClick={() => handleDismiss(currentAnnouncement._id)}
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

