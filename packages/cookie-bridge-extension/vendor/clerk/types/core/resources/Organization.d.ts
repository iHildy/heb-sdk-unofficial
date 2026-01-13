import type { AddMemberParams, ClerkPaginatedResponse, ClerkResourceReloadParams, CreateOrganizationParams, GetDomainsParams, GetInvitationsParams, GetMembershipRequestParams, GetMemberships, GetRolesParams, InviteMemberParams, InviteMembersParams, OrganizationDomainResource, OrganizationInvitationResource, OrganizationJSON, OrganizationJSONSnapshot, OrganizationMembershipRequestResource, OrganizationResource, SetOrganizationLogoParams, UpdateMembershipParams, UpdateOrganizationParams } from '@clerk/shared/types';
import { addPaymentMethod, getPaymentMethods, initializePaymentMethod } from '../modules/billing';
import { BaseResource, OrganizationMembership } from './internal';
import { Role } from './Role';
export declare class Organization extends BaseResource implements OrganizationResource {
    pathRoot: string;
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    hasImage: boolean;
    publicMetadata: OrganizationPublicMetadata;
    adminDeleteEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    membersCount: number;
    pendingInvitationsCount: number;
    maxAllowedMemberships: number;
    constructor(data: OrganizationJSON | OrganizationJSONSnapshot);
    static create(params: CreateOrganizationParams): Promise<OrganizationResource>;
    static get(organizationId: string): Promise<OrganizationResource>;
    update: (params: UpdateOrganizationParams) => Promise<OrganizationResource>;
    getRoles: (getRolesParams?: GetRolesParams) => Promise<{
        total_count: number;
        data: Role[];
        has_role_set_migration: boolean | undefined;
    }>;
    getDomains: (getDomainParams?: GetDomainsParams) => Promise<ClerkPaginatedResponse<OrganizationDomainResource>>;
    getDomain: ({ domainId }: {
        domainId: string;
    }) => Promise<OrganizationDomainResource>;
    getMembershipRequests: (getRequestParam?: GetMembershipRequestParams) => Promise<ClerkPaginatedResponse<OrganizationMembershipRequestResource>>;
    createDomain: (name: string) => Promise<OrganizationDomainResource>;
    getMemberships: GetMemberships;
    getInvitations: (getInvitationsParams?: GetInvitationsParams) => Promise<ClerkPaginatedResponse<OrganizationInvitationResource>>;
    addMember: ({ userId, role }: AddMemberParams) => Promise<OrganizationMembership>;
    inviteMember: (params: InviteMemberParams) => Promise<OrganizationInvitationResource>;
    inviteMembers: (params: InviteMembersParams) => Promise<OrganizationInvitationResource[]>;
    updateMember: ({ userId, role }: UpdateMembershipParams) => Promise<OrganizationMembership>;
    removeMember: (userId: string) => Promise<OrganizationMembership>;
    destroy: () => Promise<void>;
    setLogo: ({ file }: SetOrganizationLogoParams) => Promise<OrganizationResource>;
    initializePaymentMethod: typeof initializePaymentMethod;
    addPaymentMethod: typeof addPaymentMethod;
    getPaymentMethods: typeof getPaymentMethods;
    protected fromJSON(data: OrganizationJSON | OrganizationJSONSnapshot | null): this;
    __internal_toSnapshot(): OrganizationJSONSnapshot;
    reload(params?: ClerkResourceReloadParams): Promise<this>;
}
