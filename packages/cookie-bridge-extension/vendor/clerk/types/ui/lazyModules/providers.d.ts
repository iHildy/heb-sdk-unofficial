import type { Appearance } from '@clerk/shared/types';
import React from 'react';
import type { FlowMetadata } from '../elements/contexts';
import type { Drawer } from '../elements/Drawer';
import type { ThemableCssProp } from '../styledSystem';
import type { ClerkComponentName } from './components';
declare const AppearanceProvider: React.LazyExoticComponent<(props: import("../customizables/parseAppearance").AppearanceCascade & {
    children?: React.ReactNode | undefined;
}) => import("@emotion/react/jsx-runtime").JSX.Element>;
declare const Portal: React.LazyExoticComponent<typeof import("./../portal").Portal>;
declare const Modal: React.LazyExoticComponent<React.ComponentType<{
    id?: string;
    handleOpen?: () => void;
    handleClose?: () => void;
    contentSx?: ThemableCssProp;
    containerSx?: ThemableCssProp;
    canCloseModal?: boolean;
    style?: React.CSSProperties;
    portalRoot?: HTMLElement | React.MutableRefObject<HTMLElement | null>;
    initialFocusRef?: number | React.MutableRefObject<HTMLElement | null>;
} & {
    children?: React.ReactNode | undefined;
}>>;
declare const OrganizationSwitcherPrefetch: React.LazyExoticComponent<typeof import("../components/prefetch-organization-list").OrganizationSwitcherPrefetch>;
type LazyProvidersProps = React.PropsWithChildren<{
    clerk: any;
    environment: any;
    options: any;
    children: any;
}>;
export declare const LazyProviders: (props: LazyProvidersProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type _AppearanceProviderProps = Parameters<typeof AppearanceProvider>[0];
type AppearanceProviderProps = {
    globalAppearance?: _AppearanceProviderProps['globalAppearance'];
    appearanceKey: _AppearanceProviderProps['appearanceKey'];
    componentAppearance?: _AppearanceProviderProps['appearance'];
};
type LazyComponentRendererProps = React.PropsWithChildren<{
    node: PortalProps['node'];
    componentName: any;
    componentProps: any;
} & AppearanceProviderProps>;
type PortalProps = Parameters<typeof Portal>[0];
export declare const LazyComponentRenderer: (props: LazyComponentRendererProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type ModalProps = Parameters<typeof Modal>[0];
type LazyModalRendererProps = React.PropsWithChildren<{
    componentName: ClerkComponentName;
    flowName?: FlowMetadata['flow'];
    startPath?: string;
    onClose?: ModalProps['handleClose'];
    onExternalNavigate?: () => void;
    modalContainerSx?: ThemableCssProp;
    modalContentSx?: ThemableCssProp;
    canCloseModal?: boolean;
    modalId?: string;
    modalStyle?: React.CSSProperties;
} & AppearanceProviderProps>;
export declare const LazyModalRenderer: (props: LazyModalRendererProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type DrawerProps = Parameters<typeof Drawer.Root>[0];
type LazyDrawerRendererProps = React.PropsWithChildren<{
    componentName: ClerkComponentName;
    flowName?: FlowMetadata['flow'];
    open: DrawerProps['open'];
    onOpenChange: DrawerProps['onOpenChange'];
    portalId?: string;
    portalRoot?: HTMLElement | null | undefined;
} & AppearanceProviderProps>;
export declare const LazyDrawerRenderer: (props: LazyDrawerRendererProps) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * This component automatically mounts when impersonating, without a user action.
 * We want to hotload the /ui dependencies only if we're actually impersonating.
 */
export declare const LazyImpersonationFabProvider: (props: React.PropsWithChildren<{
    globalAppearance: Appearance | undefined;
}>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const LazyEnableOrganizationsPromptProvider: (props: React.PropsWithChildren<{
    globalAppearance: Appearance | undefined;
}>) => import("@emotion/react/jsx-runtime").JSX.Element;
type LazyOneTapRendererProps = React.PropsWithChildren<{
    componentProps: any;
    startPath: string;
} & Omit<AppearanceProviderProps, 'appearanceKey'>>;
export declare const LazyOneTapRenderer: (props: LazyOneTapRendererProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export { OrganizationSwitcherPrefetch };
