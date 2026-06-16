import type { CSSProperties } from "react";

/**
 * Parse a CSS declaration string ("display:flex;gap:8px") into a React style
 * object. This lets the screens carry the design's inline-style strings over
 * almost verbatim — the single most reliable way to stay pixel-perfect with
 * the NudGoo.dc.html source. Custom properties (`--x`) are preserved as-is;
 * everything else is camel-cased.
 */
const kebabToCamel = (s: string): string =>
  s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export function css(decl: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const part of decl.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const prop = part.slice(0, i).trim();
    if (!prop) continue;
    out[prop.startsWith("--") ? prop : kebabToCamel(prop)] = part
      .slice(i + 1)
      .trim();
  }
  return out as CSSProperties;
}

/** Join class names, dropping falsy values. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");
