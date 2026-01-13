/**
 * Shared constants for color utilities
 */
import type { ColorScale } from '@clerk/shared/types';
export type ColorShade = 25 | 50 | 100 | 150 | 200 | 300 | 400 | 500 | 600 | 700 | 750 | 800 | 850 | 900 | 950;
export type ColorShadeKey = keyof ColorScale<any>;
export declare const COLOR_SCALE: readonly ColorShade[];
export declare const LIGHT_SHADES: ColorShadeKey[];
export declare const DARK_SHADES: ColorShadeKey[];
export declare const ALL_SHADES: ColorShadeKey[];
export declare const LIGHTNESS_CONFIG: {
    readonly TARGET_LIGHT: 97;
    readonly TARGET_DARK: 12;
    readonly LIGHT_STEPS: 7;
    readonly DARK_STEPS: 7;
};
export declare const ALPHA_PERCENTAGES: Record<ColorShade, number>;
export declare const ALPHA_VALUES: number[];
export declare const LIGHTNESS_MIX_DATA: Record<ColorShade, {
    mixColor: 'white' | 'black' | null;
    percentage: number;
}>;
export declare const RELATIVE_SHADE_STEPS: Record<number, number>;
export declare const COLOR_BOUNDS: {
    readonly rgb: {
        readonly min: 0;
        readonly max: 255;
    };
    readonly alpha: {
        readonly min: 0;
        readonly max: 1;
    };
    readonly hue: {
        readonly min: 0;
        readonly max: 360;
    };
    readonly percentage: {
        readonly min: 0;
        readonly max: 100;
    };
};
export declare const MODERN_CSS_LIMITS: {
    readonly MAX_LIGHTNESS_MIX: 95;
    readonly MIN_ALPHA_PERCENTAGE: 5;
    readonly MAX_LIGHTNESS_ADJUSTMENT: 30;
    readonly MIN_LIGHTNESS_FLOOR: 95;
    readonly LIGHTNESS_MULTIPLIER: 2;
    readonly MIX_MULTIPLIER: 4;
};
