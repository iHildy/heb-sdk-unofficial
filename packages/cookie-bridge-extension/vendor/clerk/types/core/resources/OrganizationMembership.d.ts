import type { ClerkPaginatedResponse, ClerkResourceReloadParams, GetUserOrganizationMembershipParams, OrganizationCustomRoleKey, OrganizationMembershipJSON, OrganizationMembershipJSONSnapshot, OrganizationMembershipResource, OrganizationPermissionKey } from '@clerk/shared/types';
import { BaseResource, Organization, PublicUserData } from './internal';
export declare class OrganizationMembership extends BaseResource implements OrganizationMembershipResource {
    id: string;
    publicMetadata: OrganizationMembershipPublicMetadata;
    publicUserData?: PublicUserData;
    organization: Organization;
    permissions: OrganizationPermissionKey[];
    role: OrganizationCustomRoleKey;
    roleName: string;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: OrganizationMembershipJSON | OrganizationMembershipJSONSnapshot);
    static retrieve: GetOrganizationMembershipsClass;
    destroy: () => Promise<OrganizationMembership>;
    update: ({ role }: UpdateOrganizationMembershipParams) => Promise<OrganizationMembership>;
    protected fromJSON(data: OrganizationMembershipJSON | OrganizationMembershipJSONSnapshot | null): this;
    __internal_toSnapshot(): OrganizationMembershipJSONSnapshot;
    reload(_?: ClerkResourceReloadParams): Promise<this>;
}
export type UpdateOrganizationMembershipParams = {
    role: OrganizationCustomRoleKey;
};
export type GetOrganizationMembershipsClass = (params?: GetUserOrganizationMembershipParams) => Promise<ClerkPaginatedResponse<OrganizationMembership>>;
