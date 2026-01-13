import type { OAuthProvider, PhoneCodeProvider, Web3Provider } from '@clerk/shared/types';
import { Box } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
type ProviderInitialIconProps = PropsOfComponent<typeof Box> & {
    value: string;
    id: Web3Provider | OAuthProvider | PhoneCodeProvider;
};
export declare const ProviderInitialIcon: (props: ProviderInitialIconProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
