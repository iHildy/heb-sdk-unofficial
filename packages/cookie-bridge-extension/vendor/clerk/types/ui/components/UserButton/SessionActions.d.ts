import type { SignedInSessionResource } from '@clerk/shared/types';
import type { ElementDescriptor, ElementId } from '../../../ui/customizables/elementDescriptors';
import type { LocalizationKey } from '../../customizables';
import type { ThemableCssProp } from '../../styledSystem';
type SingleSessionActionsProps = {
    handleManageAccountClicked: () => Promise<unknown> | void;
    handleSignOutSessionClicked: (session: SignedInSessionResource) => () => Promise<unknown> | void;
    handleUserProfileActionClicked: (startPath?: string) => Promise<unknown> | void;
    session: SignedInSessionResource;
    completedCallback: () => void;
};
export declare const SingleSessionActions: (props: SingleSessionActionsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type MultiSessionActionsProps = {
    handleManageAccountClicked: () => Promise<unknown> | void;
    handleSignOutSessionClicked: (session: SignedInSessionResource) => () => Promise<unknown> | void;
    handleSessionClicked: (session: SignedInSessionResource) => () => Promise<unknown> | void;
    handleAddAccountClicked: () => Promise<unknown> | void;
    handleUserProfileActionClicked: (startPath?: string) => Promise<unknown> | void;
    session: SignedInSessionResource;
    otherSessions: SignedInSessionResource[];
    completedCallback: () => void;
};
export declare const MultiSessionActions: (props: MultiSessionActionsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type SignOutAllActionsProps = {
    handleSignOutAllClicked: () => Promise<unknown> | void;
    elementDescriptor?: ElementDescriptor;
    elementId?: ElementId;
    iconBoxElementDescriptor?: ElementDescriptor;
    iconBoxElementId?: ElementId;
    iconElementDescriptor?: ElementDescriptor;
    iconElementId?: ElementId;
    label?: LocalizationKey;
    sx?: ThemableCssProp;
    actionSx?: ThemableCssProp;
};
export declare const SignOutAllActions: (props: SignOutAllActionsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
