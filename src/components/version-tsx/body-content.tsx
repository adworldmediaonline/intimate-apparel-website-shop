'use client';

import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

/** Renders body content: HTML (rich text) or plain text. Uses dompurify for sanitization (client-only). */
export function BodyContent({
  body,
  className,
}: {
  body: string;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current || !body?.trim()) return;
    const isHtml = /<[a-z][\s\S]*>/i.test(body);
    if (isHtml) {
      divRef.current.innerHTML = DOMPurify.sanitize(body, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
      });
    } else {
      divRef.current.textContent = body;
    }
  }, [body]);

  if (!body?.trim()) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  if (!isHtml) {
    return (
      <p className={cn('text-sm sm:text-base text-muted-foreground whitespace-pre-wrap', className)}>
        {body}
      </p>
    );
  }
  return (
    <div
      ref={divRef}
      className={cn('prose prose-sm max-w-none text-muted-foreground', className)}
    />
  );
}
