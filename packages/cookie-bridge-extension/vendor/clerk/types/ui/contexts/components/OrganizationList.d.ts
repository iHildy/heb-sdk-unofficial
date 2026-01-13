import type { OrganizationResource, UserResource } from '@clerk/shared/types';
import type { OrganizationListCtx } from '../../types';
export declare const OrganizationListContext: import("react").Context<OrganizationListCtx | null>;
export declare const useOrganizationListContext: () => {
    afterCreateOrganizationUrl: string | ((organization: OrganizationResource) => string);
    skipInvitationScreen: boolean;
    hideSlug: boolean;
    hidePersonal: boolean;
    navigateAfterCreateOrganization: (organization: OrganizationResource) => Promise<unknown>;
    navigateAfterSelectOrganization: (organization: OrganizationResource) => Promise<unknown>;
    navigateAfterSelectPersonal: (user: UserResource) => Promise<unknown>;
    componentName: "OrganizationList";
    afterSelectOrganizationUrl?: ((organization: OrganizationResource) => string) | ((string & Record<never, never>) | ":name" | ":slug" | ":id" | ":imageUrl" | ":hasImage" | ":membersCount" | ":pendingInvitationsCount" | ":adminDeleteEnabled" | ":maxAllowedMemberships" | ":pathRoot");
    appearance?: import("@clerk/types").OrganizationListTheme;
    afterSelectPersonalUrl?: ((user: UserResource) => string) | ((string & Record<never, never>) | ":id" | ":imageUrl" | ":hasImage" | ":pathRoot" | ":firstName" | ":lastName" | ":username" | ":primaryEmailAddressId" | ":primaryPhoneNumberId" | ":primaryWeb3WalletId" | ":externalId" | ":fullName" | ":passwordEnabled" | ":totpEnabled" | ":backupCodeEnabled" | ":twoFactorEnabled" | ":createOrganizationEnabled" | ":createOrganizationsLimit" | ":deleteSelfEnabled" | ":hasVerifiedEmailAddress" | ":hasVerifiedPhoneNumber");
    mode?: "modal" | "mounted";
};
