import type { RoutingOptions, RoutingStrategy } from '@clerk/shared/types';
export declare const normalizeRoutingOptions: ({ routing, path, }: {
    routing?: RoutingStrategy;
    path?: string;
}) => RoutingOptions;
