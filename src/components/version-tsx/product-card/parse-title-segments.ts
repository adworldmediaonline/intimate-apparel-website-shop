export type TitleSegment = { kind: 'outside' | 'inside'; text: string };

/**
 * Splits a product title into segments outside vs inside parentheses.
 * Parenthetical segments are wrapped in a span with white-space: nowrap
 * so they never break onto the next line.
 */
export function parseTitleSegments(str: string): TitleSegment[] {
  const segments: TitleSegment[] = [];
  let current: TitleSegment = { kind: 'outside', text: '' };
  let depth = 0;

  for (const c of str) {
    if (c === '(') {
      if (depth === 0) {
        if (current.text) {
          segments.push(current);
          current = { kind: 'outside', text: '' };
        }
        current = { kind: 'inside', text: '(' };
      } else {
        current.text += c;
      }
      depth += 1;
    } else if (c === ')') {
      depth -= 1;
      current.text += c;
      if (depth === 0) {
        segments.push(current);
        current = { kind: 'outside', text: '' };
      }
    } else {
      current.text += c;
    }
  }

  if (current.text) segments.push(current);
  return segments;
}
