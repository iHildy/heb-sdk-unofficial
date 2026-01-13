import type { ColorScale, CssColorOrAlphaScale, CssColorOrScale, HslaColorString } from '@clerk/shared/types';
type InternalColorScale<T> = ColorScale<T> & Partial<Record<20, T>>;
type WithPrefix<T extends Record<string, string>, Prefix extends string> = {
    [K in keyof T as `${Prefix}${K & string}`]: T[K];
};
/**
 * Modern CSS alpha scale generation
 */
declare function generateModernAlphaScale(baseColor: string): ColorScale<string>;
/**
 * Legacy HSLA alpha scale generation
 */
declare function generateLegacyAlphaScale(baseColor: string): ColorScale<string>;
/**
 * Modern CSS lightness scale generation
 */
declare function generateModernLightnessScale(baseColor: string): ColorScale<string>;
/**
 * Legacy HSLA lightness scale generation
 */
declare function generateLegacyLightnessScale(baseColor: string): ColorScale<string>;
/**
 * Unified alpha scale generator that automatically chooses between modern and legacy implementations
 * @param color - Base color string or existing color scale
 * @returns Complete color scale with alpha variations
 */
export declare function generateAlphaScale(color: string | ColorScale<string> | CssColorOrScale | undefined): ColorScale<string>;
/**
 * Unified lightness scale generator that automatically chooses between modern and legacy implementations
 * @param color - Base color string or existing color scale
 * @returns Complete color scale with lightness variations
 */
export declare function generateLightnessScale(color: string | ColorScale<string> | CssColorOrScale | undefined): ColorScale<string>;
/**
 * Direct access to modern scale generators (for testing or when modern CSS is guaranteed)
 */
export declare const modernScales: {
    readonly generateAlphaScale: typeof generateModernAlphaScale;
    readonly generateLightnessScale: typeof generateModernLightnessScale;
};
/**
 * Direct access to legacy scale generators (for testing or compatibility)
 */
export declare const legacyScales: {
    readonly generateAlphaScale: typeof generateLegacyAlphaScale;
    readonly generateLightnessScale: typeof generateLegacyLightnessScale;
};
/**
 * Converts a color option to a themed alpha scale with prefix
 * Returns CSS color values (modern color-mix/relative colors or legacy HSLA)
 * @param colorOption - Color input (string or alpha scale object)
 * @param prefix - Prefix to apply to scale keys
 * @returns Prefixed CSS color scale or undefined
 */
export declare const colorOptionToThemedAlphaScale: <Prefix extends string>(colorOption: CssColorOrAlphaScale | undefined, prefix: Prefix) => WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined;
/**
 * Converts a color option to a themed lightness scale with prefix
 * Returns CSS color values (modern color-mix/relative colors or legacy HSLA)
 * @param colorOption - Color input (string or lightness scale object)
 * @param prefix - Prefix to apply to scale keys
 * @returns Prefixed CSS color scale or undefined
 */
export declare const colorOptionToThemedLightnessScale: <Prefix extends string>(colorOption: CssColorOrScale | undefined, prefix: Prefix) => WithPrefix<InternalColorScale<HslaColorString>, Prefix> | undefined;
export {};
