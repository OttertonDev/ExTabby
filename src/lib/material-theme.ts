import {
  argbFromHex,
  themeFromSourceColor,
  hexFromArgb,
} from "@material/material-color-utilities";

// Material Design Blue 700 as seed color
const BLUE_SEED = "#1976D2";

// Generate complete Material 3 theme
const theme = themeFromSourceColor(argbFromHex(BLUE_SEED));

// Export light and dark schemes
export const lightScheme = theme.schemes.light;
export const darkScheme = theme.schemes.dark;

// Helper to convert ARGB to hex
export function argbToHex(argb: number): string {
  return hexFromArgb(argb);
}

// Export all color tokens as hex for CSS
export const lightColors = {
  primary: argbToHex(lightScheme.primary),
  onPrimary: argbToHex(lightScheme.onPrimary),
  primaryContainer: argbToHex(lightScheme.primaryContainer),
  onPrimaryContainer: argbToHex(lightScheme.onPrimaryContainer),
  secondary: argbToHex(lightScheme.secondary),
  onSecondary: argbToHex(lightScheme.onSecondary),
  secondaryContainer: argbToHex(lightScheme.secondaryContainer),
  onSecondaryContainer: argbToHex(lightScheme.onSecondaryContainer),
  tertiary: argbToHex(lightScheme.tertiary),
  onTertiary: argbToHex(lightScheme.onTertiary),
  tertiaryContainer: argbToHex(lightScheme.tertiaryContainer),
  onTertiaryContainer: argbToHex(lightScheme.onTertiaryContainer),
  error: argbToHex(lightScheme.error),
  onError: argbToHex(lightScheme.onError),
  errorContainer: argbToHex(lightScheme.errorContainer),
  onErrorContainer: argbToHex(lightScheme.onErrorContainer),
  background: argbToHex(lightScheme.background),
  onBackground: argbToHex(lightScheme.onBackground),
  surface: argbToHex(lightScheme.surface),
  onSurface: argbToHex(lightScheme.onSurface),
  surfaceVariant: argbToHex(lightScheme.surfaceVariant),
  onSurfaceVariant: argbToHex(lightScheme.onSurfaceVariant),
  outline: argbToHex(lightScheme.outline),
  outlineVariant: argbToHex(lightScheme.outlineVariant),
};

export const darkColors = {
  primary: argbToHex(darkScheme.primary),
  onPrimary: argbToHex(darkScheme.onPrimary),
  primaryContainer: argbToHex(darkScheme.primaryContainer),
  onPrimaryContainer: argbToHex(darkScheme.onPrimaryContainer),
  secondary: argbToHex(darkScheme.secondary),
  onSecondary: argbToHex(darkScheme.onSecondary),
  secondaryContainer: argbToHex(darkScheme.secondaryContainer),
  onSecondaryContainer: argbToHex(darkScheme.onSecondaryContainer),
  tertiary: argbToHex(darkScheme.tertiary),
  onTertiary: argbToHex(darkScheme.onTertiary),
  tertiaryContainer: argbToHex(darkScheme.tertiaryContainer),
  onTertiaryContainer: argbToHex(darkScheme.onTertiaryContainer),
  error: argbToHex(darkScheme.error),
  onError: argbToHex(darkScheme.onError),
  errorContainer: argbToHex(darkScheme.errorContainer),
  onErrorContainer: argbToHex(darkScheme.onErrorContainer),
  background: argbToHex(darkScheme.background),
  onBackground: argbToHex(darkScheme.onBackground),
  surface: argbToHex(darkScheme.surface),
  onSurface: argbToHex(darkScheme.onSurface),
  surfaceVariant: argbToHex(darkScheme.surfaceVariant),
  onSurfaceVariant: argbToHex(darkScheme.onSurfaceVariant),
  outline: argbToHex(darkScheme.outline),
  outlineVariant: argbToHex(darkScheme.outlineVariant),
};
