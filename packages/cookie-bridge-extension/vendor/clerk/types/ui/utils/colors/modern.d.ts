/**
 * CSS-based color manipulation utilities
 * Uses color-mix() and relative color syntax when supported
 */
/**
 * CSS-based color manipulation utilities
 * Uses color-mix() and relative color syntax when supported
 */
export declare const colors: {
    /**
     * Lightens a color by a percentage
     */
    lighten: (color: string | undefined, percentage?: number) => string | undefined;
    /**
     * Makes a color transparent by a percentage
     */
    makeTransparent: (color: string | undefined, percentage?: number) => string | undefined;
    /**
     * Makes a color completely opaque
     */
    makeSolid: (color: string | undefined) => string | undefined;
    /**
     * Sets the alpha value of a color
     */
    setAlpha: (color: string, alpha: number) => string;
    /**
     * Adjusts color for better contrast/lightness
     */
    adjustForLightness: (color: string | undefined, lightness?: number) => string | undefined;
};
