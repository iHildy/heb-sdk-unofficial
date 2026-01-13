/**
 * Creates a beforeUnload event tracker to prevent state updates and re-renders during hard
 * navigation events.
 *
 * It can be wrapped around navigation-related operations to ensure they don't trigger unnecessary
 * state updates during page transitions.
 *
 * @internal
 */
export declare const createBeforeUnloadTracker: (enabled?: boolean) => {
    track: (fn: () => Promise<void>) => Promise<void>;
    isUnloading: () => boolean;
};
