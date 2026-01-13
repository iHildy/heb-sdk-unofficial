import type { ColorScale } from '@clerk/shared/types';
import type { ColorShade } from './constants';
/**
 * Fast empty color scale creation - returns pre-computed frozen object
 */
export declare const createEmptyColorScale: () => ColorScale<string | undefined>;
/**
 * Core color generation functions
 */
/**
 * Create a color-mix string
 * @param baseColor - The base color
 * @param mixColor - The color to mix with
 * @param percentage - The percentage of the mix
 * @returns The color-mix string
 */
export declare function createColorMixString(baseColor: string, mixColor: string, percentage: number): string;
/**
 * Generate a relative color syntax string
 * @param color - The base color
 * @param hue - The hue component
 * @param saturation - The saturation component
 * @param lightness - The lightness component
 * @param alpha - The alpha component (optional)
 * @returns The relative color syntax string
 */
export declare function createRelativeColorString(color: string, hue: string, saturation: string, lightness: string, alpha?: string): string;
/**
 * Create an alpha color-mix string
 * @param color - The base color
 * @param alphaPercentage - The alpha percentage
 * @returns The alpha color-mix string
 */
export declare function createAlphaColorMixString(color: string, alphaPercentage: number): string;
/**
 * Generate a relative color syntax string
 * @param color - The base color
 * @param shade - The shade to generate the color for
 * @returns The relative color syntax string
 */
export declare function generateRelativeColorSyntax(color: string, shade: ColorShade): string;
/**
 * Generate a color-mix string
 * @param color - The base color
 * @param shade - The shade to generate the color for
 * @returns The color-mix string
 */
export declare function generateColorMixSyntax(color: string, shade: ColorShade): string;
export declare function generateAlphaColorMix(color: string, shade: ColorShade): string;
/**
 * Get the optimal color variant for the given shade
 * @param color - The base color
 * @param shade - The shade to generate the color for
 * @returns The optimal color variant
 */
export declare function getSupportedColorVariant(color: string, shade: ColorShade): string;
