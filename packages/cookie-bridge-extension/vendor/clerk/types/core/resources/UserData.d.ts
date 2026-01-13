import type { UserData as IUserData, UserDataJSON, UserDataJSONSnapshot } from '@clerk/shared/types';
export declare class UserData implements IUserData {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    hasImage?: boolean;
    constructor(data: UserDataJSON | UserDataJSONSnapshot | null);
    protected fromJSON(data: UserDataJSON | UserDataJSONSnapshot | null): this;
    __internal_toSnapshot(): UserDataJSONSnapshot;
}
