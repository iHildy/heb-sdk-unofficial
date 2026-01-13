import type { InternalTheme } from './types';
export declare const common: {
    textVariants: (t: InternalTheme) => {
        readonly h1: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(16 / 12)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly h2: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(24 / 17)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly h3: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(18 / 13)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly subtitle: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(18 / 13)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly body: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(18 / 13)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly caption: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(16 / 11)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly buttonLarge: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(18 / 13)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
        readonly buttonSmall: {
            readonly fontWeight: string;
            readonly fontSize: string;
            readonly lineHeight: "calc(16 / 12)";
            readonly fontFamily: string;
            readonly letterSpacing: "normal";
        };
    };
    borderVariants: (t: InternalTheme, props?: any) => {
        readonly normal: {
            readonly '&:focus'?: undefined;
            readonly '&:hover'?: undefined;
            readonly borderRadius: string;
            readonly borderWidth: "1px";
            readonly borderStyle: "solid";
            readonly borderColor: import("@clerk/types").HslaColorString;
            readonly boxShadow: string;
            readonly transitionProperty: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
            readonly transitionTimingFunction: "ease";
            readonly transitionDuration: string;
        } | {
            readonly '&:focus': {
                borderColor: import("@clerk/types").HslaColorString;
                WebkitTapHighlightColor: string;
                boxShadow: string;
            };
            readonly '&:hover'?: undefined;
            readonly borderRadius: string;
            readonly borderWidth: "1px";
            readonly borderStyle: "solid";
            readonly borderColor: import("@clerk/types").HslaColorString;
            readonly boxShadow: string;
            readonly transitionProperty: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
            readonly transitionTimingFunction: "ease";
            readonly transitionDuration: string;
        } | {
            readonly '&:focus'?: undefined;
            readonly '&:hover': {
                WebkitTapHighlightColor: string;
                borderColor: import("@clerk/types").HslaColorString;
                boxShadow: string;
            };
            readonly borderRadius: string;
            readonly borderWidth: "1px";
            readonly borderStyle: "solid";
            readonly borderColor: import("@clerk/types").HslaColorString;
            readonly boxShadow: string;
            readonly transitionProperty: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
            readonly transitionTimingFunction: "ease";
            readonly transitionDuration: string;
        } | {
            readonly '&:focus': {
                borderColor: import("@clerk/types").HslaColorString;
                WebkitTapHighlightColor: string;
                boxShadow: string;
            };
            readonly '&:hover': {
                WebkitTapHighlightColor: string;
                borderColor: import("@clerk/types").HslaColorString;
                boxShadow: string;
            };
            readonly borderRadius: string;
            readonly borderWidth: "1px";
            readonly borderStyle: "solid";
            readonly borderColor: import("@clerk/types").HslaColorString;
            readonly boxShadow: string;
            readonly transitionProperty: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
            readonly transitionTimingFunction: "ease";
            readonly transitionDuration: string;
        };
    };
    focusRingStyles: (t: InternalTheme) => {
        readonly '&::-moz-focus-inner': {
            readonly border: "0";
        };
        readonly WebkitTapHighlightColor: "transparent";
        readonly boxShadow: string;
        readonly transitionProperty: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
        readonly transitionTimingFunction: "ease";
        readonly transitionDuration: string;
    };
    focusRing: (t: InternalTheme) => {
        readonly '&:focus': {
            readonly '&::-moz-focus-inner': {
                readonly border: "0";
            };
            readonly WebkitTapHighlightColor: "transparent";
            readonly boxShadow: string;
            readonly transitionProperty: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
            readonly transitionTimingFunction: "ease";
            readonly transitionDuration: string;
        };
    };
    disabled: (t: InternalTheme) => {
        readonly '&:disabled,&[data-disabled]': {
            readonly cursor: "not-allowed";
            readonly pointerEvents: "none";
            readonly opacity: "50%";
        };
    };
    borderColor: (t: InternalTheme, props?: any) => {
        readonly borderColor: import("@clerk/types").HslaColorString;
    };
    centeredFlex: (display?: "flex" | "inline-flex") => {
        display: "flex" | "inline-flex";
        justifyContent: string;
        alignItems: string;
    };
    maxHeightScroller: (t: InternalTheme) => {
        readonly '::-webkit-scrollbar': {
            background: string;
            width: string;
            height: string;
        };
        readonly '::-webkit-scrollbar-thumb': {
            background: import("@clerk/types").HslaColorString;
        };
        readonly '::-webkit-scrollbar-track': {
            background: string;
        };
        readonly height: "100%";
        readonly overflowY: "auto";
    };
    mutedBackground: (t: InternalTheme) => string;
    unstyledScrollbar: (t: InternalTheme) => {
        '::-webkit-scrollbar': {
            background: string;
            width: string;
            height: string;
        };
        '::-webkit-scrollbar-thumb': {
            background: import("@clerk/types").HslaColorString;
        };
        '::-webkit-scrollbar-track': {
            background: string;
        };
    };
    mergedColorsBackground: (colorBack: string, colorFront: string) => string;
    visuallyHidden: () => {
        readonly clip: "rect(0 0 0 0)";
        readonly clipPath: "inset(50%)";
        readonly height: "1px";
        readonly overflow: "hidden";
        readonly position: "absolute";
        readonly whiteSpace: "nowrap";
        readonly width: "1px";
    };
};
