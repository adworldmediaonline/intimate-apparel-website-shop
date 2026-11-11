import brandConfig from '../../../brand.config.json';

/** #rrggbb -> {r,g,b}; returns null for anything else. */
function parseHex(hex: string) {
  const m = /^#?([\da-f]{6})$/i.exec(hex?.trim() ?? '');
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Darken toward black by `amount` (0-1). Used for accent-on-light text. */
function darken(hex: string, amount: number) {
  const c = parseHex(hex);
  if (!c) return hex;
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return `#${[f(c.r), f(c.g), f(c.b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Blend `from` toward `to` by `amount` (0-1). */
function mix(from: string, to: string, amount: number) {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return from;
  const f = (x: number, y: number) => Math.round(x + (y - x) * amount);
  return `#${[f(a.r, b.r), f(a.g, b.g), f(a.b, b.b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Emits the CSS variables the editorial layout reads for colour.
 *
 * The three brand tokens are required; the three surface tokens are optional and
 * only emitted when the store sets them, so a brand that wants the default warm
 * editorial ground simply omits them. This is the ONLY place store colour enters
 * the design — wireframe.css itself is brand-neutral.
 */
export function BrandTheme() {
  const theme = (brandConfig.theme ?? {}) as Record<string, string | undefined>;

  const deep = theme.secondary || theme.primary || '#1f2a36';
  const brandColour = theme.primary || deep;
  const accent = theme.accent || brandColour;
  const surface = theme.surface || '#ffffff';
  const surfaceAlt = theme.surfaceAlt || surface;
  const line = theme.line || '#e4ded1';
  /** Sale labels, hover states, ratings, small highlights. */
  const highlight = theme.highlight || accent;
  /** Titles, body text, icons. */
  const ink = theme.ink || deep;
  /** Secondary text: the ink lifted toward the page, so it stays in the
   *  palette's temperature instead of falling back to a cool grey. */
  const inkSoft = mix(ink, surface, 0.42);

  const vars: string[] = [
    `--wf-deep:${deep}`,
    `--wf-brand:${brandColour}`,
    `--wf-accent:${accent}`,
    `--wf-accent-deep:${darken(accent, 0.22)}`,
    `--background:${surface}`,
    `--foreground:${deep}`,
    `--card:${surface}`,
    `--card-foreground:${deep}`,
    `--popover:${surface}`,
    `--popover-foreground:${deep}`,
    `--primary:${brandColour}`,
    `--primary-foreground:#ffffff`,
    `--secondary:${surfaceAlt}`,
    `--secondary-foreground:${deep}`,
    `--muted:${surfaceAlt}`,
    `--muted-foreground:${inkSoft}`,
    `--accent:${surfaceAlt}`,
    `--accent-foreground:${deep}`,
    `--border:${line}`,
    `--input:${line}`,
    `--ring:${accent}`,
    `--sidebar:${surface}`,
    `--sidebar-foreground:${deep}`,
    `--sidebar-primary:${brandColour}`,
    `--sidebar-primary-foreground:#ffffff`,
    `--sidebar-accent:${surfaceAlt}`,
    `--sidebar-accent-foreground:${deep}`,
    `--sidebar-border:${line}`,
    `--sidebar-ring:${accent}`,
  ];

  if (theme.surface) vars.push(`--wf-cream:${surface}`);
  if (theme.surfaceAlt) vars.push(`--wf-cream-2:${surfaceAlt}`);
  if (theme.line) vars.push(`--wf-line:${line}`);

  // Text and highlight tokens, so the editorial layout reads the palette for
  // these too rather than the brand-neutral defaults in wireframe.css.
  if (theme.ink) vars.push(`--wf-ink:${ink}`, `--wf-ink-soft:${inkSoft}`);
  if (theme.highlight) vars.push(`--wf-sale:${highlight}`);

  // The footer bar (bg-header / text-header-foreground). The palette's
  // darkest colour with the page surface as text — the inverse of the body,
  // which is what makes the bar read as frame rather than content.
  const headerBg = deep;
  const headerFg = surface;
  vars.push(`--header:${headerBg}`, `--header-foreground:${headerFg}`);
  vars.push(`--color-header:${headerBg}`, `--color-header-foreground:${headerFg}`);

  // The masthead is light, and has its own pair because it no longer
  // matches the footer.
  //
  // The wordmark is dark red with no light variant, so on the near-black
  // bar "UNWRAP" sat at roughly 1.5:1 against its background — present, but
  // not readable. The logo is the one element on the page that cannot be
  // recoloured to suit the furniture, so the furniture gives way: cream
  // behind it, ink on top, and the wine announcement bar above still
  // carries the brand colour at the top of the page.
  const mastheadBg = surface;
  const mastheadFg = ink;
  vars.push(`--masthead:${mastheadBg}`, `--masthead-foreground:${mastheadFg}`);
  vars.push(
    `--color-masthead:${mastheadBg}`,
    `--color-masthead-foreground:${mastheadFg}`
  );

  return <style dangerouslySetInnerHTML={{ __html: `:root{${vars.join(';')};}` }} />;
}

export default BrandTheme;
