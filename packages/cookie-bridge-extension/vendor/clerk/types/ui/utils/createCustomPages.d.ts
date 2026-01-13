import type { CustomPage, EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
import type { NavbarRoute } from '../elements/Navbar';
export type CustomPageContent = {
    url: string;
    mount: (el: HTMLDivElement) => void;
    unmount: (el?: HTMLDivElement) => void;
};
export declare const createUserProfileCustomPages: (customPages: CustomPage[], clerk: LoadedClerk, shouldShowBilling: boolean, environment?: EnvironmentResource) => {
    routes: NavbarRoute[];
    contents: CustomPageContent[];
    pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};
export declare const createOrganizationProfileCustomPages: (customPages: CustomPage[], clerk: LoadedClerk, shouldShowBilling: boolean, environment?: EnvironmentResource) => {
    routes: NavbarRoute[];
    contents: CustomPageContent[];
    pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
};
