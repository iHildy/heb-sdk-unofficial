type NameHelperParams = {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
};
export declare const getFullName: ({ firstName, lastName, name }: NameHelperParams) => string;
export declare const getInitials: ({ firstName, lastName, name }: NameHelperParams) => string;
import type { UserResource } from '@clerk/shared/types';
export declare const getIdentifier: (user: Partial<UserResource>) => string;
export {};
