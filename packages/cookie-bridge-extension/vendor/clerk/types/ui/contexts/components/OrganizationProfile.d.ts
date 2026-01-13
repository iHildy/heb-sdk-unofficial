import type { NavbarRoute } from '@/ui/elements/Navbar';
import type { CustomPageContent } from '@/ui/utils/createCustomPages';
import type { OrganizationProfileCtx } from '../../types';
type PagesType = {
    routes: NavbarRoute[];
    contents: CustomPageContent[];
    pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};
export type OrganizationProfileContextType = OrganizationProfileCtx & {
    pages: PagesType;
    navigateAfterLeaveOrganization: () => Promise<unknown>;
    navigateToGeneralPageRoot: () => Promise<unknown>;
    isMembersPageRoot: boolean;
    isGeneralPageRoot: boolean;
    isBillingPageRoot: boolean;
    isAPIKeysPageRoot: boolean;
    shouldShowBilling: boolean;
};
export declare const OrganizationProfileContext: import("react").Context<OrganizationProfileCtx | null>;
export declare const useOrganizationProfileContext: () => OrganizationProfileContextType;
export {};
