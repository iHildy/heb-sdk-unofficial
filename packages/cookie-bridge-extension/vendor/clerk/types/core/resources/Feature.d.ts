import type { FeatureJSON, FeatureResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class Feature extends BaseResource implements FeatureResource {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    avatarUrl: string | null;
    constructor(data: FeatureJSON);
    protected fromJSON(data: FeatureJSON | null): this;
}
