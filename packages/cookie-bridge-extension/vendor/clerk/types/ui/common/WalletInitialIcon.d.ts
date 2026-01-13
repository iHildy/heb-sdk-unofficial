import { Box } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
type WalletInitialIconProps = PropsOfComponent<typeof Box> & {
    value: string;
    /**
     * The wallet provider name
     */
    id: string;
};
export declare const WalletInitialIcon: (props: WalletInitialIconProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
