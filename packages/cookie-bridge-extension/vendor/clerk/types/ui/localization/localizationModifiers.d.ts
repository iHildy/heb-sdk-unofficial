import { titleize } from '@clerk/shared/underscore';
export declare const MODIFIERS: {
    readonly titleize: typeof titleize;
    readonly timeString: (val: Date | string | number, locale?: string) => string;
    readonly weekday: (val: Date | string | number, locale?: string, weekday?: "long" | "short" | "narrow" | undefined) => string;
    readonly numeric: (val: Date | number | string, locale?: string) => string;
    readonly link: (val: string, label?: string) => string;
    readonly shortDate: (val: Date | string | number, locale?: string) => string;
    readonly longDate: (val: Date | string | number, locale?: string) => string;
};
