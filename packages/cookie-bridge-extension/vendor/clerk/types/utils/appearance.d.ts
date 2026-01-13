import type { Appearance } from '@clerk/shared/types';
/**
 * Extracts cssLayerName from theme/baseTheme and moves it to appearance level.
 * Handles both the new 'theme' property and deprecated 'baseTheme' property.
 */
export declare function processCssLayerNameExtraction(appearance: Appearance | undefined): Appearance | undefined;
