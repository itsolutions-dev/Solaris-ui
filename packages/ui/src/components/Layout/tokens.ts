import { Theme } from "../../providers/ThemeProvider";

/**
 * The spacing token names layout props still accept. Group G1 moves the
 * layout props to MUI's numbers (multiples of 8) and removes these.
 */
const SPACING_TOKENS = { xs: 0.5, s: 1, m: 2, l: 3, xl: 4 } as const;

/** A spacing token name (`"m"`) or a raw density-independent pixel value. */
export type SpacingValue = keyof typeof SPACING_TOKENS | number;

/** A shape token name (`"large"`) or a raw corner radius. */
export type RadiusValue = keyof Theme["shape"] | number;

/**
 * A colour the way MUI code writes it: a palette path (`"text.secondary"`),
 * a palette name (`"primary"`), a Material 3 role (`"primaryContainer"`) or
 * any raw colour string.
 */
export type ColorValue = keyof Theme["colors"] | (string & {});

export const resolveSpacing = (
  theme: Theme,
  value: SpacingValue | undefined,
): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  return theme.spacing(SPACING_TOKENS[value]);
};

export const resolveRadius = (
  theme: Theme,
  value: RadiusValue | undefined,
): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  return theme.shape[value];
};

const lookup = (node: unknown, key: string): unknown =>
  node !== null && typeof node === "object"
    ? (node as Record<string, unknown>)[key]
    : undefined;

/**
 * Resolves a colour against the active theme: palette path, then palette
 * name (its `main`, or the leaf itself when it is a colour, like `divider`),
 * then Material 3 role. Anything else is a raw colour and passes through.
 */
export const resolveColor = (
  theme: Theme,
  value: ColorValue | undefined,
): string | undefined => {
  // An empty string is "no colour" (a cleared input), not a colour to paint.
  if (!value) return undefined;
  if (value.includes(".")) {
    const found = value.split(".").reduce<unknown>(lookup, theme.palette);
    if (typeof found === "string") return found;
  }
  const named = lookup(theme.palette, value);
  if (typeof named === "string") return named;
  const main = lookup(named, "main");
  if (typeof main === "string") return main;
  return (lookup(theme.colors, value) as string | undefined) ?? value;
};
