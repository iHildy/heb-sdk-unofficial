import type { Theme } from '@clerk/shared/types';
import { type FontSizeKey, type fontWeights } from '../foundations/typography';
export declare const createColorScales: (theme: Theme) => Record<string, unknown>;
export declare const removeInvalidValues: (variables: NonNullable<Theme["variables"]>) => NonNullable<Theme["variables"]>;
export declare const createRadiiUnits: (theme: Theme) => {
    sm: string;
    md: string;
    lg: string;
    xl: string;
} | undefined;
export declare const createSpaceScale: (theme: Theme) => any;
export declare const createFontSizeScale: (theme: Theme) => Partial<Record<FontSizeKey, string>> | undefined;
export declare const createFontWeightScale: (theme: Theme) => Partial<Record<keyof typeof fontWeights, string | number>>;
export declare const createFonts: (theme: Theme) => Record<string, unknown>;
export declare const createShadowsUnits: (theme: Theme) => {
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
} | undefined;
