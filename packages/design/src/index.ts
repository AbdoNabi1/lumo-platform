/**
 * @platform/design — design tokens.
 *
 * These values are the FROZEN UI design system, extracted verbatim from
 * docs/ui/DESIGN_SYSTEM.md. Do NOT add, remove, or alter any value without approval
 * (the UI is the frozen source of truth — see docs/ui/README.md).
 *
 * The CSS source of truth that the apps actually consume is ./styles.css.
 * This module exposes the same tokens for programmatic (TS) use.
 */

export const colors = {
  light: {
    bg: "#f6f6f7",
    surface: "#ffffff",
    surface2: "#fafafb",
    border: "#e8e8eb",
    borderStrong: "#d8d8dd",
    hover: "#f1f1f4",
    text: "#16161a",
    textSecondary: "#5b5e66",
    textMuted: "#8d909a",
    accent: "#5b53e0",
    accentBg: "#eeedfc",
    accentText: "#4a43c9",
    success: "#0f8a4f",
    successBg: "#e6f5ec",
    warning: "#b5740a",
    warningBg: "#fbf0db",
    danger: "#c92f24",
    dangerBg: "#fcebe9",
  },
  dark: {
    bg: "#0e0e11",
    surface: "#17171c",
    surface2: "#1d1d23",
    border: "#2a2a31",
    borderStrong: "#3a3a44",
    hover: "#222229",
    text: "#f1f1f4",
    textSecondary: "#a6a9b1",
    textMuted: "#71747d",
    accent: "#8b84f8",
    accentBg: "#272341",
    accentText: "#b8b3fb",
    success: "#3fd089",
    successBg: "#102619",
    warning: "#e0a008",
    warningBg: "#2a2008",
    danger: "#f6776b",
    dangerBg: "#2a1512",
  },
} as const;

/** Frozen radius scale (docs/ui/DESIGN_SYSTEM.md §4). */
export const radii = {
  root: "14px",
  card: "12px",
  block: "10px",
  control: "8px",
  logo: "7px",
  pill: "999px",
} as const;

export const typography = {
  fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontMono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  lineHeight: 1.45,
  weights: { regular: 400, medium: 500 },
  sizes: {
    title: "19px",
    bigNumber: "24px",
    metric: "22px",
    cardHeader: "13.5px",
    brand: "14px",
    nav: "13px",
    body: "12.5px",
    small: "12px",
    tiny: "11px",
  },
} as const;

export const breakpoints = {
  /** The frozen admin collapses to an icon rail at this width (single breakpoint). */
  adminCollapse: "560px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

/** Frozen system is deliberately FLAT — depth comes only from 1px hairline borders. */
export const shadows = { none: "none" } as const;
