import type { APIKeysCtx } from '../../types';
export declare const APIKeysContext: import("react").Context<APIKeysCtx | null>;
export declare const useAPIKeysContext: () => {
    componentName: "APIKeys";
    perPage?: number;
    appearance?: import("@clerk/types").APIKeysTheme;
    showDescription?: boolean;
    mode?: "modal" | "mounted";
};
