import type { PublicUserData as IPublicUserData, PublicUserDataJSON, PublicUserDataJSONSnapshot } from '@clerk/shared/types';
export declare class PublicUserData implements IPublicUserData {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    hasImage: boolean;
    identifier: string;
    userId?: string;
    constructor(data: PublicUserDataJSON | PublicUserDataJSONSnapshot);
    protected fromJSON(data: PublicUserDataJSON | PublicUserDataJSONSnapshot | null): this;
    __internal_toSnapshot(): PublicUserDataJSONSnapshot;
}
