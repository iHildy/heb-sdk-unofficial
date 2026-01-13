declare const fontWeights: Readonly<{
    readonly normal: string;
    readonly medium: string;
    readonly semibold: string;
    readonly bold: string;
}>;
declare const lineHeights: Readonly<{
    readonly normal: "normal";
    readonly extraSmall: "calc(16 / 12)";
    readonly small: "calc(18 / 13)";
    readonly medium: "calc(24 / 17)";
    readonly large: "calc(16 / 11)";
}>;
declare const letterSpacings: Readonly<{
    readonly normal: "normal";
}>;
export declare const FONT_SIZE_SCALE_RATIOS: Readonly<{
    readonly xs: "11 / 13";
    readonly sm: "12 / 13";
    readonly md: "1";
    readonly lg: "17 / 13";
    readonly xl: "24 / 13";
}>;
export type FontSizeKey = keyof typeof FONT_SIZE_SCALE_RATIOS;
declare const fontSizes: Readonly<{
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
}>;
declare const fontStyles: Readonly<{
    readonly normal: "normal";
}>;
declare const fonts: Readonly<{
    readonly main: string;
    readonly buttons: string;
}>;
export { fontSizes, fontWeights, letterSpacings, lineHeights, fonts, fontStyles };
