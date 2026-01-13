export declare function distributeStrategiesIntoRows<T>(strategies: T[], maxStrategiesPerRow: number, lastAuthenticationStrategy: T | null | undefined): {
    strategyRows: T[][];
    lastAuthenticationStrategyPresent: boolean;
};
