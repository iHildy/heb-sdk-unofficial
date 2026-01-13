import { Flex } from '@/ui/customizables';
/**
 * A container for prompt components
 * @internal
 */
export declare function PromptContainer({ children, sx, ...props }: React.ComponentProps<typeof Flex>): import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * @internal
 */
export declare const basePromptElementStyles: import("@emotion/react").SerializedStyles;
export declare function PromptSuccessIcon(props: React.ComponentProps<'svg'>): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function handleDashboardUrlParsing(url: string): {
    baseDomain: string;
    appId: string;
    instanceId: string;
};
/**
 * @internal
 */
export declare function ClerkLogoIcon(): import("@emotion/react/jsx-runtime").JSX.Element;
