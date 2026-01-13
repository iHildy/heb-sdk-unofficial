import type { IdentificationLinkJSON, IdentificationLinkJSONSnapshot, IdentificationLinkResource } from '@clerk/shared/types';
import { BaseResource } from './Base';
export declare class IdentificationLink extends BaseResource implements IdentificationLinkResource {
    id: string;
    type: string;
    constructor(data: IdentificationLinkJSON | IdentificationLinkJSONSnapshot);
    protected fromJSON(data: IdentificationLinkJSON | IdentificationLinkJSONSnapshot | null): this;
    __internal_toSnapshot(): IdentificationLinkJSONSnapshot;
}
