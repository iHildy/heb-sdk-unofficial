/**
 * Spacing scale configuration
 * Maps scale keys to their rem values and multipliers for dynamic calculation
 */
declare const spacingScale: Readonly<{
    readonly '0x25': {
        readonly rem: "0.0625rem";
        readonly multiplier: 0.25;
    };
    readonly '0x5': {
        readonly rem: "0.125rem";
        readonly multiplier: 0.5;
    };
    readonly '1': {
        readonly rem: "0.25rem";
        readonly multiplier: 1;
    };
    readonly '1x5': {
        readonly rem: "0.375rem";
        readonly multiplier: 1.5;
    };
    readonly '2': {
        readonly rem: "0.5rem";
        readonly multiplier: 2;
    };
    readonly '2x5': {
        readonly rem: "0.625rem";
        readonly multiplier: 2.5;
    };
    readonly '3': {
        readonly rem: "0.75rem";
        readonly multiplier: 3;
    };
    readonly '3x25': {
        readonly rem: "0.8125rem";
        readonly multiplier: 3.25;
    };
    readonly '3x5': {
        readonly rem: "0.875rem";
        readonly multiplier: 3.5;
    };
    readonly '4': {
        readonly rem: "1rem";
        readonly multiplier: 4;
    };
    readonly '4x25': {
        readonly rem: "1.0625rem";
        readonly multiplier: 4.25;
    };
    readonly '4x5': {
        readonly rem: "1.125rem";
        readonly multiplier: 4.5;
    };
    readonly '5': {
        readonly rem: "1.25rem";
        readonly multiplier: 5;
    };
    readonly '5x5': {
        readonly rem: "1.375rem";
        readonly multiplier: 5.5;
    };
    readonly '6': {
        readonly rem: "1.5rem";
        readonly multiplier: 6;
    };
    readonly '7': {
        readonly rem: "1.75rem";
        readonly multiplier: 7;
    };
    readonly '7x5': {
        readonly rem: "1.875rem";
        readonly multiplier: 7.5;
    };
    readonly '8': {
        readonly rem: "2rem";
        readonly multiplier: 8;
    };
    readonly '8x5': {
        readonly rem: "2.125rem";
        readonly multiplier: 8.5;
    };
    readonly '8x75': {
        readonly rem: "2.1875rem";
        readonly multiplier: 8.75;
    };
    readonly '9': {
        readonly rem: "2.25rem";
        readonly multiplier: 9;
    };
    readonly '10': {
        readonly rem: "2.5rem";
        readonly multiplier: 10;
    };
    readonly '12': {
        readonly rem: "3rem";
        readonly multiplier: 12;
    };
    readonly '13': {
        readonly rem: "3.5rem";
        readonly multiplier: 13;
    };
    readonly '16': {
        readonly rem: "4rem";
        readonly multiplier: 16;
    };
    readonly '17': {
        readonly rem: "4.25rem";
        readonly multiplier: 17;
    };
    readonly '20': {
        readonly rem: "5rem";
        readonly multiplier: 20;
    };
    readonly '24': {
        readonly rem: "6rem";
        readonly multiplier: 24;
    };
    readonly '28': {
        readonly rem: "7rem";
        readonly multiplier: 28;
    };
    readonly '32': {
        readonly rem: "8rem";
        readonly multiplier: 32;
    };
    readonly '36': {
        readonly rem: "9rem";
        readonly multiplier: 36;
    };
    readonly '40': {
        readonly rem: "10rem";
        readonly multiplier: 40;
    };
    readonly '44': {
        readonly rem: "11rem";
        readonly multiplier: 44;
    };
    readonly '48': {
        readonly rem: "12rem";
        readonly multiplier: 48;
    };
    readonly '52': {
        readonly rem: "13rem";
        readonly multiplier: 52;
    };
    readonly '56': {
        readonly rem: "14rem";
        readonly multiplier: 56;
    };
    readonly '57': {
        readonly rem: "14.25rem";
        readonly multiplier: 57;
    };
    readonly '60': {
        readonly rem: "15rem";
        readonly multiplier: 60;
    };
    readonly '66': {
        readonly rem: "16.5rem";
        readonly multiplier: 66;
    };
    readonly '94': {
        readonly rem: "23.5rem";
        readonly multiplier: 94;
    };
    readonly '100': {
        readonly rem: "25rem";
        readonly multiplier: 100;
    };
    readonly '108': {
        readonly rem: "27rem";
        readonly multiplier: 108;
    };
    readonly '120': {
        readonly rem: "30rem";
        readonly multiplier: 120;
    };
    readonly '140': {
        readonly rem: "35rem";
        readonly multiplier: 140;
    };
    readonly '160': {
        readonly rem: "40rem";
        readonly multiplier: 160;
    };
    readonly '176': {
        readonly rem: "44rem";
        readonly multiplier: 176;
    };
    readonly '220': {
        readonly rem: "55rem";
        readonly multiplier: 220;
    };
}>;
type SpacingScaleKey = keyof typeof spacingScale;
/**
 * Complete spacing scale combining base units and dynamic spacing
 * Used for responsive spacing that adapts to the CSS variable
 */
