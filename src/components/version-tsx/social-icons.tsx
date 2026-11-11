import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { BRAND_NAME, activeSocialLinks } from '@/lib/brand';

/**
 * Social profile links, rendered from `social` in brand.config.json.
 *
 * Only profiles that are actually filled in appear — `activeSocialLinks` drops
 * the nulls — so adding a profile to the config is the only step needed to show
 * it, and a network the brand is not on never renders a dead icon.
 *
 * lucide ships no X or Pinterest mark, so those two are drawn inline.
 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25h6.82l4.71 6.23 5.47-6.23Zm-1.16 17.52h1.83L7.02 4.13H5.06l12.02 15.64Z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.86 6.36 9.32-.09-.79-.17-2.01.03-2.88.18-.77 1.17-4.94 1.17-4.94s-.3-.6-.3-1.48c0-1.39.8-2.43 1.8-2.43.85 0 1.26.64 1.26 1.4 0 .86-.54 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.78 0 3.15-1.88 3.15-4.58 0-2.4-1.72-4.07-4.18-4.07-2.85 0-4.52 2.13-4.52 4.34 0 .86.33 1.78.74 2.28.08.1.09.19.07.29-.08.32-.25.99-.28 1.13-.05.19-.15.23-.35.14-1.3-.61-2.11-2.5-2.11-4.03 0-3.28 2.38-6.29 6.87-6.29 3.6 0 6.4 2.57 6.4 6 0 3.58-2.26 6.46-5.39 6.46-1.05 0-2.04-.55-2.38-1.2l-.65 2.47c-.23.9-.86 2.03-1.29 2.72.97.3 2 .46 3.07.46 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
    </svg>
  );
}

const ICONS: Record<
  string,
  { Icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  instagram: { Icon: Instagram, label: 'Instagram' },
  facebook: { Icon: Facebook, label: 'Facebook' },
  twitter: { Icon: XIcon, label: 'X' },
  youtube: { Icon: Youtube, label: 'YouTube' },
  pinterest: { Icon: PinterestIcon, label: 'Pinterest' },
  linkedin: { Icon: Linkedin, label: 'LinkedIn' },
};

/** Config order decides display order, so the brand controls it in one place. */
const ORDER = ['instagram', 'facebook', 'twitter', 'youtube', 'pinterest', 'linkedin'];

export function SocialIcons({ className = '' }: { className?: string }) {
  const links = [...activeSocialLinks]
    .filter(s => ICONS[s.name])
    .sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {links.map(social => {
        const { Icon, label } = ICONS[social.name];
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${BRAND_NAME} on ${label}`}
            title={label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}

export default SocialIcons;
