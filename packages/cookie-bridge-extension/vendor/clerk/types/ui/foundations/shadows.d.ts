type ShadowGenerator = (color: string, alpha: number) => string;
declare const generateShadow: (fn: (color: string, alpha: number) => string) => ShadowGenerator;
/**
 * Creates a complete set of shadows using the provided shadow color
 * @param shadowColor - The base color to use for shadows (defaults to black)
 * @param shadowGenerator - Function to generate shadow colors with alpha (defaults to CSS variable-based generator)
 * @returns Object containing all shadow definitions
 */
export declare const createShadowSet: (shadowColor?: string, shadowGenerator?: ShadowGenerator) => {
    menuShadow: string;
    fabShadow: string;
    buttonShadow: string;
    cardBoxShadow: string;
    cardContentShadow: string;
    actionCardShadow: string;
    outlineButtonShadow: string;
    input: string;
    focusRing: string;
    badge: string;
    tableBodyShadow: string;
    segmentedControl: string;
    switchControl: string;
};
export declare const shadows: Readonly<{
    menuShadow: string;
    fabShadow: string;
    buttonShadow: string;
    cardBoxShadow: string;
    cardContentShadow: string;
    actionCardShadow: string;
    outlineButtonShadow: string;
    input: string;
    focusRing: string;
    badge: string;
    tableBodyShadow: string;
    segmentedControl: string;
    switchControl: string;
}>;
export { generateShadow };
