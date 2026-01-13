export declare function SafeLock(key: string): {
    acquireLockAndRun: (cb: () => Promise<unknown>) => Promise<any>;
};
