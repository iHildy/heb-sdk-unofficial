import type { OrganizationResource } from '@clerk/shared/types';
import type { CreateOrganizationCtx } from '../../types';
export declare const CreateOrganizationContext: import("react").Context<CreateOrganizationCtx | null>;
export declare const useCreateOrganizationContext: () => {
    skipInvitationScreen: boolean;
    hideSlug: boolean;
    navigateAfterCreateOrganization: (organization: OrganizationResource) => Promise<unknown>;
    componentName: "CreateOrganization";
    path: string | undefined;
    routing?: Extract<import("@clerk/types").RoutingStrategy, "path">;
    afterCreateOrganizationUrl?: ((organization: OrganizationResource) => string) | ((string & Record<never, never>) | ":name" | ":slug" | ":id" | ":imageUrl" | ":hasImage" | ":membersCount" | ":pendingInvitationsCount" | ":adminDeleteEnabled" | ":maxAllowedMemberships" | ":pathRoot");
    appearance?: import("@clerk/types").CreateOrganizationTheme;
    mode?: "modal" | "mounted";
} | {
    skipInvitationScreen: boolean;
    hideSlug: boolean;
    navigateAfterCreateOrganization: (organization: OrganizationResource) => Promise<unknown>;
    componentName: "CreateOrganization";
    path?: never;
    routing?: Extract<import("@clerk/types").RoutingStrategy, "hash" | "virtual">;
    afterCreateOrganizationUrl?: ((organization: OrganizationResource) => string) | ((string & Record<never, never>) | ":name" | ":slug" | ":id" | ":imageUrl" | ":hasImage" | ":membersCount" | ":pendingInvitationsCount" | ":adminDeleteEnabled" | ":maxAllowedMemberships" | ":pathRoot");
    appearance?: import("@clerk/types").CreateOrganizationTheme;
    mode?: "modal" | "mounted";
};