declare const space: Readonly<{
    readonly 1: string;
    readonly 2: string;
    readonly 3: string;
    readonly 100: string;
    readonly 4: string;
    readonly 5: string;
    readonly 6: string;
    readonly 7: string;
    readonly 8: string;
    readonly 9: string;
    readonly 10: string;
    readonly 12: string;
    readonly 13: string;
    readonly "0x25": string;
    readonly "0x5": string;
    readonly "1x5": string;
    readonly "2x5": string;
    readonly "3x25": string;
    readonly "3x5": string;
    readonly "4x25": string;
    readonly "4x5": string;
    readonly "5x5": string;
    readonly "7x5": string;
    readonly "8x5": string;
    readonly "8x75": string;
    readonly 16: string;
    readonly 17: string;
    readonly 20: string;
    readonly 24: string;
    readonly 28: string;
    readonly 32: string;
    readonly 36: string;
    readonly 40: string;
    readonly 44: string;
    readonly 48: string;
    readonly 52: string;
    readonly 56: string;
    readonly 57: string;
    readonly 60: string;
    readonly 66: string;
    readonly 94: string;
    readonly 108: string;
    readonly 120: string;
    readonly 140: string;
    readonly 160: string;
    readonly 176: string;
    readonly 220: string;
    readonly none: "0";
    readonly xxs: "0.5px";
    readonly px: "1px";
}>;
/**
 * Static sizes combining base units and fixed spacing values
 * Used for non-responsive sizing
 */
declare const sizes: Readonly<{
    readonly '0x25': "0.0625rem";
    readonly '0x5': "0.125rem";
    readonly '1': "0.25rem";
    readonly '1x5': "0.375rem";
    readonly '2': "0.5rem";
    readonly '2x5': "0.625rem";
    readonly '3': "0.75rem";
    readonly '3x25': "0.8125rem";
    readonly '3x5': "0.875rem";
    readonly '4': "1rem";
    readonly '4x25': "1.0625rem";
    readonly '4x5': "1.125rem";
    readonly '5': "1.25rem";
    readonly '5x5': "1.375rem";
    readonly '6': "1.5rem";
    readonly '7': "1.75rem";
    readonly '7x5': "1.875rem";
    readonly '8': "2rem";
    readonly '8x5': "2.125rem";
    readonly '8x75': "2.1875rem";
    readonly '9': "2.25rem";
    readonly '10': "2.5rem";
    readonly '12': "3rem";
    readonly '13': "3.5rem";
    readonly '16': "4rem";
    readonly '17': "4.25rem";
    readonly '20': "5rem";
    readonly '24': "6rem";
    readonly '28': "7rem";
    readonly '32': "8rem";
    readonly '36': "9rem";
    readonly '40': "10rem";
    readonly '44': "11rem";
    readonly '48': "12rem";
    readonly '52': "13rem";
    readonly '56': "14rem";
    readonly '57': "14.25rem";
    readonly '60': "15rem";
    readonly '66': "16.5rem";
    readonly '94': "23.5rem";
    readonly '100': "25rem";
    readonly '108': "27rem";
    readonly '120': "30rem";
    readonly '140': "35rem";
    readonly '160': "40rem";
    readonly '176': "44rem";
    readonly '220': "55rem";
    readonly none: "0";
    readonly xxs: "0.5px";
    readonly px: "1px";
}>;
/**
 * Border radius scale with CSS variables for theming
 */
export declare const BORDER_RADIUS_SCALE_RATIOS: Readonly<{
    readonly sm: "2 / 3";
    readonly md: "1";
    readonly lg: "4 / 3";
    readonly xl: "2";
}>;
declare const radii: Readonly<{
    readonly none: "0px";
    readonly circle: "50%";
    readonly avatar: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
    readonly halfHeight: "99999px";
}>;
/**
 * Used by the space scale generation helpers.
 * These keys should always match the spacing scale
 */
declare const spaceScaleKeys: SpacingScaleKey[];
export { sizes, space, radii, spaceScaleKeys };
