/**
 * Extracts the computed value of a CSS custom property (CSS variable)
 * @param variableName - The CSS variable name in any of these formats:
 *   - 'var(--color)'
 *   - '--color'
 *   - 'color' (will be prefixed with --)
 * @param element - Optional element to get the variable from (defaults to document.documentElement)
 * @returns The computed CSS variable value as a string, or null if not found
 * @example
 * const colorValue = extractCSSVariableValue('var(--color)'); // "red"
 * const colorValue2 = extractCSSVariableValue('--color'); // "red"
 * const colorValue3 = extractCSSVariableValue('color'); // "red"
 * const colorValue4 = extractCSSVariableValue('--nonexistent'); // null
 * const colorValue5 = extractCSSVariableValue('--nonexistent', document.body); // null
 * const colorValue6 = extractCSSVariableValue('--nonexistent', document.body, '#000000'); // "#000000"
 */
export declare function extractCSSVariableValue(variableName: string, element?: Element): string | null;
/**
 * Alternative version that also accepts fallback values
 * @param variableName - The CSS variable name
 * @param fallback - Fallback value if variable is not found
 * @param element - Optional element to get the variable from
 * @returns The CSS variable value or fallback
 */
export declare function extractCSSVariableValueWithFallback<T = string>(variableName: string, fallback: T, element?: Element): string | T;
/**
 * Gets multiple CSS variables at once
 * @param variableNames - Array of CSS variable names
 * @param element - Optional element to get variables from
 * @returns Object mapping variable names to their values
 * @example
 * const variables = extractMultipleCSSVariables([
 *   '--primary-color',
 *   '--secondary-color',
 *   '--font-size'
 * ]);
 */
export declare function extractMultipleCSSVariables(variableNames: string[], element?: Element): Record<string, string | null>;
/**
 * Checks if a given value represents a CSS variable (var() function)
 * @param value - The value to check
 * @returns True if the value is a CSS variable, false otherwise
 * @example
 * isCSSVariable('var(--color)'); // true
 * isCSSVariable('var(--color, red)'); // true
 * isCSSVariable('--color'); // false
 * isCSSVariable('red'); // false
 * isCSSVariable('#ff0000'); // false
 */
export declare function isCSSVariable(value: string): boolean;
/**
 * Resolves a CSS variable to its computed value, with fallback support
 * Handles var() syntax and extracts variable name and fallback value
 * @param value - The CSS variable string (e.g., 'var(--color, red)')
 * @param element - Optional element to get the variable from
 * @returns The resolved value or null if not found and no fallback provided
 * @example
 * resolveCSSVariable('var(--primary-color)'); // "blue" (if --primary-color is blue)
 * resolveCSSVariable('var(--missing-color, red)'); // "red" (fallback)
 * resolveCSSVariable('var(--missing-color)'); // null
 * resolveCSSVariable('red'); // null (not a CSS variable)
 */
export declare function resolveCSSVariable(value: string, element?: Element): string | null;
/**
 * Resolves a CSS property to its computed value, in the context of a DOM element
 * This is used to resolve CSS variables to their computed values, in the context of a DOM element.
 *
 * @param parentElement - The parent element to resolve the property in the context of
 * @param propertyName - The CSS property name (e.g., 'color', 'font-weight', 'font-size')
 * @param propertyValue - The property value to resolve (can be a CSS variable)
 * @returns The resolved property value as a string
 */
export declare function resolveComputedCSSProperty(parentElement: HTMLElement, propertyName: string, propertyValue: string): string;
/**
 * Resolves a color to its computed value, in the context of a DOM element
 * This is used to resolve CSS variables to their computed values, in the context of a DOM element to support passing
 * CSS variables to Stripe Elements.
 *
 * @param parentElement - The parent element to resolve the color in the context of
 * @param color - The color to resolve
 * @param backgroundColor - The background color to use for the canvas, this is used to ensure colors that
 * contain an alpha value mix together correctly. So the output matches the alpha usage in the CSS.
 * @returns The resolved color as a hex string
 */
export declare function resolveComputedCSSColor(parentElement: HTMLElement, color: string, backgroundColor?: string): string;
/**
 * Creates a CSS variable prefixed with `clerk-` with a default value
 * @param name - The name of the CSS variable
 * @param defaultValue - The default value
 * @returns The CSS variable string
 */
export declare const clerkCssVar: (name: string, defaultValue: string) => string;
