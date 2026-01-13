import type { NavbarRoute } from '@/ui/elements/Navbar';
import type { CustomPageContent } from '@/ui/utils/createCustomPages';
import type { ParsedQueryString } from '../../router';
import type { UserProfileCtx } from '../../types';
type PagesType = {
    routes: NavbarRoute[];
    contents: CustomPageContent[];
    pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};
export type UserProfileContextType = UserProfileCtx & {
    queryParams: ParsedQueryString;
    authQueryString: string | null;
    pages: PagesType;
    shouldAllowIdentificationCreation: boolean;
    shouldShowBilling: boolean;
};
export declare const UserProfileContext: import("react").Context<UserProfileCtx | null>;
export declare const useUserProfileContext: () => UserProfileContextType;
export {};
