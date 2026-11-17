'use client';

import { useEffect } from 'react';

/**
 * Takes the easy ways of saving a product photo off the page: right-click
 * "Save image as", dragging a photo to the desktop, and the iOS long-press
 * save sheet.
 *
 * This raises the effort; it does not make the images private. Anyone can
 * still open DevTools, read the page source, or request the Cloudinary URL
 * directly — the files are public on a CDN. Watermarking or signed, expiring
 * image URLs are the only real protections, and both are separate jobs.
 *
 * Right-click stays available everywhere else on the page, so copying a size
 * chart or a discount code still works.
 */
export default function ImageDownloadGuard() {
  useEffect(() => {
    const isImage = target =>
      target instanceof Element && Boolean(target.closest('img, picture, canvas, svg'));

    const blockIfImage = event => {
      if (isImage(event.target)) {
        event.preventDefault();
      }
    };

    // Dragging is blocked outright: dragging any part of the page can carry an
    // image along with it, and nothing on this site needs drag-and-drop.
    document.addEventListener('contextmenu', blockIfImage);
    document.addEventListener('dragstart', blockIfImage);

    return () => {
      document.removeEventListener('contextmenu', blockIfImage);
      document.removeEventListener('dragstart', blockIfImage);
    };
  }, []);

  return null;
}
