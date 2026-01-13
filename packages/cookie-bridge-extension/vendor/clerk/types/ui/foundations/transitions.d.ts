declare const transitionDurationValues: Readonly<{
    readonly slowest: 600;
    readonly slower: 280;
    readonly slow: 200;
    readonly fast: 120;
    readonly focusRing: 200;
    readonly controls: 100;
    readonly textField: 450;
    readonly drawer: 500;
}>;
declare const transitionDuration: Readonly<Record<"focusRing" | "slowest" | "slower" | "slow" | "fast" | "controls" | "textField" | "drawer", string>>;
declare const transitionProperty: Readonly<{
    readonly common: "background-color,background,border-color,color,fill,stroke,opacity,box-shadow,transform";
}>;
declare const transitionTiming: Readonly<{
    readonly common: "ease";
    readonly easeOut: "ease-out";
    readonly bezier: "cubic-bezier(0.32, 0.72, 0, 1)";
    readonly slowBezier: "cubic-bezier(0.16, 1, 0.3, 1)";
}>;
export { transitionDuration, transitionTiming, transitionProperty, transitionDurationValues };
