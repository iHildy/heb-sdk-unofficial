export declare const cssSupports: {
    relativeColorSyntax: () => boolean;
    colorMix: () => boolean;
    /**
     * Returns true if either relativeColorSyntax or colorMix is supported
     */
    modernColor(): boolean;
};
export declare const clearCache: () => void;
